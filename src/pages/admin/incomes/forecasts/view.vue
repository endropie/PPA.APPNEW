<template>
  <q-page padding class="row justify-center" >
    <page-print v-if="VIEW.show" class="q-pa-md q-pr-lg shadow-2">
      <div slot="header-tags" class="print-hide">
        <ux-chip-status :row="rsView" tag outline small square icon='bookmark'/>
      </div>
      <div class="row justify-between q-gutter-y-sm" >
        <div class="col q-pl-lg q-py-lg">
          <div class="text-subtitle2">
            <div class="">FORECAST ORDER</div>
            <div class="text-sm">{{ rsView.customer.name }} ({{ rsView.customer.code }})</div>
          </div>
        </div>
        <div class="text-center">
          <table class="q-table table table-bordered" style="width:300px">
            <tr class="bg-grey-3 text-uppercase">
              <th>{{ $tc('label.number') }}</th>
              <th>{{ $tc('label.period') }}</th>
            </tr>
            <tr>
              <td> {{ rsView.number }} </td>
              <td>{{ rsView.period ? $app.moment(rsView.period.period).format('MMMM YYYY') : '-' }}</td>
            </tr>
          </table>
        </div>
        <div class="col-12">
          <q-markup-table dense flat bordered separator="cell" class="no-highlight">
            <thead>
              <tr class="text-uppercase" style="line-height:1.5rem">
                <th name="code" class="text-left"> code </th>
                <th name="part_name" class="text-left"> partname </th>
                <th name="part_subname" class="text-left"> subname </th>
                <th name="quantity" class="text-right"> quantity </th>
                <th name="unit_id" class="text-left"> unit </th>
                <th name="price" v-if="!ISHIDE_AMOUNT" class="text-right"> price </th>
                <th name="total" v-if="!ISHIDE_AMOUNT" class="text-right"> total </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowKey) in rsView.forecast_items" :key="rowKey" style="line-height:1.5rem">
                <td class="text-left">{{ row.item.code }}</td>
                <td class="text-left">{{ row.item.part_name }}</td>
                <td class="text-left">{{ row.item.part_subname }}</td>
                <td class="text-right">{{ row.quantity }}</td>
                <td class="text-left">{{ row.unit.code }}</td>
                <td class="text-right" v-if="!ISHIDE_AMOUNT">{{ $app.number_format(row.price) }}</td>
                <td class="text-right" v-if="!ISHIDE_AMOUNT">{{ $app.number_format(row.quantity * row.price) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
        <div class="col-12">
            <div class="q-my-xs text-italic">{{$tc('label.description')}}:</div>
            <div class="q-my-xs text-weight-light" style="min-height:30px">{{ rsView.description }}</div>
        </div>
        <div class="col-12 q-gutter-xs print-hide " style="padding-top:50px">
          <q-btn :label="$tc('form.back')" :icon-right="btnIcon('cancel')"  color="dark" :to="`${VIEW.resource.uri}?return`" />
          <q-btn :label="$tc('form.edit')" :icon-right="btnIcon('edit')" color="positive" v-if="IS_EDITABLE" :to="`${VIEW.resource.uri}/${ROUTE.params.id}/edit`"  />
          <q-btn :label="$tc('form.print')" :icon-right="btnIcon('print')" color="grey" @click.native="print()" />
          <q-btn :label="$tc('form.delete')" :icon-right="btnIcon('delete')" color="negative" v-if="IS_EDITABLE" @click="VIEW.delete" outline
            :class="{'float-right':$q.screen.gt.md}" />
        </div>
      </div>
    </page-print>
  </q-page>
</template>

<script>

import MixView from 'src/mixins/mix-view.vue'
import PagePrint from 'components/page-print'

export default {
  mixins: [MixView],
  components: { PagePrint },
  data () {
    return {
      VIEW: {
        data: {},
        resource: {
          api: '/api/v1/incomes/forecasts',
          uri: '/admin/incomes/forecasts'
        }
      },
      rsView: {},
      count: 0
    }
  },
  created () {
    this.init()
  },
  watch: {
    '$route': 'init'
  },
  computed: {
    ISHIDE_AMOUNT () {
      return !this.$app.can('forecasts-amount');
    },
    IS_EDITABLE () {
      if (this.rsView.revise_id) return false
      if (this.rsView.hasOwnProperty('has_relationship') && Object.keys(this.rsView.has_relationship).length > 0) return false

      return true
    }
  },
  methods: {
    init () {
      this.VIEW.load((data) => {
        this.setView(data || {})
      })
    },
    btnIcon (str) {
      return !this.$q.screen.lt.sm ? str : ''
    },
    print () {
      window.print()
    },
    getBaseUnit (detail) {
      if (detail.unit_rate === 1) return ''
      return `(${detail.unit_amount} ${detail.item.unit.code})`
    },
    setView (data) {
      this.rsView = data
    }
  }
}
</script>
