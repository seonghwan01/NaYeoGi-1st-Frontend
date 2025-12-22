<script setup>
import { ref, onMounted } from 'vue'
import { useMemberStore } from '@/stores/members'
import axios from 'axios'

const memberStore = useMemberStore()

const userInfo = ref({})

const fetchMemberInfo = async () => {
  if (memberStore.userInfo && memberStore.userInfo.userId) {
    userInfo.value = { ...memberStore.userInfo }
    return memberStore.userInfo.userId
  }

  try {
    const response = await axios.get('http://localhost:8080/api/v1/members/me', {
      withCredentials: true,
    })
    const memberData = response.data?.data ?? response.data
    userInfo.value = memberData
    if (memberData?.userId) {
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

onMounted(() => {
  fetchMemberInfo()
})

const updateMember = async () => {
  try {
    await axios.put('http://localhost:8080/api/v1/members/me', userInfo.value, {
      withCredentials: true,
    })

    if (memberStore.userInfo) {
      memberStore.userInfo.userName = userInfo.value.userName
      memberStore.userInfo.email = userInfo.value.email
    }

    alert('회원 정보가 수정되었습니다!')
  } catch (error) {
    console.error(error)
    alert('수정에 실패했습니다.')
  }
}

const deleteMember = async () => {
  if (!confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return

  try {
    await axios.delete('http://localhost:8080/api/v1/members/me', {
      withCredentials: true,
    })

    alert('탈퇴 처리되었습니다. 그동안 이용해 주셔서 감사합니다.')

    if (memberStore.logout) {
      memberStore.logout()
    }
    window.location.href = '/'
  } catch (error) {
    console.error(error)
    alert('탈퇴 처리에 실패했습니다. 다시 시도해주세요.')
  }
}
</script>

<template>
  <div
    class="min-vh-100 w-100 position-relative d-flex align-items-center justify-content-center text-white"
  >
    <div
      class="position-absolute top-0 start-0 w-100 h-100"
      style="background-color: rgba(0, 0, 0, 0.6)"
    ></div>

    <div class="position-relative container animate-fade-in-up" style="max-width: 600px;">
      <div class="library-card p-5 rounded-4 h-100">
        <h4 class="mb-4 fw-bold text-center">회원 정보 관리</h4>
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
    </div>
  </div>
</template>

<style scoped>
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
