<template>
  <q-page padding class="content-center justify-start column">
    <page-print v-if="rsView && VIEW.show" style="width:75%;min-width:210mm;min-height:85vh">
      <div slot="header-tags" class="print-hide">
        <ux-chip-status :row="rsView" tag outline small square icon='bookmark'/>
      </div>
      <span slot="header-subtitle">Planing & Production Control Division</span>

      <div class="column" >
        <div class="justify-between row q-col-gutter-sm" >
          <div class="self-end col-stretch text-no-wrap text-truncate">
            <span class="text-h6 text-uppercase">{{$tc('general.packing', 2)}}</span>
          </div>
          <div class="col-auto">
            <q-markup-table bordered dense square class="no-shadow no-highlight transparent" separator="cell">
              <tbody>
                <tr>
                  <td>{{$tc('label.number')}}</td>
                  <td>{{rsView.number}}</td>
                </tr>
                <tr>
                  <td>{{$tc('label.date')}}</td>
                  <td>{{$app.date_format(rsView.date)}}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </div>
        <div class="justify-between row q-col-gutter-sm">
          <div class="col-stretch ">
            <q-markup-table dense separator="none" class="no-shadow no-highlight transparent">
              <tbody>
                <tr>
                  <td class="no-padding text-weight-light">{{$tc('general.customer')}}</td>
                  <td width="35%">{{ rsView.customer.name }}</td>
                </tr>
                <tr>
                  <td class="no-padding text-weight-light">Operator</td>
                  <td width="35%">{{ rsView.operator ? rsView.operator.name : '-'}}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
          <div class="col-auto ">
            <q-markup-table dense separator="none" class="no-shadow no-highlight transparent">
              <tbody>
                <tr>
                  <td class="no-padding text-weight-light">{{$tc('label.shift')}}</td>
                  <td width="35%">{{ rsView.shift.name }}</td>
                </tr>
                <tr>
                  <td class="no-padding text-weight-light">Worktime</td>
                  <td width="35%">{{ getWorktime(rsView.worktime) }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </div>
        <div>
          <q-markup-table bordered dense square separator="cell" class="no-shadow no-highlight transparent">
            <thead>
              <tr class="text-uppercase" style="line-height:30px">
                <th width="10%" class="text-center">{{ this.$tc('label.code') }}</th>
                <th width="40%" class="text-left">{{ this.$tc('label.name', 1, {v:this.$tc('label.part')}) }}</th>
                <th width="10%">{{ $tc('label.unit') }}</th>
                <th width="10%" class="text-right">QTY</th>
                <th width="10%" class="text-right">FAULT</th>
                <th width="10%" class="text-right">{{$tc('label.summary')}}</th>
              </tr>
            </thead>
            <tbody v-if="rsView.packing_items">
              <q-tr :packing-item-id="rsView.packing_items.id">
                <q-td key="code" width="10%" class="text-center">
                  {{ rsView.packing_items.item.code }}
                </q-td>
                <q-td key="part" width="30%">
                  <div>{{rsView.packing_items.item.part_name}}</div>
                  <small>[{{ rsView.packing_items.item.customer_code }}] {{rsView.packing_items.item.part_subname}}</small>
                </q-td>
                <q-td key="unit_id" class="text-center">
                  {{ rsView.packing_items.unit.code }}
                </q-td>
                <q-td key="quantity" class="text-right">
                  {{ $app.number_format(rsView.packing_items.quantity, rsView.packing_items.unit.decimal_in) }}
                </q-td>
                <q-td key="faulty" class="text-right">
                  {{ rsView.packing_items.faulty }}
                </q-td>
                <q-td key="total" class="text-right">
                  {{ $app.number_format(Number(rsView.packing_items.quantity) + Number(rsView.packing_items.faulty), rsView.packing_items.unit.decimal_in) }}
                </q-td>
              </q-tr>
              <tr v-if="PACKING_ITEM_ORDERS.length || PACKING_ITEM_FAULTS.length">
                <td colspan="100%" >
                  <div class="row q-gutter-md">
                    <q-list class="col" dense separator bordered v-if="PACKING_ITEM_ORDERS.length">
                      <q-item-label header class="q-py-sm bg-blue-grey-1">
                        PACKING [OK]
                      </q-item-label>
                      <q-separator />
                      <q-item v-for="(order, orderIndex) in PACKING_ITEM_ORDERS" :key="orderIndex" :packing-item-order-id="order.id">
                        <q-item-section>
                          <q-item-label>{{order.number}}</q-item-label>
                          <q-item-label caption>
                            {{$app.moment(order.date).format('D MMMM YYYY')}}
                          </q-item-label>
                        </q-item-section>
                        <q-item-section side class="text-subtitle2 text-weight-medium">
                          <q-item-label>{{$app.number_format(order.quantity)}} {{ rsView.packing_items.unit.code }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    <q-list class="col" dense separator bordered v-if="PACKING_ITEM_FAULTS.length">
                      <q-item-label header class="q-py-sm bg-blue-grey-1">
                        FAULTY
                      </q-item-label>
                      <q-separator />
                      <q-item v-for="(fault, faultIndex) in PACKING_ITEM_FAULTS" :key="faultIndex" :packing-item-fault-id="fault.id">
                        <q-item-section>
                          <q-item-label>{{fault.number}}</q-item-label>
                          <q-item-label caption>
                            {{$app.moment(fault.date).format('D MMMM YYYY')}}
                          </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          [{{ fault.fault.name || 'undefined' }}]
                        </q-item-section>
                        <q-item-section side class="text-subtitle2 text-weight-medium">
                          <q-item-label>{{$app.number_format(fault.quantity)}} {{ rsView.packing_items.unit.code }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>

                  </div>
                </td>
              </tr>
              <tr v-if="PACKING_ITEM_FAULTS.length == 0 && rsView.packing_items.packing_item_faults.length">
                <q-td colspan="100%">
                  <div class="q-pb-sm text-caption text-weight-light">
                    <span class="text-upprecase text-subtitle1">FAULTY:</span>
                    <template v-for="(item_fault, index) in rsView.packing_items.packing_item_faults">
                      <q-chip :key="index" class="bg-grey-3 bordered" square dense>
                        <q-avatar color="faded" text-color="white">{{ $app.number_format(item_fault.quantity) }}</q-avatar>
                        {{item_fault.fault.name}}
                      </q-chip>
                    </template>
                  </div>
                </q-td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
        <div>
            <div class="q-my-xs text-italic">{{$tc('label.description')}}:</div>
            <div class="q-my-xs text-weight-light" style="min-height:30px">{{ rsView.description }}</div>
        </div>
      </div>
      <div slot="actions" class="row q-gutter-sm print-hide">
        <q-btn :label="$tc('form.edit')" icon="edit" color="green" outline :to="`${VIEW.resource.uri}/${ROUTE.params.id}/edit`" v-if="IS_EDITABLE" />
        <q-btn :label="$tc('form.print')" icon="print" color="grey" @click.native="print()" />
        <q-space />
        <q-btn :label="$tc('form.list')" icon-right="list" color="dark" :to="`${VIEW.resource.uri}?return`"/>
        <!-- <q-btn :label="$tc('form.delete')" :icon="btnIcon('delete')" color="negative" outline @click="VIEW.delete" v-if="IS_EDITABLE"></q-btn> -->
        <ux-btn-dropdown split color="blue-grey"
          @click="IS_EDITABLE ? $router.push(`${VIEW.resource.uri}/create`) : false"
          :options="[
            { label: $tc('form.add_new'), color:'green', icon: 'add',
              detail: $tc('messages.process_create'),
              hidden: !IS_EDITABLE || !$app.can('packings-create'),
              actions: () => {
                $router.push(`${VIEW.resource.uri}/create`)
              }
            },
            { label: 'DELETE', color:'red', icon: 'delete',
              detail: $tc('messages.process_delete'),
              hidden: !IS_EDITABLE || !$app.can('packings-delete'),
              actions: () => {
                VIEW.delete()
              }
            },
            { label: 'VOID', color:'red', icon: 'block',
              detail: $tc('messages.process_void'),
              hidden: !IS_VOID || !$app.can('packings-create'),
              actions: () => {
                VIEW.void(()=> init() )
              }
            },
        ]"/>
      </div>
    </page-print>

    <q-inner-loading :showing="VIEW.loading">
        <q-spinner-dots size="50px" color="primary" />
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
      VIEW: {
        resource: {
          api: '/api/v1/factories/packings',
          uri: '/admin/factories/packings',
          params: '?mode=view'
        }
      },
      rsView: null,
      count: 0
    }
  },
  created () {
    this.init()
  },
  computed: {
    IS_VOID () {
      if (this.IS_EDITABLE) return false
      if (this.rsView.deleted_at) return false
      if (!this.$app.can('packings-void')) return false
      if (['VOID'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_EDITABLE () {
      if (this.rsView.deleted_at || this.rsView.status !== 'OPEN') return false
      if (this.rsView.hasOwnProperty('has_relationship') && Object.keys(this.rsView.has_relationship).length > 0) return false

      return true
    },
    PACKING_ITEM_ORDERS () {
      if (!this.rsView.packing_items) return []
      return this.rsView.packing_items.packing_item_orders.map(x => {
        const number = x.work_order_item.work_order.number
        const date = x.work_order_item.work_order.date
        const unitRate = this.rsView.packing_items.unit_rate
        return ({ ...x, number, date, unit_rate: unitRate })
      })
    },
    PACKING_ITEM_FAULTS () {
      if (!this.rsView.packing_items) return []
      return this.rsView.packing_items.packing_item_faults
        .filter(x => x.work_order_item_id)
        .map(x => {
          const number = x.work_order_item.work_order.number
          const date = x.work_order_item.work_order.date
          const unitRate = this.rsView.packing_items.unit_rate
          return ({ ...x, number, date, unit_rate: unitRate })
        })
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
    getWorktime (val) {
      const worktimes = this.CONFIG.options['worktime']
      const v = worktimes.find(x => x.value === val)
      return v ? v.label : 'N/A'
    },
    setView (data) {
      this.rsView = data
    }
  }
}
</script>
