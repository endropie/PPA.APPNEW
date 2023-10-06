<template>
  <q-page padding class="column justify-start items-center" >
    <page-print v-if="VIEW.show">
      <div slot="header-tags" class="print-hide">
        <!-- header-tags -->
        <ux-chip-status :row="rsView" tag outline small square icon='bookmark' :color-options="{INVOICED:'green'}" />
      </div>
      <div class="row justify-around q-col-gutter-sm" >
        <div class="col-12">
          <div class="row justify justify-between q-gutter-sm" >
            <div class="sel q-pt-lg q-px-xs">
              <div class="text-h6 ">STOCKCARD INVOICE #{{rsView.fullnumber || rsView.number}}</div>
              <div class="text-uppercase row full-width">
                <span v-if="rsView.customer">[{{rsView.customer.code}}] {{rsView.customer.name}}</span>
              </div>
            </div>
            <div class="content-end self-end q-pt-lg">
              <div class="text-uppercase">
                <span v-if="rsView.invoiced_number">No. Invoice {{rsView.invoiced_number}}</span>
              </div>
            </div>
            <div class="column items-start q-gutter-sm">
              <q-markup-table dense square bordered class="super-dense no-shadow " separator="cell" >
                <tbody v-if="rsView.request_order">
                  <tr><td>{{$tc('label.no', 1, {v:'SO'})}}</td><td>{{rsView.request_order.fullnumber || rsView.request_order.number}}</td></tr>
                  <tr><td>{{$tc('label.date')}}</td><td>{{ $app.date_format(rsView.request_order.date) }}</td></tr>
                  <tr><td>{{$tc('label.no', 1, {v:'PO'})}}</td><td>{{rsView.request_order.reference_number}}</td></tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
        </div>
        <div v-if="FILTER.item" class="print-only col-12 row ">
          <div>
            {{ $tc('items.part_name') }}: {{FILTER.item.part_name}}
          </div>
          <q-space />
          <div>
            {{ $app.setting('item.subname_label') }}: {{ FILTER.item.part_subname }}
          </div>
        </div>
        <div class="col-12 col-sm-4 print-hide">
          <ux-select
            name="item_id"
            :label="$tc('general.request_order')"
            v-model="FILTER.request_order" clearable
            filter
            :source="`/api/v1/incomes/request-orders?mode=all&delivery_invoice_id=${ROUTE.params.id}&--limit=20`"
            :source-keys="['number', 'description']"
            option-value="id"
            option-label="fullnumber"
            @input="FILTER.item = null, stockcard = null"
          />
        </div>
        <div class="col-12 col-sm-4 print-hide">
          <ux-select
            name="item_id"
            :label="$tc('items.part_name')"
            v-model="FILTER.item" clearable
            filter
            :source="`/api/v1/common/items?mode=all&request_order_id=${FILTER.request_order ? FILTER.request_order.id : ''}&invoice_id=${ROUTE.params.id}&--limit=20`"
            :source-keys="['part_name', 'part_number']"
            option-value="id"
            :option-label="(item) => item.part_name || rsForm.item.part_name"
            :option-sublabel="(item) => `[${item.customer_code}] ${item.part_subname || '--'}`"
            :option-disable="(item) => !item.enable"
            @input="fetchItem"
          />
        </div>
        <div class="col-12 col-sm-4 print-hide">
          <q-input readonly
            :value="FILTER.item ? FILTER.item.part_subname : null"
            :label="$app.setting('item.subname_label')"
          />
        </div>
        <div class="col-12">
          <q-markup-table dense bordered square separator="cell" class="table-print no-shadow no-highlight"  >
            <thead>
            <q-tr style="line-height:25px" class="text-uppercase">
              <q-th width="10%">{{ $tc('label.date') }}</q-th>
              <q-th width="20%">{{ $tc('label.number') }}</q-th>
              <q-th width="20%">No. index</q-th>
              <q-th width="15%">{{ $tc('label.incoming') }}</q-th>
              <q-th width="15%">{{ $tc('label.outgoing') }}</q-th>
              <q-th width="15%">{{ $tc('label.saldo') }}</q-th>
            </q-tr>
            </thead>
            <tbody v-if="stockcard">
              <q-tr v-for="(row, index) in stockcard.data || []" :key="index">
                <q-td>{{ $app.date_format(row.date) }}</q-td>
                <q-td>{{ row.number }}</q-td>
                <q-td>{{ row.indexed_number }}</q-td>
                <q-td class="text-right">{{ $app.number_format(row.quantity_in, 0) }}</q-td>
                <q-td class="text-right">{{ $app.number_format(row.quantity_out, 0) }}</q-td>
                <q-td class="text-right">{{ $app.number_format(getRowTotal(index), 0) }}</q-td>
              </q-tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
      <div class="row q-gutter-xs print-hide " style="padding-top:50px">
        <q-btn :label="$tc('form.back')" icon="cancel" color="dark" :class="{'full-width': $q.screen.lt.sm}" v-go-back.single />
        <q-btn :label="$tc('form.print')" icon="print" color="grey" :class="{'full-width': $q.screen.lt.sm}" @click.native="VIEW.print()" />
      </div>
    </page-print>
    <q-inner-loading :showing="VIEW.loading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>
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
      bottomTab: null,
      FILTER: {
        request_order: null,
        item_id: null
      },
      VIEW: {
        data: {},
        resource: {
          api: '/api/v1/incomes/invoices',
          uri: '/admin/incomes/invoices'
        }
      },
      rsView: {},
      stockcard: []
    }
  },
  created () {
    this.init()
  },
  watch: {
    '$route': 'init'
  },
  methods: {
    init () {
      this.VIEW.load((data) => {
        this.setView(data || {})
      })
    },
    showDO (id) {
      let params = {
        path: '/admin/deliveries/delivery-orders/view',
        params: { id: id },
        meta: { mode: 'view' },
        actions: {
          // actions
        }
      }

      this.$refs.modal.show(params)
    },
    setView (data) {
      this.rsView = data
    },
    getRowTotal (index) {
      if (!this.stockcard) return null
      if (!this.stockcard.data.length) return null

      return this.stockcard.data.reduce((sum, row, i) => {
        const a = (i <= index) ? row.quantity_in - row.quantity_out : 0
        return sum + a
      }, 0)
    },
    fetchItem (item = null) {
      if (item === null) {
        this.stockcard = null
        return false
      }
      let url = `/api/v1/common/items/invoice-cards?item_id=${item.id}&request_order_id=${this.FILTER.request_order ? this.FILTER.request_order.id : ''}&invoice_id=${this.ROUTE.params.id}`
      this.$q.loading.show()
      this.$axios.get(url)
        .then((response) => {
          this.stockcard = response.data
        })
        .catch(error => {
          this.$app.response.error(error.response || error)
        })
        .finally(() => {
          this.$q.loading.hide()
        })
    }
  }
}
</script>
