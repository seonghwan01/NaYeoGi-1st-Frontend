<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import AttractionMain from '@/views/attraction/AttractionView.vue'

const navLinks = [
  { to: '/', label: '홈' },
  { to: '/storybook', label: 'AI 스토리북' },
  { to: '/recommendations', label: 'AI 여행지 추천' },
  { to: '/categories', label: '카테고리별 여행지' },
  { to: '/member', label: '내 정보' },
]

const user = {
  name: '성환이형님',
  email: 'user@nayeogi.dev',
}

const route = useRoute()
const isHome = computed(() => route.name === 'home')
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <div class="brand">나여기</div>
      <nav class="nav">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          active-class="nav-link--active"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
      <RouterLink class="user" to="/member">
        <div class="avatar">{{ user.name.charAt(0) }}</div>
        <div class="user-text">
          <strong>{{ user.name }}</strong>
          <small>{{ user.email }}</small>
        </div>
      </RouterLink>
    </header>

    <main class="content">
      <RouterView />
      <AttractionMain v-if="isHome" />
    </main>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 120%);
  color: #0f172a;
  font-family: 'Inter', 'Pretendard', system-ui, -apple-system, sans-serif;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e2e8f0;
}

.brand {
  font-weight: 800;
  letter-spacing: -0.4px;
  color: #2563eb;
}

.nav {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.nav-link {
  padding: 8px 12px;
  border-radius: 10px;
  color: #334155;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.15s ease;
}

.nav-link:hover {
  color: #1d4ed8;
  background: #e2e8f0;
}

.nav-link--active {
  color: #0f172a;
  background: #dbeafe;
  border: 1px solid #bfdbfe;
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: inherit;
  text-decoration: none;
  min-width: 180px;
}

.user:hover {
  border-color: #bfdbfe;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;
  display: grid;
  place-items: center;
  font-weight: 800;
}

.user-text strong {
  display: block;
}

.user-text small {
  color: #475569;
}

.content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}
</style>
