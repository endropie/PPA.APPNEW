<template>
  <q-page padding class="page-admin">
    <div>
      <div class="row q-col-gutter-sm">
        <div class="col-12 col-md-4">
          <incoming-validation />
        </div>
        <div class="col-12 col-md-4">
          <work-order-validation  />
        </div>
        <div class="col-12 col-md-4">
          <item-sample-validation />
        </div>
        <div class="col-12">
          <commentable style="min-height:200px" title="SYSTEM LOG" />
        </div>
        <div class="col-12">
          <item-histories  />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import MixPage from 'src/mixins/mix-page.vue'
import ItemHistories from 'pages/admin/common/items/dashboard-histories'
import ItemSampleValidation from 'pages/admin/common/items/dashboard-validation'
import IncomingValidation from 'pages/admin/deliveries/incoming-goods/dashboard-validation'
import WorkOrderValidation from 'pages/admin/factories/work-orders/dashboard-validation'

export default {
  mixins: [MixPage],
  components: {
    ItemHistories,
    ItemSampleValidation,
    IncomingValidation,
    WorkOrderValidation
  },
  data () {
    return {
    //  values..
    }
  },
  created () {
    // console.info('This dashboard component created!')
  },
  methods: {
    // Method...
  }
}
</script>

<style lang="stylus">

.page-admin
  img
    width 100px
    height 100px
    margin-bottom 15px
  .admin-top
    margin-bottom 35px
    .q-alert
      max-width 500px
  .card
    cursor pointer
    position relative
    padding 16px
    .q-icon
      font-size 56px
    p
      color rgba(0, 0, 0, .87)
      margin 15px 0 0 0 !important
    &:before
      content ''
      position absolute
      top 0
      right 0
      bottom 0
      left 0
      border-radius 2px
      opacity 0
      transition opacity .2s
      background currentColor
    &:hover:before
      opacity .4
</style>
