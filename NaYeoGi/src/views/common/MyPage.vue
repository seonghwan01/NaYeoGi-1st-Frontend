<script setup>
import { ref, onMounted } from 'vue'
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
const myStories = ref([]) // 내 스토리북 리스트

// 배경 이미지 (로그인 페이지와 통일감)
const bgImage =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80'

// 2. 초기 데이터 로딩
onMounted(async () => {
  try {
    // [수정] 두 번째 인자로 설정 객체({ withCredentials: true })를 추가합니다.
    const response = await axios.get('http://localhost:8080/api/v1/members/me', {
      withCredentials: true,
    })

    // 데이터 구조에 맞춰서 꺼내기 (ApiResponse 구조 고려)
    // 백엔드에서 ApiResponse.success(memberInfo)로 보냈다면
    // response.data는 ApiResponse 객체이고, 그 안의 data가 memberInfo입니다.
    userInfo.value = response.data.data
  } catch (error) {
    console.error('회원 정보 로드 실패', error)
    // 에러 상세 확인을 위해 콘솔 로그 추가
    if (error.response) {
      console.log('서버 응답 상태:', error.response.status)
      console.log('서버 응답 데이터:', error.response.data)
    }
    alert('로그인이 필요합니다.')
    // router.push('/login') // 테스트 중에는 잠시 주석 처리 추천
  }

  // (2) 내 여행 계획 & 스토리북 가져오기 (API가 있다고 가정)
  // fetchMyPlans()
  // fetchMyStories()
})

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
              <div v-if="myPlans.length === 0" class="text-center py-5 text-white-50">
                <p>아직 저장된 여행 계획이 없습니다.</p>
                <button class="btn btn-outline-light btn-sm mt-2">여행 계획 짜러 가기</button>
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
</style>
