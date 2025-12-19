<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMemberStore } from '@/stores/members'

const router = useRouter()
const route = useRoute()
const memberStore = useMemberStore()

// 화면 상태 관리 (false: 소개글, true: 로그인폼)
const showLoginForm = ref(false)

// 로그인 입력 데이터
const loginUser = ref({
  userId: '',
  userPassword: '',
})

// URL에 ?login=true가 있는지 확인하는 함수
const checkLoginQuery = () => {
  if (route.query.login === 'true') {
    showLoginForm.value = true
  } else {
    showLoginForm.value = false
  }
}

// 처음 화면 떴을 때 URL 확인
onMounted(() => {
  checkLoginQuery()
})

// 헤더 버튼 등으로 URL이 바뀌면 감지해서 폼 열기/닫기
watch(
  () => route.query.login,
  () => {
    checkLoginQuery()
  },
)

// "시작하기" 버튼 클릭 시 -> URL을 변경하여 폼 열기 (헤더와 동작 통일)
const showLogin = () => {
  router.push({ query: { login: 'true' } })
}

// "뒤로가기" 클릭 시 -> 폼 닫고 URL에서 ?login=true 제거
const closeLogin = () => {
  showLoginForm.value = false
  router.replace({ query: null }) // 히스토리 교체 (뒤로가기 눌러도 로그인창 안 뜨게)
}

// 실제 로그인 요청
const handleLogin = async () => {
  if (!loginUser.value.userId || !loginUser.value.userPassword) {
    alert('아이디와 비밀번호를 입력해주세요.')
    return
  }

  await memberStore.userLogin(loginUser.value)

  if (memberStore.isLogin) {
    router.push({ name: 'main' })
  }
}
</script>

<template>
  <!-- App.vue에서 배경을 처리하므로, 이 컴포넌트는 콘텐츠만 렌더링합니다. -->
  <!-- App.vue의 어두운 배경 위에 글씨가 잘 보이도록 text-white 클래스를 적용합니다. -->
  <!-- flex 관련 클래스로 콘텐츠를 수직 중앙 정렬합니다. -->
  <div class="text-white d-flex flex-column justify-content-center" style="min-height: calc(100vh - 150px)">
    <div v-if="!showLoginForm" class="text-center animate-fade-in-up">
      <h1 class="display-3 fw-bold mb-4">여행을 기록하다,<br />기억을 그리다.</h1>
      <p class="lead mb-5">
        당신의 사진에 AI의 감성을 더해<br />세상에 하나뿐인 스토리북을 만들어드립니다.
      </p>
      <button
        @click="showLogin"
        class="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg"
      >
        시작하기
      </button>
    </div>

    <div
      v-else
      class="mx-auto animate-fade-in-up login-card p-5 rounded-4 shadow-lg text-center"
    >
      <h2 class="mb-4 fw-bold">로그인</h2>

      <div class="mb-3 text-start">
        <label for="userId" class="form-label">아이디</label>
        <input
          type="text"
          id="userId"
          class="form-control form-control-lg"
          v-model="loginUser.userId"
          placeholder="아이디를 입력하세요"
          @keyup.enter="handleLogin"
        />
      </div>

      <div class="mb-4 text-start">
        <label for="userPw" class="form-label">비밀번호</label>
        <input
          type="password"
          id="userPw"
          class="form-control form-control-lg"
          v-model="loginUser.userPassword"
          placeholder="비밀번호를 입력하세요"
          @keyup.enter="handleLogin"
        />
      </div>

      <button @click="handleLogin" class="btn btn-primary w-100 btn-lg rounded-3 mb-3 fw-bold">
        입장하기
      </button>

      <div class="d-flex justify-content-between mt-3 small">
        <a href="#" class="text-white-50 text-decoration-none" @click.prevent="closeLogin"
          >← 뒤로가기</a
        >
        <a
          href="#"
          class="text-white fw-bold text-decoration-none"
          @click.prevent="router.push('/signup')"
          >회원가입</a
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  animation: fadeInUp 0.8s ease-out forwards;
}

/* 로그인 카드 스타일 */
.login-card {
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 인풋창 스타일 */
.form-control {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
}
.form-control:focus {
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.25);
}
</style>
