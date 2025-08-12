import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'todos',
      redirect: () => {
          const authStore = useAuthStore()
          return authStore.isAuthenticated ? '/todos' : '/login';
      }
    },
    {
      path: '/login',
      meta: { guestOnly: true},
      name: 'login',
      component: () => import('../views/AuthView.vue'),
    },
    {
      path: '/register',
      meta: { guestOnly: true},
      name: 'register',
      component: () => import('../views/AuthView.vue'),
    },
    {
      path: '/todos',
      meta: { requiresAuth: true},
      name: 'todos',
      component: () => import('../views/TodosView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'catch-all',
      redirect: () => {
        return '/login'
      }
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore() 
  let isAuthenticated = authStore.isAuthenticated

  if (!isAuthenticated) {
    isAuthenticated = await authStore.checkAuthStatus()
  }
  
  if (to.meta.requiresAuth && !isAuthenticated) {
      next('/login')
      return
  }
  
  if (to.meta.guestOnly && isAuthenticated) {

    next('/todos')
    return
  }
  
  next()
})

export default router
