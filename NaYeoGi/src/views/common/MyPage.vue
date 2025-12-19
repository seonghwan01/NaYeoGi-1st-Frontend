<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/members'
import axios from 'axios'

const router = useRouter()
const memberStore = useMemberStore()

// 1. 상태 변수들
// 여기서 탭 관리를 위한 상태 변수와 회원 정보, 여행 계획, 스토리북 데이터를 정의합니다.
const activeTab = ref('info') // 현재 선택된 탭 (info, plans, stories)
const userInfo = ref({}) // 내 정보 담을 객체
const myPlans = ref([]) // 내 여행 계획 리스트
const isPlansLoading = ref(false)
const planError = ref('')
const myStories = ref([]) // 내 스토리북 리스트
const planOwnerId = ref('')

// 배경 이미지 (로그인 페이지와 통일감)
const bgImage =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80'

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

const featuredPlan = computed(() => sortedPlans.value[0] ?? null)
const additionalPlans = computed(() =>
  featuredPlan.value ? sortedPlans.value.slice(1) : sortedPlans.value,
)

const fetchMemberInfo = async () => {
  if (memberStore.userInfo && memberStore.userInfo.userId) {
    userInfo.value = { ...memberStore.userInfo }
    planOwnerId.value = memberStore.userInfo.userId
    return memberStore.userInfo.userId
  }

  try {
    const response = await axios.get('http://localhost:8080/api/v1/members/me', {
      withCredentials: true,
    })
    const memberData = response.data?.data ?? response.data
    userInfo.value = memberData
    if (memberData?.userId) {
      planOwnerId.value = memberData.userId
      memberStore.userInfo = memberData
      memberStore.isLogin = true
    }
    return memberData?.userId
  } catch (error) {
    console.error('회원 정보 로드 실패', error)
    if (error.response) {
      console.log('서버 응답 상태:', error.response.status)
      console.log('서버 응답 데이터:', error.response.data)
    }
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

const goToStoryBuilder = (planId) => {
  if (!planId) return
  router.push({ name: 'storybook-create', params: { planId } })
}

// 3. 회원 정보 수정 로직
const updateMember = async () => {
  try {
    // 1. 백엔드(DB) 업데이트 요청
    await axios.put('http://localhost:8080/api/v1/members', userInfo.value, {
      withCredentials: true,
    })

    // 2. [핵심] 프론트엔드 스토어(Pinia) 정보도 즉시 갱신
    // 이렇게 해야 헤더가 이 변경사항을 감지하고 이름을 바꿉니다.
    if (memberStore.userInfo) {
      memberStore.userInfo.userName = userInfo.value.userName
      memberStore.userInfo.email = userInfo.value.email // 이메일도 바꿨다면 갱신
    }

    alert('회원 정보가 수정되었습니다!')
  } catch (error) {
    console.error(error)
    alert('수정에 실패했습니다.')
  }
}

// 4. 회원 탈퇴 로직
const deleteMember = async () => {
  // 1. 실수 방지를 위한 확인창
  if (!confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return

  try {
    // 2. 백엔드에 탈퇴 요청 (세션 쿠키 포함 필수!)
    await axios.delete('http://localhost:8080/api/v1/members', {
      withCredentials: true,
    })

    alert('탈퇴 처리되었습니다. 그동안 이용해 주셔서 감사합니다.')

    // 3. [중요] 프론트엔드 로그인 상태 초기화
    // (Pinia 스토어에 있는 내 정보와 로그인 상태를 날려버립니다)
    // memberStore에 logout 액션이 있다면 그걸 호출하는 것이 가장 깔끔합니다.
    if (memberStore.logout) {
      memberStore.logout()
    }
    // 4. [중요] 랜딩 페이지(메인)로 이동
    // router.push('/')는 페이지만 이동하고 새로고침은 안 됩니다.
    // 헤더(GNB)의 로그인 상태까지 확실하게 갱신하려면 아래 방법을 추천합니다.
    window.location.href = '/'
  } catch (error) {
    console.error(error)
    alert('탈퇴 처리에 실패했습니다. 다시 시도해주세요.')
  }
}

// (임시) 여행 계획/스토리북 데이터 로드 함수 예시
/*
const fetchMyPlans = async () => {
    const res = await axios.get(`http://localhost:8080/api/v1/plans/my`)
    myPlans.value = res.data.data
}
*/
</script>

<template>
  <div
    class="min-vh-100 w-100 position-relative d-flex align-items-center justify-content-center text-white"
    :style="{
      backgroundImage: `url(${bgImage})`,
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
              <button
                class="list-group-item list-group-item-action bg-transparent text-white border-0 py-3 fw-bold"
                :class="{ 'active-menu': activeTab === 'info' }"
                @click="activeTab = 'info'"
              >
                👤 회원 정보 수정
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-9">
          <div class="library-card p-5 rounded-4 h-100">
            <div v-if="activeTab === 'info'">
              <h4 class="mb-4 fw-bold">회원 정보 관리</h4>
              <form @submit.prevent="updateMember">
                <div class="mb-3">
                  <label class="form-label">아이디</label>
                  <input type="text" class="form-control" v-model="userInfo.userId" disabled />
                </div>
                <div class="mb-3">
                  <label class="form-label">이름</label>
                  <input type="text" class="form-control" v-model="userInfo.userName" />
                </div>
                <div class="mb-3">
                  <label class="form-label">이메일</label>
                  <input type="email" class="form-control" v-model="userInfo.email" />
                </div>
                <div class="mb-4">
                  <label class="form-label">새 비밀번호 (변경 시에만 입력)</label>
                  <input
                    type="password"
                    class="form-control"
                    v-model="userInfo.userPassword"
                    placeholder="변경하려면 입력하세요"
                  />
                </div>

                <div class="d-flex justify-content-between">
                  <button type="submit" class="btn btn-primary fw-bold px-4">정보 수정</button>
                  <button type="button" @click="deleteMember" class="btn btn-danger fw-bold px-4">
                    회원 탈퇴
                  </button>
                </div>
              </form>
            </div>

            <div v-else-if="activeTab === 'plans'">
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
                <div v-if="featuredPlan" class="plan-banner rounded-4 p-4 mb-4">
                  <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
                    <div>
                      <div class="plan-chip mb-2">이번 여정</div>
                      <h5 class="plan-title mb-2">{{ featuredPlan.title }}</h5>
                      <p class="plan-period mb-1">
                        {{ formatPlanPeriod(featuredPlan) }}
                        <span v-if="calcDurationDays(featuredPlan)">
                          · {{ calcDurationDays(featuredPlan) }}일 일정
                        </span>
                      </p>
                      <p class="plan-desc mb-0">{{ featuredPlan.description || '메모가 없습니다.' }}</p>
                    </div>
                    <div class="text-md-end">
                      <p class="plan-created mb-2">{{ formatCreatedAt(featuredPlan) }}</p>
                      <button
                        class="btn btn-light text-primary fw-bold"
                        @click="goToStoryBuilder(featuredPlan.id)"
                      >
                        스토리북 작성하기
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="additionalPlans.length" class="plan-list">
                  <div
                    v-for="plan in additionalPlans"
                    :key="plan.id"
                    class="plan-card rounded-4 p-3 mb-3 d-flex flex-column flex-md-row align-items-start align-items-md-center"
                  >
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
                    <div class="text-md-end small text-white-50 mt-2 mt-md-0">
                      {{ formatCreatedAt(plan) || '작성일 정보 없음' }}
                    </div>
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

.plan-banner {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(13, 110, 253, 0.25));
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.plan-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  background-color: rgba(0, 0, 0, 0.25);
  font-size: 0.85rem;
  letter-spacing: 0.05em;
}

.plan-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.plan-period {
  color: rgba(255, 255, 255, 0.9);
}

.plan-desc {
  color: rgba(255, 255, 255, 0.75);
}

.plan-created {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.plan-card {
  background-color: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
</style>
