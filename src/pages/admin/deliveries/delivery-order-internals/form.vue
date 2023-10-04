<template>
<q-page padding class="form-page justify-center">
  <q-card inline class="main-box" v-if="FORM.show">
    <q-card-section class="q-py-xs">
      <form-header :title="FORM.title()" :subtitle="`# ` + (rsForm.fullnumber || rsForm.number || FORM.subtitle())" hide-menu>
        <template  slot="menu-append">
          <ux-chip-status square outline :row="rsForm" v-if="rsForm.status" />
        </template>
      </form-header>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="row q-col-gutter-x-md">
        <q-field class="col-12"
          borderless stack-label hide-bottom-space
          :label="$tc('label.mode',1, {v:$tc('label.transaction')})"
          :error="errors.has('transaction')">

        <q-option-group slot="control"
          name="transaction" type="radio" inline
          v-model="rsForm.transaction"
          v-validate="'required'"
          :options="CONFIG.options['transaction_mode']"
        />
      </q-field>
        <div class="col-12 col-md-6">
          <ux-select
            name="customer_id"
            :label="$tc('general.customer')"  stack-label
            v-model="rsForm.customer"
            :disable="Boolean(rsForm.delivery_order_items.find(detail => detail.item_id))"
            filter clearable
            source="api/v1/incomes/customers?mode=all"
            :option-label="(item) => `[${item.code}] ${item.name}`"
            option-value="id"
            :option-disable="(c) => !c.enable || c.order_mode === 'ACCUMULATE'"
            v-validate="'required'"
            :error="errors.has('customer_id')"
            :error-message="errors.first('customer_id')"
            @input="(v) => {
              rsForm.customer = v ? v : null
              rsForm.customer_id = v ? v.id : null
              rsForm.customer_name = v ? v.name : null
              rsForm.customer_phone = v ? v.phone : null
              rsForm.customer_address = v ? v.address : null
            }"
          />
          <div class="row q-col-gutter-sm" :class="{ 'column': $q.screen.lt.sm }">
            <ux-select class="col-6"
              name="vehicle_id"
              :label="$tc('general.vehicle')"  stack-label
              v-model="rsForm.vehicle"
              filter clearable
              source="api/v1/references/vehicles?mode=all&type=DELIVERY"
              :option-label="(item) => `${item.number}`"
              option-value="id"
              v-validate="'required'"
              :error="errors.has('vehicle_id')"
              :error-message="errors.first('vehicle_id')"
              @input="(v) => {
                rsForm.vehicle = v ? v : null
                rsForm.vehicle_id = v ? v.id : null
              }"
            />
            <ux-date class="col-6"
              name="date" type="date"
              :label="$tc('label.date')"
              v-model="rsForm.date"
              :dark="LAYOUT.isDark"
              v-validate="'required'"
              :error="errors.has('date')"
              :error-message="errors.first('date')"
            />
          </div>
        </div>
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
      </div>
    </q-card-section>
    <q-separator inset />
    <q-card-section :class="$app.classDimmed(!rsForm.customer_id) ">
      <!-- COLUMN:: Part items lists -->
      <q-markup-table bordered class="main-box no-shadow no-highlight q-mb-sm"
        dense separator="horizontal"
        :dark="LAYOUT.isDark">
        <thead>
          <q-tr class="text-uppercase" style="line-height:30px">
            <q-th key="prefix" width="50px"></q-th>
            <q-th key="name" width="25%">{{$tc('items.part_name')}}</q-th>
            <q-th key="subname" width="25%">{{$app.setting('item.subname_label')}}</q-th>
            <q-th key="quantity" width="10%">{{$tc('label.quantity')}}</q-th>
            <q-th key="unit" width="10%">{{$tc('label.unit')}}</q-th>
            <q-th key="note" width="35%">{{$tc('label.note')}}</q-th>
          </q-tr>
        </thead>
        <tbody>
          <q-tr v-for="(row, rowIndex) in rsForm.delivery_order_items" :key="rowIndex">
            <q-td name="prefix">
              <q-btn dense flat outline tabindex="1000" color="negative" icon="clear" @click="removeDetail(rowIndex)" />
            </q-td>
            <q-td name="name">
              <ux-select dense outlined hide-bottom-space
                style="min-width:250px"
                v-model="row.item" emit-value
                filter clearable
                :source="`/api/v1/common/items?mode=all&--limit=50&enable=1${rsForm.customer_id ? '&customer_id='+rsForm.customer_id : ''}`"
                :source-key="['part_name', 'part_number', 'code']"
                option-label="part_name"
                :option-sublabel="(opt) => `[${opt.customer_code}] ${opt.part_number}`"
                v-validate="'required'"
                :name="`delivery_order_items.${rowIndex}.item_id`"
                :error="errors.has(`delivery_order_items.${rowIndex}.item_id`)"
                @input="(v) => {
                  row.item = v ? v : null
                  row.item_id = v ? v.id : null
                  row.unit = v ? { value: v.unit.id, label: v.unit.code } : null
                  row.unit_id = v ? v.unit.id : null
                  row.unit_rate = 1
                }"
              />
            </q-td>
            <q-td name="subname">
              <q-input type="text" dense outlined hide-bottom-space
                input-style="min-width:150px"
                :value="row.item ? row.item.part_subname : ''" readonly disable
                v-validate="'required'"
                :name="`delivery_order_items.${rowIndex}.subname`"
                :error="errors.has(`delivery_order_items.${rowIndex}.subname`)"
              />
            </q-td>
            <q-td name="quantity">
              <q-input type="number" dense outlined hide-bottom-space no-error-icon
                input-style="min-width:75px"
                v-model="row.quantity"
                v-validate="'required'"
                :name="`delivery_order_items.${rowIndex}.quantity`"
                :error="errors.has(`delivery_order_items.${rowIndex}.quantity`)"
                :error-message="errors.first(`delivery_order_items.${rowIndex}.quantity`)"
              />
            </q-td>
            <q-td name="unit">
              <ux-select dense outlined hide-bottom-space hide-dropdown-icon
                input-style="min-width:75px"
                v-model="row.unit"
                clearable
                :options="ItemUnitOptions[rowIndex]"
                v-validate="'required'"
                :name="`delivery_order_items.${rowIndex}.unit_id`"
                :error="errors.has(`delivery_order_items.${rowIndex}.unit_id`)"
                @input="(v) => {
                  row.unit = v ? v : null
                  row.unit_id = v ? v.value : null
                  row.unit_rate = v ? v.rate : null
                }"
              />
            </q-td>
            <q-td name="note">
              <q-input type="text" dense outlined hide-bottom-space no-error-icon
                input-style="min-width:150px"
                v-model="row.note"
                :name="`delivery_order_items.${rowIndex}.note`"
                :error="errors.has(`delivery_order_items.${rowIndex}.note`)"
              />
            </q-td>
          </q-tr>
          <q-tr>
            <q-td>
              <q-btn dense color="positive" icon="add" @click="addNewDetail" />
            </q-td>
            <q-td rowspan="100%"></q-td>
          </q-tr>
        </tbody>
      </q-markup-table>
      <div>
          <q-input type="textarea" autogrow rows="1"
            filled class="q-mb-sm self-start"
            v-model="rsForm.description"
            :label="$tc('label.description')" stack-label
          />
      </div>
      <div class="row q-col-gutter-sm q-mb-sm">
        <q-select class="self-start col-12 col-md-auto" type="text" hide-bottom-space
          filled style="min-width:150px"
          emit-value map-options
          v-model="rsForm.internal_reason_id"
          :options="ReasonOptions"
          :label="$tc('label.reason')"
        />
        <q-input class="col-12 col-md" type="text" autogrow hide-bottom-space
          name="internal_reason_description"
          filled
          v-model="rsForm.internal_reason_description"
          :label="$tc('label.reason') + ' Internal'"
          v-validate="Boolean(rsForm.internal_reason_id) ? '' : 'required'"
          :error="errors.has('internal_reason_description')"
        />
      </div>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark" />
    <q-card-actions class="q-mx-lg">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" :dark="LAYOUT.isDark">
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
        units: { api: '/api/v1/references/units?mode=all' },
        reasons: { api: '/api/v1/references/reasons?mode=all&type=DELIVERY_INTERNAL' }
      },
      FORM: {
        resource: {
          api: '/api/v1/incomes/delivery-order-internals',
          uri: '/admin/deliveries/delivery-order-internals'
        }
      },
      rsForm: null,
      setDefault: () => {
        return {
          number: null,
          date: this.$app.moment().format('YYYY-MM-DD'),
          transaction: null,
          customer: null,
          customer_id: null,
          customer_name: null,
          customer_phone: null,
          customer_address: null,
          description: null,
          internal_reason_id: null,
          internal_reason_description: null,
          is_internal: 1,
          delivery_order_items: [
            {
              item_id: null,
              quantity: null,
              unit_id: null,
              unit_rate: 1,
              item: null,
              unit: null,
              note: null
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
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemUnitOptions () {
      // return varItemUnits
      return this.rsForm.delivery_order_items.map((rsItem, key) => {
        return this.UnitOptions
          .filter((unit) => {
            if (!rsItem.item) return
            if (rsItem.item.unit_id === unit.value) return true

            const find = rsItem.item.item_units.find((fill) => fill.unit_id === unit.value)
            if (rsItem.item.item_units && find) return true
          })
          .map(unit => {
            if (rsItem.item.unit_id === unit.value) return { ...unit, rate: 1 }
            const find = rsItem.item.item_units.find((fill) => fill.unit_id === unit.value)
            if (rsItem.item.item_units && find) {
              return { ...unit, rate: find.rate }
            }
          })
      })
    },
    ReasonOptions () {
      return (this.SHEET.reasons.data
        .filter(item => item.enable)
        .map(item => ({ label: item.name, value: item.id })) || [])
        .concat([{ label: this.$tc('label.others'), value: 0 }])
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
      this.rsForm = Object.assign(this.setDefault(), data)
    },

    addNewDetail () {
      const newitem = Object.assign(this.setDefault().delivery_order_items[0])
      this.rsForm.delivery_order_items.push(newitem)
    },
    removeDetail (index) {
      this.rsForm.delivery_order_items.splice(index, 1)
      if (!this.rsForm.delivery_order_items.length) this.addNewDetail()
    },
    onSave () {
      const submit = () => {
        this.FORM.loading = true
        const { apiUrl, method } = this.FORM.meta()
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
