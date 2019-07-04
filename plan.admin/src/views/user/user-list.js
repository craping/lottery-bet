import MasterPage from "@/components/master";
import { formatDate } from '@/libs/util'
import { choosedMenu } from '@/components/layout/layout'
export default {
    components: {
        MasterPage
    },
    data() {
        return {
            user: {},
            renewModal: {
                dateOptions: {
                    disabledDate(date) {
                        return date && date.valueOf() < Date.now() - 86400000;
                    }
                },
                extension: false,
                serverEnd: ''
            },
            permissions: {
                zombieTest: false,
                chat: false,
                keyword: false,
                globalKeyword: false,
                timer: false,
                globalTimer: false,
                acceptFriend: false,
                chatRoomFoundTip: false,
                memberJoinTip: false,
                memberLeftTip: false,
                wapSite: false,
                forward: false,
                turing: false,
            },
            page: {
                totalNum: 10,
                curPage: 1,
                pageSize: 10
            },
            formItem: {
                userName: "",
                serverState: "",
                phoneState: "",
                destroy: ""
            },
            p_modal: false,
            p_loading: false,
            p_columns: [
                { title: "功能描述", key: "name" },
                { title: "操作", align: 'center', render: (h, params) => {
                        return h('i-switch', {
                            props: { size: 'large', value: params.row.value},
                            on: { 'on-change': (value) => { 
                                    this.permissions[''+params.row.target+''] = value;
                                    //this.syncPermissions();
                                } 
                            },
                        }, 
                        [
                            h('span', { slot: 'open', domProps: { innerHTML: '开启' } }),
                            h('span', { slot: 'close', domProps: { innerHTML: '关闭' } })
                        ])
                    }
                }
            ],
            columns: [
                { title: "用户名", align: 'center', render: (h, params) => {
                        return h('span', params.row.userInfo.userName)
                    }
                },
                { title: "机器人开关", align: 'center', render: (h, params) => {
                        if (params.row.userInfo.serverState) {
                            return h('Icon', { props: { type: 'md-checkmark', size: '18' } })
                        } else {
                            return h('Icon', { props: { type: 'md-close', size: '18' } })
                        }
                    }
                },
                { title: "手机认证", align: 'center', render: (h, params) => {
                        if (params.row.userInfo.phoneState) {
                            return h('Icon', { props: { type: 'md-checkmark', size: '18' } })
                        } else {
                            return h('Icon', { props: { type: 'md-close', size: '18' } })
                        }
                    }
                },
                { title: "是否注销", align: 'center', render: (h, params) => {
                        if (params.row.userInfo.destroy) {
                            return h('span', '已注销')
                        } else {
                            return h('span', '正常')
                        }
                    }
                },
                { title: "到期时间", align: 'center', render: (h, params) => {
                        let endTime = formatDate(params.row.userInfo.serverEnd);
                        return h('span', endTime)
                    }
                },
                { title: "注册时间", align: 'center', render: (h, params) => {
                        let regTime = formatDate(params.row.userInfo.regTime);
                        return h('span', regTime)
                    }
                },
                { title: '操作', align: 'center', width: 400, render: (h, params) => {
                        let btns = [];
                        if (params.row.userInfo.destroy) {
                            btns.push(
                                h('Button', {
                                    props: { type: 'error', size: 'small', },
                                    style: { marginRight: '5px' },
                                    on: { click: () => { this.destroy(params.row, false) } }
                                }, '激活账户')
                            );
                        } else {
                            btns.push(
                                h('Button', {
                                    props: { type: 'primary', size: 'small', },
                                    style: { marginRight: '5px' },
                                    on: {
                                        click: () => {
                                            this.getPermissionsData(params.row);
                                            Object.assign(this.$data.permissions, this.$options.data().permissions)
                                            this.p_modal = true;
                                            this.user = params.row;
                                        }
                                    }
                                }, '权限设置'),
                                h('Button', {
                                    props: { type: 'primary', size: 'small', },
                                    style: { marginRight: '5px' },
                                    on: {
                                        click: () => {
                                            this.renewModal.extension = true;
                                            this.user = params.row;
                                        }
                                    }
                                }, '续费'),
                                h('Button', {
                                    props: { type: 'primary', size: 'small', },
                                    style: { marginRight: '5px' },
                                    on: { click: () => { this.resetPwd(params.row) } }
                                }, '重置密码')
                            );
                            if (params.row.userInfo.serverState) {
                                btns.push(
                                    h('Button', {
                                        props: { type: 'error', size: 'small', },
                                        style: { marginRight: '5px' },
                                        on: { click: () => { this.lock(params.row, false) } }
                                    }, '关闭机器人')
                                );
                            } else {
                                btns.push(
                                    h('Button', {
                                        props: { type: 'success', size: 'small', },
                                        style: { marginRight: '5px' },
                                        on: { click: () => { this.lock(params.row, true) } }
                                    }, '开启机器人')
                                );
                            }
                            btns.push(
                                h('Button', {
                                    props: { type: 'success', size: 'small', },
                                    style: { marginRight: '5px' },
                                    on: { click: () => { this.destroy(params.row, true) } }
                                }, '注销账户')
                            );
                        }
                        return h("div", btns);
                    }
                }
            ],
            userList: []
        };
    },
    mounted() {
        this.getUserList();
    },
    methods: {
        syncPermissions() {
            const me = this;
            me.p_loading = true;
            const data = {
                id : me.user.id,
                permissions: JSON.stringify(me.permissions)
            }
            me.$http.post("/admin/syncPermissions?format=json", data)
                .then(response => {
                    const data = response.data;
                    me.p_loading = false;
                    if (!data.result) {
                        me.$Message.success(data.msg);
                        setTimeout(() => {
                            me.p_modal = false;
                        }, 500); 
                    } else {
                        me.$Message.error(data.msg);
                    }
                })
                .catch(error => {
                    me.p_loading = false;
                    console.log(error);
                }
            );
        },
        getPermissionsData(params) {
            const me = this;
            const data = {id: params.id} 
            me.$http.post("/admin/getPermissions?format=json", data)
                .then(response => {
                    const data = response.data;
                    if (!data.result) {
                        if (JSON.stringify(data.data) != '{}') {
                            this.permissions = Object.assign({}, data.data.info);
                        } 
                    } else {
                        me.$Message.error(data.msg);
                    }
                })
                .catch(error => {
                    console.log(error);
                }
            );
        },
        initPermissionsData() {
            let data = [];
            data.push(
                { name: "僵尸粉检测", target:"zombieTest", value: this.permissions.zombieTest },
                { name: "聊天", target:"chat", value: this.permissions.chat },
                { name: "分群关键词", target:"keyword", value: this.permissions.keyword },
                { name: "全群关键词", target:"globalKeyword", value: this.permissions.globalKeyword },
                { name: "分群定时消息", target:"timer", value: this.permissions.timer },
                { name: "全群定时消息", target:"globalTimer", value: this.permissions.globalTimer },
                { name: "自动接受好友请求", target:"acceptFriend", value: this.permissions.acceptFriend },
                //{ name: "发现新群提示语", target:"chatRoomFoundTip", value: this.permissions.chatRoomFoundTip },
                { name: "成员加入提示语", target:"memberJoinTip", value: this.permissions.memberJoinTip },
                { name: "成员退出提示语", target:"memberLeftTip", value: this.permissions.memberLeftTip },
                { name: "移动端管理", target:"wapSite", value: this.permissions.wapSite },
                { name: "图灵机器人", target:"turing", value: this.permissions.turing },
                { name: "群转发", target:"forward", value: this.permissions.forward }
            );
            return data;
        },
        resetPwd(params) {
            const me = this;
            me.$Modal.confirm({
                title: "重置密码",
                content: "用户[" + params.userInfo.userName + "]的密码将重置为[888888]",
                okText: "确定",
                onOk() {
                    me.$http.post('/admin/resetPwd?format=json', {id: params.id})
                        .then(response => {
                            const data = response.data;
                            if (!data.result) {
                                me.$Message.success("操作成功!");
                            } else {
                                me.$Message.error(data.msg);
                            }
                        })
                        .catch(error => {
                            console.log(error);
                        }
                    );
                }
            });
        },
        reset() {
            this.formItem = Object.assign({}, {});
            this.$nextTick(() => {
                this.getUserList();
            });
        },
        renew() {
            const me = this;
            if (me.renewModal.serverEnd == ""){
                return;
            }
            const data = {
                id: me.user.id,
                server_end: me.renewModal.serverEnd
            };
            this.$http.post('/admin/extension?format=json', data)
                .then(response => {
                    const data = response.data;
                    if (!data.result) {
                        me.$Message.success("操作成功!");
                        me.$nextTick(() => {
                            me.getUserList();
                        });
                    } else {
                        me.$Message.error(data.msg);
                    }
                })
                .catch(error => {
                    console.log(error);
                }
            );
        },
        changeTime(e) {
            this.renewModal.serverEnd = e;
        },
        addUser(){
            choosedMenu('user-add');
        },
        changePage(idx) {
            this.page.curPage = idx;
            this.getUserList();
        },
        lock(params, state) {
            const me = this;
            let title = '关闭机器人：';
            let content = '<p>关闭机器人后用户只有聊天功能，确定?</p>';
            let okText = '确定关闭';
            if (state) {
                title = '开启用户：';
                content = '<p>确定开启？</p>';
                okText = '确定开启';
            }
            me.$Modal.confirm({
                title: title + params.userInfo.userName,
                content: content,
                okText: okText,
                onOk() {
                    const data = {
                        id: params.id,
                        server_state: state
                    };
                    this.$http.post('/admin/lock?format=json', data)
                        .then(response => {
                            const data = response.data;
                            if (!data.result) {
                                me.$Message.success("操作成功!");
                                me.$nextTick(() => {
                                    me.getUserList();
                                });
                            } else {
                                me.$Message.error(data.msg);
                            }
                        })
                        .catch(error => {
                            console.log(error);
                        }
                    );
                }
            });
        },
        destroy(params, state) {
            const me = this;
            let title = '注销用户：';
            let content = '<p>注销后账号不可再使用，确定?</p>';
            let okText = '确定注销';
            if (!state) {
                title = '激活用户：';
                content = '<p>激活后帐号可以正常使用</p>';
                okText = '确定激活';
            }
            console.log(state);
            me.$Modal.confirm({
                title: title + params.userInfo.userName,
                content: content,
                okText: okText,
                onOk() {
                    const data = {
                        id: params.id,
                        destroy: state
                    };
                    this.$http.post('/admin/destroy?format=json', data)
                        .then(response => {
                            const data = response.data;
                            if (!data.result) {
                                me.$Message.success("操作成功!");
                                me.$nextTick(() => {
                                    me.getUserList();
                                });
                            } else {
                                me.$Message.error(data.msg);
                            }
                        })
                        .catch(error => {
                            console.log(error);
                        }
                    );
                }
            });
        },
        getUserList() {
            this.formItem = Object.assign({}, this.formItem, this.page);
            this.$http.post('/admin/list?format=json', this.formItem)
                .then(response => {
                    const data = response.data;
                    if (!data.result) {
                        this.userList = data.data.info;
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