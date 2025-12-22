<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/members'
import axios from 'axios'

const router = useRouter()
const memberStore = useMemberStore()

// 1. 상태 변수들
const activeTab = ref('plans') // 현재 선택된 탭 (plans, stories)
const myPlans = ref([]) // 내 여행 계획 리스트
const isPlansLoading = ref(false)
const planError = ref('')
const myStories = ref([]) // 내 스토리북 리스트
const planOwnerId = ref('')
const editingPlanId = ref(null)
const editingPlanDraft = ref(null)
const isSavingPlan = ref(false)
const planSaveError = ref('')
const deletingPlanId = ref(null)
const planDeleteError = ref('')
const planDeleteErrorId = ref(null)

const normalizePlans = (planList) =>
  planList
    .filter((plan) => plan && typeof plan === 'object')
    .map((plan, index) => ({
      id: plan.id ?? plan.planId ?? `plan-${index}`,
      memberId: plan.memberId ?? plan.member_id ?? '',
      title: plan.title ?? plan.planTitle ?? '제목 미정',
      startDate: plan.startDate ?? plan.start_date ?? '',
      endDate: plan.endDate ?? plan.end_date ?? '',
      description: plan.description ?? plan.memo ?? '',
      createdAt: plan.createdAt ?? plan.created_at ?? '',
    }))

const parseDate = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDateLabel = (value) => {
  const parsed = parseDate(value)
  if (!parsed) return ''
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

const calcDurationDays = (plan) => {
  const start = parseDate(plan.startDate)
  const end = parseDate(plan.endDate)
  if (!start || !end) return null
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
  return diff > 0 ? diff : 1
}

const formatPlanPeriod = (plan) => {
  const start = formatDateLabel(plan.startDate)
  const end = formatDateLabel(plan.endDate)
  if (!start && !end) return '일정 날짜 미정'
  if (!end || start === end) return start || '일정 날짜 미정'
  return `${start} ~ ${end}`
}

const formatCreatedAt = (plan) => {
  const created = formatDateLabel(plan.createdAt)
  return created ? `작성일 ${created}` : ''
}

const sortedPlans = computed(() => {
  const plans = [...myPlans.value]
  return plans.sort((a, b) => {
    const aTime = parseDate(a.startDate)?.getTime() ?? Number.POSITIVE_INFINITY
    const bTime = parseDate(b.startDate)?.getTime() ?? Number.POSITIVE_INFINITY
    if (aTime === bTime) {
      const aCreated = parseDate(a.createdAt)?.getTime() ?? 0
      const bCreated = parseDate(b.createdAt)?.getTime() ?? 0
      return bCreated - aCreated
    }
    return aTime - bTime
  })
})

const fetchMemberInfo = async () => {
  if (memberStore.userInfo && memberStore.userInfo.userId) {
    planOwnerId.value = memberStore.userInfo.userId
    return memberStore.userInfo.userId
  }

  try {
    const response = await axios.get('http://localhost:8080/api/v1/members/me', {
      withCredentials: true,
    })
    const memberData = response.data?.data ?? response.data
    if (memberData?.userId) {
      planOwnerId.value = memberData.userId
      memberStore.userInfo = memberData
      memberStore.isLogin = true
    }
    return memberData?.userId
  } catch (error) {
    console.error('회원 정보 로드 실패', error)
    alert('로그인이 필요합니다.')
    return null
  }
}

const fetchMyPlans = async (memberId) => {
  if (!memberId) return
  try {
    isPlansLoading.value = true
    planError.value = ''
    const response = await axios.get('http://localhost:8080/api/v1/plans', {
      params: { memberId },
      withCredentials: true,
    })
    const payload = response.data?.data ?? response.data ?? []
    myPlans.value = normalizePlans(Array.isArray(payload) ? payload : [])
  } catch (error) {
    console.error('내 여행 계획 로드 실패', error)
    planError.value = '여행 계획을 불러오지 못했습니다.'
  } finally {
    isPlansLoading.value = false
  }
}

const initPage = async () => {
  const memberId = await fetchMemberInfo()
  if (memberId) {
    await fetchMyPlans(memberId)
  }
}

onMounted(() => {
  initPage()
})

const retryFetchPlans = () => {
  if (planOwnerId.value) {
    fetchMyPlans(planOwnerId.value)
  }
}

const goToPlanBuilder = () => {
  router.push({ name: 'attraction-select' })
}

const goToStoryCreate = (planId) => {
  router.push(`/storybook/create/${planId}`);
}

const startEditPlan = (plan) => {
  editingPlanId.value = plan.id
  planSaveError.value = ''
  editingPlanDraft.value = {
    ...plan,
    startDate: plan.startDate || '',
    endDate: plan.endDate || '',
    createdAt: plan.createdAt || '',
  }
}

const cancelEditPlan = () => {
  editingPlanId.value = null
  editingPlanDraft.value = null
  planSaveError.value = ''
}

const replacePlanInList = (updatedPlan) => {
  const idx = myPlans.value.findIndex((p) => p.id === updatedPlan.id)
  if (idx !== -1) {
    myPlans.value[idx] = { ...myPlans.value[idx], ...updatedPlan }
  }
}

const savePlanEdit = async () => {
  if (!editingPlanDraft.value) return
  const draft = editingPlanDraft.value
  if (!draft.title) {
    planSaveError.value = '제목을 입력하세요.'
    return
  }
  const start = parseDate(draft.startDate)
  const end = parseDate(draft.endDate)
  if (start && end && end < start) {
    planSaveError.value = '종료일은 시작일 이후여야 합니다.'
    return
  }

  isSavingPlan.value = true
  planSaveError.value = ''
  try {
    const payload = {
      title: draft.title,
      startDate: draft.startDate || null,
      endDate: draft.endDate || null,
      description: draft.description || '',
      attractionId: draft.attractionId ?? [],
    }

    const response = await axios.put(
      `http://localhost:8080/api/v1/plans/${draft.id}`,
      payload,
      { withCredentials: true },
    )

    const raw = response.data?.data ?? response.data ?? draft
    const [normalized] = normalizePlans(Array.isArray(raw) ? raw : [raw])
    replacePlanInList(normalized || draft)
    cancelEditPlan()
  } catch (error) {
    console.error('여행 계획 수정 실패', error)
    planSaveError.value = '수정에 실패했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isSavingPlan.value = false
  }
}

const deletePlan = async (plan) => {
  if (!plan?.id || deletingPlanId.value) return
  const confirmed = window.confirm(`"${plan.title}" 여행 계획을 삭제할까요?`)
  if (!confirmed) return

  deletingPlanId.value = plan.id
  planDeleteError.value = ''
  planDeleteErrorId.value = null
  try {
    await axios.delete(`http://localhost:8080/api/v1/plans/${plan.id}`, {
      withCredentials: true,
    })
    myPlans.value = myPlans.value.filter((item) => item.id !== plan.id)
    if (editingPlanId.value === plan.id) {
      cancelEditPlan()
    }
  } catch (error) {
    console.error('여행 계획 삭제 실패', error)
    planDeleteError.value = '삭제에 실패했습니다. 잠시 후 다시 시도해주세요.'
    planDeleteErrorId.value = plan.id
  } finally {
    deletingPlanId.value = null
  }
}
</script>

<template>
  <div
    class="min-vh-100 w-100 position-relative d-flex align-items-center justify-content-center text-white"
    :style="{
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
  >
    <div
      class="position-absolute top-0 start-0 w-100 h-100"
      style="background-color: rgba(0, 0, 0, 0.6)"
    ></div>

    <div class="position-relative container animate-fade-in-up">
      <div class="row">
        <div class="col-md-3 mb-4">
          <div class="library-card p-4 rounded-4 h-100">
            <h3 class="fw-bold mb-4 text-center">📚 내 서재</h3>
            <div class="list-group list-group-flush bg-transparent">
              <button
                class="list-group-item list-group-item-action bg-transparent text-white border-0 py-3 fw-bold"
                :class="{ 'active-menu': activeTab === 'plans' }"
                @click="activeTab = 'plans'"
              >
                ✈️ 나의 여행 계획
              </button>
              <button
                class="list-group-item list-group-item-action bg-transparent text-white border-0 py-3 fw-bold"
                :class="{ 'active-menu': activeTab === 'stories' }"
                @click="activeTab = 'stories'"
              >
                📖 스토리북
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-9">
          <div class="library-card p-5 rounded-4 h-100">
            <div v-if="activeTab === 'plans'">
              <h4 class="mb-4 fw-bold">✈️ 나의 여행 계획</h4>
              <div v-if="isPlansLoading" class="text-center py-5 text-white-50">
                <div class="spinner-border text-light" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">여행 계획을 불러오는 중입니다.</p>
              </div>
              <div v-else-if="planError" class="text-center py-5 text-white-50">
                <p class="mb-3">{{ planError }}</p>
                <button class="btn btn-outline-light btn-sm" @click="retryFetchPlans">
                  다시 시도하기
                </button>
              </div>
              <div v-else-if="!myPlans.length" class="text-center py-5 text-white-50">
                <p>아직 저장된 여행 계획이 없습니다.</p>
                <button class="btn btn-outline-light btn-sm mt-2" @click="goToPlanBuilder">
                  여행 계획 짜러 가기
                </button>
              </div>
              <div v-else>
                <div class="plan-list">
                  <div
                    v-for="plan in sortedPlans"
                    :key="plan.id"
                    class="plan-card rounded-4 p-3 mb-3"
                  >
                    <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                      <div class="flex-grow-1">
                        <h6 class="mb-2">{{ plan.title }}</h6>
                        <p class="mb-1 small">
                          {{ formatPlanPeriod(plan) }}
                          <span v-if="calcDurationDays(plan)">
                            · {{ calcDurationDays(plan) }}일
                          </span>
                        </p>
                        <p class="mb-0 text-white-50 small">{{ plan.description || '메모 없음' }}</p>
                      </div>
                      <div class="text-md-end small text-white-50">
                        {{ formatCreatedAt(plan) || '작성일 정보 없음' }}
                      </div>
                    </div>
                    <div class="mt-3 d-flex align-items-center gap-2">
                      <button
                        class="btn btn-outline-light btn-sm"
                        :disabled="isSavingPlan && editingPlanId === plan.id"
                        @click="startEditPlan(plan)"
                      >
                        수정
                      </button>
                      <button
                        class="btn btn-outline-danger btn-sm"
                        :disabled="deletingPlanId === plan.id"
                        @click="deletePlan(plan)"
                      >
                        삭제
                      </button>
                      <button
                        class="btn btn-primary btn-sm"
                        @click="goToStoryCreate(plan.id)"
                      >
                        스토리 생성 ✨
                      </button>
                    </div>
                    <div
                      v-if="editingPlanId === plan.id && editingPlanDraft"
                      class="mt-3 p-3 rounded-3 plan-edit"
                    >
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label class="form-label small text-white-50">제목</label>
                          <input
                            v-model="editingPlanDraft.title"
                            type="text"
                            class="form-control"
                            required
                          />
                        </div>
                        <div class="col-md-3">
                          <label class="form-label small text-white-50">시작일</label>
                          <input v-model="editingPlanDraft.startDate" type="date" class="form-control" />
                        </div>
                        <div class="col-md-3">
                          <label class="form-label small text-white-50">종료일</label>
                          <input v-model="editingPlanDraft.endDate" type="date" class="form-control" />
                        </div>
                        <div class="col-12">
                          <label class="form-label small text-white-50">설명</label>
                          <textarea v-model="editingPlanDraft.description" class="form-control" rows="3" />
                        </div>
                      </div>
                      <div class="d-flex align-items-center gap-2 mt-3">
                        <button
                          class="btn btn-primary btn-sm"
                          :disabled="isSavingPlan"
                          @click="savePlanEdit"
                        >
                          저장
                        </button>
                        <button class="btn btn-outline-light btn-sm" @click="cancelEditPlan">
                          취소
                        </button>
                        <span v-if="planSaveError" class="text-warning small">{{ planSaveError }}</span>
                      </div>
                    </div>
                    <p
                      v-if="planDeleteError && planDeleteErrorId === plan.id"
                      class="mt-2 mb-0 text-warning small"
                    >
                      {{ planDeleteError }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeTab === 'stories'">
              <h4 class="mb-4 fw-bold">📖 마이 스토리북</h4>
              <div v-if="myStories.length === 0" class="text-center py-5 text-white-50">
                <p>작성된 스토리북이 없습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 유리창 효과 스타일 (로그인 페이지와 동일) */
.library-card {
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.form-control {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 12px;
}
.form-control:disabled {
  background-color: rgba(255, 255, 255, 0.5);
}

/* 메뉴 활성화 스타일 */
.active-menu {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-left: 4px solid #0d6efd !important;
  color: #fff !important;
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.plan-card {
  background-color: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.plan-edit {
  background-color: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
