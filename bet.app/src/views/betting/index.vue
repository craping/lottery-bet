<template>
<section>
    <van-nav-bar :title="$route.meta.title" left-text="返回" left-arrow @click-left="goback">
        <van-icon name="replay" slot="right" size="18px" @click="getBettings" />
    </van-nav-bar>
    <van-search placeholder="请输入搜索关键词" v-model="keyword" />
    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" >
        <van-swipe-cell v-for="e in keyMap" :key="e.id" >
            <van-cell-group>
                <van-cell :title="e.periods" :value="showInfo(e.position,e.ds)" @click="showContent(e.id)">
                    <template slot="title">
                        <span class="custom-title">{{e.periods}}  </span>
                        <van-tag :type="showTagType(e.state)"> {{showBetDesc(e.state)}} </van-tag>
                    </template>
                </van-cell>
            </van-cell-group>
            <span slot="right">
                <van-button type="info" style="float:left;width:75px" square @click="modify(e.id)">
                    修改
                </van-button>
                <van-button type="danger" style="float:right;width:75px" square @click="delDialog(e.id)">
                    撤单
                </van-button>
            </span>
        </van-swipe-cell>
    </van-list>

    <!-- 删除dialog -->
    <van-dialog v-model="isShow" show-cancel-button :beforeClose="beforeClose">
        <div class="van-dialog__content"><div class="van-dialog__message">确定撤销计划吗？</div></div>
    </van-dialog>

    <!-- 修改状态 -->
    <van-action-sheet v-model="sheetShow" :actions="actions" cancel-text="取消" @select="onSelect" @cancel="onCancel"/>

    <footerNav></footerNav>
</section>
</template>

<script src="./betting.js"></script>
<style>
.sheet_success{
    background-color: red;
    color: white;
}
.sheet_fail{
    background-color: gray;
    color: white;
}
.sheet_unopen{
    background-color:#07c160;
    color: white;
}
</style>
