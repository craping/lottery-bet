import Vue from 'vue'
import App from './App.vue'
import Vant from 'vant';
import { router } from './router';
import http from '@/libs/axios'
import config from '@/config'
import { getParams } from '@/libs/util'
import { handling } from '@/libs/sync'

import 'vant/lib/index.css';
import clipboard from 'clipboard';

Vue.use(Vant);

Vue.config.productionTip = false
Vue.prototype.$http = http
Vue.prototype.$config = config
Vue.prototype.$clipboard = clipboard;

new Vue({
  router,
  render: h => h(App),
  mounted() {
    //config.token = getParams(window.location.href).token;
    //handling(config.token);
  }
}).$mount('#app')