<template>
<q-page padding class="main-page justify-center">
  <q-card inline class="main-box" v-if="FORM.show">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" hide-menu>
        <q-chip square outline slot="optional" icon="assignment" color="blue-grey" class="text-weight-normal"
          v-if="rsForm.order_mode">
          <span v-if="rsForm.transaction == 'RETURN'"> RETURN </span>
          <span v-else>
            {{CONFIG.options.order_mode.find(x => x.value === rsForm.order_mode)
              ? CONFIG.options.order_mode.find(x => x.value === rsForm.order_mode).label : rsForm.order_mode}}
          </span>
        </q-chip>
        <ux-chip-status square slot="optional" :row="rsForm" outline v-if="rsForm.id"/>
      </form-header>
    </q-card-section>
    <q-separator />
    <!-- COLUMN::1st customer Identitity -->
    <q-card-section class="row q-col-gutter-sm">
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <ux-select-filter name="customer" class="col-12"
            v-model="rsForm.customer_id"
            :label="$tc('general.customer')"
            :disable="IssetItemDetails" v-validate="'required'"
            :options="CustomerOptions" filter clearable
            :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
            @input="(val)=>{ setCustomerReference(val) }"
            :error="errors.has('customer')"
            :error-message="errors.first('customer')"
            :loading="SHEET['customers'].loading">
            <q-tooltip v-if="IssetItemDetails" :offset="[0, 10]">To change: Please delete Part items first!</q-tooltip>
          </ux-select-filter>
          <ux-date class="col" style="min-width:150px" name="date"
            stack-label :label="$tc('label.date')"
            v-model="rsForm.date"
            :dark="LAYOUT.isDark"
            v-validate="'required'"
            :error="errors.has('date')"
            :error-message="errors.first('date')"
          />
          <q-space />
          <ux-date name="actived_date" class="col" style="min-width:150px"
            stack-label :label="$tc('label.expired',2) + ' PO'"
            v-model="rsForm.actived_date"
            :dark="LAYOUT.isDark"
            v-validate="rsForm.order_mode == 'PO' ? 'required' : ''"
            :error="errors.has('actived_date')"
            :error-message="errors.first('actived_date')"
          />
        </div>
      </div>
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <q-input name="reference_number" class="col-12"
            stack-label label="Referense PO/SJ"
            v-model="rsForm.reference_number"
            :dark="LAYOUT.isDark"
            v-validate="rsForm.order_mode === 'PO' ? 'required' :''"
            :error="errors.has('reference_number')"
            :error-message="errors.first('reference_number')" />
        </div>
      </div>
    </q-card-section>
    <!-- COLUMN::2th Incoming Items lists -->
    <q-card-section class="row">
      <div class="col-12 q-pb-md">
        <q-markup-table class="main-box no-shadow no-highlight th-uppercase"
          dense bordered separator="horizontal"
          :dark="LAYOUT.isDark">
          <thead>
            <q-tr style="line-height:30px">
              <q-th key="prefix" width="50px"></q-th>
              <q-th key="item">{{$tc('items.part_name')}}</q-th>
              <q-th key="quantity">{{$tc('label.quantity')}}</q-th>
              <q-th key="unit_id">{{$tc('label.unit')}}</q-th>
              <q-th key="price">{{$tc('label.price')}}</q-th>
              <q-th key="total">{{$tc('label.total')}}</q-th>
            </q-tr>
          </thead>
          <tbody>
            <q-tr v-for="(row, index) in rsForm.request_order_items" :key="index">
              <q-td key="prefix" style="width:50px">
                <!-- {{row}} -->
                <q-btn dense flat icon="clear" color="negative" @click="removeItem(index)" v-if="!Boolean(row.amount_delivery > 0)"/>
              </q-td>
              <q-td key="item" width="45%" style="min-width:150px">
                <ux-select class="field-native-top"
                  :name="`request_order_items.${index}.item_id`"
                  v-model="row.item_id"
                  v-validate="'required'"
                  outlined dense hide-bottom-space color="blue-grey-5"
                  :options="ItemOptions"
                  filter emit-value map-options
                  :readonly="!IssetCustomerID"
                  :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                  :error="errors.has(`request_order_items.${index}.item_id`)"
                  :loading="SHEET['items'].loading"
                  @input="(val)=>{ setItemReference(index, val) }"
                >
                  <small v-if="row.item" class="absolute-bottom">
                    [{{row.item.customer_code}}]
                    {{row.item.part_subname}}
                  </small>
                  <q-tooltip v-if="!IssetCustomerID" :offset="[0, 10]">Select a customer, first! </q-tooltip>
                </ux-select>
              </q-td>
              <q-td key="quantity" width="20%">
                <q-input :name="`request_order_items.${index}.quantity`"
                  v-model="row.quantity" type="number" min="0"
                  outlined dense hide-bottom-space
                  color="blue-grey-5" style="min-width:80px"
                  v-validate="`required|gt_value:0`"
                  :dark="LAYOUT.isDark"
                  :error="errors.has(`request_order_items.${index}.quantity`)"
                />
              </q-td>
              <q-td key="unit_id" width="10%">
                <q-select :name="`request_order_items.${index}.unit_id`"
                  v-model="row.unit_id"
                  :options="ItemUnitOptions[index]"
                  map-options emit-value
                  outlined dense hide-bottom-space
                  color="blue-grey-5" style="width:80px"
                  v-validate="row.item_id ? 'required' : ''"
                  :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                  :error="errors.has(`request_order_items.${index}.unit_id`)"
                  @input="(val)=> { setUnitReference(index, val) }" />
                <q-input v-model="row.unit_rate" class="hidden" />
              </q-td>
              <q-td key="price" width="20%" style="min-width:120px">
                <ux-numeric type="number" :name="`request_order_items.${index}.price`"
                  v-model="row.price"
                  outlined dense hide-bottom-space
                  color="blue-grey-5" style="min-width:120px"
                  v-validate="row.item_id ? 'required' : ''"
                  :dark="LAYOUT.isDark"
                  :error="errors.has(`request_order_items.${index}.price`)" />
              </q-td>
              <q-td key="total" width="25%" style="min-width:150px">
                <ux-numeric :name="`total-${index}`"
                  :value="Number(row.quantity) * Number(row.price)"
                  readonly dense borderless hide-bottom-space
                  color="blue-grey-5" style="width:120px"
                  v-validate="row.item_id ? '' : ''"
                  :dark="LAYOUT.isDark"
                  :error="errors.has(`total-${index}`)"
                />
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
      <div class="col-12">
        <q-input filled type="textarea" rows="3"
          name="description"
          stack-label :label="$tc('label.description')"
          v-model="rsForm.description"
          :dark="LAYOUT.isDark">

          <template slot="prepend">
            <q-icon name="rate_review"></q-icon>
          </template>
        </q-input>

      </div>

    </q-card-section>
    <q-separator :dark="LAYOUT.isDark" />
    <q-card-actions class="q-mx-lg">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" v-if="IS_EDITABLE"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" :dark="LAYOUT.isDark"><q-spinner-dots size="70px" /></q-inner-loading>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      SHEET: {
        customers: { api: '/api/v1/incomes/customers?mode=all' },
        brands: { api: '/api/v1/references/brands?mode=all' },
        units: { api: '/api/v1/references/units?mode=all' },
        vehicles: { api: '/api/v1/references/vehicles?mode=all' },
        items: { autoload: false, api: '/api/v1/common/items?mode=all' }
      },
      FORM: {
        resource: {
          uri: '/admin/incomes/request-orders',
          api: '/api/v1/incomes/request-orders'
        }
      },
      rsForm: {},
      setDefault: () => {
        return {
          number: null,
          customer_id: null,
          date: null,
          actived_date: null,
          reference_number: null,
          transaction: 'REGULER',
          order_mode: null,
          description: null,

          request_order_items: [
            {
              id: null,
              item_id: null,
              quantity: null,
              price: 0,
              unit_id: null,
              unit_rate: 1
            }
          ]

        }
      }
    }
  },
  created () {
    // Component Page Created!
    this.init()
  },
  computed: {
    IS_EDITABLE () {
      if (this.rsForm.deleted_at) return false
      if (this.rsForm.order_mode === 'NONE' && this.rsForm.customer) {
        if (!this.rsForm.customer.order_manual_allowed) return false
      }
      if (this.rsForm.is_relationship) return false
      return true
    },
    IssetItemDetails () {
      let items = this.rsForm.request_order_items
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
      let data = this.SHEET.customers.data
      if (this.ROUTE.meta.mode !== 'edit') {
        data = data.filter(item => item.order_mode === 'PO' || item.order_manual_allowed)
      }

      return (data.map(item => ({ label: [item.code, item.name].join(' - '), value: item.id })) || [])
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemOptions () {
      let items = this.SHEET.items.data.filter((item) => item.customer_id === this.rsForm.customer_id)
      return (items.map(item => ({ label: item.part_name, sublabel: `[${item.customer_code}] ${item.part_subname || '--'}`, value: item.id, disable: !item.enable })) || [])
    },
    ItemUnitOptions () {
      let vars = []
      for (const i in this.rsForm.request_order_items) {
        if (this.rsForm.request_order_items.hasOwnProperty(i)) {
          let rsItem = this.rsForm.request_order_items[i]
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
      this.rsData = JSON.parse(JSON.stringify(data))
      this.rsForm = JSON.parse(JSON.stringify(data))

      // if(data.id && Object.keys(data['has_relationship']).length > 0) {
      if (data.id && data.status !== 'OPEN') {
        this.FORM.response.relationship({
          title: 'Sale Orders has not OPEN state!',
          messages: data['has_relationship'],
          then: () => this.$router.push(`${this.FORM.resource.uri}/${data.id}`)
        })
      }

      if (data.customer_id) {
        this.SHEET.load('items', `customer_id=${data.customer_id}`)
      }
    },
    setCustomerReference (val) {
      if (!val) {
        this.rsForm.customer = {}
        this.rsForm.order_mode = null
      } else {
        this.rsForm.customer = this.MAPINGKEY['customers'][val]
        this.rsForm.order_mode = this.MAPINGKEY['customers'][val].order_mode

        this.SHEET.load('items', `customer_id=${val}`)

        if (this.rsForm.order_mode === 'PO') {
          this.rsForm.begin_date = null
          this.rsForm.until_date = null
        }
      }
    },
    setItemReference (index, val) {
      if (!val) {
        this.rsForm.request_order_items[index].unit_id = null
        this.rsForm.request_order_items[index].price = null
        this.rsForm.request_order_items[index].unit = {}
        this.rsForm.request_order_items[index].item = {}
      } else {
        this.rsForm.request_order_items[index].item = this.MAPINGKEY['items'][val]
        this.rsForm.request_order_items[index].price = this.MAPINGKEY['items'][val].price

        let baseUnitID = this.MAPINGKEY['items'][val].unit_id
        this.rsForm.request_order_items[index].unit_id = baseUnitID
        this.rsForm.request_order_items[index].unit_rate = 1
        this.rsForm.request_order_items[index].unit = this.MAPINGKEY['units'][baseUnitID]
      }
    },
    setUnitReference (index, val) {
      if (!val) return undefined
      else if (this.rsForm.request_order_items[index].item.unit_id === val) {
        this.rsForm.request_order_items[index].unit_rate = 1
      } else {
        if (this.rsForm.request_order_items[index].item.item_units) {
          this.rsForm.request_order_items[index].item.item_units.map((unitItem) => {
            if (unitItem.unit_id === val) this.rsForm.request_order_items[index].unit_rate = unitItem.rate
          })
        }
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
            this.FORM.show = true
            this.FORM.loading = false
          })
      } else {
        this.rsForm = this.setDefault()
        this.FORM.show = true
      }
    },
    getMinQuantity (index) {
      const row = this.rsForm.request_order_items[index]
      if (this.FORM.data.request_order_items.length) {
        const detail = this.FORM.data.request_order_items.find(x => x.id === row.id)
        if (detail) return (detail.amount_delivery || 0) / (detail.unit_rate || 1)
      }
      return 0
    },
    addNewItem (autofocus = true) {
      let newEntri = this.setDefault().request_order_items[0] // {id:null, item_id: null, quantity: null};

      this.rsForm.request_order_items.push(newEntri)
    },
    removeItem (index) {
      this.rsForm.request_order_items.splice(index, 1)
      if (this.rsForm.request_order_items.length < 1) this.addNewItem()
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

        this.$axios.set(method, apiUrl, this.rsForm)
          .then((response) => {
            let message = response.data.number + ' - #' + response.data.id
            this.FORM.response.success({ message: message })
            this.FORM.toView(response.data.id)
          })
          .catch((error) => {
            this.FORM.response.error(error.response || error)
            this.FORM.response.fields(error.response)
          })
          .finally(() => {
            this.FORM.loading = false
          })
      })
    }
  }
}
</script>
<style lang="stylus">
.field-native-top
  .q-field__native
    align-items flex-start
</style>
