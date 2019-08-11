import topNav from '@/components/nav/top-nav'
import footerNav from '@/components/nav/footer-nav'
import { Toast,SwipeCell,Popup,ImagePreview,Dialog } from 'vant'
import { betStateDesc,betStateType,showPositionDesc,showDsDesc } from '@/libs/util'
export default {
    components:{topNav,footerNav,SwipeCell,Popup,ImagePreview,Dialog},
    data() {
        return {
            seq: '',
            keyword: '',
            bettings: [],
            loading: false,
            finished: true,
            bettingId: '',
            isShow: false,
            token: ''
        }
    },
    computed: {
        keyMap() {
            return this.bettings.filter(e => 
                e.periods.indexOf(this.keyword.trim()) >= 0
            );
        }
    },
    mounted() {
        //this.token = getParams(window.location.href).token;
        //this.seq = getParams(window.location.href).seq;
        this.getBettings();
    },
    methods: {
        goback() {
            this.$router.go(-1);
        },
        showTagType(state) {
            return betStateType(state);
        },
        showBetDesc(state) {
            return betStateDesc(state);
        },
        showInfo(position,ds) {
            return showPositionDesc(position) + " - " + showDsDesc(ds);
        },
        showContent(id) {
            const betting = this.bettings.filter(e => e.id == id);
            const ids = betting[0].userIds;
            let msg = "关键字：" + ids + "\n";
            Toast(msg);
        },
        getBettings() {
            const data = {seq: this.seq, token: this.token}
            this.$http.post("bet/bettings?format=json", data).then(response => {
                const data = response.data;
                console.log(data);
                if (!data.result) {
                    this.bettings = data.data.info;
                } else {
                    Toast.fail(data.msg);
                }
            })
            .catch(error => {
                console.log(error);
            });
        },
        delDialog(id) {
            this.bettingId = id;
            this.isShow = true;
        },
        beforeClose(action, done) {
            if (action == "cancel")
                done();
            if (action == "confirm") {
                const param = { id: this.bettingId }
                this.$http.post("bet/cancel?format=json",  param).then(response => {
                    const data = response.data;
                    done();
                    this.getBettings();
                    setTimeout(() => {
                        Toast(data.msg);
                    }, 500);
                })
                .catch(error => {
                    console.log(error);
                });
            }
        }
    }
}