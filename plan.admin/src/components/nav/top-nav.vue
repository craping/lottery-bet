<template>
<van-nav-bar :title="$route.meta.title" left-text="返回" left-arrow @click-left="goback" />
</template>

<script>
export default {
    name: 'topNav',
    data() {
        return {

        }
    },
    methods: {
        goback(){
            this.$router.go(-1);
        }
    }
}
</script>

<style lang="" scoped>

</style>
