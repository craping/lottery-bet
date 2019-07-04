import Vue from 'vue'
import Router from 'vue-router'
import { getToken } from '@/libs/util'

Vue.use(Router)

const router = new Router({
  // mode: 'history',
  routes: [{
      path: '/',
      name: 'home',
      component: () => import('@/components/layout'),
      children: [{
          path: '',
          name: 'home',
          component: () => import('@/views/Home')
        },
        {
          path: '/home',
          name: 'home-page',
          component: () => import('@/views/Home')
        }
      ]
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: () => import('@/components/layout'),
      children: [{
          path: 'user-list',
          name: 'user-list',
          component: () => import('@/views/user/user-list.vue')
        },
        {
          path: 'user-add',
          name: 'user-add',
          component: () => import('@/views/user/user-add.vue')
        }
      ]
    },
    {
      path: '/notice-management',
      name: 'notice-management',
      component: () => import('@/components/layout'),
      children: [{
          path: 'notice-list',
          name: 'notice-list',
          component: () => import('@/views/notice/notice-list.vue')
        },
        {
          path: 'notice-add',
          name: 'notice-add',
          component: () => import('@/views/notice/notice-add.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      // meta: {
      //   title: '登录',
      // },
      component: () => import('@/views/login/login')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = getToken();
  // 判断token 不存在则过期，跳转登录
  if (token) {
    next();
  } else {
    const redirect = to.fullPath;
    if (to.path == '/login') { //如果是登录页面路径，就直接next()
      next();
    } else { //不然就跳转到登录；
      next({
        path: '/login',
        query: {
          redirect: redirect
        } // 将跳转的路由path作为参数，登录成功后跳转到该路由
      })
    }
  }
})

export default router