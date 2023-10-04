<template>
  <q-page padding class="column justify-start items-center" >
    <div class="content" style="min-width:75%" v-if="VIEW.show">
      <page-print v-if="VIEW.show">
        <div slot="header" class="column no-wrap q-py-sm" v-if="rsView">
          <span v-if="rsView.customer" class="text-lg text-bold ">
            {{rsView.customer.name}} [{{rsView.customer.code}}]
          </span>
          <span v-if="rsView.date" class="cursor-pointer" @click="viewSetting.isPeriod = !viewSetting.isPeriod">
            <div v-if="viewSetting.isPeriod">{{$tc('label.period')}}: {{ $app.moment(rsView.date).format('MMM YYYY') }}</div>
            <div v-else>{{$tc('label.date')}}: {{ $app.moment(rsView.date).format('DD/MM/YYYY') }}</div>
          </span>
          <span v-if="rsView.customer && rsView.customer.invoice_mode !== 'JOIN' && viewSetting.isTotalOnly" class="text-lg text-bold ">
            <span v-if="viewSetting.separate === 'MATERIAL'">REKAP MATERIAL</span>
            <span v-if="viewSetting.separate === 'JASA'">REKAP JASA</span>
          </span>
        </div>
        <div class="content justify-around q-gutter-y-sm" >
          <div class="row justify justify-between q-gutter-sm" v-if="false">
            <div class="q-px-xs">
              <div class="q-pt-md text-h6" style="line-height:normal">
                  REKAP INVOICE
                  #{{rsView.fullnumber || rsView.number}}
              </div>
              <div class="text-uppercase row full-width">
                <span v-if="rsView.customer">[{{rsView.customer.code}}] {{rsView.customer.name}}</span>
              </div>
            </div>
            <div class="content-end self-end q-pt-lg">
              <div class="text-uppercase">
                <span v-if="rsView.invoiced_number">No. Invoice {{rsView.invoiced_number}}</span>
              </div>
              <div class="column items-start q-gutter-sm">
                <q-markup-table dense square bordered class="super-dense no-shadow " separator="cell">
                  <tbody v-if="rsView.request_order">
                    <tr><td>{{$tc('label.no', 1, {v:'SO'})}}</td><td>{{rsView.request_order.fullnumber || rsView.request_order.number}}</td></tr>
                    <tr><td>{{$tc('label.date')}}</td><td>{{ $app.date_format(rsView.request_order.date) }}</td></tr>
                    <tr><td>{{$tc('label.no', 1, {v:'PO'})}}</td><td>{{rsView.request_order.reference_number}}</td></tr>
                  </tbody>
                </q-markup-table>
              </div>
            </div>
          </div>
          <div class="column" id="invoice">
            <div class="row justify-start q-pb-sm print-hide">
              <q-select dense filled map-options emit-value
                label="MODE" stack-label
                v-model="viewDetail"
                :options="viewDetailOptions"
              >
                <div slot="after">
                  <q-input dense type="number"
                    style="width:75px" input-class="q-pr-sm" min="1"
                    v-model="viewDetailX"
                    v-if="!Boolean(['ViewDetail1'].find(v => v === viewDetail))"
                  >
                    <div slot="prepend" class="q-px-sm q-mb-xs text-subtitle2 self-end" >X:</div>
                    <q-tooltip>X (Jumlah) Kolom</q-tooltip>
                  </q-input>
                </div>
              </q-select>
              <q-space />
              <q-btn-dropdown
                unelevated color="grey-3" text-color="dark"
                label="Konfigurasi"
              >
                <div class="column q-px-sm q-my-sm" style="min-width:200px">
                  <q-list bordered >
                    <!-- SORTING -->
                    <q-select dense square borderless
                      class="q-px-md"
                      label="URUTAN KOLOM"
                      v-model="viewSetting.sortBy"
                      :options="viewSetting.sortOptions"
                      emit-value map-options
                    />
                    <q-separator  />
                    <!-- SHOW/HIDE -->
                    <q-item label style="min-height: auto;">TAMPILKAN KOLOM</q-item>
                    <q-item clickable>
                      <q-item-section>
                        <q-toggle dense v-model="viewSetting.shows.reference_number" label="REFERENCE" class="q-pl-none" />
                      </q-item-section>
                    </q-item>
                    <q-item clickable>
                      <q-item-section>
                        <q-toggle dense v-model="viewSetting.shows.confirmed_number" label="LPB" class="q-pl-none" />
                      </q-item-section>
                    </q-item>
                    <q-item clickable>
                      <q-item-section>
                        <q-toggle dense v-model="viewSetting.isTotalOnly" label="TOTAL ONLY" class="q-pl-none" />
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-if="viewSetting.isTotalOnly && (rsView && rsView.customer.invoice_mode !== 'JOIN')">
                      <q-item-section>
                        <q-select v-model="viewSetting.separate" :options="['MATERIAL', 'JASA']" clearable filled dense label="Separate" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </q-btn-dropdown>
            </div>
            <view-detail-1 :rsView="rsView" :setting="viewSetting" v-if="viewDetail === 'ViewDetail1'" />
            <view-detail-2 :rsView="rsView" :setting="viewSetting" :colx="Number(viewDetailX)" v-if="viewDetail === 'ViewDetail2'" />
            <view-detail-3 :rsView="rsView" :setting="viewSetting" :colx="Number(viewDetailX)" v-if="viewDetail === 'ViewDetail3'" />
          </div>
        </div>
        <div class="row q-gutter-xs print-hide " style="padding-top:50px">
          <q-btn :label="$tc('form.back')" icon="cancel" color="dark" :class="{'full-width': $q.screen.lt.sm}" v-go-back.single />
          <q-btn :label="$tc('form.edit')" icon="edit" color="positive" :class="{'full-width': $q.screen.lt.sm}" @click="$router.push(`${VIEW.resource.uri}/${ROUTE.params.id}/edit`)"  v-if="IS_EDITABLE" />
          <q-btn :label="$tc('form.print')" icon="print" color="grey" :class="{'full-width': $q.screen.lt.sm}" @click.native="print()" />
          <q-space />
          <ux-btn-dropdown  color="blue-grey" :class="{'full-width': $q.screen.lt.sm}"
            :options="[
            { label: $tc('form.add_new'), color:'green', icon: 'add',
                hidden: !$app.can('acc-invoices-create'),
                detail: $tc('messages.process_create'),
                actions: () => {
                  $router.push(`${VIEW.resource.uri}/create`)
                }
              },
              { label: 'STOCKCARD', color:'blue', icon: 'widgets',
                hidden: !$app.can('acc-invoices-update'),
                actions: () => {
                  $router.push(`${VIEW.resource.uri}/${ROUTE.params.id}/stockcards`)
                }
              },
              { label: 'CONFIRM', color:'positive', icon: 'done_all',
                hidden: !IS_CONFIRM || !$app.can('acc-invoices-confirm'),
                detail: $tc('form.confirm'),
                actions: () => {
                  setConfirmed()
                }
              },
              { label: 'RE-OPEN', color:'blue', icon: 'refresh',
                hidden: !IS_REOPEN || !$app.can('acc-invoices-confirm'),
                detail: $tc('form.reopen'),
                actions: () => {
                  setReopen()
                }
              },
              { label: 'SYNCRONIZE', color:'blue', icon: 'sync_alt',
                hidden: !IS_REOPEN || !$app.can('acc-invoices-update'),
                detail: $tc('form.sync', 1, {v: 'Invoices'}),
                actions: () => {
                  setSync()
                }
              },
              { label: 'DELETE', color:'red', icon: 'delete',
                hidden: !IS_EDITABLE || !$app.can('acc-invoices-delete'),
                detail: $tc('messages.process_delete'),
                actions: () => {
                  VIEW.delete()
                }
              }
            ]">
          </ux-btn-dropdown>
        </div>
      </page-print>
      <q-inner-loading :showing="VIEW.loading">
        <q-spinner size="50px" color="primary" />
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script>

import MixView from 'src/mixins/mix-view.vue'
import PagePrint from 'components/page-print'
import ViewDetail1 from './view-detail-1'
import ViewDetail2 from './view-detail-2'
import ViewDetail3 from './view-detail-3'

export default {
  mixins: [MixView],
  components: { PagePrint, ViewDetail1, ViewDetail2, ViewDetail3 },
  data () {
    return {
      viewSetting: {
        isPeriod: true,
        isTotalOnly: false,
        separate: null,
        shows: {
          reference_number: true,
          confirmed_number: true
        },
        sortBy: 'date',
        sortOptions: [
          { value: 'date', label: 'Date' },
          { value: 'confirmed_number', label: 'LPB' }
        ]
      },
      viewDetail: 'ViewDetail1',
      viewDetailX: null,
      viewDetailOptions: [
        { value: 'ViewDetail1', label: 'Standart' },
        { value: 'ViewDetail2', label: 'X:Part Y:Delivery' },
        { value: 'ViewDetail3', label: 'X:Delivery Y:Part' }
      ],
      VIEW: {
        data: {},
        resource: {
          params: '?--with=customer;acc_invoice_items.delivery_order;acc_invoice_items.item;acc_invoice_items.unit',
          api: '/api/v1/incomes/invoices',
          uri: '/admin/incomes/invoices'
        }
      },
      rsView: {},
      show_delivery: false
    }
  },
  created () {
    this.init()
  },
  watch: {
    '$route': 'init'
  },
  computed: {
    IS_REOPEN () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.status !== 'INVOICED') return false
      return true
    },
    IS_CONFIRM () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.status !== 'OPEN') return false
      return true
    },
    IS_EDITABLE () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.status !== 'OPEN') return false
      return true
    },
    SUM_ITEMS () {
      let data = []
      this.rsView.request_order_items.map((detail) => {
        const index = data.findIndex(x => {
          return x.item_id === detail.item_id
        })
        if (index > -1) {
          data[index].unit_amount += detail.unit_amount
          data[index].amount_delivery += detail.amount_delivery
          data[index].quantity += detail.quantity
        } else {
          data.push(JSON.parse(JSON.stringify(detail)))
        }
      })
      return data
    }
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
    setConfirmed () {
      const submit = () => {
        this.$q.loading.show()
        let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}/confirmed`

        this.$axios.post(url)
          .then((response) => {
            let msg = response.data.message[0] || ''
            if (response.data.success) this.$app.notify.success('[ACCURATE]', msg)
            else this.$app.notify.warning('[ACCURATE]', msg)

            this.init()
          })
          .catch(error => {
            this.$app.response.error(error.response || error)
          })
          .finally(() => {
            this.$q.loading.hide()
          })
      }

      submit()
    },
    setReopen () {
      const submit = () => {
        this.$q.loading.show()
        let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}/reopened`
        if (process.env.DEV) console.info('[PLAY]', 'VIEW LOAD', url)
        this.$axios.post(url)
          .then((response) => {
            let msg = response.data.message[0] || ''
            if (response.data.success) this.$app.notify.success('[ACCURATE]', msg)
            else this.$app.notify.warning('[REOPEN]', msg)

            this.init()
          })
          .catch(error => {
            this.$app.response.error(error.response || error)
          })
          .finally(() => {
            this.$q.loading.hide()
          })
      }

      submit()
    },
    setSync () {
      const submit = () => {
        this.$q.loading.show()
        let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}/syncronized`

        this.$axios.post(url)
          .then((response) => {
            let msg = response.data.message[0] || ''
            if (response.data.success) this.$app.notify.success('[ACCURATE-SYNC]', msg)
            else this.$app.notify.warning('[ACCURATE-REOPEN]', msg)

            this.init()
          })
          .catch(error => {
            this.$app.response.error(error.response || error)
          })
          .finally(() => {
            this.$q.loading.hide()
          })
      }

      submit()
    }
  }
}
</script>

<style lang="sass">
@media print
  #invoice
    .q-table thead tr,
    .q-table tbody tr,
    .q-table tbody td
      height: auto

    .q-table thead td,
    .q-table thead th
      padding: 2px 4px
      font-size: 9pt
      line-height: normal

    .q-table tbody td
      padding: 2px 4px
      font-size: 9pt
      height: auto

</style>
