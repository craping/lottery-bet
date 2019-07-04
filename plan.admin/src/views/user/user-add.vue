<style lang="postcss" scoped>
.home-container {}
</style>
<template>
<section class="home-container">
    <MasterPage title="新增会员">
        <div slot="title-icon">
            <Icon type="md-add" />
        </div>
        <div slot="searchContent" class="search-content-slot">
            <Form :model="formItem" ref="formItem" :rules="ruleValidate" :label-width="80">
                <Row>
                    <Col span="4">
                        <FormItem label="用户名" prop="userName">
                            <Input type="text" v-model="formItem.userName" placeholder="请输入用户名"></Input>
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span="4">
                        <FormItem label="登录密码" prop="password">
                            <Input type="password" v-model="formItem.password" placeholder="请输入密码"></Input>
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span="12">
                        <FormItem label="服务状态" prop="serverState">
                            <RadioGroup v-model="formItem.serverState">
                                <Radio label="true">启用</Radio>
                                <Radio label="false">禁用</Radio>
                            </RadioGroup>
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span="12">
                         <FormItem label="服务时间" prop="serverEnd">
                            <DatePicker type="date" placeholder="选择时间" 
                                :editable="false" 
                                :options="dateOptions" 
                                v-model="formItem.serverEnd" 
                                style="width: 216px" >
                            </DatePicker>
                        </FormItem>
                    </Col>
                </Row>
                <FormItem label="用户权限" prop="interest">
                    <Checkbox :indeterminate="indeterminate" :value="checkAll" @click.prevent.native="handleCheckAll">
                        全选
                    </Checkbox>
                    <CheckboxGroup v-model="checkAllGroup" @on-change="checkAllGroupChange">
                        <Checkbox v-model="permissions.zombieTest" label="zombieTest">僵尸粉检测</Checkbox>
                        <Checkbox v-model="permissions.chat" label="chat">聊天</Checkbox>
                        <Checkbox v-model="permissions.keyword" label="keyword">分群关键词</Checkbox>
                        <Checkbox v-model="permissions.globalKeyword" label="globalKeyword">全群关键词</Checkbox>
                        <Checkbox v-model="permissions.timer" label="timer">分群定时消息</Checkbox>
                        <Checkbox v-model="permissions.globalTimer" label="globalTimer">全群定时消息</Checkbox>
                        <Checkbox v-model="permissions.acceptFriend" label="acceptFriend">自动接受好友请求</Checkbox>
                        <Checkbox v-model="permissions.chatRoomFoundTip" label="chatRoomFoundTip">发现新群提示语</Checkbox>
                        <Checkbox v-model="permissions.memberJoinTip" label="memberJoinTip">成员加入提示语</Checkbox>
                        <Checkbox v-model="permissions.memberLeftTip" label="memberLeftTip">成员退出提示语</Checkbox>
                        <Checkbox v-model="permissions.wapSite" label="wapSite">移动端管理</Checkbox>
                    </CheckboxGroup>
                </FormItem>
                <FormItem>
                    <Button type="primary" :loading="loading" @click="handleSubmit('formItem')">提交</Button>
                    <Button @click="handleCancel" style="margin-left: 8px">取消</Button>
                </FormItem>
            </Form>
        </div>
    </MasterPage>
</section>
</template>
<script src="./user-add.js"></script>


