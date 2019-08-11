import { Toast } from 'vant';
import footerNav from '@/components/nav/footer-nav'
export default {
    components: {
        Toast,
        footerNav
    },
    data() {
        return {
            betPopup: false,
            keyword: '',
            users: [],
            loading: true,
            loadingBet: false,
            finished: false,
            results: [],
            active: '',
            position:'1',
            ds:'1',
            xyftPeriods:''
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
        this.getXYFTPeriods();
    },
    methods: {
        nextStep() {
            if (this.xyftPeriods == "") {
                Toast("期号不正确，请刷新期号");
                return;
            }
            this.betPopup = true;
            this.getUsers();
        },
        toggle(index) {
            this.$refs.checkboxes[index].toggle();
        },
        showPeriods(nowPeriods){
            if (nowPeriods == "0"){
                return "";
            } else {
                return "danger";
            }
        },
        onBet() {
            this.loadingBet = true;
            let ids = [];
            Object.keys(this.results).forEach(key => {
                ids.push(this.results[key].id);
            });
            var params = {
                periods: this.xyftPeriods,
                position: this.position,
                ds: this.ds,
                ids: ids
            }

            if (this.xyftPeriods == "") {
                Toast("期号不正确，请刷新期号");
                this.loadingBet = false;
                return;
            }

            if (ids.length <= 0) {
                Toast("请勾选用户");
                this.loadingBet = false;
                return;
            }

            this.$http.post("/bet/betting?format=json",  params).then(response => {
                const data = response.data;
                if (!data.result) {
                    Toast.success(data.msg);
                    this.loadingBet = false;
                    //setTimeout(() => {
                      //  this.addPopup = false;
                    //}, 500);
                } else {
                    Toast.fail(data.msg);
                    this.loadingBet = false;
                }
            })
            .catch(error => {
                this.loading = false;
                console.log(error);
            });
        },
        goSetting(seq) {
            this.$config.active = null;
            this.$router.push({
                path: '/setting',
                query: {
                    seq: seq
                }
            })
        },
        getXYFTPeriods() {
            this.xyftPeriods = "";
            this.loading = true;
            this.$http.post("/bet/getXYFTPeriods?format=json",{}).then(response => {
                const data = response.data;
                if (!data.result) {
                    this.xyftPeriods = data.data.info;
                    this.loading = false;
                } else {
                    Toast.fail(data.msg);
                    this.loading = false;
                }
            })
            .catch(error => {
                console.log(error);
            });
        },
        reloadUsers() {
            this.getUsers();
            setTimeout(() => {
                Toast("在线用户加载成功");
            }, 500);
        },
        getUsers() {
            this.results = [];
            this.$http.post("/user/onlineList?format=json", {}).then(response => {
                const data = response.data;
                if (!data.result) {
                    this.users = data.data.info;
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