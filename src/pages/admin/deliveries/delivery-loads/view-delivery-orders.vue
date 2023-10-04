<template>
  <q-page padding class="column justify-start items-center">
    <div class="content" :style="{'min-width': $q.screen.gt.sm ? '70%' : '100%'}">
      <div class="row q-pb-md print-hide">
        <q-space />
        <q-btn color="grey" icon="print" label="Print" @click="VIEW.print()" />
      </div>
      <div v-for="(page, pageIndex) in rsPage" :key="pageIndex">
        <template v-if="page.data">
          <page-print class="multi-page" v-for="(pageMode, pi) in getArrayPage(page.data.customer)" :key="pi">
            <div slot="header-tags" class="column no-wrap items-end">
              <div class="print-hide no-padding">
                <ux-chip-status :row="page.data" tag outline dense square icon='bookmark' class="no-margin" />
              </div>
              <div class="text-subtitle2 text-weight-bold text-uppercase text-center on-right">
                <span v-if="page.data.is_internal">{{ $tc('general.sj_internal', 2) }} </span>
                <span v-else>{{ $tc('general.sj_delivery',2) }} {{ page.data.transaction }}</span>
              </div>
            </div>
            <div class="column" style="min-height:3.25in;height:auto">
              <div class="row q-gutter-x-sm q-pb-sm" :class="{'no-wrap': $q.screen.gt.xs}">
                <ux-qrcode :value="valQrCode(page.data)" :options="{ width: 96, height: 96, margin: 1 }" />
                <div class="" style="max-width:50%">
                  <div class="text-weight-medium uppercase">To: {{page.data.customer_name}}</div>
                  <address class="text-normal" style="font-style: normal">{{page.data.customer_address}}</address>
                  <div class="text-weight-medium" v-if="page.data.customer_note">{{$tc('label.no',1, {v:'DN'})}}: {{page.data.customer_note}}</div>
                  <div class="text-weight-medium" v-if="page.data.vehicle">{{$tc('label.transport')}}: {{page.data.vehicle.number}}</div>
                </div>
                <q-space/>
                <div class="on-right" style="max-width:50%">
                  <div class="column items-start">
                    <q-markup-table dense bordered square separator="cell"
                      class="table-print dotted super-dense no-shadow no-highlight th-uppercase"
                    >
                      <tbody>
                        <tr>
                          <td>{{$tc('label.number')}}</td>
                          <td>
                            {{ page.data.fullnumber || page.data.number }}{{(String(pageMode).toUpperCase() === 'JASA' ? 'A' : '')}}
                            </td>
                          <td>{{$tc('label.date')}}</td>
                          <td>{{$app.date_format(page.data.date)}}</td>
                        </tr>
                        <tr v-if="!Boolean(page.data.is_internal || page.data.transaction == 'SAMPLE')">
                          <td>{{$tc('label.no',1, {v:'Index'})}}</td>
                          <td>
                            {{page.data.indexed_number}}
                          </td>
                          <td>No. SO</td>
                          <td>
                            {{ page.data.request_order ? (page.data.request_order.fullnumber || page.data.request_order.number) : '-' }}
                          </td>
                        </tr>
                        <tr v-if="page.data.reconcile_number">
                          <td>{{$tc('form.reconciliation')}}</td>
                          <td  colspan="100%">
                            {{page.data.reconcile_number}}
                          </td>
                        </tr>
                        <tr v-if="!Boolean(page.data.is_internal || page.data.transaction == 'SAMPLE')">
                          <td>PO/SJ</td>
                          <td colspan="100%">
                            <div class="ellipsis-3-lines" style="white-space:normal;">
                              {{ page.data.request_order ? page.data.request_order.reference_number : '-' }}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </div>
                  <div class="row">
                    <q-space/>
                    <div v-if="page.data.is_internal">
                      <q-checkbox left-label color="blue-grey" label="REMAINIG"
                        v-model="remain_only"
                        :true-value="true" :false-value="false"
                        class="print-hide align-end"
                      />
                      <span class="text-weight-medium print-only" v-if="remain_only">(REMAINIG)</span>
                    </div>
                    <div>
                      <q-checkbox left-label color="blue-grey" label="UNIT [PCS-KG]"
                        v-model="isDoubleUnit"
                        :true-value="true" :false-value="false"
                        class="print-hide align-end"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <q-markup-table dense bordered square separator="cell"
                  class="table-print dotted no-shadow no-highlight th-uppercase">
                  <thead>
                  <q-tr>
                    <q-th v-if="Boolean(page.data.customer.order_lots)">LOTS</q-th>
                    <q-th class="text-left">{{ $tc('label.name', 1, {v: $tc('label.part')}) }}</q-th>
                    <q-th class="text-left">{{ $app.setting('item.subname_label') }}</q-th>
                    <q-th v-if="isDoubleUnit" key="PCS" class="text-right" >Unit (PCS)</q-th>
                    <q-th v-if="isDoubleUnit" key="KG" class="text-right" >Unit (KG)</q-th>
                    <q-th v-if="!isDoubleUnit" class="text-right" >{{ $tc('label.quantity') }}</q-th>
                    <q-th v-if="!isDoubleUnit" class="text-left" width="10%" >{{ $tc('label.unit') }}</q-th>
                    <q-th>{{ $tc('label.encasement') }}</q-th>
                  </q-tr>
                  </thead>
                  <tbody v-for="(row, index) in page.data.delivery_order_items" :key="index">
                    <q-tr :delivery-order-item-id="row.id"
                      v-show="isRowMain(row)" >
                      <q-td v-if="Boolean(page.data.customer.order_lots)"> {{row.number_lots}} </q-td>
                      <q-td key="part_name">
                        <span class="text-weight-medium" v-if="Boolean(pageMode)">{{pageMode}}:&nbsp;</span>
                        <span class="text-weight-medium" v-if="['DETAIL', 'UNIT_DETAIL'].find(x => x === page.data.customer.delivery_mode)">Material:&nbsp;</span>
                        <span v-if="row.item"> {{row.item.part_name}} </span>
                      </q-td>
                      <q-td key="part_subname">
                        <span v-if="row.item"> {{row.item.part_subname}} </span>
                      </q-td>
                      <q-td v-if="isDoubleUnit" key="PCS" class="text-right">
                        {{!valPCS(row) ? '' : $app.number_format(valPCS(row), row.unit.decimal_in) + ' PCS'}}
                      </q-td>
                      <q-td v-if="isDoubleUnit" key="KG" class="text-right">
                        {{!valKG(row) ? '' : $app.number_format(valKG(row), row.unit.decimal_in) + ' KG'}}
                      </q-td>
                      <q-td  v-if="!isDoubleUnit" key="quantity" class="text-right">
                        <span v-if="page.data.is_internal && remain_only">
                          {{$app.number_format(Number(row.quantity) - (row.amount_reconcile / (row.unit_rate||1)), row.unit.decimal_in)}}
                        </span>
                        <span v-else>{{$app.number_format(row.quantity, row.unit.decimal_in)}}</span>
                      </q-td>
                      <q-td v-if="!isDoubleUnit" key="unit"  class="text-left">
                        {{row.unit.code}}
                      </q-td>
                      <q-td>
                        <div class="row cursor-pointer">
                          <span>{{row.encasement}}</span>
                          <template v-if="String(pageMode).toUpperCase() !== 'JASA' && page.data.status === 'OPEN'">
                            <q-popup-edit v-model="row.encasement" content-class="" :cover="false" :offset="[0, 10]"
                              @save="(val,init) => setEncasement(index, val, init)"
                              >
                              <template v-slot="{ value, emitValue, set, cancel }">
                                <q-input autofocus dense :value="value" :label="$tc('label.encasement')" stack-label
                                  @input="emitValue"
                                >
                                  <template v-slot:after>
                                    <q-btn flat dense color="negative" icon="cancel" @click.stop="cancel" />
                                    <q-btn flat dense color="positive" icon="check_circle" @click.stop="set" />
                                  </template>
                                </q-input>
                              </template>
                            </q-popup-edit>
                            <q-space/>
                            <q-icon name="edit" class="print-hide cursor-pointer self-end text-grey"/>
                          </template>
                        </div>
                      </q-td>
                    </q-tr>
                    <q-tr :delivery-order-item-id="row.id"
                      v-show="isRowMain(row)"
                      v-if="['DETAIL', 'UNIT_DETAIL'].find(x => x === page.data.customer.delivery_mode)">
                      <q-td v-if="Boolean(page.data.customer.order_lots)"> {{row.number_lots}} </q-td>
                      <q-td>
                        <span class="text-weight-medium">Jasa:&nbsp;</span>
                        <span v-if="row.item"> {{row.item.part_name}} </span>
                      </q-td>
                      <q-td>
                        <span v-if="row.item"> {{row.item.part_subname}} </span>
                      </q-td>
                      <q-td  v-if="isDoubleUnit" key="PCS" class="text-right">
                        {{!valPCS(row) ? '' : $app.number_format(valPCS(row), row.unit.decimal_in) + ' PCS'}}
                      </q-td>
                      <q-td v-if="isDoubleUnit" key="KG" class="text-right">
                        {{!valKG(row) ? '' : $app.number_format(valKG(row), row.unit.decimal_in) + ' KG'}}
                      </q-td>
                      <q-td v-if="!isDoubleUnit" class="text-right">
                        {{$app.number_format(row.quantity, row.unit.decimal_in)}}
                      </q-td>
                      <q-td v-if="!isDoubleUnit" class="text-left">{{row.unit.code}}</q-td>
                      <q-td></q-td>
                    </q-tr>
                  </tbody>
                  <tbody >
                    <tr v-if="page.data.is_internal && remain_only && !page.data.delivery_order_items.filter(x => isRowMain(x)).length">
                      <td colspan="100%" class="text-italic text-grey text-center" style="height: 42px !important">
                        <span>NO REMAIN RECORD.</span>
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
              <div v-show="Boolean(page.data.description)">
                <div class="q-my-xs">{{$tc('label.description')}}:</div>
                <div class="q-my-xs" style="min-height:30px">{{ page.data.description }}</div>
              </div>
            </div>
            <q-space />
            <div class="page-break-inside" style="break-inside: avoid;">
            <div class="row justify-center">
              <q-markup-table dense class="no-shadow text-weight-light" style="min-width:70%">
                <tr class="text-center">
                  <td width="30%">
                    <div class="sign-name">Diterima Oleh</div>
                    <div class="sign-tag row no-wrap q-mx-lg">( <q-space/>. . . . . . . . . . . . . .<q-space/> )</div>
                  </td>
                  <td width="30%">
                    <div class="sign-name">Security</div>
                    <div class="sign-tag row no-wrap q-mx-lg">( <q-space/>. . . . . . . . . . . . . .<q-space/> )</div>
                  </td>
                  <td width="30%" class="text-capitalize">
                    <div class="sign-name">Hormat Kami</div>
                    <div class="sign-tag row no-wrap q-mx-lg" v-if="rsView.created_user">(<q-space/>{{rsView.created_user.name}}<q-space/>)</div>
                    <div class="sign-tag row no-wrap q-mx-lg" v-else>( <q-space/>. . . . . . . . . . . . . .<q-space/> )</div>
                  </td>
                </tr>
              </q-markup-table>
            </div>
            </div>
          </page-print>
        </template>
         <q-card v-if="!page.data">
          <q-item>
            <q-item-section>
              <q-item-label v-if="page.error" class="text-negative">
                <q-icon name="warning" /> {{page.error}}
              </q-item-label>
              <q-item-label>
                <q-skeleton type="text" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" />
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-skeleton height="200px" square />

          <q-card-actions align="center" class="q-gutter-lg">
            <q-skeleton type="QBtn" />
            <q-skeleton type="QBtn" />
            <q-skeleton type="QBtn" />
            <q-skeleton type="QBtn" />
          </q-card-actions>
        </q-card>
        <div class="q-pb-lg print-hide"></div>
      </div>
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
      VIEW: {
        data: {},
        resource: {
          api: '/api/v1/incomes/delivery-loads',
          uri: '/admin/deliveries/delivery-loads'
        }
      },
      rsView: {},
      rsPage: [],
      remain_only: false,
      isDoubleUnit: false
    }
  },
  created () {
    this.init()
  },
  computed: {
    IS_CLOSE () {
      if (this.rsView.deleted_at) return false
      if (['CLOSED'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_VOID () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.revise_id) return false
      if (this.rsView.status !== 'OPEN') return false
      if (Object.keys(this.rsView.has_relationship || {}).length > 0) return false
      return true
    },
    IS_EDITABLE () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.revise_id) return false
      if (this.rsView.status !== 'OPEN') return false
      return true
    }
  },
  methods: {
    init () {
      this.VIEW.load((data) => {
        this.setView(data || {})
      })
    },
    setView (data) {
      this.rsView = data
      this.rsPage = this.rsView.delivery_orders.map((delivery, key) => {
        setTimeout(() => {
          this.loadDelivery(key)
        }, 1000)
        return ({ ...delivery, data: null, error: null })
      })
    },
    getArrayPage (c) {
      if (c.delivery_mode === 'SEPARATE') return ['Material', 'Jasa']
      else return ['']
    },
    isRowMain (row) {
      return Math.round(row.unit_amount) !== Math.round(row.amount_reconcile)
    },
    valQrCode (data) {
      return `/delivery-orders/${data.id}`
      // return `${window.location.origin}/#/admin/deliveries/delivery-orders/${data.id}`
    },
    valPCS (row) {
      if (row.unit_id === 1) {
        return Number(row.quantity)
      } else if (row.item.unit_id === 1) {
        return Number(row.unit_amount)
      } else if (row.item && row.item.item_units) {
        const find = row.item.item_units.find(u => u.unit_id === 1)
        if (find) {
          return (Number(row.unit_amount) / Number(find.rate || 1))
        }
      }
      return null
    },
    valKG (row) {
      if (row.unit_id === 2) {
        return Number(row.quantity)
      } else if (row.item.unit_id === 2) {
        return Number(row.unit_amount)
      } else if (row.item && row.item.item_units) {
        const find = row.item.item_units.find(u => u.unit_id === 2)
        if (find) {
          return (Number(row.unit_amount) / Number(find.rate || 1))
        }
      }
      return null
    },
    loadDelivery (index) {
      const view = this.rsView.delivery_orders[index]
      let url = `/api/v1/incomes/delivery-orders/${view.id}`
      this.$axios.get(url)
        .then((response) => {
          this.rsPage[index].data = response.data
        })
        .catch(error => {
          this.$app.notify.error({ message: error.response.data.message || error.response.statusText }, 'Load Delivery Failed')
          if (error.response) {
            this.rsPage[index].error = error.response.data.message || error.response.statusText
          }
        })
        .finally(() => {
          setTimeout(() => {
            // this.VIEW.loading = false
          }, 1000)
        })
    }
  }
}
</script>
<style lang="stylus">
.info, .info th
  text-transform uppercase
  font-size 11px
  font-weight 500

.table-print
  .q-table tr, .q-table td
    line-height normal
    height unset !important
  .q-table td
    padding-top 2px
    padding-bottom 2px
.sign-tag
  margin-top 40px
  vertical-align bottom

@media print {
  html, body {
      display: block;
      margin: 0 auto
  }

  @page {
    // size:  200mm 125mm;
    size:  21cm 16cm;
  }

  .logo {
    width: 30%;
  }
}
</style>
