import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/TodosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'todos',
      redirect: () => {
        return '/login'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/AuthView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/AuthView.vue'),
    },
    {
      path: '/todos',
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

export default router
