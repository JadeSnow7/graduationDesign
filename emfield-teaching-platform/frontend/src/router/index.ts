import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import ChatView from '@/views/ChatView.vue'
import CoursesView from '@/views/CoursesView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SimView from '@/views/SimView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/', component: HomeView },
    { path: '/courses', component: CoursesView },
    { path: '/chat', component: ChatView },
    { path: '/sim', component: SimView },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (auth.token && !auth.me) {
    try {
      await auth.loadMe()
    } catch {
      auth.logout()
    }
  }
  if (to.path !== '/login' && !auth.token) return '/login'
  if (to.path === '/login' && auth.token) return '/'
  return true
})

export default router

