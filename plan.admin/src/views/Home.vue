<style lang="postcss" scoped>
.home-container {}
</style>

<template>
<section class="home-container">
  <MasterPage title="欢迎登陆">
    <div slot="title-icon">
      <Icon type="ios-home" />
    </div>
    <div slot="searchContent" class="search-content-slot">
      <Form :model="formItem" :label-width="80">
        <Row :gutter="20">
          <i-col :xs="12" :md="8" :lg="4" v-for="(infor, i) in inforCardData" :key="`infor-${i}`" style="height: 120px;padding-bottom: 10px;">
            <infor-card shadow :color="infor.color" :icon="infor.icon" :icon-size="36">
              1
              <p>{{ infor.title }}</p>
            </infor-card>
          </i-col>
        </Row>
      </Form>
    </div>
  </MasterPage>
</section>
</template>

<script>
import MasterPage from "@/components/master/master.vue";
import InforCard from '_c/info-card'
export default {
  components: {
    MasterPage,
    InforCard
  },
  data() {
    return {
      inforCardData: [
        // { title: '新增用户', icon: 'md-person-add', count: 803, color: '#2d8cf0' },
        // { title: '累计点击', icon: 'md-locate', count: 232, color: '#19be6b' },
        // { title: '新增问答', icon: 'md-help-circle', count: 142, color: '#ff9900' },
        // { title: '分享统计', icon: 'md-share', count: 657, color: '#ed3f14' },
        // { title: '新增互动', icon: 'md-chatbubbles', count: 12, color: '#E46CBB' },
        // { title: '新增页面', icon: 'md-map', count: 14, color: '#9A66E4' }
      ],
      formItem: {
        title: "",
        state: "",
        sendTime: ""
      },
    };
  },
  methods: {}
};
</script>


