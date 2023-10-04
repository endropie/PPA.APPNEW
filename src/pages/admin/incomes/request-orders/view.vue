<template>
  <q-page padding class="column justify-start items-center" >
    <page-print v-if="VIEW.show">
      <div slot="header-tags" class="print-hide">
        <ux-chip-status :row="rsView" tag outline small square icon='bookmark' />
        <span v-if="!rsView.deleted_at && Number(rsView.total_unit_delivery) > 0 && ['OPEN','CLOSED'].some(x => x === rsView.status)">
            <q-chip square outline icon="local_shipping"
              label="DELIVERED"
              color="orange-10"
              v-if="Math.round(rsView.total_unit_amount) === Math.round(rsView.total_unit_delivery)" >
            </q-chip>
            <q-chip square outline icon="local_shipping"
              label="SEMI-DELIVERY"
              color="orange"
              v-else>
              <q-tooltip>
                TOTAL:{{Math.round(rsView.total_unit_amount) }}
                DELIVERED:{{ Math.round(rsView.total_unit_delivery)}}
              </q-tooltip>
            </q-chip>
        </span>
      </div>
      <div class="row justify-around q-col-gutter-y-sm" >
        <div class="col-12">
          <div class="row justify-between q-gutter-sm" >
            <div class="items-end q-pt-lg">
              <div class="text-h6 q-px-xs">SALES ORDER</div>
              <q-markup-table class="super-dense no-shadow" separator="none" :dark="LAYOUT.isDark">
                <tbody>
                  <tr>
                    <td class="text-uppercase">{{$tc('general.customer')}}</td>
                    <td>{{ rsView.customer.name }}</td>
                  </tr>
                  <tr>
                    <td class="text-uppercase">{{$tc('label.transaction')}}</td>
                    <td class="text-weight-bold">{{ rsView.transaction || '-'}}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
            <div class="column items-start q-gutter-sm">
              <q-markup-table dense square bordered class="super-dense no-shadow " separator="cell" :dark="LAYOUT.isDark">
                <tbody>
                  <tr><td>{{$tc('label.number')}}</td><td>{{rsView.fullnumber || rsView.number}}</td></tr>
                  <tr><td>{{$tc('label.date')}}</td><td>{{ $app.date_format(rsView.date) }}</td></tr>
                  <tr><td>{{$tc('label.no', 1, {v:'PO'})}}</td><td>{{rsView.reference_number}}</td></tr>
                </tbody>
              </q-markup-table>
              <q-checkbox  dense left-label v-model="show_summary" label="SUMMARY ACCUMULATE" class="print-hide" v-if="rsView.order_mode == 'ACCUMULATE'" />
            </div>
          </div>
        </div>
        <div class="col-12">
          <q-markup-table dense bordered square separator="cell" class="table-print no-shadow no-highlight"  :dark="LAYOUT.isDark">
            <thead>
            <q-tr style="line-height:25px">
              <q-th width="10px">{{ $tc('label.no') }}</q-th>
              <q-th v-if="IS_LOCKROWS"><q-icon name="lock" size="xs" color="grey" /></q-th>
              <q-th width="30%" v-if="IS_LOTS && !IS_ITEM_SUMMARY">LOTS</q-th>
              <q-th width="30%">{{ $tc('label.name', 1, {v: $tc('label.part')}) }}</q-th>
              <q-th width="30%">{{ $app.setting('item.subname_label') }}</q-th>
              <q-th width="10%">{{ $tc('label.unit') }}</q-th>
              <q-th width="10%">{{ $tc('label.quantity') }}</q-th>
              <q-th width="10%">{{ $tc('label.send') }}</q-th>
              <q-th width="10%">{{ $tc('label.balance') }}</q-th>
            </q-tr>
            </thead>
            <template v-if="IS_ITEM_SUMMARY">
            <tbody>
              <q-tr v-for="(row, index) in SUM_ITEMS" :key="index"  :request-order-item-id="row.id">
                <q-td>{{index+1}}</q-td>
                <q-td>{{row.item.part_name}}</q-td>
                <q-td>{{row.item.part_subname}}</q-td>
                <q-td class="text-center">{{row.item.unit.code}}</q-td>
                <q-td class="text-right">
                  {{$app.number_format(row.unit_amount, $app.get(row, 'item.unit.decimal_in'))}}
                </q-td>
                <q-td class="text-right">
                  <span v-if="rsView.transaction === 'REGULER' && rsView.customer.order_mode === 'ACCUMULATE'">
                    {{$app.number_format(row.unit_amount, $app.get(row, 'item.unit.decimal_in'))}}
                  </span>
                  <span v-else>
                    {{$app.number_format(row.amount_delivery, $app.get(row, 'item.unit.decimal_in'))}}
                  </span>
                </q-td>
                <q-td class="text-right">
                  <div v-if="Math.round(row.unit_amount - row.amount_delivery) > 0">
                    {{$app.number_format((row.unit_amount - row.amount_delivery), $app.get(row, 'item.unit.decimal_in'))}}
                  </div>
                  <div v-else class="text-center">
                    -
                  </div>
                </q-td>
              </q-tr>
            </tbody>
            </template>
            <template  v-else>
              <tbody v-for="(row, index) in rsView.request_order_items" :key="index">
                <q-tr :request-order-item-id="row.id">
                  <q-td>{{index+1}}</q-td>
                  <td v-if="IS_LOCKROWS">
                    <q-btn flat dense size="sm" color="blue-grey" icon="lock_open" @click="setLockDetail(row.id)" v-if="!row.is_autoload" >
                      <q-tooltip>Click to Lock</q-tooltip>
                    </q-btn>
                    <q-btn flat dense size="sm" color="blue-grey-10" icon="lock" @click="setLockDetail(row.id, true)" v-else >
                      <q-tooltip>Click to Open</q-tooltip>
                    </q-btn>
                  </td>
                  <td v-if="IS_LOTS">
                    <span v-if="row.lots">
                      {{ row.lots }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <q-td>{{row.item.part_name}}</q-td>
                  <q-td>{{row.item.part_subname}}</q-td>
                  <q-td class="text-center">{{row.unit.code}} </q-td>
                  <q-td class="text-right">{{$app.number_format(row.quantity, row.unit.decimal_in)}}</q-td>
                  <q-td class="text-right">
                    <span v-if="rsView.transaction === 'REGULER' && rsView.customer.order_mode === 'ACCUMULATE'">
                      {{ $app.number_format(row.quantity, row.unit.decimal_in) }}
                    </span>
                    <span v-else>
                      {{ $app.number_format(row.amount_delivery / (row.unit_rate||1), row.unit.decimal_in) }}
                    </span>
                  </q-td>
                  <q-td class="text-right">
                    <div v-if="Math.round(row.quantity - row.amount_delivery/(row.unit_rate||1)) > 0">
                      {{$app.number_format((row.quantity - row.amount_delivery/(row.unit_rate||1)), row.unit.decimal_in)}}
                    </div>
                    <div v-else class="text-center">
                      -
                    </div>
                  </q-td>
                </q-tr>
              </tbody>
            </template>
          </q-markup-table>
        </div>
        <div class="col-12 text-weight-light text-italic" v-if="rsView.begin_date || rsView.until_date">
            From date {{ rsView.begin_date ? $app.moment(rsView.begin_date).format('DD/MM/YYYY') : '' }}
            until then {{ rsView.until_date ? $app.moment(rsView.until_date).format('DD/MM/YYYY') : '' }}
        </div>
        <div class="col-12">
            <div class="q-my-xs text-italic">{{$tc('label.description')}}:</div>
            <div class="q-my-xs text-weight-light" style="min-height:30px;white-space:pre-line">{{ rsView.description }}</div>
        </div>
        <div class="col-12" v-if="false">
          <q-btn dense flat color="secondary" class="print-hide float-right"
            :label="$tc('form.show',1, {v:$tc('general.sj_delivery')})"
            v-show="!show_delivery" @click="show_delivery = true"/>
          <q-list v-show="show_delivery" bordered :dark="LAYOUT.isDark" class="main-box">
            <q-item>
              <q-item-section>{{$tc('general.sj_delivery', 2)}} ({{rsView.delivery_orders.length}})</q-item-section>
              <q-item-section side>
                <q-btn flat dense icon="clear" @click="show_delivery = !show_delivery"/>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-ripple @click="showDO(link.id)" :dark="LAYOUT.isDark"
              v-for="(link, index) in rsView.delivery_orders" :key="index">
              <q-item-section>
                {{link.fullnumber || link.number}}
              </q-item-section>
              <q-item-section side>
                <ux-chip-status dense square :row="link" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
      <div class="row q-gutter-xs print-hide " style="padding-top:50px">
        <q-btn :label="$tc('form.back')" icon="cancel" color="dark" :class="{'full-width': $q.screen.lt.sm}" :to="`${VIEW.resource.uri}?return`" />
        <q-btn :label="$tc('form.edit')" icon="edit" color="positive" :class="{'full-width': $q.screen.lt.sm}" v-if="IS_EDITABLE" :to="`${VIEW.resource.uri}/${ROUTE.params.id}/edit`"  />
        <q-btn :label="$tc('label.reference')" icon="edit" color="positive" :class="{'full-width': $q.screen.lt.sm}" v-if="IS_REFERENCE" :to="`${VIEW.resource.uri}/${ROUTE.params.id}/edit-reference`"  />
        <q-btn :label="$tc('form.print')" icon="print" color="grey" :class="{'full-width': $q.screen.lt.sm}" @click.native="print()" />
        <q-space />
        <ux-btn-dropdown  color="blue-grey" :class="{'full-width': $q.screen.lt.sm}"
          :options="[
           { label: $tc('form.add_new'), color:'green', icon: 'add',
              hidden: !$app.can('request-orders-create'),
              detail: $tc('messages.process_create'),
              actions: () => {
                $router.push(`${VIEW.resource.uri}/create`)
              }
            },
            { label: 'CLOSED', color:'red-10', icon: 'lock',
              hidden: !IS_CLOSE || !$app.can('request-orders-close'),
              detail: $tc('messages.process_close'),
              actions: () => {
                setClose()
              }
            },
            { label: 'DELETE', color:'red', icon: 'delete',
              hidden: !IS_EDITABLE,
              detail: $tc('messages.process_delete'),
              actions: () => {
                VIEW.delete()
              }
            },
            { label: 'VOID', color:'red', icon: 'block', hidden: !IS_VOID,
              detail: $tc('messages.process_void'),
              actions: () => {
                VIEW.void(()=> init() )
              }
            },
            { label: 'RE-CALCULATE', color:'warning', icon: 'refresh',
              hidden: !$app.can('request-orders-create'),
              // detail: $tc('messages.process_void'),
              actions: () => {
                setRecalculate()
              }
            }
          ]">
        </ux-btn-dropdown>
      </div>

      <div class="print-hide q-my-md full-width">
        <q-separator class="q-my-md" />
        <div class="row justify-end q-col-gutter-sm">
          <div class="col-12 col-sm-6 col-md-4" v-if="rsView.delivery_orders">
            <q-card>
              <q-expansion-item header-class="bg-cyan-8 text-white" icon="local_shipping" :label="`SJDO ${$tc('general.sj_delivery', 2)} (${rsView.delivery_orders.length})`">
                <q-list bordered separator :dark="LAYOUT.isDark" class="main-box">
                  <q-item clickable v-ripple @click="showDO(link.id)" :dark="LAYOUT.isDark"
                    v-for="(link, index) in rsView.delivery_orders" :key="index">
                    <q-item-section>
                      {{link.fullnumber || link.number}}
                    </q-item-section>
                    <q-item-section side>
                      <ux-chip-status dense square :row="link" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-expansion-item>
            </q-card>
          </div>
        </div>
      </div>
    </page-print>
    <q-inner-loading :showing="VIEW.loading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>
    <ux-modal-view ref="modal" fit icon="local_shipping" :title="$tc('general.sj_delivery')" :dark="LAYOUT.isDark" />
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
          api: '/api/v1/incomes/request-orders',
          uri: '/admin/incomes/request-orders'
        }
      },
      rsView: {},
      show_delivery: false,
      show_summary: true
    }
  },
  created () {
    this.init()
  },
  watch: {
    '$route': 'init'
  },
  computed: {
    IS_LOTS () {
      if (!this.rsView.customer) return false
      return this.rsView.customer.order_lots
    },
    IS_CLOSE () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.status !== 'OPEN') return false
      return true
    },
    IS_VOID () {
      if (this.IS_EDITABLE) return false
      if (['VOID'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_EDITABLE () {
      if (!this.$app.can('request-orders-update')) return false
      if (this.rsView.deleted_at) return false
      if (this.rsView.status !== 'OPEN') return false
      if (this.rsView.order_mode === 'ACCUMULATE') return false

      if (this.rsView.order_mode === 'NONE' && !this.rsView.customer.order_manual_allowed) return false

      return true
    },
    IS_REFERENCE () {
      if (!this.$app.can('request-orders-update')) return false
      if (this.rsView.deleted_at) return false
      if (this.rsView.status === 'CLOSED') return false
      return (this.rsView.order_mode === 'PO')
        ? this.rsView.is_relationship
        : true
    },
    IS_ITEM_SUMMARY () {
      if (this.rsView.order_mode !== 'ACCUMULATE') return false
      return this.show_summary
    },
    IS_LOCKROWS () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.status !== 'OPEN') return false
      if (this.rsView.order_mode === 'ACCUMULATE') return false
      return this.$app.can('request-orders-update')
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
    push (row) {
      this.$q.loading.show()
      let url = `/api/v1/incomes/request-orders/invoice/${row.id}/accurate/push`
      this.$axios.post(url)
        .then((response) => {
          console.warn('OK', response)
          let msg = response.data.d[0] || ''
          return (response.data.s)
            ? this.$app.notify.success('[ACCURATE]', msg)
            : this.$app.notify.warning('[ACCURATE]', msg)
        })
        .catch(error => {
          this.$app.response.error(error.response || error)
        })
        .finally(() => {
          this.$q.loading.hide()
        })
    },
    forget (row) {
      const submit = (row) => {
        this.$q.loading.show()
        let url = `/api/v1/incomes/request-orders/invoice/${row.id}/accurate/forget`
        this.$axios.post(url)
          .then((response) => {
            let msg = response.data.d[0] || ''
            if (response.data.s) {
              this.$app.notify.success('[ACCURATE]', msg)
            } else this.$app.notify.warning('[ACCURATE]', msg)
            this.init()
          })
          .catch(error => {
            this.$app.response.error(error.response || error)
          })
          .finally(() => {
            this.$q.loading.hide()
          })
      }

      this.$q.dialog({ title: 'DELETE CONFIRM', message: 'Are you sure to delete?', cancel: true })
        .onOk(() => {
          submit(row)
        })
    },
    setClose () {
      const submit = () => {
        this.VIEW.show = false
        this.$q.loading.show()
        let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}?mode=close&nodata=true`
        this.$axios.put(url)
          .then((response) => {
            this.init()
          })
          .catch(error => {
            this.$app.response.error(error.response, 'FORM CLOSED')
          })
          .finally(() => {
            this.VIEW.show = true
            setTimeout(() => {
              this.$q.loading.hide()
            }, 1000)
          })
      }

      this.$q.dialog({
        title: this.$tc('form.confirm', 1, { v: 'CLOSE' }),
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('messages.process_close') }),
        cancel: true,
        persistent: true
      }).onOk(() => {
        submit()
      })
    },
    setRecalculate () {
      const submit = () => {
        // this.VIEW.show = false
        this.$q.loading.show()
        let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}?mode=calculate&nodata=true`
        this.$axios.put(url)
          .then((response) => {
            this.init()
          })
          .catch(error => {
            this.$app.response.error(error.response, 'FORM CLOSED')
          })
          .finally(() => {
            this.VIEW.show = true
            setTimeout(() => {
              this.$q.loading.hide()
            }, 1000)
          })
      }

      submit()
    },
    setLockDetail (id, isUnlock = false) {
      const submit = () => {
        this.$q.loading.show()
        let url = `/api/v1/incomes/request-order-items/${id}/${isUnlock ? 'unlock' : 'lock'}`
        this.$axios.put(url)
          .then((response) => {
            this.init()
          })
          .catch(error => {
            this.$app.response.error(error.response, 'LOCK DETAIL')
          })
          .finally(() => {
            this.$q.loading.hide()
          })
      }

      this.$q.dialog({
        title: this.$tc('form.confirm', 1, { v: 'LOCK' }),
        message: this.$tc('messages.to_sure', 1, { v: 'lock detail' }),
        cancel: true,
        persistent: true
      }).onOk(() => {
        submit()
      })
    }
  }
}
</script>
