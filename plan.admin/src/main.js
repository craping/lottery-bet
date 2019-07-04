import Vue from 'vue'
import App from './App.vue'
import router from './router'
import http from '@/libs/axios'
import config from '@/config'

Vue.config.productionTip = false

import iView from 'iview';
import 'iview/dist/styles/iview.css';

Vue.use(iView);
Vue.prototype.$http = http
Vue.prototype.$config = config

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
