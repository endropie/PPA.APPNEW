<template>
  <q-page padding class="items-center justify-start column" >
    <div class="content" style="min-width:75%" v-if="rsView">
      <page-print v-if="VIEW.show">
        <div slot="header-tags" class="print-hide">
          <!-- <ux-chip-status :row="rsView" tag outline small square icon='bookmark' /> -->
        </div>
        <div class="justify-around content q-gutter-y-sm" >
          <div class="justify-between row justify q-gutter-sm">
            <div class="q-px-xs">
              <div class="q-pt-md text-h6" style="line-height:normal">
                  <span class="text-uppercase">{{$tc('general.delivery_handovers')}}</span><br/>
                  #{{rsView.fullnumber || rsView.number}}
              </div>
              <div class="text-uppercase row full-width">
                <span v-if="rsView.customer">[{{rsView.customer.code}}] {{rsView.customer.name}}</span>
              </div>
            </div>
            <div class="content-end self-end q-pt-lg">
              <div class="text-uppercase">

              </div>
            </div>
          </div>
          <div class="column">
            <q-markup-table dense bordered square separator="cell" class="table-print no-shadow no-highlight th-uppercase">
              <thead>
                <tr>
                  <th class="text-left" style="width:50px">No</th>
                  <th class="text-center">{{$tc('label.date')}}</th>
                  <th class="text-center" width="35%">{{$tc('general.sj_delivery')}}</th>
                  <th class="text-center" width="35%">LPB</th>
                  <th class="">Confirmed</th>
                </tr>
              </thead>
              <!-- <tbody v-for="(repeat) in 30" :key="repeat"> -->
              <tbody>
                <tr v-for="(delivery_order,index) in rsView.delivery_orders" :key="index" :delivery-order-id="delivery_order.id">
                  <td class="text-left">{{ index+1}}</td>
                  <td class="text-center">{{delivery_order.date}}</td>
                  <td class="text-left">{{delivery_order.fullnumber || delivery_order.number}}</td>
                  <td class="text-left">{{delivery_order.confirmed_number}}</td>
                  <td class="q-py-none">
                    <div v-if="delivery_order.confirmed_at" class="text-center column" style="line-height:normal">
                      <span v-if="delivery_order.confirmed_user">{{delivery_order.confirmed_user.name}}</span>
                      <q-tooltip>
                        <span class="text-small">{{$app.moment(delivery_order.confirmed_at).format('DD/MM/YYYY HH:mm')}}</span>
                      </q-tooltip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
            <div v-if="rsView.description" class="">
              <div>{{$tc('label.description')}}</div>
              <div style="white-space:pre">{{rsView.description}}</div>
            </div>
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
                hidden: !$app.can('delivery-handovers-create'),
                detail: $tc('messages.process_create'),
                actions: () => {
                  $router.push(`${VIEW.resource.uri}/create`)
                }
              },
              { label: 'VOID', color:'red', icon: 'block',
                hidden: !IS_EDITABLE || !$app.can('delivery-handover-void'),
                detail: $tc('messages.process_void'),
                actions: () => {
                  VIEW.void()
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

export default {
  mixins: [MixView],
  components: { PagePrint },
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
          params: '?--with=customer',
          api: '/api/v1/incomes/delivery-handovers',
          uri: '/admin/deliveries/delivery-handovers'
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
