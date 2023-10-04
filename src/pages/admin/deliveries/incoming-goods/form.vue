<template>
<q-page padding class="form-page">
  <q-card inline class="main-box" v-if="FORM.show">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
        <q-chip slot="optional" v-if="rsForm.status === 'VOID'"
          icon="bookmark"  class="text-weight-medium"
          label="void" color="negative" outline/>
      </form-header>
    </q-card-section>
    <q-separator />
    <!-- COLUMN::1st Transaction details -->
    <q-card-section class="row q-col-gutter-x-md">
      <q-field class="col-12"
        borderless stack-label hide-bottom-space
        :label="$tc('label.mode',1, {v:$tc('label.transaction')})"
        :disable="Boolean(rsForm.id) || IssetItemDetails"
        :error="errors.has('transaction')">

        <q-option-group slot="control"
          name="transaction" type="radio" inline
          v-model="rsForm.transaction"
          v-validate="'required'"
          :disable="Boolean(rsForm.id) || IssetItemDetails"
          :options="CONFIG.options['transaction_mode'].concat({ 'label': 'SAMPLE', 'value': 'SAMPLE' }, { 'label': 'INTERNAL', 'value': 'INTERNAL' })"
          @input="(val) => setTransactionReference(val)"/>

      </q-field>
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <ux-select name="customer" class="col-12"
            :label="$tc('general.customer')"
            v-model="rsForm.customer_id"
            filter emit-value map-options
            :options="CustomerOptions" clearable
            :disable="Boolean(rsForm.id) || IssetItemDetails"
            v-validate="'required'"
            :error="errors.has('customer')"
            :error-message="errors.first('customer')"
            @input="(val) => setCustomerReference(val)">
            <q-badge slot="counter"
              :label="String($tc(`customers.order_${rsForm.order_mode}`).toUpperCase())"
              v-if="Boolean(rsForm.customer_id) && rsForm.transaction == 'REGULER'" />
          </ux-select>

          <ux-date name="date" type="date" class="col-8"
            :label="$tc('warehouses.incoming_date')" stack-label
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
            :error-message="errors.first('time')"
          />

          <ux-select class="col-12"
            name="vehicle_id"
            :label="$tc('transports.seri')" stack-label
            v-model="rsForm.vehicle_id"
            autocomplete="off"
            filter emit-value map-options
            :options="VehicleOptions"
            :error="errors.has('vehicle_id')"
            :error-message="errors.first('vehicle_id')" >

            <q-select slot="after" class="no-padding" style="min-width:80px"
              name="rit" label="RIT"
              v-model="rsForm.rit" clearable
              no-error-icon hide-dropdown-icon
              :options="RitOptions" options-dense
              v-validate="'min_value:0'"
              :error="errors.has('rit')"
            />
          </ux-select>

        </div>
      </div>
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <!--  -->
          <q-input class="col-12"
            name="reference_number"
            stack-label :label="$tc('warehouses.reference_number')"
            v-model="rsForm.reference_number"
            v-validate="isNotSample(`required`)"
            :error="errors.has('reference_number')"
            :error-message="errors.first('reference_number')"/>

          <ux-date class="col-12"
            name="reference_date" type="date"
            stack-label :label="$tc('warehouses.reference_date')"
            v-model="rsForm.reference_date"
            v-validate="isNotSample(`required|date_format:yyyy-MM-dd|before:${$app.moment().add(1,'days').format('YYYY-MM-DD')}`)"
            :date-options="(date) => date <= $app.moment().format('YYYY/MM/DD')"
            :error="errors.has('reference_date')"
            :error-message="errors.first('reference_date')"
          />

          <q-input name="registration" class="col-12"
            :label="$tc('warehouses.registration')"
            v-model="rsForm.registration"
            v-validate="isNotSample(`required`)"
            :error="errors.has('registration')"
            :error-message="errors.first('registration')"
          />
        </div>
      </div>
    </q-card-section>
    <!-- COLUMN::2nd Request orders -->
    <q-card-section class="q-gutter-sm q-pt-none">
      <q-markup-table flat bordered square class="main-box no-highlight th-uppercase"
        dense separator="horizontal"
      >
        <thead>
          <q-tr>
            <q-th key="prefix"></q-th>
            <q-th key="lots" v-if="IS_LOTS">{{$tc('label.lots')}}</q-th>
            <q-th key="item_id">{{ $tc('items.part_name') }}</q-th>
            <q-th key="part_subname">{{$app.setting('item.subname_label')}}</q-th>
            <q-th key="quantity">QTY</q-th>
            <q-th key="unit_id">{{ $tc('label.unit')}}</q-th>
            <q-th key="valid">Actual QTY</q-th>
            <q-th key="note">{{ $tc('label.note')}}</q-th>
          </q-tr>
        </thead>
        <tbody>
          <q-tr v-for="(row, index) in rsForm.incoming_good_items" :key="index">
            <q-td  style="width:50px">
              <q-btn dense flat="" @click="removeItem(index)" icon="clear" tabindex="100" color="negative"/>
            </q-td>
            <q-td width="20%" v-if="IS_LOTS">
              <q-input
                color="blue-grey-5"
                :name="`incoming_good_items.${index}.lots`"
                v-model="row.lots"
                outlined dense hide-bottom-space  no-error-icon
                v-validate="'required'"
                :error="errors.has(`incoming_good_items.${index}.lots`)" />
            </q-td>
            <q-td width="20%">
              <ux-select autofocus
                :name="`incoming_good_items.${index}.item_id`"
                dense outlined hide-bottom-space no-error-icon color="blue-grey-5"
                v-model="row.item_id"
                v-validate="'required'"
                filter map-options emit-value
                :options="ItemOptions" clearable
                popup-content-class="options-striped"
                :readonly="Boolean(!rsForm.customer_id || !rsForm.transaction)"
                @input="(val)=>{ setItemReference(index, val) }"
                :loading="SHEET['items'].loading"
                :error="errors.has(`incoming_good_items.${index}.item_id`)">
              </ux-select>
              <q-tooltip v-if="!Boolean(rsForm.customer_id)" :offset="[0, 10]">Select a customer, First! </q-tooltip>
              <q-tooltip v-if="!Boolean(rsForm.transaction)" :offset="[0, 10]">Select a transaction, First! </q-tooltip>
            </q-td>
            <q-td key="part_subname" width="20%" style="min-width:150px">
              <q-input readonly
                :value="row.item ? row.item.part_subname : null"
                outlined dense hide-bottom-space color="blue-grey-5"
              />
            </q-td>
            <q-td width="15%">
              <q-input type="number" min="0" style="min-width:120px"
                :data-vv-as="$tc('label.quantity')"
                :name="`incoming_good_items.${index}.quantity`"
                v-model="row.quantity"
                @input="(v) => {
                  if (rsForm.transaction === 'INTERNAL') row.valid = v
                }"
                v-validate="row.item_id ? 'required|gt_value:0' : ''"
                dense outlined hide-bottom-space no-error-icon color="blue-grey-5"
                :error="errors.has(`incoming_good_items.${index}.quantity`)"
              />
            </q-td>
            <q-td width="15%">
              <q-select style="min-width:100px"
                :name="`incoming_good_items.${index}.unit_id`"
                :data-vv-as="$tc('label.unit')"
                v-model="row.unit_id"
                dense outlined hide-bottom-space color="blue-grey-5"
                @input="(val)=> { setUnitReference(index, val) }"
                :options="ItemUnitOptions[index]"
                map-options emit-value
                v-validate="row.item_id ? 'required' : ''"
                :error="errors.has(`incoming_good_items.${index}.unit_id`)"
              />
              <q-input class="hidden" v-model="row.unit_rate" />
            </q-td>
            <q-td width="15%">
              <q-input type="number" min="0" style="min-width:120px"
                :readonly="rsForm.transaction === 'INTERNAL'"
                :data-vv-as="$tc('label.quantity', { v: 'valid' })"
                :name="`incoming_good_items.${index}.valid`"
                v-model="row.valid"
                v-validate="row.item_id ? 'required|min:0' : ''"
                dense outlined hide-bottom-space no-error-icon color="blue-grey-5"
                :error="errors.has(`incoming_good_items.${index}.valid`)"
              />
            </q-td>
            <q-td width="20%">
              <q-input
                v-model="row.note"
                outlined dense hide-bottom-space color="blue-grey-5"
              />
            </q-td>

          </q-tr>
          <q-tr >
            <q-td></q-td>
            <q-td colspan="100%">
              <q-btn dense outline icon-right="add_circle" color="primary" class="full-width"
                :label="$tc('form.add', 2)"
                @click="addNewItem()" />
            </q-td>
          </q-tr>
        </tbody>
      </q-markup-table>
      <!-- COLUMN::4th Description -->
      <q-input filled
        name="description" type="textarea" rows="3"
        stack-label
        :label="$tc('label.description')"
        v-model="rsForm.description"/>
    </q-card-section>
    <q-separator />
    <q-card-actions class="q-mx-lg">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" v-if="IS_EDITABLE"
        :loading="FORM.loading" />
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
        vehicles: { api: '/api/v1/references/vehicles?mode=all&type=DELIVERY' },
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
              valid: null,

              unit_id: null,
              unit_rate: 1,
              note: null,
              lots: null
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
    IS_LOTS () {
      if (this.rsForm.transaction !== 'REGULER') return false
      if (this.rsForm.order_mode !== 'NONE') return false
      if (!this.MAPINGKEY.customers[this.rsForm.customer_id]) return false
      return this.MAPINGKEY.customers[this.rsForm.customer_id].order_lots
    },
    IS_EDITABLE () {
      if (Object.keys(this.FORM.data.has_relationship || {}).length > 0) return false

      return this.$app.can('incoming-goods-update')
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
    RitOptions () {
      let rits = []
      for (let i = 0; i < 10; i++) rits.push(i + 1)
      return rits
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
      this.rsForm = JSON.parse(JSON.stringify(data))

      if (this.rsForm.customer_id) {
        const additonal = this.rsForm.transaction === 'SAMPLE' ? `&sample_in=SAMPLE` : ''
        this.SHEET.load('items', `customer_id=${this.rsForm.customer_id}${additonal}`)
      }

      if (data.hasOwnProperty('has_relationship') && Object.keys(data['has_relationship']).length > 0) {
        this.FORM.response.relationship({
          title: 'Incoming goods has relations!',
          messages: data['has_relationship'],
          then: () => this.$router.push(`${this.FORM.resource.uri}/${data.id}`)
        })
      }
    },
    setDateReference (val) {
      if (this.ROUTE.meta.mode === 'create') {
        if (this.rsForm.date < this.$app.moment().format('YYYY-MM-DD')) this.rsForm.time = null
        else if (this.rsForm.date === this.$app.moment().format('YYYY-MM-DD')) {
          this.rsForm.time = this.$app.moment().format('HH:mm')
        }
      }
    },
    isNotSample (v) {
      return this.rsForm.transaction !== 'SAMPLE' ? v : ''
    },
    setTransactionReference (val) {
      if (val === 'RETURN') { this.rsForm.order_mode = 'NONE' } else { this.rsForm.order_mode = null }

      this.setCustomerReference(this.rsForm.customer_id)
    },
    setCustomerReference (val) {
      if (!val) return

      if (this.rsForm.customer_id) {
        const additonal = this.rsForm.transaction === 'SAMPLE' ? `&sample_in=SAMPLE` : ''
        this.SHEET.load('items', `customer_id=${this.rsForm.customer_id}${additonal}`)
      }

      if (this.rsForm.transaction === 'REGULER') {
        const customer = this.MAPINGKEY['customers'][val]
        if (customer) {
          this.rsForm.order_mode = this.MAPINGKEY['customers'][val].order_mode
        }
      }
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
      if (!val) return undefined
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

    addNewItem (autofocus) {
      autofocus = autofocus || false
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
          this.$q.notify({
            color: 'negative',
            icon: 'error',
            position: 'top-right',
            timeout: 3000,
            message: this.$tc('messages.to_complete_form')
          })

          return
        }
        this.FORM.loading = true
        let { method, apiUrl } = this.FORM.meta()
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
