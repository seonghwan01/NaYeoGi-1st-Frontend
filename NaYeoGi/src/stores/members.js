import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMemberStore = defineStore('member', () => {
  // 로그인 상태 관리
  const isLoggedIn = ref(false)
  const userInfo = ref(null)

  function login(user) {
    isLoggedIn.value = true
    userInfo.value = user
  }

  function logout() {
    isLoggedIn.value = false
    userInfo.value = null
  }

  return { isLoggedIn, userInfo, login, logout }
})