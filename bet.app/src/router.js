import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const routes = [{
    path: '*',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('./views/home'),
    meta: { title: '首页' }
  },
  {
    path: '/setting',
    name: 'setting',
    component: () => import('./views/setting'),
    meta: { title: '插件设置' }
  },
  {
    path: '/user-add',
    name: 'user-add',
    component: () => import('./views/user-add'),
    meta: { title: '新增用户' }
  },
  {
    path: '/betting',
    name: 'betting',
    component: () => import('./views/betting'),
    meta: { title: '投注管理' }
  },
  {
    path: '/user-list',
    name: 'user-list',
    component: () => import('./views/user-list'),
    meta: { title: '会员列表' }
  },
  {
    path: '/user-online-list',
    name: 'user-online-list',
    component: () => import('./views/user-online-list'),
    meta: { title: '在线会员列表' }
  }
];

// add route path
routes.forEach(route => {
  route.path = route.path || '/' + (route.name || '');
});

const router = new Router({
  routes
});

router.beforeEach((to, from, next) => {
  const title = to.meta && to.meta.title;
  if (title) {
    document.title = title;
  }
  next();
});

export { router };