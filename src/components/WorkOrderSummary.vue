<template>
  <div>
    <div class="column q-gutter-xs q-py-xs" style="min-width:205px" v-if="row && row.summary_production > 0 && loading === false">
      <div class="row no-wrap items-center text-left">
        <q-chip dense square color="lime-8" text-color="white" class="q-my-none" style="width:50px">WIP</q-chip>
        <q-linear-progress size="22px"  color="blue-grey" :value="Boolean(row.summary_items) ? (row.summary_production/row.summary_items) : 0">
          <div class="absolute-full flex flex-center">
            <q-badge :color="Boolean(row.has_producted) ? 'red' : 'blue-grey-10'" text-color="white" class="text-weight-medium q-pt-xs">
              <span>{{$app.number_abbreviate(row.summary_production || 0)}} </span>
              <span>&nbsp;/&nbsp;{{$app.number_abbreviate(row.summary_items || 0)}}</span>
            </q-badge>
          </div>
        </q-linear-progress>
      </div>
      <div class="row no-wrap items-center text-left" v-show="!row.main_id">
        <q-chip dense square color="lime-8" text-color="white" class="q-my-none" style="width:50px">PAK</q-chip>
        <q-linear-progress size="22px"  color="blue-grey" :value="Boolean(row.summary_production) ? (row.summary_packing/row.summary_production) : 0">
          <div class="absolute-full flex flex-center">
            <q-badge :color="Boolean(row.has_packed) ? 'red' : 'blue-grey-10'" text-color="white" class="text-weight-medium q-pt-xs">
              <span>{{$app.number_abbreviate(row.summary_packing || 0)}} </span>
              <span>&nbsp;/&nbsp;{{$app.number_abbreviate(row.summary_production || 0)}}</span>
            </q-badge>
          </div>
        </q-linear-progress>
      </div>
    </div>
    <q-inner-loading :showing="loading" class="bg-transparent">
      <q-spinner-dots size="20px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>

export default {
  name: 'WorkOrderSummary',
  props: {
    record: Object
  },
  data () {
    return {
      loading: false,
      row: null
    }
  },
  mounted () {
    this.loading = true
    this.$axios.get(`/api/v1/factories/work-orders/${String(this.record.id)}?mode=summary`)
      .then((response) => {
        this.row = response.data
      }).catch((error) => {
        console.error(error.response || error)
      })
      .finally(() => {
        setTimeout(() => {
          this.loading = false
        }, 2000)
      })
  }
}
</script>
