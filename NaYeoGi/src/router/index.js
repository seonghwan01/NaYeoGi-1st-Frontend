import { createRouter, createWebHistory } from 'vue-router'
import CommonView from '@/views/common/CommonView.vue'
import StoryBookView from '@/views/storybook/StroyBookView.vue'
import PlanView from '@/views/plan/PlanView.vue'
import AttractionMain from '@/views/attraction/AttractionView.vue'
import MemberView from '@/views/member/MemberView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: CommonView },
    { path: '/storybook', name: 'storybook', component: StoryBookView },
    { path: '/recommendations', name: 'recommendations', component: PlanView },
    { path: '/categories', name: 'categories', component: AttractionMain },
    { path: '/member', name: 'member', component: MemberView },
  ],
})

export default router
