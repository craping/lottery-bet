<style lang="postcss" scoped>
.home-container {}
</style>
<template>
<section class="home-container">
    <MasterPage title="公告搜索">
        <div slot="title-icon">
            <Icon type="ios-search" />
        </div>
        <div slot="searchContent" class="search-content-slot">
            <Form :model="formItem" :label-width="95">
                <Row>
                    <Col span="3">
                        <FormItem label="公告标题：">
                            <Input v-model="formItem.title" placeholder="请输入"></Input>
                        </FormItem>
                    </Col>
                    <Col span="3">
                        <FormItem label="发布状态：">
                            <Select v-model="formItem.state">
                                    <Option value="">全部</Option>
                                    <Option value="true">已发布</Option>
                                    <Option value="false">未发布</Option>
                                </Select>
                        </FormItem>
                    </Col>
                    <Col span="3">
                        <FormItem label="发布时间：">
                            <DatePicker type="date" placeholder="选择时间" v-model="formItem.sendTime" 
                                    style="width: 216px" :editable="false">
                            </DatePicker>
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        </div>
        <div slot="search">
            <Button type="primary" icon="ios-search" @click="getNoticeList">查询</Button>&nbsp;
            <Button type="primary" icon="ios-refresh" @click="reset">重置</Button>
        </div>
        <div slot="btns">
            <Button type="primary" icon="md-add" @click="addNotice">新增公告</Button>
        </div>
        <div slot="paddingContent">
            <Table :columns="columns" :data="noticeList"></Table>
        </div>
        <div slot="pager">
            <Page :total="page.totalNum" show-total @on-change="changePage" />
        </div>
    </MasterPage>
    <Modal title="公告详情" v-model="infoModal" class-name="vertical-center-modal" width="350">
        <p v-html="notice.content" style=""></p>
    </Modal>
    <Modal title="修改公告" v-model="updModal" class-name="vertical-center-modal" width="500">
        <Form :model="notice" ref="updForm" :rules="ruleValidate" :label-width="80">
            <Row>
                <Col span="23">
                    <FormItem label="公告标题:" prop="title">
                        <Input type="text" v-model="notice.title" placeholder="请输入公告标题"></Input>
                    </FormItem>
                </Col>
            </Row>
            <Row>
                <Col span="23">
                    <FormItem label="公告内容:" prop="content">
                        <Input v-model="updContent" type="textarea" :autosize="{minRows: 5,maxRows: 10}" 
                            placeholder="请输入公告内容"></Input>
                    </FormItem>
                </Col>
            </Row>
            <Row>
                <Col span="12">
                    <FormItem label="是否发布:" prop="state">
                        <Checkbox v-model="notice.state">发布</Checkbox>
                    </FormItem>
                </Col>
            </Row>
            <Row>
                <Col span="12">
                    <FormItem label="发布时间:" prop="sendTime">
                    <DatePicker type="datetime" placeholder="选择时间" 
                        
                        :options="dateOptions" 
                        v-model="updBeforeTime" 
                        format="yyyy-MM-dd HH:mm" 
                        style="width: 216px;" :editable="false"></DatePicker>
                    </FormItem>
                </Col>
            </Row>
        </Form>
        <div slot="footer">
            <Button type="text"  @click="updModal=false">取消</Button>
            <Button type="primary" :loading="updLoading" @click="updNotice">确定修改</Button>
        </div>
    </Modal>
</section>
</template>
<style lang="less">
.p_table {
    width: 300px;
}
p{
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
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
<script src="./notice-list.js"></script>


