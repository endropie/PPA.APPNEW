
<template id="main">
  <q-list class="menu">
    <template v-for="(node, index) in AdminMenus">
      <admin-menu-item :node="node" :isIndent="false" :prefix="`/admin/${node.path}`" :key="index" />
    </template>
  </q-list>
</template>

<script>
import MixPage from 'src/mixins/mix-page.vue'
import AdminMenus from 'assets/data-menu'
import AdminMenuItem from './AdminMenuItem'
export default {
  mixins: [MixPage],
  components: {
    'admin-menu-item': AdminMenuItem
  },
  data () {
    return {
      AdminMenus
    }
  }
}
</script>
<style lang="stylus">

.menu
  .q-expansion-item
    .q-expansion-item__content .q-item
      min-height 42px

  .q-item__section--avatar
    min-width: 38px;

  .q-expansion-item--expanded > div > .q-item > .q-item__section--main
    // color $primary
    // font-weight 700

  .q-expansion-item__content
    // padding 2px 0

    .q-item
      // min-height unset
      // border-radius 0 10px 10px 0
      // margin-right 12px
      // margin-top 1px
      // margin-bottom 1px

  .q-item.q-router-link--active
    // background lighten($primary, 90%)

</style>
