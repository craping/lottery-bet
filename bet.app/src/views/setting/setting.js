import topNav from '@/components/nav/top-nav'
import footerNav from '@/components/nav/footer-nav'
import { Toast } from 'vant';
export default {
    components: {
        topNav,
        footerNav,
        Toast
    },
    data() {
        return {
            token: ''
        }
    },
    mounted() {
        
    },
    methods: {
        goSetting(mode) {
            this.$config.active = null;
            this.$router.push({
                path: '/'+ mode,
                query: {
                    token: this.token
                }
            })
        }
    }
}