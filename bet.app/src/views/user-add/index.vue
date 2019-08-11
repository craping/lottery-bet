<template>
<section>
    <topNav></topNav>
    <van-cell-group>
        <van-field v-model="userName" required clearable label="用户名" placeholder="请输入用户名" ref="userName"/>
        <van-field v-model="userPwd" required clearable label="密码" placeholder="请输入密码" ref="userPwd"/>
        <van-field v-model="endTime" required label="服务时间" placeholder="请选择服务时间" disabled>
            <van-button slot="button" size="small" type="default" @click="pickTimePopup">选择时间</van-button>
        </van-field>
        <van-cell title="初始期数" required><van-stepper v-model="periods" min="1" max="10" /></van-cell>
    </van-cell-group>

    <van-popup v-model="pickTime" round position="bottom" :style="{ height: '40%' }">
        <van-datetime-picker v-model="currentDate" type="date" :min-date="minDate" 
        @change="onChange" 
        @cancel="pickTime=false" 
        @confirm="pickTime=false" />
    </van-popup>

    <br />
    <van-button size="large" type="info" @click="addUser" :loading="loading">确定提交</van-button>

    <footerNav></footerNav>
</section>
</template>

<script src="./user-add.js">

</script>

<style scoped>

</style>
