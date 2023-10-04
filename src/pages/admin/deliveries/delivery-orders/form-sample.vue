<template>
<q-page padding class="form-page justify-center">
  <q-card inline class="main-box" v-if="FORM.show">
    <q-card-section class="q-py-xs">
      <form-header :title="FORM.title('SAMPLE')" :subtitle="`# ` + rsForm.fullnumber || rsForm.number || FORM.subtitle()" hide-menu>
        <template  slot="menu-append">
          <ux-chip-status square outline :row="rsForm" v-if="rsForm.status" />
        </template>
      </form-header>
    </q-card-section>
    <q-separator />
    <q-card-section class="row q-col-gutter-x-md">
      <q-field class="col-12"
        borderless stack-label hide-bottom-space
        :label="$tc('label.mode',1, {v:$tc('label.transaction')})"
        :dark="LAYOUT.isDark"
        :disable="Boolean(rsForm.id) || IssetItemDetails"
        :error="errors.has('transaction')">

        <q-option-group slot="control"
          name="transaction" type="radio" inline
          v-model="rsForm.transaction"
          v-validate="'required'"
          :dark="LAYOUT.isDark"
          :disable="Boolean(rsForm.id) || IssetItemDetails || true"
          :options="CONFIG.options['transaction_mode'].concat({ 'label': 'SAMPLE', 'value': 'SAMPLE' })"
        />
        <q-tooltip> FOR SAMPLE ONLY </q-tooltip>

      </q-field>
      <!-- COLUMN::1st delivery detail -->
      <div class="col-12 col-md-6" >
        <ux-select
          name="customer_id"
          :label="$tc('general.customer')"  stack-label
          v-model="rsForm.customer"
          :disable="Boolean(rsForm.id) || IssetItemDetails"
          source="api/v1/incomes/customers?mode=all"
          :option-label="(item) => `[${item.code}] ${item.name}`"
          option-value="id"
          filter clearable
          :error="errors.has('customer_id')"
          :error-message="errors.first('customer_id')"
          @input="(v) => {
            rsForm.customer_id = v ? v.id : null
            rsForm.customer_name = v ? v.name : null
            rsForm.customer_phone = v ? v.phone : null
            rsForm.customer_address = v ? v.address_raw : null
          }"
        />
        <div class="row q-col-gutter-x-sm">
          <ux-date class="col-12 col-sm-6"
            name="date" type="date"
            stack-label label="Date"
            v-model="rsForm.date"
            :dark="LAYOUT.isDark"
            v-validate="'required'"
            :error="errors.has('date')"
            :error-message="errors.first('date')"
          />
          <ux-select class="coll-12 col-sm-6"
            name="vehicle_id"
            :label="$tc('general.vehicle')"  stack-label
            v-model="rsForm.vehicle_id"
            source="api/v1/references/vehicles?mode=all&type=DELIVERY"
            option-label="number"
            option-value="id"
            filter emit-value map-options clearable
            :error="errors.has('vehicle_id')"
            :error-message="errors.first('vehicle_id')"
          />
        </div>
      </div>
      <!-- COLUMN::2nd Customer Identity -->
      <div class="col-12 col-md-6" >
        <div class="row q-col-gutter-x-sm">
          <q-input class="col" name="customer_name"
            :label="$tc('label.name')"  stack-label
            v-model="rsForm.customer_name"
            :dark="LAYOUT.isDark"
            v-validate="'required'"
            :error="errors.has('customer_name')" />

          <q-input class="col-12 col-sm-auto" name="customer_phone"
            :label="$tc('label.phone')"  stack-label
            v-model="rsForm.customer_phone"
            :dark="LAYOUT.isDark"
            v-validate="''"
            :error="errors.has('customer_phone')"/>
        </div>
        <q-input type="textarea" autogrow rows="3"
          name="customer_address"
          :label="$tc('label.address')"  stack-label
          :dark="LAYOUT.isDark"
          v-model="rsForm.customer_address"
        />
      </div>
    </q-card-section>
    <q-separator inset />
    <!-- SINGLE-REVISION -->
    <q-card-section>
      <!-- COLUMN:: Part items lists -->
      <q-markup-table bordered class="main-box no-shadow no-highlight"
        dense separator="horizontal"
        :dark="LAYOUT.isDark">
        <thead>
          <q-tr class="text-uppercase" style="line-height:30px">
            <q-th key="prefix" width="50px"></q-th>
            <q-th key="part" width="50%">{{$tc('items.part_name')}}</q-th>
            <q-th key="quantity" width="30%">{{$tc('label.quantity')}}</q-th>
            <q-th key="unit_id" width="20%">{{$tc('label.unit')}}</q-th>
          </q-tr>
        </thead>
        <tbody>
          <q-tr v-if="!rsForm.delivery_order_items.length">
            <q-td colspan="100%" class="justify-center">
              <q-input  class="hidden"
                :name="`delivery_order_items.length`"
                :value="rsForm.delivery_order_items.length"
                v-validate="`gt_value:0`"
              />
              <div class="q-pa-sm text-center text-subtitle1 text-negative"
               v-if="errors.has(`delivery_order_items.length`)">
                <q-icon name="error" size="sm" color="negative" />
                {{$tc('messages.no_details')}}
              </div>
            </q-td>
          </q-tr>
          <q-tr v-for="(row, index) in rsForm.delivery_order_items" :key="index">
            <q-td key="prefix" style="width:50px">
              <q-btn dense flat round icon="clear" color="red" @click="removeDetail(index)"/>
            </q-td>
            <q-td key="part" width="30%">
              <ux-select
                class="native-top"
                :name="`delivery_order_items.${index}.item_id`"
                dense outlined hide-bottom-space
                color="blue-grey"
                v-model="row.item"
                :disable="!Boolean(rsForm.customer_id && rsForm.transaction)"
                filter clearable
                :source="`/api/v1/common/items?mode=all&customer_id=${rsForm.customer_id}` + (rsForm.transaction == 'SAMPLE' ? '&sample_in=SAMPLE' : '')"
                :option-label="(item) => item.part_name"
                :option-sublabel="(item) => `[${item.customer_code}] ${item.part_subname || '-'}`"
                option-value="id"
                v-validate="`required`"
                :error="errors.has(`delivery_order_items.${index}.item_id`)"
                @input="(v) => {
                  row.item_id = v ? v.id : null
                }"
              >
                <small v-if="row.item_id && row.item && row.item.part_subname" class="absolute-bottom">
                  [{{row.item.customer_code}}] {{row.item.part_subname}}
                </small>
              </ux-select>
            </q-td>
            <q-td key="quantity" width="25%">
              <q-input
                type="number" style="min-width:120px"
                :name="`delivery_order_items.${index}.quantity`"
                v-model="row.quantity"
                outlined dense color="blue-grey-5"
                hide-bottom-space no-error-icon
                :dark="LAYOUT.isDark"
                v-validate="`required`"
                :error="errors.has(`delivery_order_items.${index}.quantity`)"
              />
            </q-td>
            <q-td key="unit_id" width="20%" >
              <q-select style="min-width:100px"
                :name="`delivery_order_items.${index}.unit_id`"
                v-model="row.unit_id"
                outlined dense color="blue-grey-5"
                hide-bottom-space no-error-icon
                map-options emit-value
                :options="ItemUnitOptions[index]"
                :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                v-validate="row.item_id ? 'required' : ''"
                :error="errors.has(`delivery_order_items.${index}.unit_id`)"
                @input="(val)=>{ setUnitReference(index, val) }"
              />
            </q-td>
          </q-tr>
          <q-tr>
            <td colspan="100%">
              <q-btn color="primary" icon="add_circle" :label="$tc('form.add')"  @click="addNewDetail()" />
            </td>
          </q-tr>
          <q-tr>
            <q-td colspan="100%">
              <q-input type="textarea" autogrow class="q-mt-sm"
                name="description"
                :data-vv-as="$tc('label.description')"
                :label="$tc('label.description')" stack-label
                filled :dark="LAYOUT.isDark"
                v-model="rsForm.description"/>
            </q-td>
          </q-tr>
        </tbody>
      </q-markup-table>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark" />
    <q-card-actions class="q-mx-lg">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" v-if="IS_REVISE"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" :dark="LAYOUT.isDark">
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
        items: { autoload: false, api: '/api/v1/common/items?mode=all' },
        customers: { api: '/api/v1/incomes/customers?mode=all' },
        employees: { api: '/api/v1/common/employees?mode=all' },
        vehicles: { api: '/api/v1/references/vehicles?mode=all&type=DELIVERY' },
        units: { api: '/api/v1/references/units?mode=all' }
      },
      FORM: {
        resource: {
          api: '/api/v1/incomes/delivery-orders',
          uri: '/admin/deliveries/delivery-orders'
        }
      },
      rsForm: null,
      setDefault: () => {
        return {
          number: null,
          transaction: 'SAMPLE',
          date: this.$app.moment().format('YYYY-MM-DD'),

          customer_id: null,
          customer_name: null,
          customer_phone: null,
          customer_address: null,

          vehicle_id: null,
          revise_id: null,
          revise_number: 0,
          description: null,
          delivery_order_items: [{
            id: null,
            item_id: null,
            item: null,
            unit_id: null,
            unit: null,
            quantity: null,
            unit_rate: 1
          }]
        }
      }
    }
  },
  created () {
    // Component Page Created!
    this.init()
  },
  computed: {
    IssetItemDetails () {
      if (!this.rsForm.delivery_order_items) return false
      return Boolean(this.rsForm.delivery_order_items.find(x => x.item_id))
    },
    IS_REVISE () {
      if (this.rsForm.deleted_at) return false
      if (this.rsForm.is_internal) return false
      if (this.rsForm.reconcile_id && this.rsForm.status !== 'OPEN') return false
      return true
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemUnitOptions () {
      let vars = []
      for (const i in this.rsForm.delivery_order_items) {
        if (this.rsForm.delivery_order_items.hasOwnProperty(i)) {
          let rsItem = this.rsForm.delivery_order_items[i]
          vars[i] = (this.UnitOptions || [])
          vars[i] = vars[i].filter((unit) => {
            if (!rsItem.item_id) return false
            if (rsItem.item) {
              if (rsItem.item.unit_id === unit.value) return true
              if (rsItem.item.item_units) {
                let filtered = rsItem.item.item_units.filter((fill) => fill.unit_id === unit.value)
                if (filtered.length > 0) return true
              }
            }
            return false
          })
        }
      }
      return vars
    },
    MAPINGKEY () {
      let variables = {
        'units': {}
      }
      this.SHEET['units'].data.map(value => { variables['units'][value.id] = value })
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
    setUnitReference (index, val) {
      if (!val) return undefined

      if (this.rsForm.delivery_order_items[index].item.unit_id === val) {
        this.rsForm.delivery_order_items[index].unit_rate = 1
      } else {
        if (this.rsForm.delivery_order_items[index].item.item_units) {
          this.rsForm.delivery_order_items[index].item.item_units.map((itemUnit) => {
            if (itemUnit.unit_id === val) this.rsForm.delivery_order_items[index].unit_rate = itemUnit.rate
          })
        }
      }
    },
    setForm (data) {
      this.rsForm = Object.assign({}, this.setDefault(), data)
      this.SHEET.load('items', `customer_id=${this.rsForm.customer_id}`)
    },

    addNewDetail (entri, partitionIndex) {
      const newitem = this.setDefault().delivery_order_items[0]
      this.rsForm.delivery_order_items.push(newitem)
    },
    removeDetail (index) {
      this.rsForm.delivery_order_items.splice(index, 1)
      if (!this.rsForm.delivery_order_items.length) this.addNewDetail()
    },
    onSave () {
      const submit = () => {
        this.FORM.loading = true
        const { apiUrl, method } = this.FORM.meta()
        this.$axios.set(method, `${apiUrl}?mode=sample`, this.rsForm)
          .then((response) => {
            let message = response.data.number + ' - #' + response.data.id
            this.FORM.response.success({ message: message })
            this.FORM.toView(response.data.id)
          })
          .catch((error) => {
            this.FORM.response.fields(error.response)
            this.FORM.response.error(error.response || error, 'REVISION FAILED')
          })
          .finally(() => {
            this.FORM.loading = false
          })
      }
      this.$validator.validate().then(result => {
        if (!result) {
          return this.$q.notify({
            color: 'negative',
            icon: 'error',
            position: 'top-right',
            timeout: 3000,
            message: this.$tc('messages.to_complete_form')
          })
        }

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
