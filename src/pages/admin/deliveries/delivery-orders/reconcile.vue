<template>
<q-page padding class="form-page justify-center">
  <q-card inline class="main-box" v-if="FORM.show">
    <q-card-section>
      <form-header
        :title="FORM.title('RECONCILE')"
        :subtitle="reconcile ? `# ${reconcile.fullnumber || reconcile.number}` : FORM.subtitle()" hide-menu>
        <template  slot="menu-append">
          <!-- <ux-chip-status square outline :row="rsForm" /> -->
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
          <ux-date class="col-12"
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
          <q-input disable class="col" name="customer_name"
            :label="$tc('label.name')"  stack-label
            v-model="rsForm.customer_name"
            :dark="LAYOUT.isDark"
            v-validate="''"/>
          <q-input disable class="col-12 col-sm-auto" name="customer_phone"
            :label="$tc('label.phone')"  stack-label
            v-model="rsForm.customer_phone"
            :dark="LAYOUT.isDark"
            v-validate="''"/>
        </div>
        <q-input disable type="textarea" autogrow
          name="customer_address"
          :label="$tc('label.address')"  stack-label
          :dark="LAYOUT.isDark"
          v-model="rsForm.customer_address"
        />
      </div>
      <!-- COLUMN::3th Part items lists -->
      <div class="col-12 q-my-sm">
        <div class="row items-center">
          <q-field :label="$tc('general.sj_internal', 2)" stack-label v-if="reconcile" style="min-width:200px">
            <div slot="control" class="column">
              <span>{{reconcile.fullnumber || reconcile.number}}</span>
            </div>
              <small class="absolute-bottom text-grey">{{$app.moment(reconcile.date).format('ll')}}</small>
              <q-btn slot="after" dense flat icon="open_in_new" color="blue-grey" @click="showReconcile = true"/>
          </q-field>
          <q-space />
          <q-select dense filled hide-bottom-space
            name="transaction"
            class="q-mr-sm"
            v-model="rsForm.transaction"
            :options="['RETURN', 'REGULER']"
            v-validate="`required|is:${rsForm.request_order ? rsForm.request_order.transaction : ''}`"
            :error="errors.has(`transaction`)"
            :error-message="errors.first(`transaction`)"
          />
          <ux-select class="native-top"
            name="request_order"
            stack-label :label="$tc('general.request_order')"
            :data-vv-as="$tc('general.request_order')"
            v-model="rsForm.request_order" :disable="rsForm.delivery_order_items.length > 0"
            filter :source="`/api/v1/incomes/request-orders?mode=all&customer_id=${rsForm.customer_id}`"
            :option-label="(item) => item.number" clearable
            :option-sublabel="(item) => item.reference_number ? `REF: ${item.reference_number}` : ''"
            :option-value="(item) => item"
            :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
            v-validate="'required'"
            :error="errors.has(`request_order`)"
            :error-message="errors.first(`request_order`)"
            @input="setRequestOrder"
            v-if="rsForm.customer_id"
          >
            <small class="absolute-bottom text-grey" v-if="rsForm.request_order">REF: {{rsForm.request_order.reference_number}}</small>
            <q-btn slot="after" dense flat icon="open_in_new" color="blue-grey"  v-if="rsForm.request_order" @click="showRequestOrder = true"/>
          </ux-select>
        </div>
        <q-markup-table bordered class="main-box no-shadow no-highlight"
          dense separator="horizontal"
          :dark="LAYOUT.isDark">
          <thead>
            <q-tr class="text-uppercase" style="line-height:30px">
              <q-th key="prefix" width="50px"></q-th>
              <q-th key="part" align="left" width="50%">{{$tc('items.part_name')}}</q-th>
              <q-th key="quantity" align="right" width="30%">{{$tc('label.quantity')}}</q-th>
              <q-th key="unit_id" align="left"  width="20%">{{$tc('label.unit')}}</q-th>
            </q-tr>
          </thead>
          <tbody>
            <q-tr v-for="(row, index) in rsForm.delivery_order_items" :key="index">
              <q-td key="prefix" style="width:50px">
                <q-btn dense flat round icon="clear" color="red" @click="removeItem(index)"/>
              </q-td>
              <q-td key="part" width="30%" >
                <ux-select readonly class="native-top" style="min-width:150px"
                  :name="`delivery_order_items.${index}.item_id`"
                  v-model="row.item_id"
                  dense borderless color="blue-grey-5"
                  hide-bottom-space no-error-icon hide-dropdown-icon
                  filter emit-value map-options
                  :options="ItemOptions"
                  :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                  v-validate="`required`"
                  :error="errors.has(`delivery_order_items.${index}.item_id`)"
                  @input="(val)=>{ setItemReference(index, val) }"
                  :loading="SHEET['items'].loading" >
                  <small class="absolute-bottom">[{{row.item.customer_code}}] {{row.item.part_subname}}</small>
                </ux-select>
              </q-td>
              <q-td key="quantity" width="25%">
                <q-input type="number" style="min-width:120px"
                  :name="`delivery_order_items.${index}.quantity`"
                  v-model="row.quantity"
                  outlined dense color="blue-grey-5"
                  hide-bottom-space no-error-icon
                  :dark="LAYOUT.isDark"
                  v-validate="`required|gt_value:0|max_value:${numUnitConvertion(row, MaxMount[index])}`"
                  :error="errors.has(`delivery_order_items.${index}.quantity`)">
                  <span slot="append" class="text-body2">
                  / <q-badge :label="numUnitConvertion(row, MaxMount[index])" />
                  </span>
                </q-input>
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
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" v-if="IS_EDITABLE"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" :dark="LAYOUT.isDark">
    <q-spinner-dots size="70px" color="primary" />
  </q-inner-loading>
  <q-dialog v-model="showRequestOrder">
    <q-card  style="min-width:80vw" v-if="request_order">
      <q-card-section>
        <div class="row no-wrap items-center">
          <div class="col ellipsis">
            <span class="text-h6">{{$tc('general.request_order')}}</span>
            <br/><span># {{request_order.fullnumber || request_order.number }}</span>
          </div>
          <div class="col-auto row no-wrap items-center">
            <ux-chip-status :row="request_order" />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="no-padding">
        <q-markup-table dense class="no-shadow">
          <thead>
            <tr class="text-uppercase" style="line-height:30px">
              <th class="text-left">Part</th>
              <th class="text-center">unit</th>
              <th class="text-right">quantity</th>
              <th class="text-right">Delivery</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in request_order.request_order_items" :key="index">
              <td>
                <span>{{row.item.part_name}}</span><br/>
                <span class="text-small">[{{row.item.customer_code}}] {{row.item.part_subname}}</span>
              </td>
              <td class="text-center">{{row.item.unit.code}}</td>
              <td class="text-right">{{$app.number_format(row.quantity)}}</td>
              <td class="text-right">{{$app.number_format(row.amount_delivery)}}</td>
              <td class="text-center">
                <q-btn dense flat icon="add_circle" @click="includeRequest(index)"/>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn v-close-popup flat color="blue-grey" :label="$tc('form.close')" />
      </q-card-actions>
    </q-card>
    <q-banner v-else dense class="bg-grey-3">
      <template v-slot:avatar>
        <q-icon name="block" color="negative" />
      </template>
      {{`Please select ${$tc('general.request_order')}`}}
      <template v-slot:action>
        <q-btn flat color="negative" :label="$tc('form.close')"  v-close-popup />
      </template>
    </q-banner>
  </q-dialog>
  <q-dialog v-model="showReconcile">
    <q-card  style="min-width:80vw" v-if="reconcile">
      <q-card-section>
        <div class="row no-wrap items-center">
          <div class="col column ellipsis">
            <span class="text-h6">{{$tc('general.sj_internal', 2)}}</span>
            <span class="text-caption">{{reconcile.fullnumber || reconcile.number }}
              <q-badge color="blue-grey" :label="reconcile.transaction" class="on-right" />
            </span>

            <small class="text-grey">REF: {{reconcile.reference_number || '-' }}</small>
          </div>
          <div class="col-auto row no-wrap items-center">
            <ux-chip-status :row="reconcile" />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="no-padding">
        <q-markup-table dense class="no-shadow">
          <thead>
            <tr class="text-uppercase" style="line-height:30px">
              <th class="text-left">Part</th>
              <th class="text-center">unit</th>
              <th class="text-right">quantity</th>
              <th class="text-right">Reconcile</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in reconcile.delivery_order_items" :key="index">
              <td>
                <span>{{row.item.part_name}}</span><br/>
                <span class="text-small">{{row.item.customer_code}} {{row.item.part_subname}}</span>
              </td>
              <td class="text-center">{{row.item.unit.code}}</td>
              <td class="text-right">{{$app.number_format(row.quantity)}}</td>
              <td class="text-right">{{$app.number_format(row.amount_reconcile)}}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn v-close-popup flat color="blue-grey" :label="$tc('form.close')" />
      </q-card-actions>
    </q-card>
    <q-banner v-else dense class="bg-grey-3">
      <template v-slot:avatar>
        <q-icon name="block" color="negative" />
      </template>
      {{`Please select ${$tc('general.request_order')}`}}
      <template v-slot:action>
        <q-btn flat color="negative" :label="$tc('form.close')"  v-close-popup />
      </template>
    </q-banner>
  </q-dialog>
</q-page>
</template>

<script>
/* eslint-disable vue/no-side-effects-in-computed-properties */
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      SHEET: {
        request_orders: { autoload: false, api: '/api/v1/incomes/request-orders?mode=all' },
        items: { autoload: false, api: '/api/v1/common/items?mode=all' },
        customers: { api: '/api/v1/incomes/customers?mode=all' },
        employees: { api: '/api/v1/common/employees?mode=all' },
        units: { api: '/api/v1/references/units?mode=all' }
      },
      FORM: {
        resource: {
          api: '/api/v1/incomes/delivery-orders',
          uri: '/admin/deliveries/delivery-orders'
        }
      },
      showRequestOrder: false,
      showReconcile: false,
      request_order: null,
      reconcile: null,
      rsForm: {},
      setDefault: () => {
        return {
          number: null,
          date: null,
          customer_id: null,
          transaction: null,
          customer_name: null,
          customer_phone: null,
          customer_address: null,
          revise_id: 0,
          revise_number: 0,
          description: null,
          delivery_order_items: [],
          exclude_items: []
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
      return true
    },
    ISTO_RECONCILED () {
      if (this.reconcile || !this.reconcile.delivery_order_items.length) return false

      return !this.reconcile.delivery_order_items.find(x => Math.round(x.unit_amount) > Math.round(x.amount_reconcile))
    },
    EmployeeOptions () {
      return (this.SHEET.employees.data.map(item => ({ label: `[${item.code}] ${item.name}`, value: item.id })) || [])
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
      let maxitem = {}
      let moveItem = {
        set: function (id, val) {
          if (!this.hasOwnProperty(id)) this[id] = 0
          this[id] += Number(val)
        },
        get: function (id) {
          return this.hasOwnProperty(id) ? this[id] : 0
        }
      }

      if (this.reconcile) {
        this.reconcile.delivery_order_items.map(detail => {
          if (!maxitem[detail.item_id]) maxitem[detail.item_id] = 0
          maxitem[detail.item_id] += Number(detail.unit_amount) - Number(detail.amount_reconcile)
        })
      }

      let data = []
      if (this.rsForm.delivery_order_items) {
        data = this.rsForm.delivery_order_items.map((detail, index) => {
          let use = 0
          if (maxitem[detail.item_id] && detail.item_id) {
            use = Number(moveItem.get(detail.item_id) || 0)
            moveItem.set(detail.item_id, (Number(detail.quantity) * Number(detail.unit_rate)))
          }
          const max = Number(maxitem[detail.item_id] || 0) - use
          const req = (detail.max_request || 0)
          return max > req ? req : max
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
        this.setForm(data)
      })
    },
    numUnitConvertion (row, val = 0) {
      return Number(val) / Number(row.unit_rate || 1)
    },
    setRequestOrder (val) {
      if (val) {
        this.loadRequestOrder(val.id)
      }
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
      if (!val) return null
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
    loadRequestOrder (id) {
      if (id) {
        const find = (row) => {
          if (!this.reconcile) return null
          return this.reconcile.delivery_order_items.find(x => x.item_id === row.item_id)
        }
        this.$axios.get(`/api/v1/incomes/request-orders/${id}?mode=view`)
          .then(response => {
            this.request_order = JSON.parse(JSON.stringify(response.data))
            setTimeout(() => {
              this.request_order.request_order_items.map((row, index) => {
                if (find(row)) this.includeRequest(index)
              })
            }, 100)
          })
          .catch(error => {
            this.$app.response.error(error.response || error)
          })
      }
    },
    setForm (data) {
      this.reconcile = Object.assign({}, this.setDefault(), data)

      this.rsForm = Object.assign({}, {
        ...data,
        id: null,
        number: null,
        revise_number: 0,
        reconcile_id: data.id,
        is_internal: 0,
        delivery_order_items: []
      })

      this.SHEET.load('items', `customer_id=${this.rsForm.customer_id}`)
    },
    addNewItem () {
      let newEntri = this.setDefault().delivery_order_items[0]
      this.rsForm.delivery_order_items.push(newEntri)
    },
    removeItem (index) {
      // if (this.rsForm.delivery_order_items[index].id) {
      //   this.rsForm.exclude_items.push(Object.assign({},this.rsForm.delivery_order_items[index]))
      // }
      this.rsForm.delivery_order_items.splice(index, 1)
    },
    includeRequest (index) {
      if (this.request_order.request_order_items[index]) {
        let detail = this.request_order.request_order_items[index]
        this.rsForm.delivery_order_items.push({
          ...detail,
          id: null,
          request_order_item_id: detail.id,
          max_request: (detail.unit_amount - detail.amount_delivery),
          quantity: null
        })
      } else this.$q.notify('Index of list undefined!')
    },
    onSave () {
      const submit = () => {
        this.FORM.loading = true
        // const {method, mode, apiUrl} = this.FORM.meta();
        const method = 'PUT'
        const apiUrl = `${this.FORM.resource.api}/${this.ROUTE.params.id}?mode=reconciliation&nodata`

        this.$axios.set(method, apiUrl, this.rsForm)
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
          console.warn('error', this.$validator)
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
          message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.revision') }),
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
