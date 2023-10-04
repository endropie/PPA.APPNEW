<template>
<q-page padding class="form-page justify-center">
  <q-card inline class="main-box" v-if="FORM.show">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="rsForm.number ? `# ${rsForm.number}` : FORM.subtitle()" hide-menu>
        <template  slot="menu-append">

          <q-chip class="text-uppercase" square outline
            :label="$tc('form.temporary')"
            :dark="LAYOUT.isDark"
            color="orange-10"
            v-if="rsForm.is_internal" />

          <q-chip class="text-uppercase" square outline
            :label="rsForm.customer.order_mode"
            :dark="LAYOUT.isDark"
            color="blue-grey"
            v-if="rsForm.transaction === 'REGULER' && rsForm.customer.order_mode == 'ACCUMULATE'"
          />

          <ux-chip-status square outline :row="rsForm" />
        </template>
      </form-header>
    </q-card-section>
    <q-separator />
    <q-card-section class="row q-col-gutter-x-md">
      <!-- COLUMN::1st delivery detail -->
      <div class="col-12 col-md-6" >
        <q-input disable hint=""
          :label="$tc('general.customer')"
          :dark="LAYOUT.isDark"
          :value="rsForm.customer ? `${rsForm.customer.code} - ${rsForm.customer.name}` : null"
        />
        <div class="row q-col-gutter-x-sm">
          <ux-date class="col-12 col-sm-12"
            name="date" type="date"
            stack-label label="Date"
            v-model="rsForm.date"
            :dark="LAYOUT.isDark"
            v-validate="'required'"
            :error="errors.has('date')"
            :error-message="errors.first('date')"/>

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
      <!-- COLUMN::3th Part items lists -->
      <div class="col-12 q-my-sm">
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
            <q-tr v-for="(row, index) in rsForm.delivery_order_items" :key="index">
              <q-td key="prefix" style="width:50px">
                <q-btn dense flat round icon="clear" color="red" @click="removeItem(index)"/>
              </q-td>
              <q-td key="part" width="30%">
                <ux-select class="native-top" style="min-width:150px"
                  :name="`delivery_order_items.${index}.item_id`"
                  v-model="row.item_id"
                  outlined dense color="blue-grey-5"
                  hide-bottom-space no-error-icon
                  filter emit-value map-options
                  :options="ItemOptions"
                  :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                  v-validate="`required`"
                  :error="errors.has(`delivery_order_items.${index}.item_id`)"
                  @input="(val)=>{ setItemReference(index, val) }"
                  :loading="SHEET['items'].loading" >
                  <small v-if="row.item" class="absolute-bottom">
                    [{{row.item.customer_code}}] {{row.item.part_subname}}
                  </small>
                </ux-select>
              </q-td>
              <q-td key="quantity" width="25%">
                <q-input type="number" style="min-width:120px"
                  :name="`delivery_order_items.${index}.quantity`"
                  v-model="row.quantity"
                  outlined dense color="blue-grey-5"
                  hide-bottom-space no-error-icon
                  :dark="LAYOUT.isDark"
                  v-validate="`required|gt_value:0`"
                  :error="errors.has(`delivery_order_items.${index}.quantity`)" />
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
              <q-td colspan="100%">
                <q-btn split  icon-right="add_circle" color="positive" :label="$tc('form.add')" @click="addNewItem()" />
              </q-td>
            </q-tr>
          </tbody>
        </q-markup-table>
      </div>
      <!-- COLUMN::4th Description -->
      <div class="col-12">
        <q-input type="textarea" rows="3"
          name="description"
          :data-vv-as="$tc('label.description')"
          :label="$tc('label.description')" stack-label
          filled :dark="LAYOUT.isDark"
          v-model="rsForm.description"/>
      </div>
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
  <q-dialog ref="dialog-submit" persistent>
    <q-card style="min-width:200px; width:50vw">
      <q-bar class="text-grey-14">
        <q-icon name="insert_comment" class="on-left"/>
        <div class="text-ellipsis">
          REVISE REASON
        </div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section class="q-gutter-sm">
        <q-select
          :label="$tc('label.reason')" stack-label
          v-model="dialog_reason.reason_id"
          :options="ReasonOptions" clearable
          emit-value map-options
        />
        <q-input type="textarea" filled autogrow
          input-style="min-height:50px"
          :label="$tc('label.description')" stack-label
          v-model="dialog_reason.reason_description"
        />
      </q-card-section>
      <q-card-actions class="q-pt-none" align="right">
        <q-btn color="grey" label="Cancel" v-close-popup />
        <q-btn color="primary" label="OK" @click="onSubmit()"
          :disable="(dialog_reason.reason_id == null && !dialog_reason.reason_description)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
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
        units: { api: '/api/v1/references/units?mode=all' },
        reasons: { api: '/api/v1/references/reasons?mode=all' }
      },
      FORM: {
        resource: {
          api: '/api/v1/incomes/delivery-orders',
          uri: '/admin/deliveries/delivery-orders'
        }
      },
      rsForm: {},
      setDefault: () => {
        return {
          number: null,
          transaction: null,
          date: this.$app.moment().format('YYYY-MM-DD'),

          customer_id: null,
          customer_name: null,
          customer_phone: null,
          customer_address: null,

          revise_id: 0,
          revise_number: 0,
          description: null,
          delivery_order_items: [{
            id: null,
            item_id: null,
            item: {},
            quantity: null,

            unit_id: null,
            unit_rate: 1
          }]
        }
      },
      dialog_reason: { reason: null, reason_description: null }
    }
  },
  created () {
    // Component Page Created!
    this.init()
  },
  computed: {
    IS_REVISE () {
      if (this.rsForm.delated_at) return false
      if (!this.rsForm.is_internal) return false
      return true
    },
    ReasonOptions () {
      return (this.SHEET.reasons.data.map(item => ({ label: item.name, value: item.id })) || []).concat([{ label: 'Others', value: null }])
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemOptions () {
      let ITEM = this.SHEET.items.data.filter((item) => item.customer_id === this.rsForm.customer_id)
      return (ITEM.map(item => ({ label: `${item.part_name}`, sublabel: `${item.code} - ${item.part_subname}`, value: item.id })) || [])
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
    MaxMount () {
      // if(this.RequestOrderOptions.length == 0) return []
      let maxitem = {}
      let moveItem = {
        set: function (id, val) {
          var vm = this
          if (!vm.hasOwnProperty(id)) vm[id] = 0
          vm[id] += Number(val)
        },
        get: function (id) {
          return this.hasOwnProperty(id) ? this[id] : 0
        }
      }

      let data = []
      if (this.rsForm.delivery_order_items) {
        data = this.rsForm.delivery_order_items.map((detail, index) => {
          let use = 0
          if (maxitem[detail.item_id] && detail.item_id) {
            use = Number(moveItem.get(detail.item_id) || 0)
            moveItem.set(detail.item_id, (Number(detail.quantity) * Number(detail.unit_rate)))
          }
          return Number(maxitem[detail.item_id] || 0) - use
        })
      }

      return data
    },
    MAPINGKEY () {
      let variables = {
        'units': {},
        'items': {}
      }
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
    numUnitConvertion (row, val = 0) {
      return Number(val) / Number(row.unit_rate || 1)
    },
    setItemReference (index, val) {
      if (!val) {
        this.rsForm.delivery_order_items[index].unit_id = null
        this.rsForm.delivery_order_items[index].unit = {}
        this.rsForm.delivery_order_items[index].item = {}
      } else {
        this.rsForm.delivery_order_items[index].item = this.MAPINGKEY['items'][val]

        let baseUnitID = this.MAPINGKEY['items'][val].unit_id
        this.rsForm.delivery_order_items[index].unit_id = baseUnitID
        this.rsForm.delivery_order_items[index].unit_rate = 1
        this.rsForm.delivery_order_items[index].unit = this.MAPINGKEY['units'][baseUnitID]
      }
    },
    setUnitReference (index, val) {
      if (!val) return false
      else if (this.rsForm.delivery_order_items[index].item.unit_id === val) {
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

    addNewItem () {
      let newEntri = this.setDefault().delivery_order_items[0]
      this.rsForm.delivery_order_items.push(newEntri)
    },
    removeItem (index) {
      this.rsForm.delivery_order_items.splice(index, 1)
      if (!this.rsForm.delivery_order_items.length) {
        this.addNewItem()
      }
    },
    onSubmit () {
      const submit = () => {
        this.FORM.loading = true
        const method = 'PUT'
        const apiUrl = `${this.FORM.resource.api}/${this.ROUTE.params.id}/internal-revision`
        const data = { ...this.rsForm, ...this.dialog_reason }
        this.$axios.set(method, apiUrl, data)
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

      this.$q.dialog({
        title: this.$tc('form.confirm'),
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.save') }),
        cancel: true,
        focus: 'cancel'
      }).onOk(() => submit())
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

        this.$refs['dialog-submit'].show()
      })
    }
  }
}
</script>
