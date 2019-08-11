<template>
<section>
    <van-nav-bar :title="$route.meta.title" left-text="返回" left-arrow @click-left="goback">
        <van-icon name="replay" slot="right" size="18px" @click="getBettings" />
    </van-nav-bar>
    <van-search placeholder="请输入搜索关键词" v-model="keyword" />
    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" >
        <van-swipe-cell v-for="e in keyMap" >
            <van-cell-group v-bind="e">
                <van-cell :title="e.periods" :value="showInfo(e.position,e.ds)" @click="showContent(e.id)">
                    <template slot="title">
                        <span class="custom-title">{{e.periods}}  </span>
                        <van-tag :type="showTagType(e.state)"> {{showBetDesc(e.state)}} </van-tag>
                    </template>
                </van-cell>
            </van-cell-group>
            <span slot="right">
                <van-button v-if="e.state==3" type="danger" style="float:right;width:75px" square @click="delDialog(e.id)">
                    撤销计划
                </van-button>
            </span>
        </van-swipe-cell>
    </van-list>

    <!-- 删除dialog -->
    <van-dialog v-model="isShow" show-cancel-button :beforeClose="beforeClose">
        <div class="van-dialog__content"><div class="van-dialog__message">确定撤销计划吗？</div></div>
    </van-dialog>

    <footerNav></footerNav>
</section>
</template>

<script src="./betting.js"></script>
<style>
</style>
