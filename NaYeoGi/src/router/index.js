import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '@/views/common/TheLandingView.vue'

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
      component: () => import('@/views/common/TheLandingView.vue')
    },
    // {
    //   path: '/signup',
    //   name: 'signup',
    //   component: () => import('@/views/auth/SignupView.vue')
    // },
    {
      path: '/main',
      name: 'main',
      component: () => import('@/views/common/TheMainView.vue')
    },
    {
      path: '/storybook/create',
      name: 'storybook-create',
      component: () => import('@/views/storybook/StoryBookCreateView.vue')
    },
    {
      path: '/attraction/recommend',
      name: 'attraction-recommend',
      component: () => import('@/views/attraction/AttractionSurveyView.vue')
    },
    {
      path: '/attraction/select',
      name: 'attraction-select',
      component: () => import('@/views/attraction/AttractionSelectView.vue')
    }
  ]
})

export default router
