<template>
<section>
    <topNav></topNav>
    <van-cell-group>
        <van-cell title="投注管理" icon="gold-coin" is-link @click="goSetting('betting')" />
        <van-cell title="新增会员" icon="manager" is-link @click="goSetting('user-add')" />
        <van-cell title="会员列表" icon="friends" is-link @click="goSetting('user-list')" />
        <!-- <van-cell title="在线用户列表" icon="friends" is-link @click="goSetting('user-online-list')" /> -->
    </van-cell-group>

    <footerNav></footerNav>
</section>
</template>

<script src="./setting.js"></script>
<style scoped>
</style>
