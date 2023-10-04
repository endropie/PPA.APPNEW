<template>
  <q-page padding class="items-center column">
    <page-print v-if="VIEW.show" class="q-ma-md shadow-2" >
      <div slot="header-tags" class="print-hide">
        <ux-chip-status :row="rsView" tag outline small square icon='bookmark' />
      </div>
      <span slot="header-subtitle" style="font-size:12px">Planing & Production Control Division</span>

      <div class="row q-col-gutter-xs" >
        <div class="col-12">
          <div class="justify-between row q-col-gutter-sm" >
            <div class="self-end col-auto">
              <span class="text-h6 text-uppercase">{{$tc('general.work_order', 2)}}</span>

              <q-markup-table bordered dense square class="no-shadow transparent">
                <tbody>
                  <tr>
                    <td class="text-left text-weight-medium">{{ rsView.main_id ? 'SUBLINE' : 'MAINLINE' }}</td>
                    <td>{{ rsView.line ? rsView.line.name : '-' }}</td>
                  </tr>
                  <tr>
                    <td class="text-left text-weight-medium">MATERIAL</td>
                    <td>{{ getStockistFrom(rsView.stockist_from) }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
            <div class="col-auto">
              <q-markup-table bordered dense square class="super-dense no-shadow transparent" separator="cell">
                <tr>
                  <th>{{$tc('label.number')}}</th>
                  <td>
                    {{ rsView.fullnumber || rsView.number }}
                  </td>
                </tr>
                <tr>
                  <th>{{$tc('label.date')}}</th>
                  <td>{{$app.date_format(rsView.date)}}</td>
                </tr>
                <tr>
                  <th>{{$tc('label.shift')}}</th>
                  <td>{{rsView.shift ? rsView.shift.name : '-'}}</td>
                </tr>
              </q-markup-table>
              <div class="float-right print-hide">
                <q-chip square color="grey" text-color="white"
                  :label="`DIRECT [${rsView.stockist_direct}]`"
                  v-if="rsView.stockist_direct" />
                <q-toggle
                  v-model="show_preline"
                  :label="$tc('form.show',1,{v:$tc('items.preline')})"
                  v-if="!rsView.stockist_direct" />
              </div>
            </div>
          </div>
        </div>
        <div class="col-12">
          <q-markup-table bordered dense square class="table-print no-highlight no-shadow transparent" separator="cell">
            <thead>
              <tr>
                <th>{{$tc('general.cust')}}</th>
                <th class="text-left">{{$tc('label.name', 1, {v:$tc('label.part')})}}</th>
                <th class="text-left">{{$app.setting('item.subname_label')}}</th>
                <th class="text-right">{{$tc('label.quantity')}}</th>
                <th>{{$tc('label.unit')}}</th>
                <th>%NG</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody v-for="(row, index) in rsView.work_order_items" :key="index">
              <q-tr :work-order-item-id="row.id">
                <q-td key="code">
                  {{row.item.customer_code}}
                </q-td>
                <q-td key="part_name" width="30%">
                  {{row.item.part_name}}
                </q-td>
                <q-td key="part_subname" width="30%">
                  {{row.item.part_subname}}
                </q-td>
                <q-td key="target" class="text-right">
                  {{row.target}}
                </q-td>
                <q-td key="unit_id" class="text-left">
                  {{row.unit.code}}
                </q-td>
                <q-td key="ngratio" class="text-right">
                  {{row.ngratio}}
                </q-td>
                <q-td key="quantity" class="text-right">
                  {{row.quantity}}
                </q-td>
              </q-tr>
              <q-tr v-if="!rsView.stockist_direct && show_preline">
                <q-td colspan="100%" style="padding:2px">
                  <div class="row q-col-gutter-sm q-mb-sm">
                    <div class="col">
                      <q-expansion-item dense expand-separator default-opened
                        :work-order-line-id="rsView.line_id"
                        :class="$q.dark.isActive ? `bg-grey-9` : `bg-grey-2`"
                        :header-class="$q.dark.isActive ? `bg-blue-grey-10` : `bg-blue-grey-1`"
                      >
                        <div slot="header" class="justify-center q-item__section column q-item__section--main">
                          <span v-if="rsView" >
                            {{rsView.line.name}}
                            <q-badge
                              :label="`${$app.number_format(row.amount_process / (row.unit_rate||1), row.unit.decimal_in)} / ${$app.number_format(row.unit_amount / (row.unit_rate||1), row.unit.decimal_in)}`"
                              :color="rsView.has_producted ? 'red-10' : 'primary'
                            "/>
                          </span>
                          <span v-else>
                            {{rsView.line_id}}
                          </span>
                        </div>
                        <q-list dense separator v-if="row.work_production_items.length">
                          <q-item v-for="(itemProduction, key) in row.work_production_items" :key="key">
                            <q-item-section>
                              <span v-if="itemProduction.work_production">
                                {{itemProduction.work_production.number}}
                                <!-- <q-badge color="blue-grey" :label="`#${itemProduction.id}`" /> -->
                              </span>
                            </q-item-section>
                            <q-item-section side>
                              <span v-if="MAPINGKEY['units'][itemProduction.unit_id]" >
                                {{$app.number_format(itemProduction.quantity)}}
                                {{MAPINGKEY['units'][itemProduction.unit_id].code}}
                              </span>
                            </q-item-section>
                          </q-item>
                          <q-item-label header v-if="!Boolean(row.work_production_items.length)" class="text-center q-pa-sm text-italic">No data</q-item-label>
                        </q-list>
                      </q-expansion-item>
                    </div>
                    <div class="col" v-if="!Boolean(rsView.main_id)">
                      <q-expansion-item dense expand-separator default-opened
                        :class="$q.dark.isActive ? `bg-grey-9` : `bg-grey-2`"
                        :header-class="$q.dark.isActive ? `bg-blue-grey-10` : `bg-blue-grey-1`"
                      >
                        <div slot="header" class="justify-center q-item__section column q-item__section--main">
                          <span>
                            {{$tc('general.packing')}}
                            <q-badge
                              :label="`${$app.number_format(row.amount_packing / (row.unit_rate||1),0)} / ${$app.number_format(row.amount_process / (row.unit_rate||1),0)}`"
                              :color="rsView.has_packed ? 'red-10' : 'primary'"
                            />
                          </span>
                        </div>
                        <q-list dense separator>
                          <q-item v-for="(packing_item_order, index) in row.packing_item_orders" :key="index"
                            :packing-item-id="packing_item_order.id"
                          >
                            <q-item-section>
                              <span v-if="packing_item_order.packing_item && packing_item_order.packing_item.packing">
                                {{packing_item_order.packing_item.packing.number}}
                              </span>
                            </q-item-section>
                            <q-item-section  side>
                              <span v-if="MAPINGKEY['units'][packing_item_order.packing_item.unit_id]" >
                                {{$app.number_format(packing_item_order.unit_amount / (packing_item_order.packing_item.unit_rate || 1))}}
                                {{MAPINGKEY['units'][packing_item_order.packing_item.unit_id].code}}
                              </span>
                            </q-item-section>
                          </q-item>
                          <q-item-label header v-if="!Boolean(row.packing_item_orders.length)" class="text-center q-pa-sm text-italic">No data</q-item-label>
                        </q-list>
                      </q-expansion-item>
                    </div>
                    <div class="col" v-if="!Boolean(rsView.main_id)">
                      <q-expansion-item dense expand-separator default-opened
                        :class="$q.dark.isActive ? `bg-grey-9` : `bg-grey-2`"
                        :header-class="$q.dark.isActive ? `bg-blue-grey-10` : `bg-blue-grey-1`"
                      >
                        <div slot="header" class="justify-center q-item__section column q-item__section--main">
                          <span>
                            NG-NC
                            <q-badge
                              :label="`${$app.number_format(row.amount_faulty / (row.unit_rate||1),0)} / ${$app.number_format(row.amount_process / (row.unit_rate||1),0)}`"
                              :color="rsView.has_packed ? 'red-10' : 'primary'"
                            />
                          </span>
                        </div>
                        <q-list dense separator>
                          <q-item v-for="(packing_item_fault, index) in row.packing_item_faults" :key="index"
                            :packing-item-id="packing_item_fault.id"
                          >
                            <q-item-section>
                              <span v-if="packing_item_fault.packing_item && packing_item_fault.packing_item.packing">
                                {{packing_item_fault.packing_item.packing.number}}
                              </span>
                            </q-item-section>
                            <q-item-section  side>
                              <span v-if="MAPINGKEY['units'][packing_item_fault.packing_item.unit_id]" >
                                {{$app.number_format(packing_item_fault.unit_amount / (packing_item_fault.packing_item.unit_rate || 1))}}
                                {{MAPINGKEY['units'][packing_item_fault.packing_item.unit_id].code}}
                              </span>
                            </q-item-section>
                          </q-item>
                          <q-item-label header v-if="!Boolean(row.packing_item_faults.length)" class="text-center q-pa-sm text-italic">No data</q-item-label>
                        </q-list>
                      </q-expansion-item>
                    </div>
                    <div class="col-auto">
                      <q-btn dense flat color="grey" @click="onCommentable(row)" icon="info" />
                    </div>
                  </div>
                  <div class="column bg-yellow-1 q-px-sm q-py-xs">
                    <div class="text-italic"><span class="text-weight-bold">Note: </span>{{ row.note || '-' }}</div>
                    <div class="text-italic"><span class="text-weight-bold">Producted Note: </span>{{ row.producted_notes || '-' }}</div>
                  </div>
                </q-td>
              </q-tr>
            </tbody>
          </q-markup-table>
        </div>
        <div class="col-12">
            <div class="q-my-xs text-italic">{{$tc('label.description')}}:</div>
            <div class="q-my-xs text-weight-light" style="min-height:30px">{{ rsView.description }}</div>
        </div>
      </div>
      <div class="row q-col-gutter-xs" >
        <div class="col-12 q-gutter-xs print-hide " style="padding-top:50px">
          <q-btn :label="$tc('form.back')" icon="cancel" color="dark" :to="`${VIEW.resource.uri}?return`"></q-btn>
          <q-btn :label="$tc('form.edit')" icon="edit" color="green" :to="`${VIEW.resource.uri}/${ROUTE.params.id}/edit`" v-if="IS_EDITABLE"></q-btn>
          <q-btn :label="$tc('form.print')" icon="print" color="grey" @click.native="VIEW.print" ></q-btn>
          <ux-btn-dropdown color="blue-grey" no-caps class="float-right"
            :options="[
              {
                label: String($tc('form.add_new')).toUpperCase(), color:'primary', icon: 'add',
                detail: $tc('messages.process_create'),
                hidden: !$app.can('work-orders-create'),
                actions: () => $router.push(`${VIEW.resource.uri}/create`)
              },
              {
                label: 'RE-OPEN', color:'green', icon: 'refresh',
                detail: $tc('messages.process_revise'),
                hidden: !IS_REOPEN || !$app.can('work-orders-revision'),
                actions: () => setReopen()
              },
              {
                label: 'PRODUCTED', color:'green', icon: 'done_all',
                detail: $tc('messages.process_producted'),
                hidden: !IS_PRODUCTED || !$app.can('work-orders-close'),
                actions: () => setProducted()
              },
              {
                label: 'PACKED', color:'green', icon: 'done_all',
                detail: $tc('messages.process_packed'),
                hidden: !IS_PACKED || !$app.can('work-orders-close'),
                actions: () => setPacked()
              },
              {
                label: 'VALIDATED', color:'green', icon: 'done_all',
                detail: $tc('messages.process_validation'),
                hidden: !IS_DIRECTED || !$app.can('work-orders-validation'),
                actions: () => setDirectValidated()
              },
              {
                label: 'CLOSE', color:'green', icon: 'done_all',
                detail: $tc('messages.process_close'),
                hidden: !IS_CLOSE || !$app.can('work-orders-close'),
                actions: () => setClosed()
              },
              {
                label: String($tc('form.revision')).toUpperCase(), color:'orange', icon: 'edit',
                detail: $tc('messages.process_revise'),
                hidden: true, // !IS_REVISE || !$app.can('work-orders-revision'),
                actions: () => setRevision()
              },
              {
                label: 'DELETE', color:'red-10', icon: 'delete',
                detail: $tc('messages.process_delete'),
                hidden: !IS_EDITABLE || !$app.can('work-orders-delete'),
                actions: () => VIEW.delete()
              },
              {
                label: 'VOID', color:'negative', icon: 'block',
                detail: $tc('messages.process_void'),
                hidden: !IS_VOID || !$app.can('work-orders-void'),
                actions: () => VIEW.void(()=> init())
              },
              {
                label: 'RE-CALCULATE', color:'grey', icon: 'refresh',
                hidden: rsView.deleted_at || !$app.can('work-orders-read'),
                actions: () => recalculate()
              }
            ]">
          </ux-btn-dropdown>
        </div>
      </div>
    </page-print>

    <q-dialog ref="dialogProducted" persistent v-if="rsView && rsView.work_order_items">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="rule" font-size="32px" color="blue" text-color="white" />
          <div class="q-ml-sm text-blue">
            <div class="text-h6">PRODUCTED NOTES</div>
            <div>Please input producted notes of details</div>
          </div>
        </q-card-section>
        <q-card-section>
          <q-markup-table dense flat bordered>
            <thead>
              <tr class="text-uppercase">
                <th class="text-left">Part</th>
                <th class="text-center">Qty</th>
                <th class="text-center">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(detail) in rsView.work_order_items.filter(x => Math.round(x.unit_amount) > Math.round(x.amount_process))" :key="detail.id">
                <td class="text-left">
                  <div>{{ detail.item.part_name }}</div>
                  <div class="text-caption text-grey" style="line-height:normal">{{ detail.item.part_number }}</div>
                </td>
                <td class="text-right">
                  {{$app.number_format(detail.amount_process)}} / {{ $app.number_format(detail.unit_amount) }}
                </td>
                <td>
                  <q-input dense outlined
                    v-model="detail.producted_notes"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Submit" color="primary" @click="submitProducted"
            :disable="rsView.work_order_items.some(x => Math.round(x.unit_amount) > Math.round(x.amount_process) && !x.producted_notes)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-inner-loading :showing="VIEW.loading">
        <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script>

import MixView from 'src/mixins/mix-view.vue'
import PagePrint from 'components/page-print'
import CommentableDialog from 'components/CommentableDialog.vue'

export default {
  mixins: [MixView],
  components: { PagePrint },
  data () {
    return {
      show_preline: false,
      SHEET: {
        lines: { api: '/api/v1/references/lines?mode=all' },
        units: { api: '/api/v1/references/units?mode=all' }
      },
      VIEW: {
        resource: {
          api: '/api/v1/factories/work-orders',
          uri: '/admin/factories/work-orders',
          params: '?mode=view'
        }
      },
      rsView: {},
      productedNotes: {}
    }
  },
  created () {
    this.init()
  },
  computed: {
    IS_REOPEN () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.status === 'OPEN') return false
      if (!this.rsView.main_id && !['PRODUCTED', 'PACKED'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_DIRECTED () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.status !== 'OPEN') return false
      return Boolean(this.rsView.stockist_direct)
    },
    IS_PRODUCTED () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.main_id) return false
      if (this.rsView.status !== 'OPEN') return false
      if (this.IS_DIRECTED) return false
      return true
    },
    IS_PACKED () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.main_id) return false
      if (this.rsView.status !== 'PRODUCTED') return false
      if (this.IS_DIRECTED) return false
      return true
    },
    IS_CLOSE () {
      if (this.rsView.deleted_at) return false
      if (['CLOSED'].find(x => x === this.rsView.status)) return false
      if (this.IS_DIRECTED) return false
      return true
    },
    IS_VOID () {
      if (this.IS_EDITABLE) return false
      if (this.rsView.main_id) return false
      if (this.rsView.deleted_at) return false
      if (['VOID'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_REVISE () {
      if (this.IS_EDITABLE) return false
      if (this.rsView.main_id) return false
      if (this.rsView.deleted_at) return false
      if (['VOID', 'REVISED'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_EDITABLE () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.main_id) return false
      if (this.rsView.status !== 'OPEN') return false
      if (Object.keys(this.rsView.has_relationship || {}).length > 0) return false
      return true
    },

    MAPINGKEY () {
      let variables = {
        'units': {}
      }
      this.SHEET['units'].data.map(value => { variables['units'][value.id] = value })

      return variables
    }
  },
  methods: {
    init () {
      this.VIEW.load((data) => {
        this.setView(data || {})
      })
    },
    getStockistFrom (val) {
      const stockist = [
        { value: 'FM', label: 'FRESH MATERIAL' },
        { value: 'NC', label: 'NOT GOOD', color: 'warning' },
        { value: 'NCR', label: 'REPAIR', color: 'orange-8' }
      ]
      const v = stockist.find(x => x.value === val)
      return v ? v.label : 'N/A'
    },
    setValidation () {
      this.$router.push(`/admin/factories/work-process/${this.ROUTE.params.id}/edit`)
    },
    setRevision () {
      this.$router.push(`${this.VIEW.resource.uri}/${this.ROUTE.params.id}/revision`)
    },
    setView (data) {
      this.rsView = data
    },
    totalProduction (detail) {
      return Math.round(detail.amount_process)
    },
    totalPacking (detail) {
      const total = detail.packing_item_orders.reduce((total, item) => total += item.unit_total, 0)
      return this.$app.number_abbreviate(Math.round(total))
    },
    totalAmount (detail) {
      return Math.round(detail.unit_amount)
    },

    setReopen () {
      const submit = () => {
        this.VIEW.show = false
        this.VIEW.loading = true
        let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}?mode=reopen&nodata=true`
        this.$axios.put(url)
          .then((response) => {
            this.init()
          })
          .catch(error => {
            this.$app.response.error(error.response, 'FORM REOPEN')
          })
          .finally(() => {
            this.VIEW.show = true
            setTimeout(() => {
              this.VIEW.loading = false
            }, 1000)
          })
      }

      this.$q.dialog({
        title: this.$tc('form.confirm', 1, { v: 'RE-OPEN' }),
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('messages.process_reopen') }),
        cancel: true,
        persistent: true
      }).onOk(() => {
        submit()
      })
    },

    setProducted () {
      this.$refs.dialogProducted.show()
    },

    submitProducted () {
      this.VIEW.loading = true
      let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}?mode=producted&nodata=true`
      const data = this.rsView.work_order_items.filter(x => x.producted_notes)

      this.$axios.put(url, { work_order_items: data })
        .then((response) => {
          this.$refs.dialogProducted.hide()
          this.init()
        })
        .catch(error => {
          this.$app.response.error(error.response, 'FORM PRODUCTED')
        })
        .finally(() => {
          setTimeout(() => {
            this.VIEW.loading = false
          }, 1000)
        })
    },

    setPacked () {
      const submit = () => {
        this.VIEW.show = false
        this.VIEW.loading = true
        let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}?mode=packed&nodata=true`
        this.$axios.put(url)
          .then((response) => {
            this.init()
          })
          .catch(error => {
            this.$app.response.error(error.response, 'FORM PACKED')
          })
          .finally(() => {
            this.VIEW.show = true
            setTimeout(() => {
              this.VIEW.loading = false
            }, 1000)
          })
      }

      this.$q.dialog({
        title: this.$tc('form.confirm', 1, { v: 'PACKED' }),
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('messages.process_packed') }),
        cancel: true,
        persistent: true
      }).onOk(() => {
        submit()
      })
    },

    setClosed () {
      const submit = () => {
        this.VIEW.show = false
        this.VIEW.loading = true
        let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}?mode=closed&nodata=true`
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
              this.VIEW.loading = false
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

    recalculate () {
      this.VIEW.show = false
      this.VIEW.loading = true
      let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}?mode=recalculate&nodata=true`
      this.$axios.put(url)
        .then((response) => {
          this.init()
        })
        .catch(error => {
          this.$app.response.error(error.response, 'RE-CALCULATE')
        })
        .finally(() => {
          this.VIEW.show = true
          setTimeout(() => {
            this.VIEW.loading = false
          }, 1000)
        })
    },

    setDirectValidated () {
      const submit = () => {
        this.VIEW.show = false
        this.VIEW.loading = true
        let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}?mode=directed&nodata=true`
        this.$axios.put(url)
          .then((response) => {
            this.$app.notify.success('DIRECT VALIDATED', `WO [${response.data.fullnumber || response.data.number}] validate sucess!`)
            this.init()
          })
          .catch(error => {
            console.error(error.response || error)
            this.$app.response.error(error.response, 'DIRECT VALIDATED')
          })
          .finally(() => {
            this.VIEW.show = true
            setTimeout(() => {
              this.VIEW.loading = false
            }, 1000)
          })
      }

      this.$q.dialog({
        title: this.$tc('form.confirm', 1, { v: 'DIRECT-VALIDATED' }),
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('messages.process_validation') }),
        cancel: true,
        persistent: true
      }).onOk(() => {
        submit()
      })
    },

    onCommentable (row) {
      this.$q.dialog({
        ok: true,
        component: CommentableDialog,
        title: `SPK Detail [${row.part_name}] - LOG`,
        model: 'App\\Models\\Factory\\WorkOrderItem',
        id: row.id
      })
    }
  }
}
</script>
