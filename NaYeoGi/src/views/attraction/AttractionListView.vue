<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ContentCard from '@/components/common/ContentCard.vue'
import { loadKakaoMaps } from '@/restapi/attraction'
import { ATTRACTION_CATEGORY_GROUPS, useAttractionStore } from '@/stores/attractions'
import { TOP_100_ATTRACTIONS } from '@/constants/attraction/top100'

const IDLE_DEBOUNCE_MS = 1000
const MAX_MARKERS = 100000

const router = useRouter()
const route = useRoute()
const attractionStore = useAttractionStore()
const {
  attractions,
  attractionsLoading,
  attractionsError,
  listActiveCategory,
  listCategoryTypes
} = storeToRefs(attractionStore)
const {
  resolveCategoryLabel,
  syncCategory,
  fetchAttractionsList: fetchAttractionsFromStore
} = attractionStore

const selectedId = ref(null)
const visibleAttractions = ref([])
const cardListRef = ref(null)
const viewMode = ref('top') // 'all' | 'top'

const mapContainer = ref(null)
const mapInstance = ref(null)
const markers = ref([])
const markerImages = ref({ default: null, selected: null })

const normalizedQueryTypes = computed(() => {
  const value = route.query.contentTypeId
  if (value === undefined) return []
  const array = Array.isArray(value) ? value : [value]
  return array
    .map((item) => Number(item))
    .filter((item) => !Number.isNaN(item))
})

const requestedCategoryTypes = computed(() =>
  normalizedQueryTypes.value.length ? normalizedQueryTypes.value : listCategoryTypes.value
)

const syncCategoryFromRoute = () => {
  syncCategory({
    categoryKey: route.query.category,
    typesFromQuery: normalizedQueryTypes.value
  })
}

const getCardId = (id) => `attraction-card-${id}`

const cleanupMarkers = () => {
  markers.value.forEach(({ marker }) => marker.setMap(null))
  markers.value = []
}

const createMarkerImage = (kakao, fillColor) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="35" viewBox="0 0 24 35">
  <path d="M12 0C6.477 0 2 4.477 2 10c0 7.5 10 25 10 25s10-17.5 10-25C22 4.477 17.523 0 12 0z" fill="${fillColor}" stroke="#ffffff" stroke-width="1.4"/>
  <circle cx="12" cy="10.5" r="4.2" fill="#ffffff"/>
</svg>`
  const imageSrc = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  const size = new kakao.maps.Size(24, 35)
  const options = { offset: new kakao.maps.Point(12, 35) }
  return new kakao.maps.MarkerImage(imageSrc, size, options)
}

const initMarkerImages = (kakao) => {
  if (markerImages.value.default && markerImages.value.selected) return
  markerImages.value = {
    default: createMarkerImage(kakao, '#ef4444'),
    selected: createMarkerImage(kakao, '#f97316')
  }
}

const createMarker = (kakao, attraction, { selected = false } = {}) => {
  initMarkerImages(kakao)
  const position = toLatLng(kakao, attraction)
  if (!position) return null
  const image = selected ? markerImages.value.selected : markerImages.value.default
  const marker = new kakao.maps.Marker({ position, image })
  marker.setMap(mapInstance.value)
  kakao.maps.event.addListener(marker, 'click', () => {
    selectedId.value = attraction.id
    updateMarkerSelection(attraction.id)
    scrollToCard(attraction.id)
  })
  return marker
}

const updateMarkerSelection = (id) => {
  if (!markerImages.value.default || !markerImages.value.selected) return
  markers.value.forEach(({ id: markerId, marker }) => {
    const image = markerId === id ? markerImages.value.selected : markerImages.value.default
    marker.setImage(image)
  })
}

const toLatLng = (kakao, attraction) => {
  const lat = Number(attraction.latitude)
  const lng = Number(attraction.longitude)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return new kakao.maps.LatLng(lat, lng)
}

const getSafeLevel = (value, fallback = 6) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(14, Math.max(1, parsed))
}

const safeSetCenter = (latLng) => {
  if (!mapInstance.value || !latLng) return
  try {
    mapInstance.value.setCenter(latLng)
  } catch (error) {
    console.error('지도의 중심을 설정하지 못했습니다.', error)
  }
}

const safeSetLevel = (level, options) => {
  if (!mapInstance.value) return
  const targetLevel = getSafeLevel(level, mapInstance.value.getLevel())
  try {
    if (options) {
      mapInstance.value.setLevel(targetLevel, options)
    } else {
      mapInstance.value.setLevel(targetLevel)
    }
  } catch (error) {
    console.error('지도 줌 변경 중 오류가 발생했습니다.', error)
  }
}

const isMapReady = () =>
  !!(
    mapInstance.value &&
    typeof mapInstance.value.getLevel === 'function' &&
    typeof mapInstance.value.setCenter === 'function'
  )

const placeSingleMarker = (attraction, latLng) => {
  if (!isMapReady() || !latLng || !window.kakao?.maps) return
  cleanupMarkers()
  const marker = createMarker(window.kakao, attraction, { selected: true })
  if (!marker) return
  markers.value = [{ id: attraction.id, marker }]
}

const focusOnAttraction = (attraction) => {
  if (!isMapReady() || !window.kakao?.maps) return
  const kakao = window.kakao
  const latLng = toLatLng(kakao, attraction)
  if (!latLng) return

  selectedId.value = attraction.id
  placeSingleMarker(attraction, latLng)
  updateMarkerSelection(attraction.id)
  safeSetCenter(latLng)
  safeSetLevel(attraction.map_level ?? 6)
  updateVisibleList()
}

const scrollToCard = (id) => {
  const container = cardListRef.value
  const el = document.getElementById(getCardId(id))
  if (!container || !el) return
  const containerRect = container.getBoundingClientRect()
  const targetRect = el.getBoundingClientRect()
  const offset = targetRect.top - containerRect.top
  const nextScrollTop = container.scrollTop + offset - container.clientHeight / 2 + targetRect.height / 2
  container.scrollTo({ top: Math.max(nextScrollTop, 0), behavior: 'smooth' })
}

const updateVisibleList = () => {
  let list = [...attractions.value]

  if (viewMode.value === 'top') {
    // 현재 선택된 카테고리의 Top 100 ID 목록 가져오기
    // listActiveCategory.value.types는 배열이므로 첫 번째 요소를 사용하거나
    // 해당 카테고리에 맞는 ID 목록을 찾아야 함.
    // 여기서는 간단히 첫 번째 타입 ID를 키로 사용한다고 가정하거나,
    // TOP_100_ATTRACTIONS의 키와 매칭되는지 확인.

    // ATTRACTION_CATEGORY_GROUPS의 구조: { types: [12], ... }
    // TOP_100_ATTRACTIONS의 키: 12, 14, ...

    const currentTypeIds = listActiveCategory.value.types || []
    const topIds = []

    // 현재 카테고리에 속한 모든 타입의 Top 100 ID를 수집
    currentTypeIds.forEach(typeId => {
      if (TOP_100_ATTRACTIONS[typeId]) {
        topIds.push(...TOP_100_ATTRACTIONS[typeId])
      }
    })

    if (topIds.length > 0) {
      // Top 100 목록에 있는 것만 필터링
      list = list.filter(item => topIds.includes(item.id))

      // Top 100 순서대로 정렬 (indexOf 사용)
      list.sort((a, b) => {
        return topIds.indexOf(a.id) - topIds.indexOf(b.id)
      })

      // 카테고리가 병합(예: 15, 25)되어 100개가 넘을 경우 상위 100개만 유지
      if (list.length > 100) {
        list = list.slice(0, 100)
      }
    } else {
      // Top 100 데이터가 없으면 vote_sum (또는 readcount) 기준으로 정렬
      list.sort((a, b) => (b.vote_sum ?? 0) - (a.vote_sum ?? 0))
    }
  }

  visibleAttractions.value = list.slice(0, MAX_MARKERS)
}

const setViewMode = (mode) => {
  viewMode.value = mode
  updateVisibleList()
  if (cardListRef.value) {
    cardListRef.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const fetchAttractions = async () => {
  selectedId.value = null
  try {
    await fetchAttractionsFromStore({ contentTypeIds: requestedCategoryTypes.value })
    await nextTick()
    updateVisibleList()
  } catch (err) {
    // store에서 에러 상태를 관리하므로 별도 처리 없음
  }
}

const selectCategory = (key) => {
  const target = ATTRACTION_CATEGORY_GROUPS.find((item) => item.key === key) ?? ATTRACTION_CATEGORY_GROUPS[0]
  router.replace({
    name: 'attraction-list',
    query: { category: target.key, contentTypeId: target.types }
  })
}

const initMap = async () => {
  if (!mapContainer.value) return
  const kakao = await loadKakaoMaps()
  mapInstance.value = new kakao.maps.Map(mapContainer.value, {
    center: new kakao.maps.LatLng(36.5, 127.8),
    level: 13,
    scrollwheel: true,
    disableDoubleClickZoom: true
  })
  let zoomTimer = null
  kakao.maps.event.addListener(mapInstance.value, 'dragend', () => {
    updateVisibleList()
  })
  kakao.maps.event.addListener(mapInstance.value, 'zoom_changed', () => {
    if (zoomTimer) {
      clearTimeout(zoomTimer)
    }
    zoomTimer = setTimeout(() => {
      updateVisibleList()
    }, IDLE_DEBOUNCE_MS)
  })
  updateVisibleList()
}

watch(
  () => route.fullPath,
  async () => {
    syncCategoryFromRoute()
    await fetchAttractions()
  },
  { immediate: true }
)

onMounted(async () => {
  await initMap()
})

onBeforeUnmount(() => {
  cleanupMarkers()
  mapInstance.value = null
})
</script>

<template>
  <div class="page">
    <ContentCard>
      <header class="page-header">
        <div>
          <p class="eyebrow">카테고리 탐색</p>
          <h1 class="title">{{ listActiveCategory.label }} 여행지</h1>
          <p class="subtitle">왼쪽 지도에서 위치를 확인하고, 오른쪽 목록을 클릭해 자세히 볼 수 있어요.</p>
        </div>
      </header>

      <div class="category-row">
        <button
          v-for="item in ATTRACTION_CATEGORY_GROUPS"
          :key="item.key"
          type="button"
          class="category-btn"
          :class="{ active: item.key === listActiveCategory.key }"
          :style="{ '--accent': item.color }"
          @click="selectCategory(item.key)"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="layout">
        <section class="map-pane">
          <div ref="mapContainer" class="map-canvas"></div>
        </section>

        <section class="list-pane">
          <header class="list-header">
            <div>
              <p class="list-eyebrow">{{ listActiveCategory.label }} 목록</p>
              <p class="list-title">총 {{ visibleAttractions.length }}곳</p>
            </div>
            <div class="view-toggle">
              <button
                type="button"
                class="toggle-btn"
                :class="{ active: viewMode === 'all' }"
                @click="setViewMode('all')"
              >
                전체
              </button>
              <button
                type="button"
                class="toggle-btn"
                :class="{ active: viewMode === 'top' }"
                @click="setViewMode('top')"
              >
                리뷰 Top 100
              </button>
            </div>
          </header>

          <div v-if="attractionsLoading" class="state">불러오는 중입니다...</div>
          <div v-else-if="attractionsError" class="state error">{{ attractionsError }}</div>
          <div v-else-if="!visibleAttractions.length" class="state">
            {{ attractions.length ? '표시할 여행지가 없습니다.' : '카테고리에 해당하는 여행지가 없습니다.' }}
          </div>
          <div v-else ref="cardListRef" class="card-list">
            <article
              v-for="item in visibleAttractions"
              :key="item.id"
              :id="getCardId(item.id)"
              :data-id="item.id"
              class="place-card"
              :class="{ active: selectedId === item.id }"
              @click="
                focusOnAttraction(item);
                scrollToCard(item.id);
              "
            >
              <div class="card-top">
                <p class="card-title">{{ item.title }}</p>
                <span class="badge">{{ resolveCategoryLabel(item.content_type_id) }}</span>
              </div>
              <p class="card-addr">{{ item.addr1 }}</p>
              <p v-if="item.tel" class="card-tel">{{ item.tel }}</p>
            </article>
          </div>
        </section>
      </div>
    </ContentCard>
  </div>
</template>

<style scoped>
/* .page {
  min-height: 100vh;
  padding: 30px 0 50px;
  background: #f8fafc;
  color: #0f172a;
} */

.page-header {
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0;
  color: #6366f1;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.02em;
}

.title {
  margin: 4px 0 0;
  font-size: 28px;
  font-weight: 800;
}

.subtitle {
  margin: 6px 0 0;
  color: #475569;
}

.category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.category-btn {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.category-btn.active {
  color: #fff;
  background: var(--accent, #4338ca);
  border-color: var(--accent, #4338ca);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
}

.category-btn:hover {
  border-color: #cbd5e1;
}

.layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 14px;
  align-items: stretch;
}

.map-pane {
  background: #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  height: clamp(560px, 80vh, 820px);
}

.map-canvas {
  width: 100%;
  height: 100%;
}

.list-pane {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  height: clamp(560px, 80vh, 820px);
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.list-eyebrow {
  margin: 0;
  font-size: 13px;
  color: #475569;
}

.list-title {
  margin: 2px 0 0;
  font-size: 20px;
  font-weight: 800;
}

.view-toggle {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
}

.toggle-btn {
  border: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toggle-btn.active {
  background: #fff;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.state {
  padding: 20px;
  text-align: center;
  color: #475569;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.state.error {
  color: #b91c1c;
  border-color: #fecdd3;
  background: #fff5f5;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 6px;
  flex: 1;
  min-height: 0;
}

.place-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
  transition: all 0.15s ease;
  cursor: pointer;
}

.place-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 18px rgba(99, 102, 241, 0.12);
}

.place-card.active {
  border-color: #6366f1;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.18);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.badge {
  background: #eef2ff;
  color: #4338ca;
  padding: 4px 8px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
}

.card-addr {
  margin: 6px 0 0;
  color: #475569;
}

.card-tel {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .map-pane,
  .list-pane {
    min-height: 480px;
  }
}
</style>
