<template>
<section>
    
    <van-nav-bar title="投注信息配置">
        <van-icon name="arrow" slot="right" @click="nextStep" />
    </van-nav-bar>
    
    <van-field v-model="xyftPeriods" center label="当前期号：" disabled>
        <van-button slot="button" size="small" type="info" @click="getXYFTPeriods" :loading="loading">刷新期号</van-button>
    </van-field>
    
    <van-radio-group v-model="position">
        <van-cell-group title="冠亚选择">
            <van-cell title="冠军" clickable @click="position = '1'">
                <van-radio slot="right-icon" name="1" />
            </van-cell>
            <van-cell title="亚军" clickable @click="position = '2'">
                <van-radio slot="right-icon" name="2" />
            </van-cell>
        </van-cell-group>
    </van-radio-group>

    <van-radio-group v-model="ds">
        <van-cell-group title="单双选择">
            <van-cell title="单" clickable @click="ds = '1'">
                <van-radio slot="right-icon" name="1" />
            </van-cell>
            <van-cell title="双" clickable @click="ds = '2'">
                <van-radio slot="right-icon" name="2" />
            </van-cell>
        </van-cell-group>
    </van-radio-group>
    <footerNav></footerNav>

    <!-- 弹出层 新增 -->
    <van-popup v-model="betPopup" position="right" :overlay="false" style="width: 100%; height: 100%;">
        <van-nav-bar title="选择投注用户" left-text="返回" left-arrow @click-left="betPopup=false"
            right-text="刷新用户" @click-right="reloadUsers"/>

        <div style="padding:0px 0px 5px">
            <van-search placeholder="请输入搜索关键词" v-model="keyword" />
        </div>
    
        <van-checkbox-group v-model="results">
            <van-cell-group>
                <van-cell v-for="(item, index) in keyMap" clickable :key="item.id"  @click="toggle(index)">
                    <template slot="title">
                        <span class="custom-title">
                            {{item.userName}} &nbsp;
                            ¥{{item.balance}}
                        </span>&nbsp;
                        <van-tag :type="showPeriods(item.nowPeriods)">{{item.nowPeriods}} / {{item.periods}}</van-tag>
                    </template>
                    <van-checkbox :name="item" ref="checkboxes" slot="right-icon"/>
                </van-cell>
            </van-cell-group>
        </van-checkbox-group>

        <!--<van-cell-group>
            <van-cell v-for="(item, index) in results" clickable :key="item.id" :title="item.userName">
                <van-stepper v-model="item.step" min="1" max="10" />
            </van-cell>
        </van-cell-group>-->

        <van-tabbar v-model="active" >
            <van-button type="info" size="large" :loading="loadingBet" @click="onBet">确定投注</van-button>
        </van-tabbar>
    </van-popup>
</section>
</template>

<script src="./home.js"></script>
<style scoped></style>
