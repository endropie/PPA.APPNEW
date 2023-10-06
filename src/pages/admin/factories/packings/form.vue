<template>
<q-page padding class="form-page">
  <q-card inline class="main-box q-ma-sm " v-if="FORM.show">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
      </form-header>
    </q-card-section>
    <q-separator />
    <q-card-section class="row q-col-gutter-x-md">
      <!-- COLUMN::1st Packing Identitity -->
      <div class="col-12 row">
        <q-field dense borderless class="col-12 col-sm-grow"
          prefix="WorkTime"
          :error="errors.has('worktime')"
          :error-message="errors.first('worktime')">
          <q-option-group slot="control"
            name="worktime" type="radio" inline
            v-model="rsForm.worktime"
            v-validate="'required'"
            :options="CONFIG.options['worktime']"
          />
        </q-field>
      </div>

      <ux-select-filter class="col-12 col-md-6"
        name="customer_id"
        v-model="rsForm.customer_id"
        :label="$tc('general.customer')"
        :disable="IssetItemID"
        v-validate="'required'"
        :options="CustomerOptions" clearable
        @input="setCustomerReference"
        :error="errors.has('customer_id')"
        :error-message="errors.first('customer_id')"
        :loading="SHEET['customers'].loading" />

      <ux-date class="col-12 col-md-6" name="date"
        :label="$tc('label.date')"
        no-error-icon
        v-model="rsForm.date" type="date"
        v-validate="'required'"
        :error="errors.has('date')"
        :error-message="errors.first('date')"
      >

        <q-select slot="after" class="no-padding" style="min-width:100px"
          name="shift_id"
          hide-dropdown-icon no-error-icon
          :label="$tc('label.shift')" stack-label
          v-model="rsForm.shift_id"
          v-validate="'required'"
          :options="ShiftOptions" filter
          map-options emit-value
          :error="errors.has('shift_id')"
        />

      </ux-date>

      <ux-select class="col-12 col-sm-12 col-md-6" style="min-width:250px"
        name="operator_id"
        label="Operator"
        v-model="rsForm.operator"
        filter clearable
        :source-keys="['name', 'code']"
        source="/api/v1/common/employees?mode=all&limit=15&sort=name"
        :option-sublabel="(ol) => ol ? `NP: ${ol.code}`  : undefined" option-label="name" option-value="id"
        @selected="(ol) => rsForm.operator_id = (ol ? ol.id : null)"
        v-validate="'required'" data-vv-as="Operator"
        :error="errors.has('operator_id')" da-vv-as="Operator"
        :error-message="errors.first('operator_id')"
      />

      <ux-datetime class="col-12 col-sm-6 col-md-3" name="begin_datetime" ref="begin_datetime"
        :data-vv-as="$tc('label.begin')"
        :label="$tc('label.begin')" stack-label
        v-model="rsForm.begin_datetime"
        v-validate="'required'"
        :error="errors.has('begin_datetime')"
        :error-message="errors.first('begin_datetime')"
        no-error-icon
      />

      <ux-datetime class="col-12 col-sm-6 col-md-3" name="until_datetime" ref="until_datetime"
        :data-vv-as="$tc('label.until')"
        :label="$tc('label.until')" stack-label
        v-model="rsForm.until_datetime"
        v-validate="`required|after_datetime:${rsForm.begin_datetime}`"
        :error="errors.has('until_datetime')"
        :error-message="errors.first('until_datetime')"
        no-error-icon
      />
    </q-card-section>
    <q-separator spaced />
    <q-card-section class="q-py-none">
      <div class="row q-col-gutter-x-md">
        <ux-select dense outlined class="col-12 col-sm-9"
          :disable="Boolean(!rsForm.customer_id) || Boolean(rsForm.packing_items.packing_item_orders.find(x => x.work_order_item))"
          name="packing_items.item_id"
          :label="$tc('general.item')"
          :data-vv-as="$tc('general.item')"
          v-model="rsForm.packing_items.item" clearable
          v-validate="'required'"
          popup-content-class="options-striped"
          filter
          :source="`/api/v1/common/items?mode=all&has_stocks=WIP&customer_id=${rsForm.customer_id}&--with=item_units`"
          option-value="id"
          :option-label="(opt) => opt.part_name"
          :option-sublabel="(opt) => opt.part_subname"
          :error="errors.has('packing_items.item_id')"
          :error-message="errors.first('packing_items.item_id')"
          no-error-icon
          @input="(v) => {
            this.rsForm.packing_items.unit = v ? v.unit : null
            this.rsForm.packing_items.item_id = v ? v.id : null
            this.rsForm.packing_items.unit_id = v ? v.unit_id : null
            this.rsForm.packing_items.unit_rate = 1
          }" >

          <q-field slot="after" label="Subname" readonly>
            <div slot="control" v-if="this.rsForm.packing_items.item" class="self-center align-center text-caption">
              [{{ this.rsForm.packing_items.item.customer_code }}] {{ this.rsForm.packing_items.item.part_subname }}
            </div>
          </q-field>
          <q-select slot="after" class="no-padding" style="min-width:100px"
            :disable="Boolean(!rsForm.packing_items.item) || Boolean(rsForm.packing_items.packing_item_orders.find(x => x.work_order_item))"
            name="packing_items.unit_id"
            :label="$tc('label.unit')" stack-label
            :data-vv-as="$tc('label.unit')"
            no-error-icon
            v-model="rsForm.packing_items.unit"
            :options="ItemUnitOptions"
            option-value="id"
            option-label="code"
            v-validate="'required'"
            :error="errors.has('packing_items.unit_id')"
            @input="(v) => {
              rsForm.packing_items.unit_id = v ? v.id : null
              rsForm.packing_items.unit_rate = v ? v.rate : 1
            }"
          />
        </ux-select>
        <q-input readonly dense outlined class="col-12 col-sm-3"
          name="packing_items.quantity"
          :label="$tc('label.quantity')" stack-label
          :data-vv-as="$tc('label.quantity')"
          v-model="rsForm.packing_items.quantity" type="number" :min="0"
          v-validate="`required|${MinValidate}|max_value:${MaxUnit}`"
          :suffix="rsForm.packing_items.item_id ? `/ ${$app.number_format(MaxUnit)}` : ''"
          :error="errors.has(`packing_items.quantity`)"
          :error-message="errors.first(`packing_items.quantity`)"
          no-error-icon
        />
      </div>
      <div class="text-h6">OK</div>
      <div class="q-mb-md">
        <q-markup-table dense flat>
          <tbody>
            <tr v-for="(rowOrder, orderKey) in rsForm.packing_items.packing_item_orders" :key="orderKey">
              <td class="text-center no-padding">
                <q-btn dense outline color="blue-grey" icon="clear" @click="removeItemOrder(orderKey)" />
              </td>
              <td class="text-left">
                <ux-select dense outlined hide-bottom-space
                  :disable="!rsForm.packing_items.item"
                  :name="`packing_items.packing_item_orders.${orderKey}.work_order_item_id`"
                  :label="$tc('general.work_order')"
                  :data-vv-as="$tc('general.item')"
                  v-model="rowOrder.work_order_item" clearable
                  v-validate="`excluded_value:id,${rsForm.packing_items.packing_item_orders.filter((x,i) => i !== orderKey).map(x => x.work_order_item_id).join(',')}`"
                  popup-content-class="options-striped"
                  filter map-options
                  :source="`/api/v1/factories/work-orders/items?mode=all&has_amount_packing=true&item_id=${rsForm.packing_items.item_id}&or_detail_ids=${rowOrder.work_order_item_id}`"
                  option-value="id"
                  :option-label="(opt) => `${opt.work_order_number} (#${opt.id})`"
                  :option-sublabel="(opt) => `Date: ${$app.date_format(opt.work_order_date)} [${opt.work_order_shift}]`"
                  :option-stamp="(opt) => `QTY: ${opt.quantity}`"
                  :error="errors.has(`packing_items.packing_item_orders.${orderKey}.work_order_item_id`)"
                  :error-message="errors.first(`packing_items.packing_item_orders.${orderKey}.work_order_item_id`)"
                  @input="(v) => {
                    rowOrder.work_order_item_id = v ? v.id : null
                  }"
                />
              </td>
              <td class="text-right">
                <ux-numeric dense outlined hide-bottom-space
                  :options="{ decimalPlaces: DecimalPlaces }"
                  :disable="!rowOrder.work_order_item"
                  :name="`packing_items.packing_item_orders.${orderKey}.quantity`"
                  :label="$tc('label.quantity')" stack-label
                  :suffix="`/ ${$app.number_format(MaxOrderUnit[orderKey],0)}`"
                  :data-vv-as="$tc('label.quantity')"
                  v-model="rowOrder.quantity" type="number" :min="0"
                  @input="setPackingItemQuantity"
                  v-validate="`${rowOrder.work_order_item ? 'required' : ''}|gt_value:0|max_value:${(MaxOrderUnit[orderKey])}`"
                  :error="errors.has(`packing_items.packing_item_orders.${orderKey}.quantity`)"
                  :error-message="errors.first(`packing_items.packing_item_orders.${orderKey}.quantity`)"
                />
              </td>
            </tr>
            <tr>
              <td class="no-padding"></td>
              <td colspan="100%">
                <q-btn outline color="blue-grey" icon="add" :label="$tc('form.add_new')" @click="addNewItemOrder()" class="fit" />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </q-card-section>
    <q-separator spaced />
    <q-card-section class="q-py-none">
      <div class="column ">
        <div class="row">
          <span class="col-grow text-h6">
            FAULTY
          </span>
          <div class="" style="min-width:200px">
            <q-select dense outlined name="type_fault_id"
              label="Type of Faulty"
              v-model="rsForm.packing_items.type_fault_id"
              v-validate="''"
              :options="TypeFaultOptions" clearable
              map-options emit-value
              :error="errors.has('type_fault_id')"
              :error-message="errors.first('type_fault_id')"
              :disable="rsForm.packing_items.packing_item_faults.some(x => Boolean(x.fault_id))"
              @input="(x) => {
                if (!x) {
                  rsForm.packing_items.packing_item_faults = []
                  addNewItemFault()
                }
              }"
            />
          </div>
        </div>

        <q-markup-table class="main-box bordered no-shadow no-highlight th-uppercase"
          dense separator="horizontal"
          v-show="rsForm.packing_items.type_fault_id">
          <q-tr>
            <q-th key="prefix" width="50px"></q-th>
            <q-th key="work_order_id" width="40%">{{ $tc('general.work_order') }}</q-th>
            <q-th key="quantity" width="30%">{{$tc('label.quantity')}}</q-th>
            <q-th key="fault_id" width="30%">{{$tc('items.fault')}}</q-th>
          </q-tr>
          <q-tr v-for="(row, faultKey) in rsForm.packing_items.packing_item_faults" :key="faultKey">
            <q-td key="prefix">
              <q-btn dense flat  icon="clear" color="red" @click="removeItemFault(faultKey)"/>
            </q-td>
            <q-td>
              <ux-select dense outlined hide-bottom-space
                :disable="!rsForm.packing_items.type_fault_id"
                :name="`packing_items.packing_item_faults.${faultKey}.work_order_item_id`"
                :label="$tc('general.work_order')"
                :data-vv-as="$tc('general.work_order')"
                v-model="row.work_order_item" clearable
                v-validate="`${rsForm.packing_items.type_fault_id ? 'required' : ''}`"
                popup-content-class="options-striped"
                filter map-options
                :source="`/api/v1/factories/work-orders/items?mode=all&has_amount_packing=true&item_id=${rsForm.packing_items.item_id}&or_detail_ids=${row.work_order_item_id}`"
                option-value="id"
                :option-label="(opt) => `${opt.work_order_number} (#${opt.id})`"
                :option-sublabel="(opt) => `Date: ${$app.date_format(opt.work_order_date)} [${opt.work_order_shift}]`"
                :option-stamp="(opt) => `QTY: ${opt.quantity}`"
                :error="errors.has(`packing_items.packing_item_faults.${faultKey}.work_order_item_id`)"
                :error-message="errors.first(`packing_items.packing_item_faults.${faultKey}.work_order_item_id`)"
                @input="(v) => {
                  row.work_order_item_id = v ? v.id : null
                }"
              />
            </q-td>
            <q-td key="quantity">
              <q-input autofocus input-class="text-center"
                :name="`packing_items.packing_item_faults.${faultKey}.quantity`"
                type="number" min="0" align="center"
                :suffix="`/ ${$app.number_format(MaxFaultUnit[faultKey],0)}`"
                outlined dense hide-bottom-space no-error-icon color="blue-grey"
                v-model="row.quantity"
                v-validate="`${row.work_order_item ? 'required' : ''}|gt_value:0|max_value:${(MaxFaultUnit[faultKey])}`"
                :data-vv-as="$tc('label.quantity')"
                :error="errors.has(`packing_items.packing_item_faults.${faultKey}.quantity`)"
                />
            </q-td>
            <q-td key="fault_id">
              <ux-select-filter
                :name="`packing_items.packing_item_faults.${faultKey}.fault_id`"
                outlined style="min-width:150px"
                dense hide-bottom-space no-error-icon color="blue-grey"
                v-model="row.fault_id"
                :options="FaultOptions" clearable
                :disable="!row.quantity"
                v-validate="row.quantity ? 'required' : ''"
                data-vv-as="fault"
                :error="errors.has(`packing_items.packing_item_faults.${faultKey}.fault_id`)"
              />
            </q-td>
          </q-tr>

          <q-tr>
            <q-td></q-td>
            <q-td colspan="100%">
              <q-btn dense outline :label="$tc('form.add')" icon="add_circle_outline" color="blue-grey" class="full-width" @click="addNewItemFault()" />
            </q-td>
          </q-tr>
        </q-markup-table>
      </div>

    </q-card-section>
     <q-card-section class="row q-col-gutter-x-md">
      <!-- COLUMN::4th Description -->
      <div class="col-12 column">
        <q-input name="description" type="textarea" rows="3"
          stack-label :label="$tc('label.description')"
          filled
          v-model="rsForm.description"
        />
      </div>

    </q-card-section>
    <q-separator />
    <q-card-actions :vertical="$q.screen.lt.sm">
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" />
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)" />
      <q-space v-if="!$q.screen.lt.sm" />
      <q-btn :label="$tc('form.list')" icon="list" color="dark" :to="`${FORM.resource.uri}?return`"/>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading">
    <q-spinner-dots size="70px" color="primary" />
  </q-inner-loading>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      SHEET: {
        units: { api: '/api/v1/references/units?mode=all' },
        shifts: { api: '/api/v1/references/shifts?mode=all' },
        faults: { api: '/api/v1/references/faults?mode=all' },
        type_faults: { api: '/api/v1/references/type-faults?mode=all' },
        customers: { api: '/api/v1/incomes/customers?mode=all' },
        employees: { api: '/api/v1/common/employees?mode=all', autoload: false },
        items: { autoload: false, api: '/api/v1/common/items?mode=all&enable=true' },
        // work_orders: {autoload:false, api:'/api/v1/factories/work-orders?mode=all&has_amount_packing=true'},
        work_order_items: { autoload: false, api: '/api/v1/factories/work-orders?mode=items&has_amount_packing=true' }
      },
      FORM: {
        resource: {
          uri: '/admin/factories/packings',
          api: '/api/v1/factories/packings'
        }
      },
      rsForm: null,
      rsData: {},
      setDefault: () => {
        return {
          number: null,
          customer_id: null,

          date: this.$app.moment().format('YYYY-MM-DD'),
          begin_datetime: this.$app.moment().format('YYYY-MM-DD 00:00'),
          until_datetime: this.$app.moment().format('YYYY-MM-DD 00:00'),
          shift_id: null,
          worktime: 'REGULER',
          description: null,
          operator_id: null,

          packing_items: {
            item_id: null,
            unit_id: null,
            unit_rate: 1,
            item: null,
            unit: null,
            quantity: 0,
            type_fault_id: null,
            packing_item_orders: [
              {
                work_order_item: null,
                work_order_item_id: null,
                quantity: null
              }
            ],
            packing_item_faults: [
              {
                id: null,
                work_order_item: null,
                work_order_item_id: null,
                fault_id: null,
                quantity: null
              }
            ]
          }
        }
      }
    }
  },
  created () {
    this.init()
  },
  computed: {
    MinValidate () {
      if (this.rsForm.packing_items.packing_item_faults.some(x => Boolean(x.quantity))) {
        return 'min:0'
      }
      return 'gt_value:0'
    },
    DecimalPlaces () {
      if (!this.rsForm) return 0
      if (!this.rsForm.packing_items.unit) return 0

      return this.rsForm.packing_items.unit.decimal_in || 0
    },
    IssetItemID () {
      if (!this.rsForm.hasOwnProperty('packing_items')) return false

      return (!!this.rsForm.packing_items.item_id)
    },
    WorkOrderItemOptions () {
      if (!this.rsForm.customer_id) return []
      if (!this.SHEET.work_order_items.data.length) return []

      const hasold = (id) => (this.FORM.data.packing_items && this.FORM.data.packing_items.work_order_item_id === id)
        ? Number(this.FORM.data.packing_items.unit_total) : 0

      let data = this.SHEET.work_order_items.data.filter(item => {
        if ((item.amount_process) <= (item.amount_packing - hasold(item.id))) return false
        return true
      })

      return data.map(item => {
        item.amount_packing -= hasold(item.id)
        let total = (Number(item.amount_process) - Number(item.amount_packing))
        return ({
          label: item.work_order.fullnumber || item.work_order.number,
          value: item.id,
          rowdata: item,
          stamp: this.$app.number_format(total)
        })
      })
    },
    TypeFaultOptions () {
      return (this.SHEET.type_faults.data.map(item => ({ label: item.name, value: item.id })) || [])
    },
    FaultOptions () {
      if (!this.rsForm.packing_items.type_fault_id) return []

      let data = this.SHEET.faults.data
      data = data.filter(x => x.type_fault_id === this.rsForm.packing_items.type_fault_id)

      return (data.map(item => ({ label: item.name, value: item.id })) || [])
    },
    ShiftOptions () {
      return (this.SHEET.shifts.data.map(item => ({ ...item, label: item.name, value: item.id })) || [])
    },
    CustomerOptions () {
      return (this.SHEET.customers.data.map(item => ({ label: [item.code, item.name].join(' - '), value: item.id })) || [])
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ ...item, label: item.code, value: item.id })) || [])
    },
    ItemOptions () {
      if (!this.WorkOrderItemOptions.length) return []

      const hasItems = this.WorkOrderItemOptions.map(x => ({
        id: x.rowdata.item_id,
        total: Number(x.rowdata.amount_process) - Number(x.rowdata.amount_packing)
      }))

      const total = (id) => {
        let UnitRate = 1
        if (this.rsForm.packing_items.item_id && this.rsForm.packing_items.item_id === id) {
          UnitRate = this.rsForm.packing_items.unit_rate || 1
        }

        return hasItems.reduce((calc, item) => {
          const add = item.id === id ? Number(item.total) : 0
          return Number(calc) + add
        }, 0) / UnitRate
      }

      let Items = this.SHEET.items.data.filter((item) => {
        if (!hasItems.find(x => item.id === x.id)) return false

        return item.customer_id === this.rsForm.customer_id
      })
      return (Items.map(item => ({
        label: item.part_name,
        sublabel: `[${item.customer_code}] ${item.part_subname || '--'}`,
        value: item.id,
        stamp: this.$app.number_format(total(item.id)),
        disable: !item.enable,
        rowdata: item
      })) || [])
    },
    ItemUnitOptions () {
      let rsItem = this.rsForm.packing_items
      return this.UnitOptions.map((unit) => {
        unit.rate = null
        if (rsItem.item) {
          if (rsItem.item.unit_id === unit.value) unit.rate = 1
          else if (rsItem.item.item_units) {
            let find = rsItem.item.item_units.find((fill) => fill.unit_id === unit.value)
            if (find) unit.rate = find.rate
          }
        }
        return unit
      }).filter(x => x.rate) || []
    },
    MaxUnit () {
      const rsItem = this.rsForm.packing_items
      const oldItem = this.FORM.data.packing_items
      if (!rsItem.item) return 0
      const stock = rsItem.item.totals['WIP'] / (rsItem.unit_rate || 1)
      const faults = rsItem.packing_item_faults.reduce((sum, item) => Number(item.quantity) + sum, 0)
      return (rsItem.id ? (oldItem.quantity + oldItem.faulty) : 0) + (stock || 0) - faults
    },
    MaxOrderUnit () {
      let rsItem = this.rsForm.packing_items
      if (!rsItem.item_id) return []

      const sumUseFault = (id) => {
        return rsItem.packing_item_faults
          .filter((x) => x.work_order_item_id === id)
          .reduce((t, x) => t + Number(x.quantity), 0)
      }

      return rsItem.packing_item_orders.map((orderDetail) => {
        if (!orderDetail.work_order_item) return 0

        return Number(orderDetail.id ? orderDetail.quantity : 0) +
              Number(orderDetail.work_order_item.amount_process / (rsItem.unit_rate || 1)) -
              Number(orderDetail.work_order_item.amount_packing / (rsItem.unit_rate || 1)) -
              Number(orderDetail.work_order_item.amount_faulty / (rsItem.unit_rate || 1)) -
              Number(sumUseFault(orderDetail.work_order_item_id))
      })
    },
    MaxFaultUnit () {
      let rsItem = this.rsForm.packing_items
      if (!rsItem.item_id) return []

      const sumOtherUse = (id, key) => {
        return rsItem.packing_item_faults
          .filter((x, i) => x.work_order_item_id === id && i !== key)
          .reduce((t, x) => t + Number(x.quantity), 0)
      }

      const sumOldestUse = (id, key) => {
        return this.FORM.data.packing_items.packing_item_faults
          .filter((x, i) => x.work_order_item_id === id)
          .reduce((t, x) => t + Number(x.quantity), 0)
      }

      return rsItem.packing_item_faults.map((faultDetail, faultKey) => {
        if (!faultDetail.work_order_item) return 0
        return Number(sumOldestUse(faultDetail.work_order_item_id, faultKey)) +
              // Number(faultDetail.id ? faultDetail.quantity : 0) +
              Number(faultDetail.work_order_item.amount_process / (rsItem.unit_rate || 1)) -
              Number(faultDetail.work_order_item.amount_packing / (rsItem.unit_rate || 1)) -
              Number(faultDetail.work_order_item.amount_faulty / (rsItem.unit_rate || 1)) -
              Number(sumOtherUse(faultDetail.work_order_item_id, faultKey))
      })
    },
    MAPINGKEY () {
      let variables = {
        'customers': {},
        'units': {},
        'items': {}
      }

      this.SHEET['customers'].data.map(value => { variables['customers'][value.id] = value })
      this.SHEET['units'].data.map(value => { variables['units'][value.id] = value })
      this.SHEET['items'].data.map(value => { variables['items'][value.id] = value })

      return variables
    }
  },
  watch: {
    '$route': 'init'
  },
  methods: {
    init () {
      this.FORM.load((data) => {
        this.setForm(data || this.setDefault())
      })
    },
    setForm (data) {
      this.rsForm = JSON.parse(JSON.stringify(data))

      if (data.customer_id) {
        this.SHEET.load('items', 'customer_id=' + data.customer_id)

        const params = [
          `customer_id=${data.customer_id}`
          // FOR EDIT ONLY
          // `or_detail_ids=${data.packing_items.work_order_item_id}`,
        ]
        this.SHEET.load('work_order_items', params.join('&'))
      }

      if (data.hasOwnProperty('has_relationship') && data['has_relationship'].length > 0) {
        this.FORM.has_relationship = data.has_relationship
        this.FORM.onRelationship({
          title: 'Packing Good has relation!',
          message: data['has_relationship'].join('-'),
          then: () => this.$router.push(`${this.FORM.resource.uri}/${data.id}/view`)
        })
      }
    },
    setCustomerReference (val) {
      if (!val) {
        this.rsForm.packing_items.item_id = null
      } else {
        this.SHEET.load('items', 'customer_id=' + val)
        const params = [`customer_id=${val}`]
        if (this.FORM.data.packing_items && this.FORM.data.packing_items.work_order_item_id) {
          params.push(`or_detail_ids=${this.FORM.data.packing_items.work_order_item_id}`)
        }
        this.SHEET.load('work_order_items', params.join('&'))
      }
    },

    addNewItemOrder (autofocus = true) {
      let newEntri = this.setDefault().packing_items.packing_item_orders[0]
      this.rsForm.packing_items.packing_item_orders.push(newEntri)
    },
    removeItemOrder (index) {
      this.rsForm.packing_items.packing_item_orders.splice(index, 1)
      this.rsForm.packing_items.quantity = this.rsForm.packing_items.packing_item_orders.reduce((sum, dtl) => Number(dtl.quantity) + sum, 0)
      if (this.rsForm.packing_items.packing_item_orders.length < 1) this.addNewItemOrder()
    },

    addNewItemFault (autofocus = true) {
      let newEntri = this.setDefault().packing_items.packing_item_faults[0]

      this.rsForm.packing_items.packing_item_faults.push(newEntri)
    },
    removeItemFault (index) {
      this.rsForm.packing_items.packing_item_faults.splice(index, 1)
      if (this.rsForm.packing_items.packing_item_faults.length < 1) this.addNewItemFault()
    },

    setPackingItemQuantity () {
      this.rsForm.packing_items.quantity = this.rsForm.packing_items.packing_item_orders.reduce((sum, dtl) => Number(dtl.quantity) + sum, 0)
    },

    onSave () {
      const submit = () => {
        this.$q.loading.show()
        let { method, apiUrl } = this.FORM.meta()
        this.$axios.set(method, apiUrl, this.rsForm)
          .then(response => {
            let message = response.data.number + ' - #' + response.data.id
            this.FORM.response.success({ message: message })
            this.FORM.toView(response.data.id)
          })
          .catch((error) => {
            this.FORM.response.fields(error.response)
            this.FORM.response.error(error.response || error, 'SAVE FAILED')
          })
          .finally(() => {
            this.$q.loading.hide()
          })
      }

      this.$validator.validate().then((result, items) => {
        if (!result) return this.$q.notify({ color: 'negative', icon: 'error', position: 'top-right', timeout: 3000, message: this.$tc('messages.to_complete_form') })

        this.$q.dialog({
          title: this.$tc('form.confirm'),
          message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.save') }),
          cancel: true,
          persistent: true
        }).onOk(() => {
          submit()
        })
      })
    }
  }
}
</script>
