import topNav from '@/components/nav/top-nav'
import footerNav from '@/components/nav/footer-nav'
import { Toast,SwipeCell,Popup,ImagePreview,Dialog } from 'vant'
export default {
    components:{topNav,footerNav,SwipeCell,Popup,ImagePreview,Dialog},
    data() {
        return {
            keyword: '',
            loading: false,
            finished: false,
            users: [],
            isShow: false,
            userId: ''
        }
    },
    computed: {
        keyMap() {
            return this.users.filter(e => 
                e.userName.indexOf(this.keyword.trim()) >= 0
            );
        }
    },
    mounted() {
        //this.token = getParams(window.location.href).token;
        //this.seq = getParams(window.location.href).seq;
        this.getUsers();
    },
    methods: {
        goback() {
            this.$router.go(-1);
        },
        showPeriods(nowPeriods){
            if (nowPeriods == "0"){
                return "";
            } else {
                return "danger";
            }
        },
        onChange(step, id) {
            Toast.loading({ 
                forbidClick: true,
                message: '提交中...'
            });
            const data = {id: id, periods: step}
            this.$http.post("/user/modifyPeriods?format=json", data).then(response => {
                const data = response.data;
                if (!data.result) {
                    setTimeout(() => {
                        Toast.clear();
                    }, 500);
                } else {
                    Toast.fail(data.msg);
                }
            })
            .catch(error => {
                console.log(error);
            });
        },
        delDialog(id) {
            this.userId = id;
            this.isShow = true;
        },
        beforeClose(action, done) {
            if (action == "cancel")
                done();
            if (action == "confirm") {
                const param = { id: this.userId }
                this.$http.post("user/resetPeriods?format=json",  param).then(response => {
                    const data = response.data;
                    done();
                    setTimeout(() => {
                        Toast(data.msg);
                    }, 500);
                })
                .catch(error => {
                    console.log(error);
                });
            }
        },
        getUsers() {
            this.results = [];
            this.$http.post("/user/onlineList?format=json", {}).then(response => {
                const data = response.data;
                if (!data.result) {
                    this.users = data.data.info;
                    this.loading = false;
                    this.finished = true;
                } else {
                    Toast.fail(data.msg);
                }
            })
            .catch(error => {
                console.log(error);
            });
        }
    }
}