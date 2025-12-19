<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/members'
import axios from 'axios' // [추가] 비동기 통신을 위해 axios 임포트

const router = useRouter()
const memberStore = useMemberStore()

// const bgImage =
//   // 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80'

// 입력 데이터
const joinInfo = ref({
  userId: '',
  userPassword: '',
  userPasswordConfirm: '',
  userName: '',
  email: '',
  role: 'USER',
})

// [추가] 아이디 중복 에러 메시지 저장용 변수
const idErrMessage = ref('')

// [추가] 아이디 중복 확인 함수 (blur 이벤트 핸들러)
const checkId = async () => {
  // 아이디가 비어있으면 검사 안 함
  if (!joinInfo.value.userId) {
    idErrMessage.value = ''
    return
  }

  try {
    // 백엔드 컨트롤러 경로: /user/idCheck/{userId}
    // (프로젝트 설정에 따라 API 기본 경로는 다를 수 있음. 예: http://localhost:8080/user/...)
    await axios.get(`http://localhost:8080/api/v1/members/id-check/${joinInfo.value.userId}`)
    // 성공(200 OK)하면 에러 메시지 초기화
    idErrMessage.value = ''
  } catch (error) {
    // 에러 발생 시
    const res = error.response?.data

    // 백엔드에서 보낸 ErrorCode 확인 (MEMBER_ID_DUPLICATE)
    if (res && res.code === 'MEMBER_ID_DUPLICATE') {
      idErrMessage.value = '이미 사용 중인 아이디입니다.'
    } else {
      console.error(error)
      // 필요하면 다른 에러 처리
    }
  }
}

// 회원가입 요청
const join = async () => {
  // 1. 유효성 검사
  if (
    !joinInfo.value.userId ||
    !joinInfo.value.userPassword ||
    !joinInfo.value.userName ||
    !joinInfo.value.email
  ) {
    alert('모든 정보를 입력해주세요.')
    return
  }

  // [추가] 아이디 중복 상태라면 가입 막기
  if (idErrMessage.value) {
    alert('아이디 중복을 확인해주세요.')
    return
  }

  if (joinInfo.value.userPassword !== joinInfo.value.userPasswordConfirm) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  // 2. 전송용 객체 생성 (confirm 제외)
  const { userPasswordConfirm, ...requestDto } = joinInfo.value

  // 3. Store 호출
  await memberStore.userJoin(requestDto)
}
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
    <!-- <div
      class="position-absolute top-0 start-0 w-100 h-100"
      style="background-color: rgba(0, 0, 0, 0.6)"
    ></div> -->

    <div class="position-relative animate-fade-in-up join-card p-5 rounded-4 shadow-lg text-center">
      <h2 class="mb-4 fw-bold">회원가입</h2>

      <div class="mb-3 text-start">
        <label for="userId" class="form-label">아이디</label>

        <input
          type="text"
          id="userId"
          class="form-control"
          v-model="joinInfo.userId"
          placeholder="아이디를 입력하세요"
          @blur="checkId"
        />

        <div v-if="idErrMessage" class="text-danger mt-1 small fw-bold">
          {{ idErrMessage }}
        </div>
      </div>

      <div class="mb-3 text-start">
        <label for="userName" class="form-label">이름</label>
        <input
          type="text"
          id="userName"
          class="form-control"
          v-model="joinInfo.userName"
          placeholder="이름을 입력하세요"
        />
      </div>

      <div class="mb-3 text-start">
        <label for="email" class="form-label">이메일</label>
        <input
          type="email"
          id="email"
          class="form-control"
          v-model="joinInfo.email"
          placeholder="ssafy@example.com"
        />
      </div>

      <div class="mb-3 text-start">
        <label for="userPw" class="form-label">비밀번호</label>
        <input
          type="password"
          id="userPw"
          class="form-control"
          v-model="joinInfo.userPassword"
          placeholder="비밀번호"
        />
      </div>

      <div class="mb-4 text-start">
        <label for="userPwConfirm" class="form-label">비밀번호 확인</label>
        <input
          type="password"
          id="userPwConfirm"
          class="form-control"
          v-model="joinInfo.userPasswordConfirm"
          placeholder="비밀번호 확인"
          @keyup.enter="join"
        />
        <div
          v-if="joinInfo.userPassword && joinInfo.userPassword !== joinInfo.userPasswordConfirm"
          class="text-warning mt-1 small"
        >
          비밀번호가 일치하지 않습니다.
        </div>
      </div>

      <div class="d-grid gap-2">
        <button @click="join" class="btn btn-primary btn-lg fw-bold">가입하기</button>
        <button @click="router.go(-1)" class="btn btn-outline-light btn-lg fw-bold">취소</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 기존 스타일 유지 */
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

.join-card {
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-label {
  font-weight: bold;
  font-size: 0.9rem;
  margin-left: 5px;
}

.form-control {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 12px;
}
.form-control:focus {
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.25);
}
</style>
