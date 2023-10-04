<template>
<q-page padding class="form-page">
  <q-card inline class="main-box q-ma-sm " v-if="rsForm && FORM.show">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
      </form-header>
    </q-card-section>
    <q-separator />
    <q-card-section class="q-py-none">
      <div class="">
          <ux-select
          :disable="Boolean(rsForm.id) || Boolean(rsForm.packing_load_items.find(x => x.item))"
          filter clearable
          v-model="rsForm.customer"
          v-validate="'required'" data-vv-as="customer"
          :label="$tc('general.customer')" stack-label
          :source="`/api/v1/incomes/customers?mode=all&--limit=50`"
          :source-keys="['name', 'code']"
          :option-label="(opt) => opt.name"
          :name="`customer_id`"
          :error="errors.has(`customer_id`)"
          :error-message="errors.first(`customer_id`)"
          @input="(v) => {
            rsForm.customer_id = v ? v.id : null
          }"
        />
      </div>
      <q-markup-table dense flat>
        <thead>
          <tr class="text-uppercase">
            <q-th auto-width  class="no-padding"></q-th>
            <q-th width="35%">Partname</q-th>
            <q-th width="35%">Subname</q-th>
            <q-th width="20%">Quantity</q-th>
            <q-th width="10%">unit</q-th>
          </tr>
        </thead>
        <tbody>
          <q-tr v-for="(row, rowIndex) in rsForm.packing_load_items" :key="rowIndex">
            <q-th auto-width  class="no-padding">
              <q-btn dense outline color="blue-grey" icon="clear" @click="removeItem(rowIndex)" />
            </q-th>
            <q-td width="35%">
              <ux-select dense outlined hide-bottom-space autofocus
                :disable="!Boolean(rsForm.customer)"
                :name="`packing_load_items.${rowIndex}.item_id`"
                :data-vv-as="$tc('general.item')"
                v-model="row.item" clearable
                v-validate="`required|excluded_value:id,${rsForm.packing_load_items.filter((x,i) => i !== rowIndex).map(x => x.item_id).join(',')}`"
                popup-content-class="options-striped"
                filter
                :source="`/api/v1/common/items?mode=all&has_stocks=PFG&customer_id=${rsForm.customer_id}&or_ids=${ORID[rowIndex] || ''}&--with=item_units`"
                option-value="id"
                :option-label="(opt) => opt.part_name"
                :option-sublabel="(opt) => `[${opt.customer_code}] ${opt.part_subname}`"
                :error="errors.has(`packing_load_items.${rowIndex}.item_id`)"
                :error-message="errors.first(`packing_load_items.${rowIndex}.item_id`)"
                @input="(v) => {
                  row.unit = v ? v.unit : null
                  row.item_id = v ? v.id : null
                  row.unit_id = v ? v.unit_id : null
                  row.unit_rate = 1
                }"  />
            </q-td>
            <q-td width="35%">
              <q-field dense outlined hide-bottom-space readonly >
                <div slot="control" v-if="row.item" class="self-center">
                  [{{ row.item.customer_code }}] {{ row.item.part_subname }}
                </div>
              </q-field>
            </q-td>
            <q-td width="20%">
              <ux-numeric dense outlined hide-bottom-space
                :options="{ decimalPlaces: row.unit ? row.unit.decimal_in : 0 }"
                :disable="!Boolean(row.item)"
                :name="`packing_load_items.${rowIndex}.quantity`"
                :data-vv-as="$tc('label.quantity')"
                v-model="row.quantity" type="number" :min="0"
                v-validate="`required|max_value:${MaxUnit[rowIndex]}`"
                :suffix="row.item ? `/ ${$app.number_format(MaxUnit[rowIndex])}` : ''"
                :error="errors.has(`packing_load_items.${rowIndex}.quantity`)"
                :error-message="errors.first(`packing_load_items.${rowIndex}.quantity`)"
              />
            </q-td>
            <q-td width="10%">
              <q-select dense outlined hide-bottom-space style="min-width:100px"
                :disable="!Boolean(row.item)"
                :name="`packing_load_items.${rowIndex}.unit_id`"
                :data-vv-as="$tc('label.unit')"
                no-error-icon
                v-model="row.unit"
                :options="ItemUnitOptions[rowIndex]"
                option-value="id"
                option-label="code"
                v-validate="'required'"
                :error="errors.has(`packing_load_items.${rowIndex}.unit_id`)"
                :error-message="errors.first(`packing_load_items.${rowIndex}.unit_id`)"
                @input="(v) => {
                  row.unit_id = v ? v.id : null
                  row.unit_rate = v ? v.rate : 1
                }"
              />
            </q-td>
          </q-tr>
          <q-tr>
            <q-td class="no-padding">

            </q-td>
            <q-td colspan="100%">
              <q-btn dense outline color="blue-grey" icon-right="add_circle" :label="$tc('form.add_new')" class="fit"
                :disable="!Boolean(rsForm.customer)"
                @click="addNewItem"
              />
            </q-td>
          </q-tr>
        </tbody>
      </q-markup-table>
    </q-card-section>
    <q-separator spaced />
     <q-card-section>
      <!-- COLUMN::4th Description -->
      <q-input name="description" type="textarea" rows="3"
        stack-label :label="$tc('label.description')"
        filled
        v-model="rsForm.description"
      />
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
        // customers: { api: '/api/v1/incomes/customers?mode=all' },
        units: { api: '/api/v1/references/units?mode=all' }
      },
      FORM: {
        resource: {
          uri: '/admin/factories/packing-loads',
          api: '/api/v1/factories/packing-loads'
        }
      },
      rsForm: null,
      rsData: {},
      setDefault: () => {
        return {
          number: null,
          customer_id: null,
          customer: null,
          packing_load_items: [{
            item_id: null,
            unit_id: null,
            unit_rate: 1,
            item: null,
            unit: null,
            quantity: null
          }]
        }
      }
    }
  },
  created () {
    this.init()
  },
  computed: {
    CustomerOptions () {
      return (this.SHEET.customers.data.map(item => ({ label: [item.code, item.name].join(' - '), value: item.id })) || [])
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ ...item, label: item.code, value: item.id })) || [])
    },
    ItemUnitOptions () {
      if (!this.rsForm) return []
      return this.rsForm.packing_load_items.map(detail => {
        return this.UnitOptions.map((unit) => {
          if (!detail.item) return []
          if (detail.item.unit_id === unit.value) unit.rate = 1
          else if (detail.item.item_units) {
            let find = detail.item.item_units.find((fill) => fill.unit_id === unit.value)
            if (find) unit.rate = find.rate
          }
          return unit
        }).filter(x => x.rate) || []
      })
    },
    ItemStockLoaded () {
      return this.FORM.data.packing_load_items?.reduce((stocked, detail) => {
        const sum = (stocked[detail.item_id] || 0) + (detail.quantity * detail.unit_rate)
        return { ...stocked, [detail.item_id]: sum }
      }, {}) || {}
    },
    MaxUnit () {
      if (!this.rsForm) return []

      const itemLoaded = this.ItemStockLoaded
      const itemUsed = Object.assign({})
      const stockLoaded = ({
        use (detail) {
          if (!itemUsed.hasOwnProperty(detail.item_id)) itemUsed[detail.item_id] = 0
          const result = (itemLoaded[detail.item_id] || 0) - itemUsed[detail.item_id]
          itemUsed[detail.item_id] += (detail.quantity * (detail.unit_rate || 1))
          return result
        }
      })
      return this.rsForm.packing_load_items.map((detail, index) => {
        if (!detail.item) return 0
        const stock = (detail.item.totals['PFG'] || 0) / (detail.unit_rate || 1)
        const loaded = Number(stockLoaded.use(detail))

        return loaded + stock
      })
    },
    ORID () {
      if (!this.FORM.data) return []
      return this.FORM.data.packing_load_items.map(detail => detail.item_id)
    },
    MAPINGKEY () {
      let variables = {
        // 'customers': {},
        'units': {}
      }

      // this.SHEET['customers'].data.map(value => { variables['customers'][value.id] = value })
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
    setForm (data) {
      this.rsForm = JSON.parse(JSON.stringify(data))
    },
    addNewItem (autofocus = true) {
      let newEntri = this.setDefault().packing_load_items[0]
      this.rsForm.packing_load_items.push(newEntri)
    },
    removeItem (index) {
      this.rsForm.packing_load_items.splice(index, 1)
      if (this.rsForm.packing_load_items.length < 1) this.addNewItem()
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

      this.$validator.validate().then(result => {
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
