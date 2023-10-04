<template>
<q-page padding class="justify-center form-page" >
  <q-card inline class="q-ma-sm " v-if="FORM.show">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
      </form-header>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="row q-col-gutter-x-sm q-mb-lg">

        <!-- COLUMN::1st customer Identitity -->
        <ux-select class="col-12 col-sm-9"
          name="customer_id"
          v-model="rsForm.customer_id"
          :label="$tc('general.customer')"
          :disable="IssetIncomeItems"
          v-validate="'required'"
          :options="CustomerOptions"
          filter emit-value map-options
          @input="setCustomerReference"
          :error="errors.has('customer_id')" :error-message="errors.first('customer_id')">
          <q-tooltip v-if="IssetIncomeItems" :offset="[0, 10]">To change, Please clear Delivery items first!</q-tooltip>
        </ux-select>

        <forecast-period-select class="col-12 col-sm-3"
          name="period_id"
          v-model="rsForm.period" clearable
          @input="(opt) => rsForm.period_id = opt ? opt.id : null"
          :label="$tc('label.period')"
          v-validate="'required'"
          map-options
          option-value="id"
          :option-label="(opt) => $app.moment(opt.period).format('MMMM YYYY')"
          source="/api/v1/incomes/forecast-periods?mode=datagrid"
          :error="errors.has('period_id')" :error-message="errors.first('period_id')"
        />

      </div>

      <!-- COLUMN::3th Items lists -->
      <div class="q-mb-md">
        <q-markup-table dense square bordered separator="horizontal" class="no-shadow">
        <thead>
          <q-tr class="text-uppercase" style="line-height:2rem">
            <q-th key="prefix"></q-th>
            <q-th key="item_id">{{$tc('items.part_name')}}</q-th>
            <q-th key="part_subname">{{$app.setting('item.subname_label')}}</q-th>
            <q-th key="quantity">{{$tc('label.quantity')}}</q-th>
            <q-th key="unit_id">{{$tc('label.unit')}}</q-th>
            <q-th key="price">{{$tc('label.price')}}</q-th>
            <q-th key="total">{{$tc('label.total')}}</q-th>
          </q-tr>
        </thead>
        <tbody>
          <q-tr v-for="(row, index) in rsForm.forecast_items" :key="index">
            <q-td key="prefix" class="no-padding q-px-sm" style="width:auto">
              <q-btn dense flat icon="clear" color="red" @click="removeItem(index)" />
            </q-td>
            <q-td key="item_id"  >
              <ux-select :name="`forecast_items.${index}.item_id`"
                v-model="row.item_id"
                dense hide-bottom-space
                outlined color="blue-grey-5"
                v-validate="'required'"
                filter emit-value map-options
                :options="ItemOptions"
                :disable="!IssetCustomerID"
                @input="(val)=>{ setItemReference(index, val) }"
                :error="errors.has(`forecast_items.${index}.item_id`)"
                :error-message="errors.first(`forecast_items.${index}.item_id`)"
                :loading="SHEET['items'].loading">
                <q-tooltip v-if="!IssetCustomerID" :offset="[0, 10]">Select a customer, first! </q-tooltip>
              </ux-select>
            </q-td>
            <q-td key="part_subname" width="30%" style="min-width:150px">
              <q-input readonly
                :value="row.item ? row.item.part_subname : null"
                outlined dense hide-bottom-space color="blue-grey-5"
              />
            </q-td>
            <q-td key="quantity" >
              <q-input :name="`forecast_items.${index}.quantity`"
                style="min-width:50px"
                v-model="row.quantity" type="number" min="0"
                outlined no-error-icon color="blue-grey-5"
                dense hide-bottom-space
                v-validate="'required|gt_value:0'"
                :error="errors.has(`forecast_items.${index}.quantity`)" />
            </q-td>
            <q-td key="unit_id"  >
              <q-select :name="`forecast_items.${index}.unit_id`" style="min-width:70px"
                v-model="row.unit_id"
                outlined  dense hide-bottom-space=""
                :options="ItemUnitOptions[index]"
                map-options emit-value
                v-validate="'required'"
                :error="errors.has(`forecast_items.${index}.unit_id`)"
                @input="(val)=> { setUnitReference(index, val) }" />
            </q-td>
            <q-td key="price" >
              <ux-numeric :name="`forecast_items.${index}.price`" style="min-width:100px"
                v-model="row.price"
                outlined color="blue-grey-5" align="right"
                dense hide-bottom-space
                v-validate="'required|gt_value:0'"
                :error="errors.has(`forecast_items.${index}.price`)" />
            </q-td>
            <q-td key="total_price"  >
              <ux-numeric :name="`forecast_items.${index}.total_price`"
                style="min-width:120px"  input-class="text-weight-bold"
                borderless color="blue-grey-5"
                dense hide-bottom-space readonly
                :value="row.quantity * row.price"
                :error="errors.has(`forecast_items.${index}.total_price`)" />
            </q-td>
          </q-tr>

          <q-tr>
            <q-td></q-td>
            <q-td>
              <q-btn dense outline :label="$tc('form.add')" icon="add_circle_outline" color="blue-grey" class="full-width" @click="addNewItem()"/>
            </q-td>
            <q-td colspan="100%"></q-td>
          </q-tr>
        </tbody>

        </q-markup-table>
      </div>
      <!-- COLUMN::4th Description -->
      <q-input class="col-12" name="description" type="textarea" rows="3"
        stack-label :label="$tc('label.description')"
        filled
        v-model="rsForm.description">
        <q-icon slot="prepend" name="rate_review" />
      </q-input>
    </q-card-section>
    <q-separator />
    <q-card-actions class="q-mx-lg">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" :loading="FORM.loading" />
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading"><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
</q-page>
</template>

<script>
import ForecastPeriodSelect from 'components/ForecastPeriodSelect.vue'
import MixForm from 'src/mixins/mix-form.vue'

export default {
  components: { ForecastPeriodSelect },
  mixins: [MixForm],
  data () {
    return {
      SHEET: {
        customers: { api: '/api/v1/incomes/customers?mode=all' },
        units: { api: '/api/v1/references/units?mode=all' },
        items: { autoload: false, api: '/api/v1/common/items?mode=all' }
      },
      FORM: {
        resource: {
          uri: '/admin/incomes/forecasts',
          api: '/api/v1/incomes/forecasts'
        }
      },
      rsForm: {},
      setDefault: () => {
        return {
          number: null,
          period_id: null,
          period: null,

          customer_id: null,
          description: null,

          forecast_items: [
            {
              id: null,
              item_id: null,
              item: {},
              unit_id: null,
              unit: {},
              unit_rate: 1,
              unit_amount: null,
              quantity: null,
              price: null,
              note: null
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
    IssetIncomeItems () {
      let items = this.rsForm.forecast_items
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
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemOptions () {
      let ITEM = this.SHEET.items.data.filter((item) => item.customer_id === this.rsForm.customer_id)
      return (ITEM.map(item => ({
        label: `${item.part_name}`,
        sublabel: `[${item.customer_code}] ${item.part_subname || '--'}`,
        value: item.id,
        disable: !item.enable
      })) || [])
    },
    ItemUnitOptions () {
      let vars = []
      for (const i in this.rsForm.forecast_items) {
        if (this.rsForm.forecast_items.hasOwnProperty(i)) {
          let rsItem = this.rsForm.forecast_items[i]
          vars[i] = (this.UnitOptions || [])
          vars[i] = vars[i].filter((unit) => {
            if (!rsItem.item_id) return false
            if (rsItem.item) {
              if (rsItem.item.unit_id === unit.value) return true
              // console.log('item-unit', i, rsItem.item.item_units)
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
    setCustomerReference (val) {
      if (!val) {
        this.rsForm.customer_name = null
        this.rsForm.customer_phone = null
        this.rsForm.customer_address = null
        this.SHEET['items'].data = []
      } else {
        this.SHEET.load('items', `customer_id=${val}`)
        this.rsForm.customer_name = this.MAPINGKEY['customers'][val].name
        this.rsForm.customer_phone = this.MAPINGKEY['customers'][val].phone
        this.rsForm.customer_address = this.MAPINGKEY['customers'][val].address_raw
      }
    },
    setItemReference (index, val) {
      if (!val) {
        this.rsForm.forecast_items[index].unit_id = null
        this.rsForm.forecast_items[index].unit = {}
        this.rsForm.forecast_items[index].item = {}
      } else {
        this.rsForm.forecast_items[index].item = this.MAPINGKEY['items'][val]

        let baseUnitID = this.MAPINGKEY['items'][val].unit_id
        this.rsForm.forecast_items[index].unit_id = baseUnitID
        this.rsForm.forecast_items[index].unit_rate = 1
        this.rsForm.forecast_items[index].unit = this.MAPINGKEY['units'][baseUnitID]
        this.rsForm.forecast_items[index].price = this.MAPINGKEY['items'][val].price
      }
    },
    setUnitReference (index, val) {
      if (!val) return undefined
      else if (this.rsForm.forecast_items[index].item.unit_id === val) {
        this.rsForm.forecast_items[index].unit_rate = 1
      } else {
        if (this.rsForm.forecast_items[index].item.item_units) {
          this.rsForm.forecast_items[index].item.item_units.map((unitItem) => {
            if (unitItem.unit_id === val) this.rsForm.forecast_items[index].unit_rate = unitItem.rate
          })
        }
      }
    },

    setForm (data) {
      this.rsForm = data

      if (data.customer_id) this.SHEET.load('items', `customer_id=${data.customer_id}`)

      if (data.hasOwnProperty('has_relationship') && data['has_relationship'].length > 0) {
        this.FORM.has_relationship = data.has_relationship
        this.FORM.onRelationship({
          title: 'Forecast has relation!',
          message: data['has_relationship'].join('-'),
          then: () => this.$router.push(`${this.FORM.resource.uri}/${data.id}/view`)
        })
      }
    },
    setRsForm (data) {
      this.rsForm = data
      if (!this.rsForm.forecast_items) {
        this.rsForm.forecast_items = this.setDefault().forecast_items
      }
    },
    setRsData (data) {
      this.FORM.data = JSON.parse(JSON.stringify(data))
      if (!this.FORM.data.forecast_items) {
        this.FORM.data.forecast_items = this.setDefault().forecast_items
      }
    },
    routing () {
      if (this.ROUTE.meta.mode === 'edit') {
        this.FORM.loading = true
        let url = this.FORM.resource.api + '/' + this.ROUTE.params.id
        this.$axios.get(url)
          .then((response) => {
            const data = response.data
            this.setRsForm(data)
            this.setRsData(data)
            this.setForm(data)
          })
          .catch(error => {
            console.warn('[FORM:routing]', error)

            this.$app.response.error(error.response, 'Load Form')
          })
          .finally(() => {
            this.FORM.loading = false
          })
      } else {
        this.rsForm = this.setDefault()
      }
    },

    addNewItem (autofocus = true) {
      let newEntri = this.setDefault().forecast_items[0] // {id:null, item_id: null, quantity: null};

      this.rsForm.forecast_items.push(newEntri)
    },
    removeItem (index) {
      this.rsForm.forecast_items.splice(index, 1)
      if (this.rsForm.forecast_items.length < 1) this.addNewItem()
    },

    onSave () {
      // console.warn(this.$validator)
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
            this.FORM.response.fields(error.response)
            this.FORM.response.error(error.response || error, 'Submit')
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
