import topNav from '@/components/nav/top-nav'
import footerNav from '@/components/nav/footer-nav'
import {
    Toast
} from 'vant';
export default {
    components: {
        topNav,
        footerNav
    },
    data() {
        return {
            userName:'',
            userPwd:'',
            endTime:'',
            loading: false,
            pickTime: false,
            currentDate: new Date(),
            minDate: new Date(),
            periods:5,
        }
    },
    watch: {
        '$router': 'getParams'
    },
    created() {
        //this.getParams();
    },
    mounted() {
        //this.loadTips();
    },
    methods: {
        pickTimePopup() {
            this.pickTime = true;
        },
        onChange(picker) {
            const values = picker.getValues();
            this.endTime = values[0] + '-' + values[1] + '-' + values[2]
        },
        addUser() {
            if (this.userName == '' || this.userName == null) {
                Toast('请输入用户名');
                this.$refs.userName.focus();
                return false
            }
            if (this.userPwd == '' || this.userPwd == null) {
                Toast('请输入密码');
                this.$refs.userPwd.focus();
                return false
            }
            if (this.endTime == '' || this.endTime == null) {
                Toast('请选择时间');
                this.pickTime = true;
                return false
            }

            this.loading = true;
            const data = {
                userName: this.userName,
                userPwd: this.userPwd,
                endTime: this.endTime,
                periods: this.periods
            };
            this.$http.post("user/addUser?format=json", data).then(response => {
                const data = response.data;
                this.loading = false;
                if (!data.result) {
                    Toast(data.msg);
                    setTimeout(() => {
                        Object.assign(this.$data, this.$options.data());
                        this.$router.go(-1);
                    }, 1000);
                } else {
                    Toast.fail(data.msg);
                }
            })
            .catch(error => {
                this.loading = false;
                console.log(error);
            });
        }
    }
}