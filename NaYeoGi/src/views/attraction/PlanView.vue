<template>
  <ContentCard
    :class="['plan-content-card', { 'plan-content-card--wide': planLayout.isWide }]"
    :style="planCardStyle"
  >
    <div class="plan-page" :class="{ 'is-wide': planLayout.isWide }">
      <header class="page-header">
        <div>
          <p class="eyebrow">나의 여정</p>
          <h1 class="title">여행 계획 만들기</h1>
          <p class="sub">선택한 장소를 날짜별로 드래그해 저장하세요.</p>
        </div>
        <button type="button" class="ghost-btn" @click="router.push({ name: 'attraction-select' })">
          선택 다시 하기
        </button>
      </header>

      <main :class="['layout', { 'has-days': hasScheduleDays, 'is-wide': planLayout.isWide }]">
        <section class="form-card">
          <h2 class="section-title">기본 정보</h2>
          <div class="field">
            <label for="title">제목</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="예) 부산 2박 3일 가족 여행"
              autocomplete="off"
            />
          </div>


          <div class="field-row">
            <div class="field">
              <label for="start">시작일</label>
              <input id="start" v-model="form.startDate" type="date" />
            </div>
            <div class="field">
              <label for="end">종료일</label>
              <input id="end" v-model="form.endDate" type="date" />
            </div>
          </div>

          <div class="field">
            <label for="description">메모</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              placeholder="일정에 대한 간단한 설명을 남겨주세요."
            ></textarea>
          </div>

          <div class="info-row">
            <div class="muted"><!--총 {{ totalAttractionCount }}곳 · 날짜별 순서로 저장됩니다.--></div>
            <button type="button" class="primary-btn" :disabled="isSubmitting" @click="submitPlan">
              {{ isSubmitting ? '저장 중...' : '계획 저장' }}
            </button>
          </div>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <div class="map-section">
            <div class="map-header">
              <h3 class="map-title">여행지 위치</h3>
              <p class="muted">날짜별 순서가 지도에 표시됩니다.</p>
            </div>
            <div class="map-pane">
              <div ref="mapContainer" class="map-canvas"></div>
              <div v-if="!mapItems.length" class="map-empty">
                여행 기간을 선택하면 지도에 위치가 표시됩니다.
              </div>
            </div>
          </div>
        </section>

        <section class="list-card">
          <div class="list-header">
            <div>
              <p class="eyebrow small">일정 구성</p>
              <h2 class="list-title">방문을 원하시는 날짜에 드래그 해주세요</h2>
            </div>
            <div class="muted">날짜별로 여행지 방문 순서를 정해주세요.</div>
          </div>
          <div v-if="!scheduleDays.length" class="empty">
            여행 기간을 선택하면 날짜별 칸이 생성됩니다.
          </div>
          <div v-else class="day-board" role="list">
            <div
              v-for="(day, dayIndex) in scheduleDays"
              :key="`day-${day.planDate}`"
              class="day-column"
            >
              <div class="day-header">
                <div class="day-title">
                  <span class="day-sequence">Day {{ day.planDate }}</span>
                  <strong v-if="day.dateLabel">{{ day.dateLabel }}</strong>
                  <strong v-else>날짜 미지정</strong>
                </div>
                <span class="badge">{{ day.items.length }}곳</span>
              </div>
              <ul class="day-list" @dragover.prevent @drop="handleColumnDrop(dayIndex)">
                <li
                  v-for="(item, itemIndex) in day.items"
                  :key="item.uid"
                  class="drag-card"
                  :class="{ active: selectedAttractionUid === item.uid }"
                  :style="getItemStyle(dayIndex)"
                  draggable="true"
                  @click="focusOnAttraction(item)"
                  @dragstart="handleDragStart(dayIndex, itemIndex, $event)"
                  @dragend="handleDragEnd"
                  @dragover.prevent
                  @drop.stop="handleCardDrop(dayIndex, itemIndex)"
                >
                  <div class="drag-body">
                    <div class="drag-top">
                      <span class="order-badge">{{ itemIndex + 1 }}</span>
                      <div class="name">{{ item.title }}</div>
                    </div>
                    <div class="muted">{{ item.addr1 }}</div>
                  </div>
                </li>
                <li v-if="!day.items.length" class="placeholder">이 날짜에 방문지를 끌어다 놓으세요.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  </ContentCard>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAttractionStore } from '@/stores/attractions'
import { loadKakaoMaps, requestCurrentMember } from '@/restapi/attraction'
import { requestCreatePlan } from '@/restapi/plan'
import ContentCard from '@/components/common/ContentCard.vue'

const router = useRouter()
const attractionStore = useAttractionStore()
const { selectedAttractions } = storeToRefs(attractionStore)

const form = reactive({
  title: '',
  startDate: '',
  endDate: '',
  description: ''
})

const plannedAttractions = ref([])
const scheduleDays = ref([])
const mapContainer = ref(null)
const mapInstance = ref(null)
const mapOverlays = ref([])
const selectedAttractionUid = ref(null)
const hasInitialCenter = ref(false)
const dragState = reactive({
  dayIndex: null,
  itemIndex: null
})
const memberId = ref(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const totalAttractionCount = computed(() => plannedAttractions.value.length)
const hasScheduleDays = computed(() => scheduleDays.value.length > 0)
const mapItems = computed(() =>
  scheduleDays.value.flatMap((day, dayIndex) =>
    day.items.map((item, itemIndex) => ({
      item,
      uid: item.uid,
      dayIndex,
      itemIndex
    }))
  )
)

const PLAN_CARD_BASE_WIDTH = 1200
const PLAN_CARD_PADDING_X = 64
const PLAN_FORM_WIDTH = 500
const PLAN_LIST_PADDING = 36
const PLAN_DAY_COLUMN_WIDTH = 260
const PLAN_DAY_COLUMN_GAP = 16
const PLAN_LAYOUT_GAP = 16

const planLayout = computed(() => {
  const dayCount = scheduleDays.value.length
  if (!dayCount) {
    return {
      isWide: false,
      cardWidth: PLAN_CARD_BASE_WIDTH,
      listWidth: 0
    }
  }

  const listInnerWidth =
    dayCount * PLAN_DAY_COLUMN_WIDTH + Math.max(0, dayCount - 1) * PLAN_DAY_COLUMN_GAP
  const listOuterWidth = listInnerWidth + PLAN_LIST_PADDING
  const requiredWidth = PLAN_FORM_WIDTH + PLAN_LAYOUT_GAP + listOuterWidth

  return {
    isWide: requiredWidth > PLAN_CARD_BASE_WIDTH,
    cardWidth: Math.max(PLAN_CARD_BASE_WIDTH, requiredWidth),
    listWidth: listOuterWidth
  }
})

const planCardStyle = computed(() => {
  if (!planLayout.value.isWide) {
    return {}
  }

  return {
    '--plan-card-width': `${planLayout.value.cardWidth + PLAN_CARD_PADDING_X}px`,
    '--plan-list-width': `${planLayout.value.listWidth}px`,
    '--plan-form-width': `${PLAN_FORM_WIDTH}px`
  }
})

const DAY_COLOR_PALETTE = [
  {
    badgeBg: '#eef2ff',
    badgeColor: '#4338ca',
    badgeBorder: '#4338ca',
    badgeShadow: 'rgba(67, 56, 202, 0.25)'
  },
  {
    badgeBg: '#ecfeff',
    badgeColor: '#0e7490',
    badgeBorder: '#0e7490',
    badgeShadow: 'rgba(14, 116, 144, 0.25)'
  },
  {
    badgeBg: '#fef3c7',
    badgeColor: '#b45309',
    badgeBorder: '#b45309',
    badgeShadow: 'rgba(180, 83, 9, 0.25)'
  },
  {
    badgeBg: '#fee2e2',
    badgeColor: '#b91c1c',
    badgeBorder: '#b91c1c',
    badgeShadow: 'rgba(185, 28, 28, 0.25)'
  },
  {
    badgeBg: '#ecfccb',
    badgeColor: '#3f6212',
    badgeBorder: '#3f6212',
    badgeShadow: 'rgba(63, 98, 18, 0.25)'
  },
  {
    badgeBg: '#ede9fe',
    badgeColor: '#6d28d9',
    badgeBorder: '#6d28d9',
    badgeShadow: 'rgba(109, 40, 217, 0.25)'
  }
]

const getDayPalette = (dayIndex) => DAY_COLOR_PALETTE[dayIndex % DAY_COLOR_PALETTE.length]

const getItemStyle = (dayIndex) => {
  const palette = getDayPalette(dayIndex)
  return {
    '--badge-bg': palette.badgeBg,
    '--badge-color': palette.badgeColor,
    '--badge-border': palette.badgeBorder,
    '--badge-shadow': palette.badgeShadow,
    '--accent-color': palette.badgeBorder,
    '--accent-shadow': palette.badgeShadow
  }
}

const createAttractionEntries = (items) =>
  items.map((item, index) => ({
    ...item,
    uid: `${item.id}-${index}-${Math.random().toString(36).slice(2, 9)}`
  }))

const buildPlanDetailsPayload = () =>
  scheduleDays.value.flatMap((day) =>
    day.items.map((item, index) => ({
      attractionId: item.id,
      planDate: day.planDate,
      sequence: index + 1
    }))
  )

const formatDateLabel = (date) => {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'long',
      day: 'numeric'
    }).format(date)
  } catch (error) {
    console.error(error)
    return date.toISOString().split('T')[0]
  }
}

const buildScheduleDays = () => {
  if (!form.startDate || !form.endDate) {
    scheduleDays.value = []
    return
  }

  const start = new Date(form.startDate)
  const end = new Date(form.endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    scheduleDays.value = []
    return
  }

  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
  if (diff <= 0) {
    scheduleDays.value = []
    return
  }

  const entryMap = new Map(plannedAttractions.value.map((item) => [item.uid, item]))
  const assigned = new Set()

  const newDays = Array.from({ length: diff }, (_, idx) => {
    const date = new Date(start)
    date.setDate(start.getDate() + idx)
    return {
      planDate: idx + 1,
      dateLabel: formatDateLabel(date),
      items: []
    }
  })

  scheduleDays.value.forEach((day) => {
    const targetDay = newDays[day.planDate - 1]
    if (!targetDay) return
    day.items.forEach((item) => {
      const mapped = entryMap.get(item.uid)
      if (mapped && !assigned.has(mapped.uid)) {
        targetDay.items.push(mapped)
        assigned.add(mapped.uid)
      }
    })
  })

  const fallbackDay = newDays[0]
  entryMap.forEach((entry) => {
    if (!assigned.has(entry.uid) && fallbackDay) {
      fallbackDay.items.push(entry)
      assigned.add(entry.uid)
    }
  })

  scheduleDays.value = newDays
}

watch(
  [() => form.startDate, () => form.endDate, () => plannedAttractions.value.length],
  () => {
    buildScheduleDays()
  },
  { immediate: true }
)

const handleDragStart = (dayIndex, itemIndex, event) => {
  dragState.dayIndex = dayIndex
  dragState.itemIndex = itemIndex
  if (event?.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
  }
}

const moveItem = (targetDayIndex, targetItemIndex = null) => {
  if (dragState.dayIndex === null || dragState.itemIndex === null) return
  if (targetDayIndex === null) return
  const updatedDays = scheduleDays.value.map((day) => ({
    ...day,
    items: [...day.items]
  }))
  const sourceItems = updatedDays[dragState.dayIndex]?.items
  const targetItems = updatedDays[targetDayIndex]?.items
  if (!sourceItems || !targetItems) {
    dragState.dayIndex = null
    dragState.itemIndex = null
    return
  }
  const [moved] = sourceItems.splice(dragState.itemIndex, 1)
  if (!moved) {
    dragState.dayIndex = null
    dragState.itemIndex = null
    return
  }
  let insertIndex =
    targetItemIndex === null || targetItemIndex > targetItems.length
      ? targetItems.length
      : targetItemIndex

  if (
    targetItemIndex !== null &&
    dragState.dayIndex === targetDayIndex &&
    dragState.itemIndex < targetItemIndex
  ) {
    insertIndex = Math.max(insertIndex - 1, 0)
  }

  targetItems.splice(insertIndex, 0, moved)
  scheduleDays.value = updatedDays
  dragState.dayIndex = null
  dragState.itemIndex = null
}

const handleCardDrop = (dayIndex, itemIndex) => {
  moveItem(dayIndex, itemIndex)
}

const handleColumnDrop = (dayIndex) => {
  moveItem(dayIndex, null)
}

const handleDragEnd = () => {
  dragState.dayIndex = null
  dragState.itemIndex = null
}

const toLatLng = (kakao, attraction) => {
  const lat = Number(attraction.latitude)
  const lng = Number(attraction.longitude)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return new kakao.maps.LatLng(lat, lng)
}

const cleanupOverlays = () => {
  mapOverlays.value.forEach(({ overlay }) => overlay.setMap(null))
  mapOverlays.value = []
}

const applyBadgeTheme = (el, dayIndex) => {
  const palette = getDayPalette(dayIndex)
  el.style.setProperty('--badge-bg', palette.badgeBg)
  el.style.setProperty('--badge-color', palette.badgeColor)
  el.style.setProperty('--badge-border', palette.badgeBorder)
  el.style.setProperty('--badge-shadow', palette.badgeShadow)
}

const updateMarkerSelection = (uid) => {
  mapOverlays.value.forEach(({ uid: markerUid, overlay, element }) => {
    const isActive = markerUid === uid
    element.classList.toggle('is-active', isActive)
    overlay.setZIndex(isActive ? 3 : 1)
  })
}

const focusOnAttraction = (attraction) => {
  if (!attraction) return
  selectedAttractionUid.value = attraction.uid
  updateMarkerSelection(attraction.uid)
}

const createOverlayMarker = (kakao, entry) => {
  const latLng = toLatLng(kakao, entry.item)
  if (!latLng) return null
  const el = document.createElement('div')
  el.className = 'marker-badge order-badge'
  el.textContent = String(entry.itemIndex + 1)
  el.setAttribute('role', 'button')
  el.setAttribute('aria-label', `${entry.item.title} ${entry.itemIndex + 1}번째 방문지`)
  applyBadgeTheme(el, entry.dayIndex)
  el.addEventListener('click', (event) => {
    event.stopPropagation()
    focusOnAttraction(entry.item)
  })
  if (selectedAttractionUid.value === entry.uid) {
    el.classList.add('is-active')
  }
  const overlay = new kakao.maps.CustomOverlay({
    position: latLng,
    content: el,
    clickable: true,
    xAnchor: 0.5,
    yAnchor: 0.5,
    zIndex: selectedAttractionUid.value === entry.uid ? 3 : 1
  })
  overlay.setMap(mapInstance.value)
  return { uid: entry.uid, overlay, element: el }
}

const renderMarkers = () => {
  if (!mapInstance.value || !window.kakao?.maps) return
  const kakao = window.kakao
  cleanupOverlays()

  mapOverlays.value = mapItems.value
    .map((entry) => createOverlayMarker(kakao, entry))
    .filter(Boolean)

  if (!hasInitialCenter.value) {
    const firstEntry = mapItems.value.find((entry) => toLatLng(kakao, entry.item))
    if (firstEntry) {
      mapInstance.value.setCenter(toLatLng(kakao, firstEntry.item))
      hasInitialCenter.value = true
    }
  }
}

const initMap = async () => {
  if (!mapContainer.value) return
  const kakao = await loadKakaoMaps()
  mapInstance.value = new kakao.maps.Map(mapContainer.value, {
    center: new kakao.maps.LatLng(36.5, 127.8),
    level: 10,
    scrollwheel: true,
    disableDoubleClickZoom: true
  })
  renderMarkers()
}

const fetchCurrentMember = async () => {
  try {
    const data = await requestCurrentMember()
    memberId.value = data?.data?.userId ?? data?.userId ?? null
  } catch (error) {
    console.error(error)
    errorMessage.value = '로그인이 필요합니다. 다시 로그인해주세요.'
  }
}

const validateForm = () => {
  if (!form.title.trim() || !form.startDate || !form.endDate || !form.description.trim()) {
    errorMessage.value = '모든 필드를 입력해주세요.'
    return false
  }

  if (!plannedAttractions.value.length) {
    errorMessage.value = '저장할 여행지를 선택해주세요.'
    return false
  }

  if (new Date(form.startDate) > new Date(form.endDate)) {
    errorMessage.value = '시작일은 종료일보다 늦을 수 없습니다.'
    return false
  }

  if (!memberId.value) {
    errorMessage.value = '로그인 정보가 확인되지 않습니다.'
    return false
  }

  const planDetails = buildPlanDetailsPayload()

  if (!planDetails.length) {
    errorMessage.value = '모든 여행지를 방문 날짜에 배치해주세요.'
    return false
  }

  if (planDetails.length !== plannedAttractions.value.length) {
    errorMessage.value = '모든 여행지를 날짜에 맞게 배정해주세요.'
    return false
  }

  errorMessage.value = ''
  return true
}

const submitPlan = async () => {
  if (isSubmitting.value) return

  if (!memberId.value) {
    await fetchCurrentMember()
  }

  if (!validateForm()) return

  isSubmitting.value = true

  const planDetails = buildPlanDetailsPayload()

  try {
    await requestCreatePlan({
      memberId: memberId.value,
      title: form.title.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description.trim(),
      attractionId: plannedAttractions.value.map((item) => item.id),
      planDetails
    })
    router.push({ name: 'main' })
  } catch (error) {
    console.error(error)
    errorMessage.value = error?.message ?? '계획 저장에 실패했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  if (!selectedAttractions.value.length) {
    router.replace({ name: 'attraction-select' })
    return
  }
  plannedAttractions.value = createAttractionEntries(selectedAttractions.value)
  await fetchCurrentMember()
  await initMap()
})

watch(
  mapItems,
  (items) => {
    if (!items.length) {
      cleanupOverlays()
      selectedAttractionUid.value = null
      hasInitialCenter.value = false
      return
    }
    renderMarkers()
    if (selectedAttractionUid.value && !items.some((entry) => entry.uid === selectedAttractionUid.value)) {
      selectedAttractionUid.value = null
      updateMarkerSelection(null)
    }
  },
  { immediate: false }
)

onBeforeUnmount(() => {
  cleanupOverlays()
  mapInstance.value = null
})
</script>

<style scoped>
:deep(.content-card.plan-content-card--wide) {
  width: var(--plan-card-width, 1200px);
  margin: 0 auto;
}

.plan-page.is-wide .page-header {
  max-width: none;
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto 18px;
}

.eyebrow {
  margin: 0;
  font-size: 13px;
  color: #6366f1;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.eyebrow.small {
  font-size: 12px;
}

.title {
  margin: 4px 0 0;
  font-size: 26px;
  font-weight: 800;
}

.sub {
  margin: 6px 0 0;
  color: #6b7280;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.layout.has-days {
  grid-template-columns: minmax(280px, 0.85fr) minmax(0, 1.15fr);
}

.layout.is-wide {
  grid-template-columns: var(--plan-form-width, 500px) var(--plan-list-width, 1fr);
  max-width: none;
  width: 100%;
}

.form-card,
.list-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  height: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.form-card {
  overflow-y: auto;
}

.section-title,
.list-title {
  margin: 0 0 14px;
  font-weight: 800;
  font-size: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.field label {
  font-weight: 700;
  color: #374151;
}

.field input,
.field textarea {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field input:focus,
.field textarea:focus {
  border-color: #4338ca;
  box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.15);
  outline: none;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}

.muted {
  color: #6b7280;
  font-size: 13px;
}

.primary-btn {
  background: #4338ca;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  min-width: 120px;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.primary-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}

.primary-btn:not(:disabled):hover {
  box-shadow: 0 8px 20px rgba(67, 56, 202, 0.2);
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

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.day-board {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(260px, 1fr);
  gap: 16px;
  overflow-x: visible;
  padding-bottom: 8px;
  flex: 1;
}

.day-column {
  display: flex;
  flex-direction: column;
  background: #f9fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 12px;
  height: 100%;
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 10px;
}

.day-title {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #111827;
}

.day-sequence {
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
  font-weight: 700;
}

.day-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.placeholder {
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  padding: 30px 12px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

.drag-card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.drag-card:hover {
  border-color: #c7d2fe;
}

.drag-card.active {
  border-color: var(--accent-color, #4f46e5);
  box-shadow: 0 8px 20px var(--accent-shadow, rgba(79, 70, 229, 0.18));
}

.drag-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drag-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--badge-bg, #eef2ff);
  color: var(--badge-color, #4338ca);
  border: 1px solid var(--badge-border, #4338ca);
  font-weight: 800;
  box-shadow: 0 4px 10px var(--badge-shadow, rgba(67, 56, 202, 0.25));
}

.name {
  font-weight: 700;
  font-size: 15px;
}

.empty {
  border: 1px dashed #e5e7eb;
  padding: 16px;
  text-align: center;
  color: #6b7280;
  border-radius: 12px;
}

.error {
  margin-top: 10px;
  color: #b91c1c;
  font-weight: 700;
}

.map-section {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.map-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.map-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
}

.map-pane {
  position: relative;
  height: 280px;
  border-radius: 14px;
  background: #e2e8f0;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.map-canvas {
  width: 100%;
  height: 100%;
}

.map-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 12px;
}

:deep(.marker-badge.order-badge) {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--badge-bg, #eef2ff);
  color: var(--badge-color, #4338ca);
  border: 1px solid var(--badge-border, #4338ca);
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px var(--badge-shadow, rgba(67, 56, 202, 0.25));
  cursor: pointer;
  user-select: none;
}

:deep(.marker-badge.order-badge.is-active) {
  box-shadow:
    0 0 0 3px rgba(15, 23, 42, 0.25),
    0 10px 20px var(--badge-shadow, rgba(67, 56, 202, 0.25));
}

@media (max-width: 1024px) {
  :deep(.content-card.plan-content-card--wide) {
    width: 100%;
  }

  .layout {
    grid-template-columns: 1fr;
  }

  .layout.is-wide {
    grid-template-columns: 1fr;
    width: 100%;
  }

  .day-board {
    overflow-x: auto;
  }
}
</style>
