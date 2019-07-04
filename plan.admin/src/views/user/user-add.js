import MasterPage from "@/components/master";
import { closeTag } from '@/components/layout/layout'
export default {
    components: {
        MasterPage
    },
    data() {
        return {
            loading: false,
            indeterminate: false,
            checkAll: false,
            checkAllGroup: [],
            dateOptions: {
                disabledDate(date) {
                    return date && date.valueOf() < Date.now() - 86400000;
                }
            },
            formItem: {
                userName: "",
                password: "",
                serverState: null,
                serverEnd: ""
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
            },
            ruleValidate: {
                userName: [{ required: true, message: '输入用户名', trigger: 'blur' }],
                password: [{ required: true, message: '输入登录密码', trigger: 'blur' }],
                serverState: [{ required: true, message: '选择服务状态', trigger: 'change' }],
                serverEnd: [{ required: true, type: 'date', message: '选择服务时间', trigger: 'change' }]
            }
        };
    },
    methods: {
        handleCheckAll() {
            if (this.indeterminate) {
                this.checkAll = false;
            } else {
                this.checkAll = !this.checkAll;
            }
            this.indeterminate = false;
            if (this.checkAll) {
                this.checkAllGroup = ['zombieTest', 'chat', 'keyword',
                    'globalKeyword', 'timer', 'globalTimer', 'acceptFriend',
                    'chatRoomFoundTip', 'memberJoinTip', 'memberLeftTip', 'wapSite'
                ];
                this.checkAllGroup.forEach(e => {
                    this.permissions[e] = true;
                });
            } else {
                this.checkAllGroup = [];
                Object.assign(this.$data.permissions, this.$options.data().permissions);
            }
        },
        checkAllGroupChange(data) {
            console.log(JSON.stringify(this.permissions));
            if (data.length == 11) {
                this.indeterminate = false;
                this.checkAll = true;
            } else if (data.length > 0) {
                this.indeterminate = true;
                this.checkAll = false;
            } else {
                this.indeterminate = false;
                this.checkAll = false;
            }
        },
        handleCancel() {
            closeTag('user-add');
        },
        handleSubmit(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    const me = this;
                    me.loading = true;
                    const data = {
                        user_name: me.formItem.userName,
                        user_pwd: me.formItem.password,
                        server_state: me.formItem.serverState,
                        server_end: me.formItem.serverEnd,
                        permissions: JSON.stringify(me.permissions)
                    }
                    me.$http.post("/admin/addUser?format=json", data)
                        .then(response => {
                            me.loading = false;
                            const data = response.data;
                            if (!data.result) {
                                me.$Message.success("操作成功!");
                                // 初始化数据
                                me.checkAll = false;
                                // Object.assign(this.$data.permissions, this.$options.data().permissions);
                                // Object.assign(this.$data.formItem, this.$options.data().formItem);
                                me.checkAllGroup = [];
                                this.$refs[name].resetFields();
                            } else {
                                me.$Message.error(data.msg);
                            }
                        })
                        .catch(error => {
                            me.loading = false;
                            console.log(error);
                        }
                    );
                }
            })
        }
    }
};