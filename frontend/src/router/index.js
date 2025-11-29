import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '../pages/Index/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Index',
      component: () => import('../pages/Edit/index.vue'),
    },
    {
      path: '/home',
      name: 'Home',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: IndexView,
    },
  ],
})

export default router
