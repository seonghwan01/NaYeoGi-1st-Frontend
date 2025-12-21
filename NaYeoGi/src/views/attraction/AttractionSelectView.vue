<template>
  <div class="select-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">맞춤 추천</p>
        <h1 class="title">선호도 기반 추천 여행지</h1>
      </div>
      <button v-if="selectedId" type="button" class="ghost-btn" @click="showAllMarkers">
        전체 마커 보기
      </button>
    </header>

    <ContentCard>
      <div class="layout">
        <section class="selected-panel">
          <header class="selected-header">
            <div>
              <p class="eyebrow small">선택한 장소</p>
              <h2 class="selected-title">총 {{ selectedAttractions.length }}곳</h2>
            </div>
            <button v-if="selectedAttractions.length" type="button" class="ghost-btn sm" @click="clearSelections">
              모두 비우기
            </button>
          </header>
          <div class="selected-actions-row">
            <button type="button" class="primary-btn" :disabled="selectedAttractions.length === 0" @click="goPlan">
              계획 만들기
            </button>
            <p class="muted">{{ selectedAttractions.length ? '순서를 다음 단계에서 조정합니다.' : '최소 1개 이상 선택하세요.' }}</p>
          </div>
          <div v-if="selectedAttractions.length === 0" class="empty-selected">선택한 장소가 없습니다.</div>
          <div v-else class="selected-list">
            <article v-for="item in selectedAttractions" :key="item.id" class="selected-card">
              <div class="selected-thumb">
                <img v-if="item.first_image1" :src="item.first_image1" :alt="item.title" />
                <div v-else class="thumb-fallback">No Image</div>
              </div>
              <div class="selected-body">
                <div class="selected-top">
                  <div class="selected-name">{{ item.title }}</div>
                  <span class="selected-badge">{{ resolveCategoryLabel(item.content_type_id) }}</span>
                </div>
                <div class="selected-addr">{{ item.addr1 }}</div>
                <div class="selected-actions">
                  <button type="button" class="ghost-btn sm" @click="focusOnAttraction(item)">지도 보기</button>
                  <button type="button" class="remove-btn" @click="removeSelection(item.id)">삭제</button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <div class="map-pane">
          <div ref="mapContainer" class="map-canvas"></div>
        </div>

        <section class="list-pane">
          <header class="list-header">
            <div>
              <p class="list-count">총 {{ displayedAttractions.length }}곳</p>
              <p class="list-sub">추천 점수 높은 순으로 정렬했어요.</p>
            </div>
          </header>

          <div class="tab-row">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              class="tab-btn"
              :class="{ active: activeTab === tab.key }"
              @click="switchTab(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="card-list">
            <article
              v-for="attraction in displayedAttractions"
              :key="attraction.id"
              class="card"
              :class="{ active: selectedId === attraction.id }"
              @click="focusOnAttraction(attraction)"
            >
              <div class="thumb">
                <img v-if="attraction.first_image1" :src="attraction.first_image1" :alt="attraction.title" />
                <div v-else class="thumb-fallback">No Image</div>
              </div>
              <div class="card-body">
                <div class="card-title">{{ attraction.title }}</div>
                <div class="card-addr">{{ attraction.addr1 }}</div>
                <div class="meta-row">
                  <span class="badge">점수 {{ attraction.cal_score?.toFixed(3) ?? 'N/A' }}</span>
                  <span v-if="attraction.tel" class="muted">{{ attraction.tel }}</span>
                </div>
                <div class="card-actions">
                  <button
                    type="button"
                    class="ghost-btn sm"
                    :class="{ active: isSelected(attraction.id) }"
                    @click.stop="toggleSelection(attraction)"
                  >
                    {{ isSelected(attraction.id) ? '선택됨' : '선택하기' }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </ContentCard>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { loadKakaoMaps } from '@/restapi/attraction'
import { useAttractionStore } from '@/stores/attractions'
import ContentCard from '@/components/common/ContentCard.vue';

const router = useRouter()
const attractionStore = useAttractionStore()
const tabs = attractionStore.tabs
const {
  recommendations,
  displayedAttractions,
  selectedAttractions,
  selectedId,
  activeTab,
  selectedRegion,
  selectedTopics,
  isRecommending
} = storeToRefs(attractionStore)
const {
  clearSelections,
  isSelected,
  removeSelection,
  resolveCategoryLabel,
  setSelectedId,
  toggleSelection,
  fetchRecommendationsForTab
} = attractionStore

const mapContainer = ref(null)
const mapInstance = ref(null)
const markers = ref([])

const cleanupMarkers = () => {
  markers.value.forEach((marker) => marker.setMap(null))
  markers.value = []
}

const createMarker = (kakao, attraction) => {
  const position = new kakao.maps.LatLng(attraction.latitude, attraction.longitude)
  const marker = new kakao.maps.Marker({ position })
  marker.setMap(mapInstance.value)

  kakao.maps.event.addListener(marker, 'click', () => focusOnAttraction(attraction))
  return marker
}

const renderAllMarkers = (kakao) => {
  cleanupMarkers()
  markers.value = displayedAttractions.value.map((item) => createMarker(kakao, item))
  if (displayedAttractions.value.length > 0) {
    const first = displayedAttractions.value[0]
    mapInstance.value.setCenter(new kakao.maps.LatLng(first.latitude, first.longitude))
    mapInstance.value.setLevel(first.map_level ?? 6)
  } else {
    setSelectedId(null)
    return
  }
  setSelectedId(null)
}

const focusOnAttraction = (attraction) => {
  if (!window.kakao?.maps || !mapInstance.value) return
  const kakao = window.kakao
  setSelectedId(attraction.id)

  cleanupMarkers()
  const singleMarker = createMarker(kakao, attraction)
  markers.value = [singleMarker]
  mapInstance.value.setCenter(new kakao.maps.LatLng(attraction.latitude, attraction.longitude))
  mapInstance.value.setLevel(attraction.map_level ?? 5)
}

const showAllMarkers = () => {
  if (!window.kakao?.maps) return
  renderAllMarkers(window.kakao)
}

const switchTab = async (key) => {
  if (isRecommending.value) return
  try {
    await fetchRecommendationsForTab({ tabKey: key })
    if (window.kakao?.maps) {
      renderAllMarkers(window.kakao)
    }
  } catch (error) {
    console.error(error)
  }
}

const initMap = async () => {
  if (!mapContainer.value) return
  const kakao = await loadKakaoMaps()
  mapInstance.value = new kakao.maps.Map(mapContainer.value, {
    center: new kakao.maps.LatLng(36.5, 127.8),
    level: 10
  })
  renderAllMarkers(kakao)
}

watch(
  recommendations,
  (newVal) => {
    if (isRecommending.value) return
    if (newVal.length === 0) {
      if (!selectedRegion.value || selectedTopics.value.length === 0) {
        router.replace({ name: 'attraction-recommend' })
      }
      return
    }
    if (mapInstance.value && window.kakao?.maps) {
      renderAllMarkers(window.kakao)
    }
  },
  { immediate: true }
)

watch(
  activeTab,
  () => {
    if (mapInstance.value && window.kakao?.maps) {
      renderAllMarkers(window.kakao)
    }
  },
  { immediate: false }
)

onMounted(async () => {
  if (recommendations.value.length === 0) {
    if (!selectedRegion.value || selectedTopics.value.length === 0) {
      router.replace({ name: 'attraction-recommend' })
      return
    }
    try {
      await fetchRecommendationsForTab({ tabKey: activeTab.value })
    } catch (error) {
      console.error(error)
      router.replace({ name: 'attraction-recommend' })
      return
    }
  }
  await initMap()
})

onBeforeUnmount(() => {
  cleanupMarkers()
  mapInstance.value = null
})

const goPlan = () => {
  if (!selectedAttractions.value.length) return
  router.push({ name: 'attraction-plan' })
}
</script>

<style scoped>
.select-page {
  min-height: 100vh;
  /* background: #f7f9fb; - 제거 */
  /* padding: 20px; - 제거 */
  color: #1f2d3d;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto 18px;
  padding-top: 20px; /* 위쪽 패딩만 유지 */
}

.eyebrow {
  margin: 0;
  font-size: 13px;
  color: #6366f1;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.title {
  margin: 4px 0 0;
  font-size: 26px;
  font-weight: 800;
}

.ghost-btn {
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 10px 14px;
  border-radius: 10px;
  color: #4b5563;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ghost-btn:hover {
  border-color: #c7d2fe;
  color: #4338ca;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 16px;
  max-width: 1480px;
  margin: 0 auto;
}

.map-pane {
  background: #dfe7f1;
  border-radius: 16px;
  height: 800px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.map-canvas {
  width: 100%;
  height: 100%;
  border-radius: 16px;
}

.selected-panel {
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 800px;
}

.selected-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selected-title {
  margin: 2px 0 0;
  font-size: 20px;
  font-weight: 800;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 2px;
  max-height: 700px;
}

.selected-actions-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.primary-btn {
  background: #4338ca;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  min-width: 140px;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.primary-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}

.primary-btn:not(:disabled):hover {
  box-shadow: 0 6px 16px rgba(67, 56, 202, 0.2);
}

.selected-card {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
}

.selected-thumb {
  width: 100%;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  background: #eef2f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selected-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.selected-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.selected-name {
  font-weight: 700;
  font-size: 15px;
}

.selected-badge {
  background: #eef2ff;
  color: #4338ca;
  padding: 4px 8px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
}

.selected-addr {
  color: #6b7280;
  font-size: 13px;
}

.selected-actions {
  display: flex;
  gap: 8px;
}

.remove-btn {
  border: 1px solid #fecdd3;
  background: #fff5f5;
  color: #b91c1c;
  padding: 8px 10px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.empty-selected {
  padding: 12px;
  color: #6b7280;
  font-size: 14px;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
  height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-canvas {
  width: 100%;
  height: 100%;
  border-radius: 16px;
}

.list-pane {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 800px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.tab-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.tab-btn {
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 10px 12px;
  border-radius: 10px;
  color: #4b5563;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn.active {
  background: #4338ca;
  color: #fff;
  border-color: #4338ca;
  box-shadow: 0 6px 16px rgba(67, 56, 202, 0.2);
}

.tab-btn:hover {
  border-color: #c7d2fe;
  color: #4338ca;
}

.list-count {
  margin: 0;
  font-weight: 700;
}

.list-sub {
  margin: 2px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-right: 6px;
  flex: 1;
}

.card {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.12);
  transform: translateY(-1px);
}

.card.active {
  border-color: #4f46e5;
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.18);
}

.thumb {
  width: 100%;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  background: #eef2f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-fallback {
  font-size: 13px;
  color: #6b7280;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-title {
  font-weight: 800;
  font-size: 16px;
  margin: 0;
}

.card-addr {
  color: #4b5563;
  font-size: 14px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.badge {
  background: #eef2ff;
  color: #4338ca;
  padding: 4px 8px;
  border-radius: 999px;
  font-weight: 700;
}

.muted {
  color: #6b7280;
}

.card-actions {
  display: flex;
  margin-top: 4px;
}

.ghost-btn.sm {
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
}

.ghost-btn.sm.active {
  background: #4338ca;
  color: #fff;
  border-color: #4338ca;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .list-pane {
    max-height: none;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .card {
    grid-template-columns: 100px 1fr;
  }
}
</style>
