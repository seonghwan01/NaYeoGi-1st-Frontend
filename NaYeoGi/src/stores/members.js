import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { defineStore } from 'pinia'
import {
  loginMember,
  getMemberInfo,
  logoutMember,
  updateMember,
  deleteMember,
  joinMember,
} from '@/restapi/member'

export const useMemberStore = defineStore('memberStore', () => {
  const router = useRouter()

  // 상태(State)
  const isLogin = ref(false)
  const userInfo = ref(null)

  // 1. 로그인 Actions
  const userLogin = async (loginUser) => {
    await loginMember(
      loginUser,
      (response) => {
        // httpStatus 200 이면 성공
        if (response.status === 200) {
          isLogin.value = true
          // 로그인 성공 후, 내 정보(이름, 등급 등)를 바로 가져옵니다.
          getUserInfo()
        }
      },
      (error) => {
        console.error(error)
        isLogin.value = false
        // ApiResponse에서 보낸 에러 메시지가 있다면 띄워주기
        alert('아이디 또는 비밀번호를 확인해주세요.')
      },
    )
  }

  // 2. 내 정보 조회 Actions (새로고침 시 로그인 유지에 필수)
  const getUserInfo = async () => {
    await getMemberInfo(
      (response) => {
        if (response.status === 200) {
          // 백엔드 ApiResponse 구조: response.data.data 에 실제 회원 정보가 있음
          userInfo.value = response.data.data
          isLogin.value = true
        }
      },
      async (error) => {
        // 401(권한 없음) 에러가 나면 로그아웃 처리
        if (error.response && error.response.status === 401) {
          isLogin.value = false
          userInfo.value = null
        }
      },
    )
  }

  // 3. 로그아웃 Actions
  const userLogout = async () => {
    await logoutMember(
      (response) => {
        if (response.status === 200) {
          isLogin.value = false
          userInfo.value = null
          // 메인 페이지로 이동 (router 이름이 'main'인지 확인 필요)
          // router/index.js에서 name을 확인해주세요.
          // router.push({ name: "main" });
          window.location.href = '/' // 혹은 강제 새로고침
        }
      },
      (error) => {
        console.error(error)
      },
    )
  }

  // 4. 회원 정보 수정 Actions
  const modifyUserInfo = async (member) => {
    await updateMember(
      member,
      (response) => {
        if (response.status === 200) {
          alert('수정 완료되었습니다.')
          getUserInfo() // 수정된 정보 다시 불러오기
        }
      },
      (error) => {
        console.error(error)
        alert('정보 수정 중 오류가 발생했습니다.')
      },
    )
  }

  // 5. 회원 탈퇴 Actions
  const withdrawalMember = async () => {
    await deleteMember(
      (response) => {
        if (response.status === 200) {
          alert('회원 탈퇴가 완료되었습니다.')
          isLogin.value = false
          userInfo.value = null
          window.location.href = '/'
        }
      },
      (error) => {
        console.error(error)
        alert('탈퇴 처리 중 오류가 발생했습니다.')
      },
    )
  }

  // 6. 회원가입 Actions
  const userJoin = async (joinInfo) => {
    await joinMember(
      joinInfo,
      (response) => {
        if (response.status === 200 || response.status === 201) {
          alert('회원가입이 완료되었습니다! 로그인 해주세요.')
          // 가입 성공 시 랜딩 페이지의 로그인 폼을 바로 열어줍니다.
          router.push({ name: 'landing', query: { login: 'true' } })
        }
      },
      (error) => {
        console.error(error)
        alert('회원가입 중 오류가 발생했습니다.')
      },
    )
  }

  return {
    isLogin,
    userInfo,
    userLogin,
    getUserInfo,
    userLogout,
    modifyUserInfo,
    withdrawalMember,
    userJoin,
  }
})
