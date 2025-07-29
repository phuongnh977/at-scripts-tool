import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Collections from '../views/Collections.vue'
import Environments from '../views/Environments.vue'
import Runner from '../views/Runner.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/collections',
    name: 'Collections',
    component: Collections
  },
  {
    path: '/environments',
    name: 'Environments',
    component: Environments
  },
  {
    path: '/runner',
    name: 'Runner',
    component: Runner
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router