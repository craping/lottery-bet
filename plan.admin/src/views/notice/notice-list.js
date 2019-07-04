import MasterPage from "@/components/master";
import { formatDate,textareaToHtml,htmlToTextarea } from '@/libs/util'
import { choosedMenu } from '@/components/layout/layout'
export default {
    components: {
        MasterPage
    },
    data() {
        return {
            infoModal:false,
            updModal:false,
            updLoading: false,
            updBeforeTime: '',
            updContent:'',
            dateOptions: {
                disabledDate(date) {
                    return date && date.valueOf() < Date.now() - 86400000;
                }
            },
            page: {
                totalNum: 10,
                curPage: 1,
                pageSize: 10
            },
            formItem: {
                title: "",
                state: "",
                sendTime: ""
            },
            ruleValidate: {
                title: [{
                    required: true,
                    message: '输入公告标题',
                    trigger: 'blur'
                }],
                content: [{
                    required: true,
                    message: '输入公告内容',
                    trigger: 'blur'
                }]
            },
            columns: [
                { title: "公告标题", align: 'center', key: "title" },
                { title: "发布时间", align: 'center', render: (h, params) => {
                        if (params.row.sendTime) {
                            let sendTime = formatDate(params.row.sendTime);
                            return h('span', sendTime)
                        } else {
                            return h('span', ' - ')
                        }
                    } 
                },
                { title: "添加时间", align: 'center', render: (h, params) => {
                        const oprTime = formatDate(params.row.oprTime);
                        return h('span', oprTime)
                    } 
                },
                { title: "当前状态", align: 'center', render: (h, params) => {
                        if (params.row.state) {
                            return h('span', '已发布')
                        } else {
                            return h('span', '未发布')
                        }
                    } 
                },
                { title: '操作', align: 'center', width: 400, render: (h, params) => {
                    let btns = [];
                    if (params.row.state) {
                        btns.push(
                            h('Button', {
                                props: { type: 'error', size: 'small', },
                                style: { marginRight: '5px' },
                                on: { click: () => { this.cancel(params.row.id); } }
                            }, '取消发布')
                        );
                    } else {
                        btns.push(
                            h('Button', {
                                props: { type: 'success', size: 'small', },
                                style: { marginRight: '5px' },
                                on: { click: () => { this.publish(params.row.id); } }
                            }, '立即发布'),
                            h('Button', {
                                props: { type: 'primary', size: 'small', },
                                style: { marginRight: '5px' },
                                on: { click: () => { 
                                        this.updContent = htmlToTextarea(params.row.content);
                                        this.updBeforeTime = formatDate(params.row.sendTime);
                                        this.notice = Object.assign({}, params.row);
                                        this.updModal = true;
                                    } 
                                }
                            }, '修改公告'),
                            h('Button', {
                                props: { type: 'error', size: 'small', },
                                style: { marginRight: '5px' },
                                on: { click: () => { this.delete(params.row.id) } }
                            }, '删除公告')
                        );
                    }
                    btns.push(
                        h('Button', {
                            props: { type: 'primary', size: 'small', },
                            style: { marginRight: '5px' },
                            on: { click: () => {  this.notice = params.row; this.infoModal = true; } }
                        }, '查看详情')
                    );
                    return h("div", btns);
                }
            }],
            noticeList: [],
            notice:{}
        };
    },
    mounted() {
        this.getNoticeList();
    },
    methods: {
        updNotice() {
            console.log(this.updBeforeTime);
            
            this.$refs.updForm.validate((valid) => {
                if (valid) {
                    const me = this;
                    me.updLoading = true;
                    const data = { 
                        id: me.notice.id,
                        title: me.notice.title,
                        content: textareaToHtml(me.updContent),
                        state: me.notice.state,
                        sendTime: this.updBeforeTime
                    }
                    me.$http.post("/admin/updNotice?format=json", data)
                        .then(response => {
                            const data = response.data;
                            if (!data.result) {
                                me.updLoading = false;
                                me.$Message.success("修改成功!");
                                me.updModal = false;
                                me.updBeforeTime = '';
                                me.updContent = '';
                                setTimeout(() => {
                                    this.getNoticeList();
                                }, 1000);
                            } else {
                                me.updLoading = false;
                                me.$Message.error(data.msg);
                            }
                        })
                        .catch(error => {
                            me.updLoading = false;
                            console.log(error);
                        }
                    );
                }
            })
        },
        cancel(id) {
            const me = this;
            const data = { id : id, state: false }
            me.$http.post("/admin/updNoticeState?format=json", data)
                .then(response => {
                    const data = response.data;
                    if (!data.result) {
                        me.$Message.success("取消成功!");
                        this.getNoticeList();
                    } else {
                        me.$Message.error(data.msg);
                    }
                })
                .catch(error => {
                    console.log(error);
                }
            );
        },
        publish(id) {
            const me = this;
            const data = {id: id, state: true} 
            me.$http.post("/admin/updNoticeState?format=json", data)
                .then(response => {
                    const data = response.data;
                    if (!data.result) {
                        me.$Message.success("发布成功!"); 
                        this.getNoticeList();
                    } else {
                        me.$Message.error(data.msg);
                    }
                })
                .catch(error => {
                    console.log(error);
                }
            );
        },
        delete(id) {
            const me = this;
            const data = {id: id} 
            me.$http.post("/admin/delNotice?format=json", data)
                .then(response => {
                    const data = response.data;
                    if (!data.result) {
                        me.$Message.success("删除成功!"); 
                        this.getNoticeList();
                    } else {
                        me.$Message.error(data.msg);
                    }
                })
                .catch(error => {
                    console.log(error);
                }
            );
        },
        reset() {
            this.formItem = Object.assign({}, {});
            this.$nextTick(() => {
                this.getNoticeList();
            });
        },
        addNotice(){
            choosedMenu('notice-add');
        },
        changeTime(e) {
            this.updBeforeTime = e;
        },
        changePage(idx) {
            this.page.curPage = idx;
            this.getNoticeList();
        },
        getNoticeList() {
            this.formItem = Object.assign({}, this.formItem, this.page);
            this.$http.post('/admin/noticeList?format=json', this.formItem)
                .then(response => {
                    const data = response.data;
                    if (!data.result) {
                        this.noticeList = data.data.info;
                        this.page.totalNum = data.data.totalnum;
                    } else {
                        this.$Message.error(data.msg);
                    }
                })
                .catch(error => {
                    console.log(error);
                }
            );
        }
    }
};