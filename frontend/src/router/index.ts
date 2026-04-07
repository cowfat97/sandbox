import { createRouter, createWebHistory } from 'vue-router'
import WarMap from '@/views/WarMap.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'war-map',
      component: WarMap
    }
  ]
})

export default router