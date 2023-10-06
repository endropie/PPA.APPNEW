<template>
<q-page padding class="form-page">
  <q-card inline class="main-box"  v-if="FORM.show">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
        <q-chip slot="optional" v-if="rsForm.status === 'VOID'"
          icon="bookmark"  class="text-weight-medium"
          label="void" color="negative" outline/>

      </form-header>
    </q-card-section>
    <q-separator ></q-separator>
    <!-- COLUMN::1st Transaction details -->
    <q-card-section class="row q-col-gutter-x-md">
      <q-field class="col-12"
        borderless stack-label hide-bottom-space
        :label="$tc('label.mode',1, {v:$tc('label.transaction')})"
        :error="errors.has('transaction')">

        <q-option-group slot="control"
          name="transaction" type="radio" inline
          v-model="rsForm.transaction"
          v-validate="'required'"
          :options="CONFIG.options['transaction_mode']"
          @input="(val) => setTransactionReference(val)"/>

      </q-field>
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <ux-select-filter name="customer" class="col-12"
            :label="$tc('general.customer')"
            v-model="rsForm.customer_id"
            :options="CustomerOptions" clearable
            :disable="IssetItemDetails"
            v-validate="'required'"
            :error="errors.has('customer')"
            :error-message="errors.first('customer')"
            @input="(val) => setCustomerReference(val)">
            <q-badge slot="counter"
              :label="String($tc(`customers.order_${rsForm.order_mode}`).toUpperCase())"
              v-show="Boolean(rsForm.customer_id)"/>
          </ux-select-filter>

          <ux-date name="date" type="date" class="col-8"
            :label="$tc('label.date')" stack-label
            v-model="rsForm.date"
            v-validate="`required|date_format:yyyy-MM-dd|before:${$app.moment().add(1,'days').format('YYYY-MM-DD')}`"
            :date-options="(date) => date <= $app.moment().format('YYYY/MM/DD')"
            :error="errors.has('date')"
            :error-message="errors.first('date')"
            @input="setDateReference"/>

           <q-input name="time" type="time" class="col-4"
            :label="$tc('label.time')" stack-label
            v-model="rsForm.time"
            v-validate="`required`"
            :error="errors.has('time')"
            :error-message="errors.first('time')" />

          <q-input name="registration" class="col-12"
            :label="$tc('warehouses.registration')"
            v-model="rsForm.registration"
            v-validate="'required'"
            :error="errors.has('registration')"
            :error-message="errors.first('registration')"/>
        </div>
      </div>
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <!--  -->
          <q-input class="col-12"
            name="reference_number"
            stack-label :label="$tc('warehouses.reference_number')"
            v-model="rsForm.reference_number"
            v-validate="'required'"
            :error="errors.has('reference_number')"
            :error-message="errors.first('reference_number')"/>

          <ux-date class="col-12"
            name="reference_date" type="date"
            stack-label :label="$tc('warehouses.reference_date')"
            v-model="rsForm.reference_date"
            v-validate="`required|date_format:yyyy-MM-dd|before:${$app.moment().add(1,'days').format('YYYY-MM-DD')}`"
            :date-options="(date) => date <= $app.moment().format('YYYY/MM/DD')"
            :error="errors.has('reference_date')"
            :error-message="errors.first('reference_date')"/>

          <ux-select-filter class="col-12"
            name="vehicle_id"
            :label="$tc('transports.seri')" stack-label
            v-model="rsForm.vehicle_id"
            autocomplete="off"
            :options="VehicleOptions"
            :error="errors.has('vehicle_id')"
            :error-message="errors.first('vehicle_id')" >
            <template slot="after">
              <q-input class="no-padding text-uppercase"
                input-style="width:50px"
                name="rit" type="number" min="0"
                label="RIT"
                v-model="rsForm.rit"
                dense no-error-icon
                v-validate="'min_value:0'"
                :error="errors.has('rit')" />
              <!-- Incoming Items lists -->
            </template>
          </ux-select-filter>

        </div>
      </div>
    </q-card-section>
    <!-- COLUMN::2nd Request orders -->
    <q-separator inset spaced ></q-separator>
    <q-card-section class="row q-col-gutter-sm">

      <div class="col-12">
        <q-markup-table class="main-box bordered no-shadow no-highlight th-uppercase"
          dense separator="horizontal"
          >
            <q-tr>
              <q-th key="prefix"></q-th>
              <q-th key="item_id">{{$tc('items.part_name')}}</q-th>
              <q-th key="part_subname">{{$app.setting('item.subname_label')}}</q-th>
              <q-th key="quantity">{{$tc('label.quantity')}}</q-th>
              <q-th key="unit_id">{{$tc('label.unit')}}</q-th>
            </q-tr>
            <q-tr v-for="(row, index) in rsForm.incoming_good_items" :key="index">
              <q-td  style="width:50px">
                <q-btn dense flat round icon="clear" color="red" tabindex="100" @click="removeItem(index)"/>
              </q-td>
              <q-td width="45%">
                <ux-select-filter autofocus
                  :name="`items.${index}.item_id`"
                  :data-vv-as="$tc('items.part_name')"
                  dense outlined hide-bottom-space color="blue-grey-5"
                  v-model="row.item_id"
                  v-validate="'required'"
                  map-options emit-value
                  :options="ItemOptions" clearable
                  :readonly="Boolean(row.request_order_item_id)"
                  @input="(val)=>{ setItemReference(index, val) }"
                  :loading="SHEET['items'].loading"
                  :error="errors.has(`items.${index}.item_id`)"
                  :error-message="errors.first(`items.${index}.item_id`)"
                />
                <q-tooltip v-if="!IssetCustomerID" :offset="[0, 10]">Select a customer, first! </q-tooltip>

              </q-td>
              <q-td key="part_subname" width="35%" style="min-width:150px">
                <q-input readonly
                  :value="row.item ? row.item.part_subname : null"
                  outlined dense hide-bottom-space color="blue-grey-5"
                   />
              </q-td>
              <q-td width="25%">
                <q-input type="number" min="0" style="min-width:120px"
                  :name="`items.${index}.quantity`"
                  :data-vv-as="$tc('label.quantity')"
                  v-model="row.quantity"
                  v-validate="row.item_id ? 'required' : ''"
                  dense outlined hide-bottom-space no-error-icon color="blue-grey-5"
                  :error="errors.has(`items.${index}.quantity`)"/>
              </q-td>
              <q-td width="25%">
                <q-select style="min-width:100px"
                  :name="`items.${index}.unit_id`"
                  :data-vv-as="$tc('label.unit')"
                  v-model="row.unit_id"
                  dense outlined hide-bottom-space color="blue-grey-5"
                  @input="(val)=> { setUnitReference(index, val) }"
                  :options="ItemUnitOptions[index]"
                  map-options emit-value
                  v-validate="row.item_id ? 'required' : ''"
                  :error="errors.has(`items.${index}.unit_id`)"/>
                <q-input class="hidden" v-model="row.unit_rate" />
              </q-td>
            </q-tr>
            <q-tr>
              <q-td colspan="100%">
                <strong><q-btn dense round @click="addNewItem()" icon="add" color="positive"/></strong>
              </q-td>
            </q-tr>
        </q-markup-table>
      </div>
      <!-- COLUMN::4th Description -->
      <q-input class="col-12"
        name="description" type="textarea" rows="3"
        stack-label :label="$tc('label.description')"
        filled
        v-model="rsForm.description"/>
    </q-card-section>
    <q-separator  />
    <q-card-actions class="q-mx-lg">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" v-if="IS_REVISION" />
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" ><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
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
        customers: { api: '/api/v1/incomes/customers?mode=all' },
        vehicles: { api: '/api/v1/references/vehicles?mode=all' },
        items: { autoload: false, api: '/api/v1/common/items?mode=all' }
      },
      FORM: {
        resource: {
          uri: '/admin/deliveries/incoming-goods',
          api: '/api/v1/warehouses/incoming-goods'
        }
      },
      rsForm: {},
      setDefault: () => {
        return {
          number: null,
          date: this.$app.moment().format('YYYY-MM-DD'),
          time: this.$app.moment().format('HH:mm'),

          customer_id: null,
          reference_number: null,
          reference_date: null,

          transaction: null,
          order_mode: null,

          vehicle_id: null,
          rit: null,
          description: null,
          incoming_good_items: [
            {
              id: null,
              item_id: null,
              item: {},
              quantity: null,

              unit_id: null,
              unit_rate: 1
            }
          ]

        }
      }
    }
  },
  created () {
    // Component Page Mounted!
    this.init()
  },
  computed: {
    IS_REVISION () {
      if (this.FORM.data.deleted_at) return false
      if (this.FORM.data.status === 'REVISED') return false

      return this.$app.can('incoming-goods-validation')
    },
    IssetItemDetails () {
      let items = this.rsForm.incoming_good_items
      for (const i in items) {
        if (items.hasOwnProperty(i)) {
          if (items[i].item_id) return true
        }
      }

      return false
    },
    IssetCustomerID () {
      return (!!this.rsForm.customer_id)
    },
    CustomerOptions () {
      // let label = [item.code, item.name].join('-')
      return (this.SHEET.customers.data.map(item => ({ label: [item.code, item.name].join(' - '), value: item.id })) || [])
    },
    VehicleOptions () {
      return this.SHEET.vehicles.data.map(item => ({
        label: item.number,
        value: item.id
      })
      )
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemOptions () {
      let orItems = []
      if (this.FORM.data.incoming_good_items) {
        orItems = this.FORM.data.incoming_good_items.map(item => item.item_id)
      }

      let Items = this.SHEET.items.data || []
      Items = Items.filter((item) => {
        if (!item.enable && !orItems.find(x => x === item.id)) return false
        return item.customer_id === this.rsForm.customer_id
      })

      return (Items.map(item => ({
        label: item.part_name,
        sublabel: `[${item.customer_code}] ${item.part_subname || '--'}`,
        disable: !item.enable,
        value: item.id }) || []))
    },
    ItemUnitOptions () {
      let vars = []
      for (const i in this.rsForm.incoming_good_items) {
        if (this.rsForm.incoming_good_items.hasOwnProperty(i)) {
          let rsItem = this.rsForm.incoming_good_items[i]
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
      this.rsForm = Object.assign(this.setDefault(), JSON.parse(JSON.stringify(data)))

      if (data.customer_id) this.SHEET.load('items', 'customer_id=' + data.customer_id)
    },
    setDateReference (val) {
      if (this.ROUTE.meta.mode === 'create') {
        if (this.rsForm.date < this.$app.moment().format('YYYY-MM-DD')) this.rsForm.time = null
        else if (this.rsForm.date === this.$app.moment().format('YYYY-MM-DD')) {
          this.rsForm.time = this.$app.moment().format('HH:mm')
        }
      }
    },
    setTransactionReference (val) {
      if (val === 'RETURN') {
        this.rsForm.order_mode = 'NONE'
        return false
      } else if (val === 'REGULER' && this.rsForm.customer_id) {
        this.setCustomerReference(this.rsForm.customer_id)
      }
    },
    setCustomerReference (val) {
      if (!val) {
        this.rsForm.order_mode = null
        return
      }

      if (this.rsForm.customer_id) this.SHEET.load('items', 'customer_id=' + this.rsForm.customer_id)

      if (this.rsForm.transaction !== 'RETURN') {
        const customer = this.MAPINGKEY['customers'][val]
        if (customer) {
          this.rsForm.order_mode = this.MAPINGKEY['customers'][val].order_mode
        }
      } else this.rsForm.order_mode = 'NONE'
    },
    setItemReference (index, val) {
      if (!val) {
        this.rsForm.incoming_good_items[index].unit_id = null
        this.rsForm.incoming_good_items[index].unit_rate = 1
        this.rsForm.incoming_good_items[index].unit = {}
        this.rsForm.incoming_good_items[index].item = {}
      } else {
        this.rsForm.incoming_good_items[index].item = this.MAPINGKEY['items'][val]

        let baseUnitID = this.MAPINGKEY['items'][val].unit_id
        this.rsForm.incoming_good_items[index].unit_id = baseUnitID
        this.rsForm.incoming_good_items[index].unit_rate = 1
        this.rsForm.incoming_good_items[index].unit = this.MAPINGKEY['units'][baseUnitID]
      }
    },
    setUnitReference (index, val) {
      if (!val) return null
      else if (this.rsForm.incoming_good_items[index].item.unit_id === val) {
        this.rsForm.incoming_good_items[index].unit_rate = 1
      } else {
        if (this.rsForm.incoming_good_items[index].item.item_units) {
          this.rsForm.incoming_good_items[index].item.item_units.map((unitItem) => {
            if (unitItem.unit_id === val) this.rsForm.incoming_good_items[index].unit_rate = unitItem.rate
          })
        }
      }
    },

    addNewItem () {
      let newEntri = this.setDefault().incoming_good_items[0]
      this.rsForm.incoming_good_items.push(newEntri)
    },
    removeItem (index) {
      this.rsForm.incoming_good_items.splice(index, 1)
      if (this.rsForm.incoming_good_items.length < 1) this.addNewItem()
    },

    onSave () {
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
        this.FORM.loading = true
        let { method, apiUrl } = this.FORM.meta()
        apiUrl += `/mode=restoration`
        this.$axios.set(method, apiUrl, this.rsForm)
          .then((response) => {
            let message = response.data.number + ' - #' + response.data.id
            this.FORM.response.success({ message: message })
            this.FORM.toView(response.data.id)
          })
          .catch((error) => {
            this.FORM.response.error(error.response || error, 'UPDATE FAILED')
            this.FORM.response.fields(error.response)
          })
          .finally(() => {
            setTimeout(() => {
              this.FORM.loading = false
            }, 2000)
          })
      })
    }
  }
}
</script>
