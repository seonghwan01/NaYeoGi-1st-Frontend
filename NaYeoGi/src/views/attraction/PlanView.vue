<template>
  <div class="plan-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">나의 여정</p>
        <h1 class="title">여행 계획 만들기</h1>
        <p class="sub">선택한 장소 순서를 드래그해서 저장하세요.</p>
      </div>
      <button type="button" class="ghost-btn" @click="router.push({ name: 'attraction-select' })">
        선택 다시 하기
      </button>
    </header>

    <main class="layout">
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
          <div class="muted">총 {{ plannedAttractions.length }}곳 · 순서대로 저장됩니다.</div>
          <button type="button" class="primary-btn" :disabled="isSubmitting" @click="submitPlan">
            {{ isSubmitting ? '저장 중...' : '계획 저장' }}
          </button>
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </section>

      <section class="list-card">
        <div class="list-header">
          <div>
            <p class="eyebrow small">방문 순서</p>
            <h2 class="list-title">드래그해서 순서를 바꾸세요</h2>
          </div>
          <div class="muted">위쪽 카드일수록 먼저 방문합니다.</div>
        </div>

        <div v-if="!plannedAttractions.length" class="empty">선택된 여행지가 없습니다.</div>
        <ul v-else class="drag-list">
          <li
            v-for="(item, index) in plannedAttractions"
            :key="item.id"
            class="drag-card"
            draggable="true"
            @dragstart="handleDragStart(index)"
            @dragover.prevent
          @drop="handleDrop(index)"
          @dragend="handleDragEnd"
        >
            <div class="drag-handle" aria-hidden="true">::</div>
            <div class="drag-body">
              <div class="drag-top">
                <span class="order-badge">{{ index + 1 }}</span>
                <div class="name">{{ item.title }}</div>
              </div>
              <div class="muted">{{ item.addr1 }}</div>
            </div>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAttractionStore } from '@/stores/attractions'
import { requestCurrentMember } from '@/restapi/attraction'
import { requestCreatePlan } from '@/restapi/plan'

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
const dragIndex = ref(null)
const memberId = ref(null)
const isSubmitting = ref(false)
const errorMessage = ref('')

const handleDragStart = (index) => {
  dragIndex.value = index
}

const handleDrop = (index) => {
  if (dragIndex.value === null) return
  const updated = [...plannedAttractions.value]
  const [moved] = updated.splice(dragIndex.value, 1)
  updated.splice(index, 0, moved)
  plannedAttractions.value = updated
  dragIndex.value = null
}

const handleDragEnd = () => {
  dragIndex.value = null
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

  try {
    await requestCreatePlan({
      memberId: memberId.value,
      title: form.title.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description.trim(),
      attractionId: plannedAttractions.value.map((item) => item.id)
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
  plannedAttractions.value = selectedAttractions.value.map((item) => ({ ...item }))
  await fetchCurrentMember()
})
</script>

<style scoped>
.plan-page {
  min-height: 100vh;
  background: #f7f9fb;
  color: #1f2d3d;
  padding: 20px;
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

.form-card,
.list-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
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
}

.drag-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drag-card {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
}

.drag-card:hover {
  border-color: #c7d2fe;
}

.drag-handle {
  display: grid;
  place-items: center;
  background: #f3f4ff;
  color: #4338ca;
  border-radius: 10px;
  font-weight: 800;
  font-size: 18px;
  cursor: grab;
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
  background: #eef2ff;
  color: #4338ca;
  font-weight: 800;
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

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
