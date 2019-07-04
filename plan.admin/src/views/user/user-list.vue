<style lang="postcss" scoped>
.home-container {}
</style>
<template>
<section class="home-container">
    <MasterPage title="用户搜索">
        <div slot="title-icon">
            <Icon type="ios-search" />
        </div>
        <div slot="searchContent" class="search-content-slot">
            <Form :model="formItem" :label-width="95">
                <Row>
                    <Col span="3">
                    <FormItem label="用户名：">
                        <Input v-model="formItem.userName" placeholder="请输入"></Input>
                    </FormItem>
                    </Col>
                    <Col span="3">
                    <FormItem label="机器人状态：">
                        <Select v-model="formItem.serverState">
                                <Option value="">全部</Option>
                                <Option value="true">开启</Option>
                                <Option value="false">关闭</Option>
                            </Select>
                    </FormItem>
                    </Col>
                    <Col span="3">
                    <FormItem label="手机认证：">
                        <Select v-model="formItem.phoneState">
                                <Option value="">全部</Option>
                                <Option value="true">已认证</Option>
                                <Option value="false">未认证</Option>
                            </Select>
                    </FormItem>
                    </Col>
                    <Col span="3">
                    <FormItem label="注销状态：">
                        <Select v-model="formItem.destroy">
                                <Option value="">全部</Option>
                                <Option value="false">正常</Option>
                                <Option value="true">已注销</Option>
                            </Select>
                    </FormItem>
                    </Col>
                </Row>
            </Form>
        </div>
        <div slot="search">
            <Button type="primary" icon="ios-search" @click="getUserList">查询</Button>&nbsp;
            <Button type="primary" icon="ios-refresh" @click="reset">重置</Button>
        </div>
        <div slot="btns">
            <Button type="primary" icon="md-add" @click="addUser">新增会员</Button>
        </div>
        <div slot="paddingContent">
            <Table :columns="columns" :data="userList"></Table>
        </div>
        <div slot="pager">
            <Page :total="page.totalNum" show-total @on-change="changePage" />
        </div>
    </MasterPage>
    <Modal title="修改服务时间" v-model="renewModal.extension" class-name="vertical-center-modal" width="350" @on-ok="renew">
        服务截止时间：
        <DatePicker type="datetime" placeholder="选择时间" style="width: 216px;" 
            :options="renewModal.dateOptions"
            format="yyyy-MM-dd HH:mm" 
            @on-change="changeTime" 
            :editable="false"></DatePicker>
    </Modal>
    <Modal v-model="p_modal" class-name="vertical-center-modal" :closable="false" width="350">
        <Table :columns="p_columns" :data="initPermissionsData()"></Table>
        <div slot="footer">
            <Button type="text"  @click="p_modal=false">取消</Button>
            <Button type="primary" :loading="p_loading" @click="syncPermissions">确定修改</Button>
        </div>
    </Modal>
</section>
</template>
<style lang="less">
.p_table {
    width: 300px;
}

.p_table td {
    width: 50%;
    text-align: center;
}

.vertical-center-modal {
    display: flex;
    align-items: center;
    justify-content: center;
    .ivu-modal {
        top: 0;
    }
}
</style>
<script src="./user-list.js"></script>


