<template>
<q-page padding class="form-page">
  <q-card inline class="main-box" :dark="LAYOUT.isDark" v-if="FORM.show">
    <q-card-section>
      <form-header
        :title="FORM.title()"
        :subtitle="FORM.subtitle()">
      </form-header>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark"></q-separator>
    <!-- COLUMN::1st Transaction details -->
    <q-card-section class="row q-col-gutter-x-md">
      <div class="col-12 col-sm-6 column">

        <q-input
          :name="`number`"
          :label="$tc('label.no',1, {v:'voucher'})"
          :data-vv-as="$tc('label.number')"
          v-model="rsForm.number"
          :dark="LAYOUT.isDark"
          v-validate="'required|integer'"
          :error="errors.has(`number`)"
          :error-message="errors.first(`number`)"/>

        <ux-select
          name="item_id"
          :label="$tc('items.part_name')"
          :data-vv-as="$tc('items.part_name')"
          popup-content-class="options-striped"
          v-model="rsForm.item_id" clearable
          v-validate="'required'"
          filter
          source="api/v1/common/items?mode=all&--limit=50"
          :source-keys="['part_name', 'part_number']"
          option-value="id" emit-value map-options
          :option-label="(item) => item.part_name || rsForm.item.part_name"
          :option-sublabel="(item) => `[${item.customer_code}] ${item.part_subname || '--'}`"
          :option-disable="(item) => !item.enable"
          :options-dark="LAYOUT.isDark"
          :dark="LAYOUT.isDark"
          @selected="(val, opt)=>{ setItemReference(val, opt) }"
          :error="errors.has(`item_id`)"
          :error-message="errors.first(`item_id`)" >
          <span slot="hint" v-if="rsForm.item_id && rsForm.item">
            [{{rsForm.item.customer_code}}] {{rsForm.item.part_subname || '--'}}
          </span>
        </ux-select>
      </div>

      <div class="col-12 col-sm-6 column">
        <q-select
          :name="`stockist`"
          label="STOCKIST"
          :data-vv-as="$tc('items.stockist')"
          v-model="rsForm.stockist"
          :disable="!Boolean(rsForm.item_id)"
          :options="StockistOptions"
          option-label="code"
          option-value="value"
          emit-value map-options
          v-validate="'required'"
          :error="errors.has(`stockist`)"
          :error-message="errors.first(`stockist`)"
          @input="(val) => setStockistReference(val) " />

        <q-input type="number" input-style="text-align:left"
          :name="`quantity`"
          :label="$tc('label.quantity')"
          :data-vv-as="$tc('label.quantity')"
          v-model="rsForm.quantity"
          v-validate="'required'"
          :dark="LAYOUT.isDark"
          :error="errors.has(`quantity`)"
          :error-message="errors.first(`quantity`)">
          <q-select slot="after" class="no-padding" style="min-width:50px"
            :name="`unit_id`"
            :data-vv-as="$tc('label.unit')"
            v-model="rsForm.unit_id"
            map-options emit-value no-error-icon hide-dropdown-icon
            :options="ItemUnitOptions"
            :options-dark="LAYOUT.isDark"
            :dark="LAYOUT.isDark"
            v-validate="rsForm.item_id ? 'required' : ''"
            :error="errors.has(`unit_id`)"
            @input="(val)=> { setUnitReference(val) }"/>
        </q-input>

        <q-input class="hidden" v-model="rsForm.unit_rate" />
      </div>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark" />
    <q-card-actions class="q-mx-lg">
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" v-if="IS_EDITABLE"
        :loading="FORM.loading" />

      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.list')" icon="list" color="dark" :to="`${FORM.resource.uri}?return`"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" :dark="LAYOUT.isDark"><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      SHEET: {
        units: { api: '/api/v1/references/units?mode=all' }
      },
      FORM: {
        resource: {
          uri: '/admin/warehouses/opname-vouchers',
          api: '/api/v1/warehouses/opname-vouchers'
        }
      },
      rsForm: {},
      setDefault: () => {
        return {
          number: null,
          stockist: null,
          item_id: null,
          item: null,
          quantity: null,
          unit_id: null,
          unit_rate: 1
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
      return this.$app.can('opname-vouchers-update')
    },
    FinalAmount () {
      const total = this.rsForm.opname_vouchers.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_rate)
      }, 0)
      return Number(total)
    },
    StockistOptions () {
      let include = ['FM', 'WIP', 'PFG', 'FG', 'NC', 'NCR', 'NG']
      return this.$store.state['admin'].CONFIG.items.stockists
        .filter(x => include.some(e => e === x.value))
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemUnitOptions () {
      if (!this.UnitOptions) return []
      if (!this.rsForm.item) return []

      const item = this.rsForm.item
      return this.UnitOptions.filter(unit => {
        if (unit.value === item.unit_id) return true
        return item.item_units.find(x => x.unit_id === unit.value)
      })
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

      if (Object.keys(data['has_relationship'] || {}).length > 0) {
        this.FORM.response.relationship({
          title: 'Stock Opname has relations!',
          messages: data['has_relationship'],
          then: () => this.$router.push(`${this.FORM.resource.uri}/${data.id}`)
        })
      }
    },
    setItemReference (val, opt) {
      this.rsForm.init_amount = 0
      this.rsForm.item = (val) ? opt : null

      if (this.rsForm.item) {
        this.rsForm.unit_id = this.rsForm.item.unit_id
        this.rsForm.unit_rate = 1

        if (this.rsForm.stockist) this.setStockistReference(this.rsForm.stockist)
      }
    },
    setStockistReference (val) {
      const totals = this.rsForm.item.totals || {}
      this.rsForm.init_amount = Number(totals[val] || 0)
    },
    setUnitReference (val) {
      if (!val) return false
      else if (this.rsForm.item.unit_id === val) {
        this.rsForm.unit_rate = 1
      } else {
        if (this.rsForm.item.item_units) {
          this.rsForm.item.item_units.map((unitItem) => {
            if (unitItem.unit_id === val) this.rsForm.unit_rate = unitItem.rate
            console.warn('rate', this.rsForm.unit_rate)
          })
        }
      }
    },
    addNewItem (autofocus) {
      autofocus = autofocus || false
      let newEntri = this.setDefault().opname_vouchers[0] // {id:null, item_id: null, quantity: null};
      if (this.rsForm.item) newEntri.unit_id = this.rsForm.item.unit_id

      this.rsForm.opname_vouchers.push(newEntri)
    },
    removeItem (index) {
      this.rsForm.opname_vouchers.splice(index, 1)
      if (this.rsForm.opname_vouchers.length < 1) this.addNewItem()
    },

    onSave () {
      const submit = () => {
        this.FORM.loading = true
        let { method, apiUrl } = this.FORM.meta()
        this.$axios.set(method, apiUrl, this.rsForm)
          .then((response) => {
            let message = `${this.$tc('label.no', 1, { v: 'voucher' })} ${response.data.number}  [#${response.data.id}]`
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

        submit()
      })
    }
  }
}
</script>
