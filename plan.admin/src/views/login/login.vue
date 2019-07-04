<style lang="postcss" scoped>
@import './login.pcss';
</style>

<template>
<section class="login-container">
    <div class="bg-wrap" :style="{backgroundImage:`url(${login_img})`}">
        <div class="card-wrap">
            <Card style="width:350px" :dis-hover="true">
                <p slot="title">
                    <Icon type="log-in"></Icon>微信机器人管理后台登录
                </p>
                <Form ref="userForm" :model="userForm" :rules="ruleCustom">
                    <FormItem prop="username">
                        <Input v-model.trim="userForm.username" placeholder="请输入" size="large">
                        <Icon type="ios-person-outline" slot="prepend" class="icon-cls"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem prop="password">
                        <Input type="password" v-model.trim="userForm.password" placeholder="请输入密码" size="large">
                        <Icon type="ios-lock-outline" slot="prepend" class="icon-cls"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem>
                        <p class="error-text" v-show="errmsg.all">{{errmsg.all}}</p>
                        <Button type="primary" @click="btn_login()" long :loading="login_loading">登录</Button>
                    </FormItem>
                </Form>
            </Card>
        </div>
    </div>
</section>
</template>

<script>
import { setToken } from '@/libs/util'
export default {
    data() {
        return {
            errmsg:{},
            login_loading: false,
            login_img: require("@/assets/login-bg.jpg"),
            userForm: {
                username: 'admin',
                password: '123456'
            },
            ruleCustom: {
                username: [{
                    required: true,
                    message: '用户名不能为空',
                    trigger: 'blur'
                }],
                password: [{
                    required: true,
                    message: '密码不能为空',
                    trigger: 'blur'
                }]
            }
        }
    },
    methods: {
        btn_login(){
            const me = this;
            me.$refs.userForm.validate((valid) => {
                if (valid) {
                    me.login_loading = true,
                    me.$http.post('/admin/login?format=json', {
                        user_name: me.userForm.username,
                        user_pwd: me.userForm.password
                    })
                    .then(response => {
                        me.login_loading = false;
                        const data = response.data;
                        if (!data.result) {
                            const user = data.data;
                            setToken(user.info.token);
                            this.$router.push('/home');
                        } else {
                            me.$Message.error(data.msg);
                        }
                    })
                    .catch(error => {
                        me.login_loading = false,
                        console.log(error);
                    });
                }
            });
        }
    }
}
</script>

