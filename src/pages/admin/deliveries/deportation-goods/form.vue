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
    <q-card-section>
      <div class="row q-col-gutter-x-sm">
        <ux-select-filter name="customer" class="col-12 col-sm-6"
          :label="$tc('general.customer')"
          v-model="rsForm.customer_id"
          :options="CustomerOptions" clearable
          :disable="Boolean(rsForm.id) || IssetItemDetails"
          v-validate="'required'"
          :error="errors.has('customer')"
          :error-message="errors.first('customer')"
          @input="(val) => setCustomerReference(val)">
          <q-badge slot="counter"
            :label="String($tc(`customers.order_${rsForm.order_mode}`).toUpperCase())"
            v-if="Boolean(rsForm.customer_id) && rsForm.transaction == 'REGULER'" />
        </ux-select-filter>

        <ux-date name="date" type="date" class="col-12 col-sm-6"
          :label="$tc('label.date')" stack-label
          v-model="rsForm.date"
          v-validate="`required|date_format:yyyy-MM-dd|before:${$app.moment().add(1,'days').format('YYYY-MM-DD')}`"
          :date-options="(date) => date <= $app.moment().format('YYYY/MM/DD')"
          :error="errors.has('date')"
          :error-message="errors.first('date')"
        />
      </div>
    </q-card-section>
    <!-- COLUMN::2nd Request orders -->
    <q-card-section class="q-gutter-sm q-pt-none">
      <q-markup-table dense flat bordered square
        separator="horizontal"
        class="main-box no-highlight th-uppercase"
      >
        <thead>
          <q-tr>
            <q-th key="prefix"></q-th>
            <q-th key="item_id">{{$tc('items.part_name')}}</q-th>
            <q-th key="part_subname">{{$app.setting('item.subname_label')}}</q-th>
            <q-th key="stockist">{{$tc('items.stockist')}}</q-th>
            <q-th key="unit_id">{{$tc('label.unit')}}</q-th>
            <q-th key="quantity">{{$tc('label.quantity')}}</q-th>
          </q-tr>
        </thead>
        <tbody>
          <q-tr v-for="(row, index) in rsForm.deportation_good_items" :key="index">
            <q-td  style="width:50px">
              <q-btn dense flat="" @click="removeItem(index)" icon="clear" tabindex="100" color="negative"/>
            </q-td>
            <q-td width="30%">
              <ux-select autofocus
                :name="`deportation_good_items.${index}.item_id`"
                dense outlined hide-bottom-space no-error-icon color="blue-grey-5"
                v-model="row.item_id"
                v-validate="'required'"
                filter map-options emit-value
                :options="ItemOptions" clearable
                popup-content-class="options-striped"
                :readonly="Boolean(!rsForm.customer_id)"
                @input="(val)=>{ setItemReference(index, val) }"
                :loading="SHEET['items'].loading"
                :error="errors.has(`deportation_good_items.${index}.item_id`)">
              </ux-select>
              <q-tooltip v-if="!Boolean(rsForm.customer_id)" :offset="[0, 10]">Select a customer, First! </q-tooltip>
            </q-td>
            <q-td width="20%" style="min-width:150px">
              <q-input readonly
                :value="row.item ? row.item.part_subname : null"
                outlined dense hide-bottom-space color="blue-grey-5"
              />
            </q-td>
            <q-td width="15%" style="min-width:150px">
              <q-select
                map-options emit-value
                :options="CONFIG.items.stockists.filter(x => ['FM', 'PFG', 'FG', 'NC', 'NCR', 'NG'].indexOf(x.value) >= 0)"
                v-model="row.stockist_from"
                outlined dense hide-bottom-space color="blue-grey-5"
              />
            </q-td>
            <q-td width="15%">
              <q-select style="min-width:100px"
                :name="`deportation_good_items.${index}.unit_id`"
                :data-vv-as="$tc('label.unit')"
                v-model="row.unit_id"
                dense outlined hide-bottom-space color="blue-grey-5"
                @input="(val)=> { setUnitReference(index, val) }"
                :options="ItemUnitOptions[index]"
                map-options emit-value
                v-validate="row.item_id ? 'required' : ''"
                :error="errors.has(`deportation_good_items.${index}.unit_id`)"/>
              <q-input class="hidden" v-model="row.unit_rate" />
            </q-td>
            <q-td width="20%">
              <q-input type="number" min="0" style="min-width:120px"
                :data-vv-as="$tc('label.quantity')"
                :name="`deportation_good_items.${index}.quantity`"
                v-model="row.quantity"
                v-validate="row.item_id ? 'required|gt_value:0' : ''"
                dense outlined hide-bottom-space no-error-icon color="blue-grey-5"
                :error="errors.has(`deportation_good_items.${index}.quantity`)"/>
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
      <q-input
        name="description" type="textarea" rows="3" filled
        stack-label :label="$tc('label.description')"
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
  <q-inner-loading :showing="FORM.loading"><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
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
        items: { autoload: false, api: '/api/v1/common/items?mode=all' }
      },
      FORM: {
        resource: {
          uri: '/admin/deliveries/deportation-goods',
          api: '/api/v1/warehouses/deportation-goods'
        }
      },
      rsForm: {},
      setDefault: () => {
        return {
          number: null,
          date: this.$app.moment().format('YYYY-MM-DD'),

          customer_id: null,
          description: null,

          deportation_good_items: [
            {
              id: null,
              item_id: null,
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
    IS_EDITABLE () {
      if (Object.keys(this.FORM.data.has_relationship || {}).length > 0) return false

      return this.$app.can('deportation-goods-update')
    },
    IssetItemDetails () {
      let items = this.rsForm.deportation_good_items
      for (const i in items) {
        if (items.hasOwnProperty(i)) {
          if (items[i].item_id) return true
        }
      }

      return false
    },
    CustomerOptions () {
      return (this.SHEET.customers.data.map(item => ({ label: [item.code, item.name].join(' - '), value: item.id })) || [])
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemOptions () {
      let orItems = []
      if (this.FORM.data.deportation_good_items) {
        orItems = this.FORM.data.deportation_good_items.map(item => item.item_id)
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
      for (const i in this.rsForm.deportation_good_items) {
        if (this.rsForm.deportation_good_items.hasOwnProperty(i)) {
          let rsItem = this.rsForm.deportation_good_items[i]
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
        this.SHEET.load('items', `customer_id=${this.rsForm.customer_id}`)
      }

      if (data.hasOwnProperty('has_relationship') && Object.keys(data['has_relationship']).length > 0) {
        this.FORM.response.relationship({
          title: 'Incoming goods has relations!',
          messages: data['has_relationship'],
          then: () => this.$router.push(`${this.FORM.resource.uri}/${data.id}`)
        })
      }
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
        this.rsForm.deportation_good_items[index].unit_id = null
        this.rsForm.deportation_good_items[index].unit_rate = 1
        this.rsForm.deportation_good_items[index].unit = null
        this.rsForm.deportation_good_items[index].item = null
        this.rsForm.deportation_good_items[index].stockist_from = null
      } else {
        this.rsForm.deportation_good_items[index].item = this.MAPINGKEY['items'][val]

        let baseUnitID = this.MAPINGKEY['items'][val].unit_id
        this.rsForm.deportation_good_items[index].unit_id = baseUnitID
        this.rsForm.deportation_good_items[index].unit_rate = 1
        this.rsForm.deportation_good_items[index].unit = this.MAPINGKEY['units'][baseUnitID]
      }
    },
    setUnitReference (index, val) {
      if (!val) return undefined
      else if (this.rsForm.deportation_good_items[index].item.unit_id === val) {
        this.rsForm.deportation_good_items[index].unit_rate = 1
      } else {
        if (this.rsForm.deportation_good_items[index].item.item_units) {
          this.rsForm.deportation_good_items[index].item.item_units.map((unitItem) => {
            if (unitItem.unit_id === val) this.rsForm.deportation_good_items[index].unit_rate = unitItem.rate
          })
        }
      }
    },

    addNewItem (autofocus) {
      autofocus = autofocus || false
      let newEntri = this.setDefault().deportation_good_items[0] // {id:null, item_id: null, quantity: null};

      this.rsForm.deportation_good_items.push(newEntri)
    },
    removeItem (index) {
      this.rsForm.deportation_good_items.splice(index, 1)
      if (this.rsForm.deportation_good_items.length < 1) this.addNewItem()
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
