<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ContentCard from '@/components/common/ContentCard.vue'
import { loadKakaoMaps } from '@/restapi/attraction'
import { ATTRACTION_CATEGORY_GROUPS, useAttractionStore } from '@/stores/attractions'

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

const mapContainer = ref(null)
const mapInstance = ref(null)
const markers = ref([])

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
  markers.value.forEach((marker) => marker.setMap(null))
  markers.value = []
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

const placeSingleMarker = (latLng) => {
  if (!isMapReady() || !latLng || !window.kakao?.maps) return
  cleanupMarkers()
  const marker = new window.kakao.maps.Marker({ position: latLng })
  marker.setMap(mapInstance.value)
  markers.value = [marker]
}

const focusOnAttraction = (attraction) => {
  if (!isMapReady() || !window.kakao?.maps) return
  const kakao = window.kakao
  const latLng = toLatLng(kakao, attraction)
  if (!latLng) return

  selectedId.value = attraction.id
  placeSingleMarker(latLng)
  safeSetCenter(latLng)
  safeSetLevel(attraction.map_level ?? 6)
  updateVisibleList()
}

const scrollToCard = (id) => {
  const el = document.getElementById(getCardId(id))
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const updateVisibleList = () => {
  // 지도 범위와 무관하게 불러온 전체 목록(상한선 MAX_MARKERS)을 표시
  visibleAttractions.value = attractions.value.slice(0, MAX_MARKERS)
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
          </header>

          <div v-if="attractionsLoading" class="state">불러오는 중입니다...</div>
          <div v-else-if="attractionsError" class="state error">{{ attractionsError }}</div>
          <div v-else-if="!visibleAttractions.length" class="state">
            {{ attractions.length ? '표시할 여행지가 없습니다.' : '카테고리에 해당하는 여행지가 없습니다.' }}
          </div>
          <div v-else class="card-list">
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