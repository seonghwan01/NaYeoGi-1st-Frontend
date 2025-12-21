import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '@/views/common/TheLandingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/common/TheLandingView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/member/MemberJoinView.vue'),
    },
    {
      path: '/Mypage',
      name: 'Mypage',
      component: () => import('@/views/common/MyPage.vue'),
    },
    {
      path: '/main',
      name: 'main',
      component: () => import('@/views/common/TheMainView.vue'),
    },
    {
      path: '/storybook/create/:planId',
      name: 'storybook-create',
      component: () => import('@/views/storybook/StoryBookCreateView.vue'),
      props: true, // planId를 컴포넌트의 props로 전달
    },
    {
      path: '/storybook/edit',
      name: 'storybook-edit',
      component: () => import('@/views/storybook/StoryBookEditView.vue'),
    },
    {
      path: '/storybook/view/:storyId',
      name: 'storybook-view',
      component: () => import('@/views/storybook/StoryBookDisplayView.vue'),
      props: true, // storyId를 컴포넌트의 props로 전달
    },
    {
      path: '/attraction/recommend',
      name: 'attraction-recommend',
      component: () => import('@/views/attraction/AttractionSurveyView.vue'),
    },
    {
      path: '/attraction/list',
      name: 'attraction-list',
      component: () => import('@/views/attraction/AttractionListView.vue'),
    },
    {
      path: '/attraction/select',
      name: 'attraction-select',
      component: () => import('@/views/attraction/AttractionSelectView.vue'),
    },
    {
      path: '/attraction/plan',
      name: 'attraction-plan',
      component: () => import('@/views/attraction/PlanView.vue'),
    },
  ],
})

export default router
