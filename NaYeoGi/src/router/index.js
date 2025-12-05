import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '@/views/common/TheLanding.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView
    },
    {
      path: '/login',
      name: 'login',
      // lazy-loading: 처음부터 로딩하지 않고 필요할 때 로딩 (성능 최적화)
      component: () => import('@/views/common/TheLanding.vue')
    },
    // {
    //   path: '/signup',
    //   name: 'signup',
    //   component: () => import('@/views/auth/SignupView.vue')
    // },
    {
      path: '/main',
      name: 'main',
      component: () => import('@/views/common/TheMain.vue')
    },
    {
      path: '/storybook/create',
      name: 'storybook-create',
      component: () => import('@/views/storybook/StoryBookCreate.vue')
    },
    {
      path: '/attraction/recommend',
      name: 'attraction-recommend',
      component: () => import('@/views/attraction/AttractionRecommend.vue')
    }
  ]
})

export default router