<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
// [추가 1] Pinia Store 연결
import { useMemberStore } from '@/stores/members'
import { storeToRefs } from 'pinia'

const props = defineProps({
  isLanding: Boolean,
})

const router = useRouter()
const memberStore = useMemberStore()

// [추가 2] 반응형으로 로그인 상태와 내 정보 가져오기
const { isLogin, userInfo } = storeToRefs(memberStore)

// [수정] 로그인 버튼 클릭 시: 랜딩페이지로 가면서 로그인 창 열기
const goLogin = () => {
  router.push({ name: 'landing', query: { login: 'true' } })
}

// [수정] 로그아웃 클릭 시: Store의 로그아웃 함수 실행
const goLogout = () => {
  memberStore.userLogout()
}

// 일반 페이지 이동
const navigate = (path) => {
  router.push(path)
}
</script>

<template>
  <nav
    :class="[
      'navbar',
      'navbar-expand-lg',
      'fixed-top',
      // isLanding prop에 따라 클래스 동적 할당
      isLanding ? 'navbar-dark bg-semi-transparent-gray' : 'navbar-light bg-light shadow-sm',
    ]"
    style="transition: all 0.3s ease-in-out"
  >
    <div class="container-fluid">
      <a class="navbar-brand fw-bold" href="#" @click.prevent="navigate(isLogin ? '/main' : '/')">
        ✈️ 나여기
      </a>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
          <template v-if="!isLogin">
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="goLogin">로그인</a>
            </li>
            <li class="nav-item ms-2">
              <button @click="navigate('/signup')" class="btn btn-primary btn-sm rounded-pill px-3">
                회원가입
              </button>
            </li>
          </template>

          <template v-else>
            <li class="nav-item" v-if="userInfo">
              <a href="#" @click.prevent="navigate('/member-info')" class="nav-link fw-bold">{{ userInfo.userName }}님</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="navigate('/mypage')">내 서재</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-danger" href="#" @click.prevent="goLogout">로그아웃</a>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.bg-semi-transparent-gray {
  background-color: rgba(60, 60, 60, 0.7); /* 어두운 회색, 70% 불투명 */
  backdrop-filter: blur(5px); /* 배경 블러 효과 */
}

/* 배경 투명도 조절용 (필요시 사용) */
.bg-opacity-75 {
  --bs-bg-opacity: 0.75;
  backdrop-filter: blur(5px); /* 블러 효과 추가 */
}
</style>
