<template>
<q-page padding class="form-page">
  <q-card inline class="main-box" v-if="FORM.show">
    <q-card-section>
      <form-header
        :title="`${$tc('general.incoming_good')} - PARTIAL VALIDATION`.toUpperCase()"
        :subtitle="FORM.subtitle()" >
        <q-chip slot="optional" v-if="rsForm.status === 'VOID'"
          icon="bookmark"  class="text-weight-medium"
          label="void" color="negative" outline/>
      </form-header>
    </q-card-section>
    <q-separator></q-separator>
    <!-- COLUMN::1st Transaction details -->
    <q-card-section class="row q-col-gutter-x-md">
      <q-field class="col-12" readonly
        borderless stack-label hide-bottom-space
        :label="$tc('label.mode',1, { v:$tc('label.transaction') })"
        :error="errors.has('transaction')">

        <q-option-group slot="control" disable
          name="transaction" type="radio" inline
          v-model="rsForm.transaction"
          v-validate="'required'"
          :options="CONFIG.options['transaction_mode'].concat({ 'label': 'SAMPLE', 'value': 'SAMPLE' })"
        />

      </q-field>
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <ux-select-filter class="col-12"
            name="customer"
            :label="$tc('general.customer')"
            v-model="rsForm.customer_id"
            :options="CustomerOptions" clearable readonly
            v-validate="'required'"
            :error="errors.has('customer')"
            :error-message="errors.first('customer')"
          >
            <q-badge slot="counter"
              :label="String($tc(`customers.order_${rsForm.order_mode}`).toUpperCase())"
              v-if="Boolean(rsForm.customer_id && rsForm.transaction == 'REGULER')"/>
          </ux-select-filter>
          <ux-date class="col-8"
            name="date" type="date"
            :label="$tc('label.date')" stack-label
            v-model="rsForm.date" readonly
            v-validate="`required|date_format:yyyy-MM-dd|before:${$app.moment().add(1,'days').format('YYYY-MM-DD')}`"
            :date-options="(date) => date <= $app.moment().format('YYYY/MM/DD')"
            :error="errors.has('date')"
            :error-message="errors.first('date')"
          />

           <q-input class="col-4"
            name="time" type="time"
            :label="$tc('label.time')" stack-label
            v-model="rsForm.time" readonly
            v-validate="`required`"
            :error="errors.has('time')"
            :error-message="errors.first('time')" />

          <q-input class="col-12"
            name="registration"
            :label="$tc('warehouses.registration')"
            v-model="rsForm.registration" readonly
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
            v-model="rsForm.reference_number" readonly
            v-validate="'required'"
            :error="errors.has('reference_number')"
            :error-message="errors.first('reference_number')"/>

          <ux-date class="col-12"
            name="reference_date" type="date"
            stack-label :label="$tc('warehouses.reference_date')"
            v-model="rsForm.reference_date" readonly
            v-validate="'required'"
            :error="errors.has('reference_date')"
            :error-message="errors.first('reference_date')"/>

          <ux-select-filter class="col-12"
            name="vehicle_id"
            :label="$tc('transports.seri')" stack-label
            v-model="rsForm.vehicle_id" readonly
            autocomplete="off"
            :options="VehicleOptions"
            :error="errors.has('vehicle_id')"
            :error-message="errors.first('vehicle_id')" >
            <template slot="after">
              <q-input class="no-padding text-uppercase"
                input-class="text-weight-bold"
                input-style="width:50px;text-align:center"
                name="rit" type="number" min="0"
                label="RIT"
                v-model="rsForm.rit" readonly
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
    <q-separator inset spaced></q-separator>
    <q-card-section class="row q-col-gutter-sm">

      <div class="col-12 q-mb-md">
        <div class="q-pl-md">PARTIAL - VALIDATION</div>
        <q-markup-table dense separator="horizontal" class="main-box bordered no-shadow no-highlight th-uppercase">
            <q-tr>
              <!-- <q-th key="prefix"></q-th> -->
              <q-th key="lots" v-if="IS_LOTS">{{$tc('label.lots')}}</q-th>
              <q-th key="item_id">{{$tc('items.part_name')}}</q-th>
              <q-th key="quantity" align="right">{{$tc('label.quantity')}}</q-th>
              <q-th key="unit_id" align="left">{{$tc('label.unit')}}</q-th>
              <q-th key="unit_real" align="right">UNIT VALID</q-th>
            </q-tr>

            <q-tr v-for="(row, index) in rsForm.incoming_good_items" :key="index">
              <!-- <q-td key="prefix" style="width:0px"></q-td> -->
              <q-td key="lots" width="20%" v-if="IS_LOTS">
                <q-input readonly
                  :value="row.lots"
                  outlined dense hide-bottom-space
                  color="blue-grey-5"
                />
              </q-td>
              <q-td key="item_id" width="55%">
                <q-field dense readonly outlined  hide-bottom-space color="blue-grey-5" >
                  <div slot="control" class="flex column" v-if="row.item">
                    <span class="">{{ row.item.part_name }}</span>
                    <span class="text-caption text-faded">Num: {{ row.item.part_subname }}</span>
                  </div>
                </q-field>
              </q-td>

              <q-td key="quantity" width="20%">
                <q-input style="min-width:100px" input-style="text-right"
                  :name="`incoming_good_items.${index}.quantity`" type="number"
                  v-model="row.quantity" readonly
                  v-validate="row.item_id ? 'required' : ''"
                  dense outlined hide-bottom-space no-error-icon color="blue-grey-5"
                  :error="errors.has(`incoming_good_items.${index}.quantity`)"/>
              </q-td>

              <q-td key="unit_id" width="10%">
                 <q-input readonly input-style="min-width:50px"
                  :value="row.unit ? row.unit.code : null"
                  borderless dense hide-bottom-space color="blue-grey-5"
                />
                <q-input class="hidden" v-model="row.unit_rate" />
              </q-td>

              <q-td key="validate_quantity" width="20%" style="min-width:150px">
                <q-input style="min-width:100px" input-style="text-align:right"
                  :name="`incoming_good_items.${index}.validate_quantity`" type="number"
                  v-model="row.validate_quantity"
                  v-validate="`${Boolean(row.quantity - row.valid) ? 'required' : 'nullable' }|min_value:0|max_value:${row.quantity - row.valid}`" min="0"
                  dense outlined hide-bottom-space no-error-icon color="blue-grey-5"
                  :error="errors.has(`incoming_good_items.${index}.validate_quantity`)"
                  :suffix="`/ ${ row.quantity - (row.valid||0) }`"
                />
              </q-td>

            </q-tr>
        </q-markup-table>
      </div>
      <!-- COLUMN::4th Description -->
      <div class="col-12 row">
        <ux-date
          name="validate_date" type="date"
          stack-label :label="$tc('label.date')"
          v-model="rsForm.validate_date"
          v-validate="'required'"
          :error="errors.has('validate_date')"
          :error-message="errors.first('validate_date')"
        />
      </div>
      <q-input class="col-12"
        name="description" type="textarea" rows="3"
        stack-label :label="$tc('label.description')"
        filled autogrow input-style="min-height:4rem"
        v-model="rsForm.validate_description"/>
    </q-card-section>
    <q-separator />
    <q-card-actions class="q-mx-lg">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()" ></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-space />
      <q-btn icon="save" color="positive" @click="save('FULL')" :label="$tc('form.validation')" />
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading">
    <q-spinner-dots size="70px" color="primary" /></q-inner-loading>
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
          description: null
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
      if (this.FORM.data.deleted_at) return false
      if (this.FORM.data.transaction !== 'REGULER') return false
      if (this.FORM.data.order_mode !== 'NONE') return false
      if (!this.FORM.data.customer) return false
      return this.FORM.data.customer.order_lots
    },
    IS_EDITABLE () {
      if (Object.keys(this.FORM.data.has_relationship || {}).length > 0) return false

      return this.$app.can('incoming-goods-update')
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
      data.validate_date = this.$app.moment().format('YYYY-MM-DD')
      data.validate_description = null
      this.rsForm = JSON.parse(JSON.stringify(data))

      if (data.customer_id) this.SHEET.load('items', 'customer_id=' + data.customer_id)

      if (data.hasOwnProperty('has_relationship') && Object.keys(data['has_relationship']).length > 0) {
        this.FORM.response.relationship({
          title: 'Incoming goods has relations!',
          messages: data['has_relationship'],
          then: () => this.$router.push(`${this.FORM.resource.uri}/${data.id}`)
        })
      }
    },
    save () {
      const submit = () => {
        this.$q.loading.show()
        let { apiUrl } = this.FORM.meta()
        apiUrl += `/partial-validations`
        this.$axios.post(apiUrl, this.rsForm)
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
              this.$q.loading.hide()
            }, 2000)
          })
      }

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

        this.$q.dialog({
          title: this.$tc('form.confirm'),
          message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.validation') }),
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
