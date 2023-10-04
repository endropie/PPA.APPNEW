<template>
<div>
  <div v-for="(cols, indexCols) in COLUMNS" :key="indexCols" class="q-mb-md">
    <q-markup-table  dense bordered square separator="cell" class="table-print no-shadow no-highlight">
      <!-- <template v-for="(cols, indexCols) in COLUMNS"> -->
        <thead :key="`thead-${indexCols}`" class="text-uppercase text-center font-weight-medium" style="page-break-inside: auto">
          <q-tr class="text-uppercase" style="line-height:15px; page-break-after: always;">
            <q-td width="10%" align="center" :rowspan="TOPROW" colspan="3" class="no-padding">{{$tc('label.name', 0, {v:$tc('label.part')}) }}</q-td>
            <q-td v-for="(col, indexCol) in cols" :key="indexCol" width="10%" :delivery-order-id="DELIVERY_ORDERS[col].id">
              <span v-if="DELIVERY_ORDERS[col].delivery_order"> {{DELIVERY_ORDERS[col].delivery_order.fullnumber}} </span>
            </q-td>

            <q-td :rowspan="TOPROW" v-if="COLUMNS.length === indexCols+1" colspan="4"></q-td>
            <q-td width="50%" class="no-padding" style="border-bottom:none;"></q-td>
          </q-tr>

          <q-tr class="text-uppercase" style="line-height:15px" v-if="setting.shows.reference_number">
            <q-td v-for="(col, indexCol) in cols" :key="indexCol" width="10%" :delivery-order-id="DELIVERY_ORDERS[col].id" class="no-padding" >
              <span v-if="DELIVERY_ORDERS[col].delivery_order"> PO: {{ DELIVERY_ORDERS[col].delivery_order.request_reference_number || -'' }} </span>
            </q-td>
            <q-td auto-width class="no-padding" style="border-bottom:none; border-top:none"></q-td>
          </q-tr>
          <q-tr class="text-uppercase" style="line-height:15px" v-if="setting.shows.confirmed_number">
            <q-td v-for="(col, indexCol) in cols" :key="indexCol" width="10%" :delivery-order-id="DELIVERY_ORDERS[col].id">
              <span v-if="DELIVERY_ORDERS[col].delivery_order"> LPB: {{ DELIVERY_ORDERS[col].delivery_order.confirmed_number || '-' }} </span>
            </q-td>

            <q-td auto-width class="no-padding" style="border-bottom:none; border-top:none"></q-td>
          </q-tr>
          <q-tr class="text-uppercase" style="line-height:15px">
            <q-td>CODE</q-td>
            <q-td>{{ $tc('label.part') }}</q-td>
            <q-td>{{ $tc('label.no', 1, {v:$tc('label.part')}) }}</q-td>
            <q-td v-for="(col, indexCol) in cols" :key="indexCol" width="10%" :delivery-order-id="DELIVERY_ORDERS[col].id">
              <span v-if="DELIVERY_ORDERS[col].delivery_order"> {{$app.moment(DELIVERY_ORDERS[col].delivery_order.date).format('L')}} </span>
            </q-td>
            <q-td  v-if="COLUMNS.length === indexCols+1" class="text-bold">{{$tc('label.total')}}</q-td>
            <q-td  v-if="COLUMNS.length === indexCols+1" class="text-bold">{{$tc('label.price')}}</q-td>
            <template v-if="setting.isTotalOnly || rsView.invoice_mode === 'JOIN'">
              <q-td  v-if="COLUMNS.length === indexCols+1" class="text-bold"> Subtotal </q-td>
            </template>
            <template v-else>
              <q-td  v-if="COLUMNS.length === indexCols+1" class="text-bold"> MATERIAL </q-td>
              <q-td  v-if="COLUMNS.length === indexCols+1" class="text-bold"> JASA </q-td>
            </template>
            <q-td auto-width class="no-padding" style="border-bottom:none; border-top:none"></q-td>
          </q-tr>
        </thead>

        <!-- LINE -->
        <q-tr>
          <q-td colspan="2" style="height:0px; padding:0;"> </q-td>
          <q-td  style="height:2px; padding:0;" v-for="(col, indexCol) in cols" :key="indexCol" width="10%"></q-td>
          <q-td auto-width class="no-padding" style="border-bottom:none; border-top:none"></q-td>
        </q-tr>

        <tbody :key="`tbody-${indexCols}`">
          <q-tr v-for="(row, rowIndex) in ROWS" :key="rowIndex">
            <q-td>
              <div v-if="row.item">
                <span>{{row.item.code}}</span>
              </div>
            </q-td>
            <q-td>
              <div v-if="row.item">
                <span>{{row.item.part_name}}</span>
              </div>
            </q-td>
            <q-td>
              <div v-if="row.item">
                <span>[{{row.item.part_subname}}]</span>
              </div>
            </q-td>
            <q-td v-for="(col, indexCol) in cols" :key="indexCol" class="text-center">
              <span v-if="getDataCell (row.data, col)">{{ $app.number_format(getDataCell (row.data, col)) }}</span>
            </q-td>

            <q-td v-if="COLUMNS.length === indexCols+1" class="text-bold text-right">
              <span v-if="row.item" class="text-bold text-right">{{ $app.number_format(row.data.reduce((t, rs) => t + rs.unit_amount, 0)) }}</span>
            </q-td>
            <q-td v-if="COLUMNS.length === indexCols+1" class="text-bold text-right">
              <span v-if="row.item" class="text-bold text-right">{{$app.number_format(getPrice(row.item))}}</span>
            </q-td>
            <template v-if="setting.isTotalOnly || rsView.invoice_mode === 'JOIN'">
              <q-td  v-if="COLUMNS.length === indexCols+1" class="text-bold text-right">
                <span v-if="row.item">{{$app.number_format( getItemSubtotal(rowIndex) )}}</span>
              </q-td>
            </template>
            <template v-else>
              <q-td v-if="COLUMNS.length === indexCols+1" class="text-bold text-right">
                <span v-if="row.item">{{$app.number_format( getItemSubMaterial(rowIndex) )}}</span>
              </q-td>
              <q-td v-if="COLUMNS.length === indexCols+1" class="text-bold text-right">
                <span v-if="row.item">{{$app.number_format( getItemSubJasa(rowIndex) )}}</span>
              </q-td>
            </template>
            <q-td colspan="100%" class="no-padding" style="border-bottom:none; border-top:none"></q-td>
          </q-tr>
        </tbody>
        <!-- LINE  -->
        <q-tr>
          <q-td colspan="100%" style="height:0px; padding:0; border-bottom:0;border-left:1px"> </q-td>
        </q-tr>
    </q-markup-table>
    <template v-if="COLUMNS.length === indexCols+1 && rsView.customer">
      <q-markup-table bordered dense square separator="cell" class="q-mt-lg table-print no-shadow no-highlight">
        <tbody>
          <q-tr class="text-bold" v-if="!setting.isTotalOnly && rsView.customer.invoice_mode !== 'JOIN'">
            <q-td style="width:90%" class="text-right">Grandtotal (Material)</q-td>
            <q-td style="min-width:200px"  class="text-right"> {{$app.number_format(getItemGrandMaterial())}} </q-td>
          </q-tr>
          <q-tr class="text-bold" v-if="!setting.isTotalOnly && rsView.customer.invoice_mode !== 'JOIN'">
            <q-td style="width:90%" class="text-right">Grandtotal (Jasa)</q-td>
            <q-td style="min-width:200px"  class="text-right"> {{$app.number_format(getItemGrandJasa())}} </q-td>
          </q-tr>
          <q-tr class="text-bold" v-if="setting.isTotalOnly || rsView.customer.invoice_mode !== 'SEPARATE'">
            <q-td style="width:90%" class="text-right">Grandtotal</q-td>
            <q-td style="min-width:200px"  class="text-right"> {{$app.number_format(getItemGrand())}} </q-td>
          </q-tr>
        </tbody>
      </q-markup-table>
    </template>
    <div class="hidden" style="page-break-after: always;"></div>
  </div>
</div>
</template>

<script>
export default {
  name: 'ViewDetail3',
  props: {
    rsView: Object,
    setting: Object,
    colx: { type: Number, required: true }
  },
  data () {
    return {
      // data
    }
  },
  computed: {
    TOPROW () {
      let length = 1
      if (this.setting.shows.reference_number === true) length++
      if (this.setting.shows.confirmed_number === true) length++
      return String(length)
    },
    SUMMARY () {
      if (!this.ROWS.length) return []
      return this.ROWS
    },
    ROWS () {
      if (!this.rsView.acc_invoice_items.length) return []
      return this.rsView.acc_invoice_items.reduce((vr, x) => {
        vr[x['item_id']] = (vr[x['item_id']] || { id: x['item_id'], data: [], item: x['item'] })
        vr[x['item_id']].data.push(x)
        return vr
      }, {})
    },
    COLUMNS () {
      // const columns = Object.keys(this.DELIVERY_ORDERS).concat(Object.keys(this.DELIVERY_ORDERS), Object.keys(this.DELIVERY_ORDERS), Object.keys(this.DELIVERY_ORDERS), Object.keys(this.DELIVERY_ORDERS))
      const columns = Object.keys(this.DELIVERY_ORDERS)
      if (!columns.length) return []

      const page = this.colx > 0 ? this.colx : columns.length

      return columns.slice()
        .sort((a, b) => {
          if (this.setting.sortBy === 'confirmed_number') {
            return String(this.DELIVERY_ORDERS[a].delivery_order.confirmed_number) - String(this.DELIVERY_ORDERS[a].delivery_order.confirmed_number)
          }
          return new Date(this.DELIVERY_ORDERS[a].delivery_order.date) - new Date(this.DELIVERY_ORDERS[b].delivery_order.date)
        })
        .reduce((rv, x, i) => {
          (rv[Math.floor((i) / page)] = rv[Math.floor((i) / page)] || []).push(x)
          return rv
        }, [])
    },
    DELIVERY_ORDERS () {
      if (!this.rsView.acc_invoice_items.length) return []

      return this.rsView.acc_invoice_items
        .reduce((rv, x) => {
          rv[x['delivery_order_id']] = (rv[x['delivery_order_id']] || { id: x['delivery_order_id'], data: [], delivery_order: x['delivery_order'] })
          rv[x['delivery_order_id']].data.push(x)
          return rv
        }, {})
    }
  },
  methods: {
    getDataCell (data, col) {
      return data.filter(x => x.delivery_order_id === Number(col)).reduce((t, rs) => { return t + rs.unit_amount }, 0)
    },
    getPrice (item) {
      if (this.rsView.customer.invoice_mode !== 'JOIN' && this.setting.isTotalOnly) {
        const service = this.rsView.customer.sen_service / 100
        if (this.setting.separate === 'MATERIAL') {
          return item.price * (1 - service)
        }
        if (this.setting.separate === 'JASA') {
          return item.price * service
        }
      }
      return item.price
    },
    getItemSum (col) {
      if (!this.ROWS[col]) return 0
      return this.ROWS[col].data.reduce((t, rs) => { return t + rs.unit_amount }, 0)
    },
    getItemSubtotal (col) {
      if (!this.ROWS[col]) return 0
      return this.getItemSum(col) * this.getPrice(this.ROWS[col].item)
    },
    getItemSubMaterial (col) {
      if (!this.ROWS[col]) return 0
      const sen = (this.rsView.customer ? this.rsView.customer.sen_service : 10) / 100

      return (1 - sen) * (this.getItemSum(col) * this.ROWS[col].item.price)
    },
    getItemSubJasa (col) {
      if (!this.ROWS[col]) return 0
      const sen = (this.rsView.customer ? this.rsView.customer.sen_service : 10) / 100
      return sen * (this.getItemSum(col) * this.ROWS[col].item.price)
    },
    getItemGrand () {
      if (!Object.keys(this.ROWS).length) return 0

      return Object.keys(this.ROWS).reduce((gt, code) => {
        if (!this.ROWS[code]) return gt + 0
        const price = this.getPrice(this.ROWS[code].item)
        return gt + (price * this.ROWS[code].data.reduce((t, rs) => {
          return t + rs.unit_amount
        }, 0))
      }, 0)
    },
    getItemGrandMaterial () {
      if (!Object.keys(this.ROWS).length) return 0

      return Object.keys(this.ROWS).reduce((gt, code) => {
        if (!this.ROWS[code]) return gt + 0
        const sen = (this.rsView.customer.sen_service || 10) / 100
        return gt + ((1 - sen) * this.ROWS[code].item.price * this.ROWS[code].data.reduce((t, rs) => {
          return t + rs.unit_amount
        }, 0))
      }, 0)
    },
    getItemGrandJasa () {
      if (!Object.keys(this.ROWS).length) return 0
      return Object.keys(this.ROWS).reduce((gt, code) => {
        if (!this.ROWS[code]) return gt + 0
        const sen = (this.rsView.customer.sen_service || 10) / 100
        return gt + (sen * this.ROWS[code].item.price * this.ROWS[code].data.reduce((t, rs) => {
          return t + rs.unit_amount
        }, 0))
      }, 0)
    }
  }
}
</script>
