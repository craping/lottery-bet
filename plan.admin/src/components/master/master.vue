<style lang="postcss" scoped>
@import './master.pcss';
</style>

<template>
<section class="master-page-container">
    <div class="master-page-wrap">
        <div class="title-header" v-if="title">
            <div class="title-content">
                <div class="title-icon">
                    <slot name="title-icon"></slot>
                </div>
                <p class="title">{{title}}</p>
            </div>
            <div class="title-toolbar">
                <slot name="title-toolbar"></slot>
            </div>
        </div>
        <div class="master-page-search-content" v-if="$slots.searchContent">
            <slot name="searchContent"></slot>
        </div>
        <div class="master-page-content-toolbar" v-if="$slots.search || $slots.btns">
            <div class="bar-search">
                <slot name="search"></slot>
            </div>
            <div class="bar-group">
                <slot name="btns"></slot>
            </div>
        </div>
        <!--$slots.content表示$slots里面是否存在content内容，就是说这里的占位符可填充了内容-->
        <div class="master-page-padding-content" v-if="$slots.paddingContent">
            <slot name="paddingContent"></slot>
        </div>
        <div class="master-page-nopadding-content" v-if="$slots.content">
            <slot name="content"></slot>
        </div>
        <div class="page-wrapper">
            <slot name="pager" />
        </div>
    </div>
</section>
</template>

<script>
export default {
    data() {
        return {

        }
    },
    props: {
        title: {
            type: String
        }
    },
    mounted() {
        //console.log('paddingContent=', this.$slots)
    },
    methods: {

    }
}
</script>
