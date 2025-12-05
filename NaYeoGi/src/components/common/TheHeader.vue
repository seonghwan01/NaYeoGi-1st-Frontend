<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 현재 페이지 이름이 'landing'이면 true (투명 헤더 적용용)
const isLanding = computed(() => route.name === 'landing')

// 페이지 이동 함수
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
      isLanding ? 'navbar-dark bg-dark' : 'navbar-light bg-light shadow-sm'
    ]"
  >
    <div class="container-fluid">
      <!-- 1. 로고 영역 -->
      <a class="navbar-brand" href="#" @click.prevent="navigate('/')">
        나여기
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 2. 우측 버튼 영역 -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <!-- Case A: 랜딩 페이지 (로그인 전) -->
          <template v-if="isLanding">
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="navigate('/login')">로그인</a>
            </li>
            <li class="nav-item">
              <button
                @click="navigate('/signup')"
                class="btn btn-primary"
              >
                회원가입
              </button>
            </li>
          </template>

          <!-- Case B: 메인 페이지 (로그인 후) -->
          <template v-else>
            <li class="nav-item">
              <span class="nav-link">성환이형님</span>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="navigate('/mypage')">내 서재</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="navigate('/')">로그아웃</a>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>