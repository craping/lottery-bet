<template>
<section>
    <van-nav-bar :title="$route.meta.title" left-text="返回" left-arrow @click-left="goback">
        <van-icon name="replay" slot="right" size="18px" @click="getUsers" />
    </van-nav-bar>
    <van-search placeholder="请输入搜索关键词" v-model="keyword" />

    <van-list v-model="loading" :finished="finished" finished-text="没有更多了">
        <van-cell v-for="e in users">
            <van-row v-bind="e">
                <van-col span="8">{{e.userName}}
                    <van-tag :type="showPeriods(e.nowPeriods)">{{e.nowPeriods}} / {{e.periods}}</van-tag>
                </van-col>
                <van-col span="8" style="text-align: right;">
                    <van-stepper v-model="e.periods" async-change min="1" max="10" 
                        @plus="onChange(e.periods, e.id)" @minus="onChange(e.periods, e.id)" />
                </van-col>
                <van-col span="8" style="text-align: right;">
                    <van-button size="small" type="info" @click="delDialog(e.id)">重置期数</van-button>
                </van-col>
            </van-row>
        </van-cell>
    </van-list>

    <!-- 重置dialog -->
    <van-dialog v-model="isShow" show-cancel-button :beforeClose="beforeClose">
        <div class="van-dialog__content"><div class="van-dialog__message">确定重置期数吗？</div></div>
    </van-dialog>

    <footerNav></footerNav>
</section>
</template>

<script src="./user-list.js">

</script>
<style>

</style>
