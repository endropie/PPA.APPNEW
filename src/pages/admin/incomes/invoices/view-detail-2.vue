<template>
<div>
  <div v-for="(cols, indexCols) in COLUMNS" :key="indexCols" class="q-mb-md">
    <q-markup-table bordered dense square separator="cell" class="table-print no-shadow no-highlight">

      <!-- HEADER -->
      <thead :key="`thead-${indexCols}`" class="text-uppercase text-center font-weight-medium" style="page-break-inside: auto">
        <q-tr class="" style="line-height:25px; page-break-after: always;">
          <q-td rowspan="3" width="10%">{{ $tc('label.date') }}</q-td>
          <q-td rowspan="3" width="10%">{{ $tc('label.number') }}</q-td>
          <q-td rowspan="3" width="10%" v-if="setting.shows.reference_number">{{ $tc('label.reference') }}</q-td>
          <q-td rowspan="3" width="10%" v-if="setting.shows.confirmed_number">LPB</q-td>
          <q-td v-for="(col, indexCol) in cols" :key="indexCol" width="10%">
            {{ITEMS[col].item.code }}
          </q-td>
          <q-td auto-width class="no-padding bg-transparent" style="border-bottom:none;"></q-td>
        </q-tr>

        <q-tr style="line-height:25px" class="text-uppercase">
          <q-td v-for="(col, indexCol) in cols" :key="indexCol" width="10%">
            {{ITEMS[col].item.part_name}}
          </q-td>
          <q-td auto-width class="no-padding bg-transparent" style="border-bottom:none; border-top:none"></q-td>
        </q-tr>
        <q-tr style="line-height:25px" class="text-uppercase">
          <q-td v-for="(col, indexCol) in cols" :key="indexCol" width="10%">
            {{ITEMS[col].item.part_subname}}
          </q-td>
          <q-td auto-width class="no-padding bg-transparent" style="border-bottom:none; border-top:none"></q-td>
        </q-tr>
      </thead>

      <!-- LINE -->
      <q-tr>
        <!-- <q-td style="height:0px; padding:0;"> </q-td>
        <q-td style="height:0px; padding:0;"> </q-td>
        <q-td style="height:0px; padding:0;"> </q-td> -->
        <q-td :colspan="LEFTCOL" style="height:0px; padding:0;"> </q-td>
        <q-td v-for="(col, indexCol) in cols" :key="indexCol" style="height:2px; padding:0;" width="10%"></q-td>
        <q-td style="border-top:none;border-bottom:none;"></q-td>
      </q-tr>

        <!-- BODY -->
        <!-- <tbody v-for="(loop, ii) in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]" :key="`tbody-${ii}-${indexCols}`"> -->
        <tbody :key="`tbody-${indexCols}`">
          <q-tr v-for="(row, index) in ROWS" :key="index" :delivery-order-item-id="row.id">
            <q-td>{{row.delivery_order ? $app.moment(row.delivery_order.date).format('L') : '-'}}</q-td>
            <q-td>
              <div v-if="row.delivery_order">
                {{row.delivery_order.fullnumber}}
              </div>
            </q-td>
            <q-td v-if="setting.shows.reference_number">
              <div v-if="row.delivery_order">
                {{row.delivery_order.request_reference_number || '-'}}
                <!-- <div class="text-small text-grey-7" style="line-height:normal;margin-top: -4px">LPB: {{row.delivery_order.confirmed_number}}</div> -->
              </div>
            </q-td>
            <q-td v-if="setting.shows.confirmed_number">
              <div v-if="row.delivery_order">
                {{row.delivery_order.confirmed_number || '-'}}
              </div>
            </q-td>
            <q-td v-for="(col, indexCol) in cols" :key="indexCol" class="text-center">
              <div v-if="getDataCell(row.data, col)">
                {{$app.number_format(getDataCell(row.data, col), 0)}}
              </div>
              <span v-if="Number(row.item_id) === Number(col)">{{$app.number_format(row.unit_amount,0)}}</span>
            </q-td>
            <q-td auto-width class="no-padding bg-transparent" style="border-bottom:none; border-top:none"></q-td>
          </q-tr>
        </tbody>
        <!-- FOOTER -->
        <tbody :key="`tfoot-${indexCols}`" class="t-foot">
          <q-tr>
            <q-td :colspan="LEFTCOL" class="text-right">Jumlah</q-td>
            <q-td v-for="(col, indexCol) in cols" :key="indexCol" class="text-center">
              <span class="text-medium text-bold">{{ $app.number_format(getItemSum(col),0) }}</span>
            </q-td>
            <q-td auto-width class="no-padding bg-transparent" style="border-top:none; border-bottom:none"></q-td>
          </q-tr>
          <q-tr>
            <q-td :colspan="LEFTCOL" class="text-right"> {{ $tc('label.price') }}</q-td>
            <q-td v-for="(col, indexCol) in cols" :key="indexCol" class="text-center">
              <span class="text-medium" v-if="ITEMS[col].item">{{ $app.number_format(getPrice(ITEMS[col].item)) }}</span>
            </q-td>
            <q-td auto-width class="no-padding bg-transparent" style="border-top:none;border-bottom:none"></q-td>
          </q-tr>
          <template v-if="setting.isTotalOnly || rsView.invoice_mode === 'JOIN'">
            <q-tr>
              <q-td :colspan="LEFTCOL" class="text-right"> Subtotal </q-td>
              <q-td v-for="(col, indexCol) in cols" :key="indexCol" class="text-center">
                <span class="text-medium" v-if="ITEMS[col].item">{{ $app.number_format(getItemSubtotal(col)) }}</span>
              </q-td>
              <q-td auto-width class="no-padding bg-transparent" style="border-top:none;"></q-td>
            </q-tr>
          </template>
          <template v-else>
            <q-tr>
              <q-td :colspan="LEFTCOL" class="text-right"> Subtotal (Material)</q-td>
              <q-td v-for="(col, indexCol) in cols" :key="indexCol" class="text-center">
                <span class="text-medium" v-if="ITEMS[col].item">{{ $app.number_format(getItemSubMaterial(col)) }}</span>
              </q-td>
              <q-td auto-width class="no-padding bg-transparent" style="border-top:none;border-bottom:none"></q-td>
            </q-tr>
            <q-tr>
              <q-td :colspan="LEFTCOL" class="text-right"> Subtotal (Jasa)</q-td>
              <q-td v-for="(col, indexCol) in cols" :key="indexCol" class="text-center">
                <span class="text-medium" v-if="ITEMS[col].item">{{ $app.number_format(getItemSubJasa(col)) }}</span>
              </q-td>
              <q-td auto-width class="no-padding bg-transparent" style="border-top:none;"></q-td>
            </q-tr>
          </template>
        </tbody>
      <!-- </template> -->
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
  name: 'ViewDetail2',
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
    LEFTCOL () {
      let length = 2
      if (this.setting.shows.reference_number === true) length++
      if (this.setting.shows.confirmed_number === true) length++
      return String(length)
    },
    COLUMNS () {
      // const columns = Object.keys(this.ITEMS).concat(Object.keys(this.ITEMS), Object.keys(this.ITEMS), Object.keys(this.ITEMS), Object.keys(this.ITEMS))
      const columns = Object.keys(this.ITEMS)
      if (!columns.length) return []
      const page = this.colx > 0 ? this.colx : columns.length
      return columns.reduce((vc, x, i) => {
        (vc[Math.floor((i) / page)] = vc[Math.floor((i) / page)] || []).push(x)
        return vc
      }, [])
    },
    ROWS () {
      if (!this.rsView.acc_invoice_items.length) return []
      const rows = this.rsView.acc_invoice_items
        .reduce((vr, x) => {
          vr[x['delivery_order_id']] = (vr[x['delivery_order_id']] || { id: x['delivery_order_id'], data: [], delivery_order: x['delivery_order'] })
          vr[x['delivery_order_id']].data.push(x)
          return vr
        }, {})

      if (this.setting.sortBy === 'confirmed_number') {
        return Object.values(rows).sort((a, b) => String(a.delivery_order.confirmed_number) - String(b.delivery_order.confirmed_number))
      }
      return Object.values(rows).sort((a, b) => new Date(a.delivery_order.date) - new Date(b.delivery_order.date))
    },
    ITEMS () {
      if (!this.rsView.acc_invoice_items.length) return []
      return this.rsView.acc_invoice_items.reduce((rv, x) => {
        rv[x['item_id']] = (rv[x['item_id']] || { id: x['item_id'], data: [], item: x['item'] })
        rv[x['item_id']].data.push(x)
        return rv
      }, {})
    }
  },
  methods: {
    getDataCell (data, col) {
      return data.filter(x => x.item_id === Number(col)).reduce((t, rs) => { return t + rs.unit_amount }, 0)
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
      if (!this.ITEMS[col]) return 0
      return this.ITEMS[col].data.reduce((t, rs) => { return t + rs.unit_amount }, 0)
    },
    getItemSubtotal (col) {
      if (!this.ITEMS[col]) return 0
      return this.getItemSum(col) * this.getPrice(this.ITEMS[col].item)
    },
    getItemSubMaterial (col) {
      if (!this.ITEMS[col]) return 0
      const sen = (this.rsView.customer ? this.rsView.customer.sen_service : 10) / 100

      return (1 - sen) * (this.getItemSum(col) * this.ITEMS[col].item.price)
    },
    getItemSubJasa (col) {
      if (!this.ITEMS[col]) return 0
      const sen = (this.rsView.customer ? this.rsView.customer.sen_service : 10) / 100
      return sen * (this.getItemSum(col) * this.ITEMS[col].item.price)
    },
    getItemGrand () {
      if (!Object.keys(this.ITEMS).length) return 0

      return Object.keys(this.ITEMS).reduce((gt, code) => {
        if (!this.ITEMS[code]) return gt + 0
        const price = this.getPrice(this.ITEMS[code].item)
        return gt + (price * this.ITEMS[code].data.reduce((t, rs) => {
          return t + rs.unit_amount
        }, 0))
      }, 0)
    },
    getItemGrandMaterial () {
      if (!Object.keys(this.ITEMS).length) return 0

      return Object.keys(this.ITEMS).reduce((gt, code) => {
        if (!this.ITEMS[code]) return gt + 0
        const sen = (this.rsView.customer.sen_service || 10) / 100
        return gt + ((1 - sen) * this.ITEMS[code].item.price * this.ITEMS[code].data.reduce((t, rs) => {
          return t + rs.unit_amount
        }, 0))
      }, 0)
    },
    getItemGrandJasa () {
      if (!Object.keys(this.ITEMS).length) return 0
      return Object.keys(this.ITEMS).reduce((gt, code) => {
        if (!this.ITEMS[code]) return gt + 0
        const sen = (this.rsView.customer.sen_service || 10) / 100
        return gt + (sen * this.ITEMS[code].item.price * this.ITEMS[code].data.reduce((t, rs) => {
          return t + rs.unit_amount
        }, 0))
      }, 0)
    }
  }
}
</script>
<style>
.t-foot td {
  color: #232323 !important;
  font-weight: bold;
}
</style>
