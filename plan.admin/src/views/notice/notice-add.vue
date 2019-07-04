<style lang="postcss" scoped>
.home-container {}
</style>
<template>
<section class="home-container">
    <MasterPage title="发布公告">
        <div slot="title-icon">
            <Icon type="md-add" />
        </div>
        <div slot="searchContent" class="search-content-slot">
            <Form :model="formItem" ref="formItem" :rules="ruleValidate" :label-width="80">
                <Row>
                    <Col span="6">
                        <FormItem label="公告标题:" prop="title">
                            <Input type="text" v-model="formItem.title" placeholder="请输入公告标题"></Input>
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span="6">
                        <FormItem label="公告内容:" prop="content">
                            <Input v-model="formItem.content" type="textarea" :autosize="{minRows: 5,maxRows: 10}" 
                                placeholder="请输入公告内容"></Input>
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span="12">
                        <FormItem label="是否发布:" prop="state">
                            <Checkbox v-model="formItem.state">发布</Checkbox>
                            <Tooltip content="勾选发布，不选发布时间，则为立即发布！" placement="right">
                                <Icon type="md-alert" size="15"/>
                            </Tooltip>
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span="12">
                         <FormItem label="发布时间:" prop="sendTime">
                            <DatePicker type="datetime" placeholder="选择时间" 
                                :options="dateOptions" 
                                v-model="formItem.sendTime" 
                                format="yyyy-MM-dd HH:mm" 
                                style="width: 216px;" :editable="false"></DatePicker>
                            </FormItem>
                        </FormItem>
                    </Col>
                </Row>
                <FormItem>
                    <Button type="primary" :loading="loading" @click="handleSubmit('formItem')">提交</Button>
                    <Button @click="handleCancel" style="margin-left: 8px">取消</Button>
                </FormItem>
            </Form>
        </div>
    </MasterPage>
</section>
</template>
<script src="./notice-add.js"></script>


