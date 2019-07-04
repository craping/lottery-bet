import MasterPage from "@/components/master";
import { closeTag } from '@/components/layout/layout'
import { textareaToHtml } from '@/libs/util'
export default {
    components: {
        MasterPage
    },
    data() {
        return {
            loading: false,
            dateOptions: {
                disabledDate(date) {
                    return date && date.valueOf() < Date.now() - 86400000;
                }
            },
            formItem: {
                title: "",
                content: "",
                state: false,
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
            }
        };
    },
    methods: {
        handleCancel() {
            closeTag('notice-add');
        },
        handleSubmit(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    const me = this;
                    me.loading = true;
                    const content = textareaToHtml(me.formItem.content);
                    const data = {
                        title: me.formItem.title,
                        content: content,
                        state: me.formItem.state,
                        sendTime: me.formItem.sendTime
                    }
                    me.$http.post("/admin/addNotice?format=json", data)
                        .then(response => {
                            me.loading = false;
                            const data = response.data;
                            if (!data.result) {
                                me.$Message.success("操作成功!");
                                // 初始化数据
                                Object.assign(this.$data.formItem, this.$options.data().formItem);
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