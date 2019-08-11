<template>
    <van-tabbar v-model="active" @change="barChange()">
        <van-tabbar-item icon="home-o" >首页</van-tabbar-item>
        <van-tabbar-item icon="setting-o">设置</van-tabbar-item>
    </van-tabbar>
</template>

<script>
export default {
    name: 'footerNav',
    data() {
        return {
            active: this.$config.active,
            token: ''
        }
    },
    mounted() {
        //this.token = getParams(window.location.href).token;
    },
    methods: {
        barChange() {
            if (this.active) {
                this.$config.active = 1;
                this.$router.push({
                    path: '/setting',
                    query: {
                        //token: this.token
                    }
                })
            } else {
                this.$config.active = 0;
                this.$router.push({
                    path: '/home',
                    query: {
                       // token: this.token
                    }
                })
            }
        }
    }
}
</script>

<style lang="" scoped>

</style>