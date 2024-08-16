import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/myGui',
      name: 'myGUi',
      component: () => import('../views/mytest/testGui.vue'),
    },
    {
      path: '/myView',
      name: 'myView',
      component: () => import('../views/mytest/module/testMyView.vue'),
    },
    {
      path: '/',
      redirect: '/introduction/install',
      name: 'home',
      component: HomeView
    },
    {
      path: '/introduction',
      name: 'introduction',
      component: HomeView,
      children: [
        {
          path: 'install',
          name: 'install',
          component: () => import('../views/docs/Install.vue')
        },
        {
          path: 'mouseCtrl',
          name: 'mouseCtrl2',
          component: () => import('../views/demo/mouseCtrl.vue'),
        },
       
      ]
    },
    {
      path: '/projects',
      name: 'projects',
      children: [
        {
          path: 'co2',
          name: 'co2',
          component: () => import('../views/projects/co2.vue'),
        },
        {
          path: 'co2Second',
          name: 'co2Second',
          component: () => import('../views/projects/co2Second.vue'),
        },
        {
          path: 'fullViewRoom',
          name: 'fullViewRoom',
          component: () => import('../views/projects/fullViewRoom.vue'),
        }
      ]
    },

  ]
})

export default router
