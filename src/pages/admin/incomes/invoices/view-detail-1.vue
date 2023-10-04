<template>
<div>
  <q-markup-table dense bordered square separator="cell" class="table-print no-shadow no-highlight">
    <thead class="text-uppercase text-center font-weight-medium">
      <q-tr style="line-height:25px" class="text-uppercase">
        <q-td width="10%">{{ $tc('label.date') }}</q-td>
        <q-td width="10%">{{ $tc('label.number') }}</q-td>
        <q-td width="10%" v-if="setting.shows.reference_number">REFERENSI</q-td>
        <q-td width="10%" v-if="setting.shows.confirmed_number">LPB</q-td>
        <q-td width="30%">{{ $tc('label.name', 1, {v: $tc('label.part')}) }}</q-td>
        <q-td width="10%">{{ $tc('label.unit') }}</q-td>
        <q-td width="10%">{{ $tc('label.quantity') }}</q-td>
        <q-td width="30%">{{ $tc('label.encasement') }}</q-td>
      </q-tr>
    </thead>
    <tbody>
      <q-tr v-for="(row, index) in  rsView.acc_invoice_items" :key="index" :delivery-order-item-id="row.id">
        <q-td>{{row.delivery_order ? $app.moment(row.delivery_order.date).format('L') : '-'}}</q-td>
        <q-td>
          <div v-if="row.delivery_order" class="column">
            <span>{{row.delivery_order.fullnumber}}</span>
          </div>
        </q-td>
        <q-td v-if="setting.shows.reference_number">{{row.delivery_order.reference_number}}</q-td>
        <q-td v-if="setting.shows.confirmed_number">{{row.delivery_order.confirmed_number}}</q-td>
        <q-td>
          <div v-if="row.item" class="column">
            [{{row.item.code}}] {{row.item.part_name}}
          </div>
        </q-td>
        <q-td class="text-center">{{row.unit.code}}</q-td>
        <q-td class="text-right">{{$app.number_format(row.quantity,0)}}</q-td>
        <q-td class="text-right">{{row.encasement}}</q-td>
      </q-tr>
    </tbody>
    <tbody>
      <q-tr class="text-uppercase text-bold"  v-if="!setting.isTotalOnly && rsView.customer.invoice_mode !== 'JOIN'">
        <q-td></q-td>
        <q-td></q-td>
        <q-td v-if="setting.shows.reference_number"></q-td>
        <q-td v-if="setting.shows.confirmed_number"></q-td>
        <q-td colspan="2" width="40%" align="right">SUBTOTAL (MATERIAL)</q-td>
        <q-td width="10%" align="right">{{ $app.number_format(getItemGrandMaterial()) }}</q-td>
        <q-td width="30%"></q-td>
      </q-tr>
      <q-tr class="text-uppercase text-bold"  v-if="!setting.isTotalOnly && rsView.customer.invoice_mode !== 'JOIN'">
        <q-td></q-td>
        <q-td></q-td>
        <q-td v-if="setting.shows.reference_number"></q-td>
        <q-td v-if="setting.shows.confirmed_number"></q-td>
        <q-td colspan="2" width="40%" align="right">SUBTOTAL (JASA)</q-td>
        <q-td width="10%" align="right">{{ $app.number_format(getItemGrandJasa()) }}</q-td>
        <q-td width="30%"></q-td>
      </q-tr>
      <q-tr class="text-uppercase text-bold"  v-if="setting.isTotalOnly || rsView.customer.invoice_mode !== 'SEPARATE'">
        <q-td></q-td>
        <q-td></q-td>
        <q-td v-if="setting.shows.reference_number"></q-td>
        <q-td v-if="setting.shows.confirmed_number"></q-td>
        <q-td colspan="2" width="40%" align="right">GRAND TOTAL</q-td>
        <q-td width="10%" align="right">{{ $app.number_format(getItemGrand()) }}</q-td>
        <q-td width="30%"></q-td>
      </q-tr>
    </tbody>
  </q-markup-table>
</div>
</template>

<script>
export default {
  name: 'ViewDetail1',
  props: {
    rsView: Object,
    setting: Object
  },
  data () {
    return {
      // data
    }
  },
  methods: {
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
    getItemGrand () {
      if (!this.rsView) return 0
      if (!this.rsView.acc_invoice_items.length) return 0

      return this.rsView.acc_invoice_items.reduce((gt, detail) => {
        const price = this.getPrice(detail.item)
        return gt + (price * detail.unit_amount)
      }, 0)
    },
    getItemGrandMaterial () {
      if (!this.rsView) return 0
      if (!this.rsView.acc_invoice_items.length) return 0

      return this.rsView.acc_invoice_items.reduce((gt, detail) => {
        const sen = (this.rsView.customer.sen_service || 10) / 100
        return gt + (detail.item.price * detail.unit_amount * (1 - sen))
      }, 0)
    },
    getItemGrandJasa () {
      if (!this.rsView) return 0
      if (!this.rsView.acc_invoice_items.length) return 0

      return this.rsView.acc_invoice_items.reduce((gt, detail) => {
        const sen = (this.rsView.customer.sen_service || 10) / 100
        return gt + (detail.item.price * detail.unit_amount * sen)
      }, 0)
    }
  }
}
</script>
