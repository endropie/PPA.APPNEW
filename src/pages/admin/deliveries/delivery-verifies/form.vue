<template>
<q-page padding class="form-page flex flex-center">
  <q-card inline class="main-box" v-if="FORM.show" style="max-width:600px">
    <q-card-section class="q-py-xs">
      <form-header :title="FORM.title()" :subtitle="`# ` + (rsForm.fullnumber || rsForm.number || FORM.subtitle())" hide-menu />
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="q-gutter-x-md">
        <ux-select
          name="customer_id"
          :label="$tc('general.customer')"  stack-label
          v-model="rsForm.customer"
          filter clearable
          source="api/v1/incomes/customers?mode=all"
          :source-keys="['name', 'code']"
          :option-label="(item) => `[${item.code}] ${item.name}`"
          option-value="id"
          :disable="Boolean(rsForm.item_id)"
          v-validate="'required'"
          :error="errors.has('customer_id')"
          :error-message="errors.first('customer_id')"
          @input="(v) => {
            rsForm.customer_id = v ? v.id : null
          }"
        />

        <div class="row q-gutter-xs">
          <ux-date type="date" no-error-icon
            style="min-width:100px"
            name="date"
            :label="$tc('label.date')" stack-label
            v-model="rsForm.date"
            :disable="Boolean(rsForm.item_id)"
            v-validate="'required'"
            :error="errors.has('date')"
            :error-message="errors.first('date')"
          />
          <q-space/>
          <!-- <q-select dense outlined no-error-icon
            style="min-width: 100px"
            name="rit"
            v-model="rsForm.rit"
            :options="[1,2,3,4,5,6,7,8,9,10]"
            prefix="RIT"
            v-validate="'required'"
            :error="errors.has('rit')"
            :error-message="errors.first('rit')"
          /> -->
        </div>
      </div>
    </q-card-section>
    <q-separator spaced inset />
    <q-card-section class="column" :class="$app.classDimmed(!Boolean(rsForm.customer_id && rsForm.date))">

      <ux-select dense outlined
        :label="$tc('label.part')"
        v-model="rsForm.item"
        filter clearable
        :source="`/api/v1/common/items?mode=all&--limit=50&enable=1&delivery_date=${rsForm.date}&customer_id=${rsForm.customer_id}`"
        :source-key="['part_name', 'part_number', 'code']"
        option-label="part_name"
        :option-sublabel="(opt) => `[${opt.customer_code}] ${opt.part_number}`"
        v-validate="'required'"
        :name="`item_id`"
        :error="errors.has(`item_id`)"
        :error-message="errors.first(`item_id`)"
        @input="(v) => {
          rsForm.item_id = v ? v.id : null
          rsForm.unit_id = v ? v.unit_id : null
          rsForm.unit_rate = v ? 1 : null
          rsForm.unit = v ? { value: v.unit.id, label: v.unit.code, rate:1 } : null
        }"
      />

      <q-field dense outlined readonly v-if="rsForm.item" class="q-mb-md">
        <div slot="control" class="self-center">[{{ rsForm.item.customer_code }}] {{ rsForm.item.part_subname }}</div>
      </q-field>

      <div class="row">

        <q-input type="number" dense outlined
          :label="$tc('label.quantity')"
          v-model="rsForm.quantity"
          v-validate="'required'"
          :name="`quantity`"
          :error="errors.has(`quantity`)"
          :error-message="errors.first(`quantity`)"
        />

        <q-select type="text" dense outlined hide-dropdown-icon no-error-icon
          class="on-right" style="min-width:100px"
          :label="$tc('label.unit')"
          v-model="rsForm.unit"
          :options="ItemUnitOptions"
          :option-label="opt => opt.code || opt.label"
          v-validate="'required'"
          :name="`unit_id`"
          :error="errors.has(`unit_id`)"
          @input="(v) => {
            rsForm.unit_id = v.value
            rsForm.unit_rate = v.rate
          }"
        />

      </div>

      <q-input type="text" dense outlined
        :label="$tc('label.encasement')"
        v-model="rsForm.encasement"
        name="encasement"
        :error="errors.has('encasement')"
          :error-message="errors.first(`encasement`)"
      />
    </q-card-section>
    <q-separator inset />
    <q-separator  />
    <q-card-actions class="q-mx-lg">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" >
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
        units: { data: [], api: '/api/v1/references/units?mode=all' }
      },
      FORM: {
        resource: {
          api: '/api/v1/incomes/delivery-verifies',
          uri: '/admin/deliveries/delivery-verifies'
        }
      },
      rsForm: null,
      setDefault: () => {
        return {
          date: this.$app.moment().format('YYYY-MM-DD'),
          rit: null,
          customer: null,
          customer_id: null,
          item: null,
          item_id: null,
          unit: null,
          unit_id: null,
          unit_rate: null,
          quantity: null,
          encasement: null
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
      const item = this.rsForm.item
      return this.UnitOptions
        .filter((unit) => {
          if (!item) return
          if (item.unit_id === unit.value) return true

          const find = item.item_units.find((fill) => fill.unit_id === unit.value)
          if (item.item_units && find) return true
        })
        .map(unit => {
          if (item.unit_id === unit.value) return { ...unit, rate: 1 }
          const find = item.item_units.find((fill) => fill.unit_id === unit.value)
          if (item.item_units && find) {
            return { ...unit, rate: find.rate }
          }
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
      this.rsForm = Object.assign({}, this.setDefault(), data)
    },
    setItemRow (v, i) {
      this.rsForm.delivery_task_items[i].item_id = v ? v.id : null
      this.rsForm.delivery_task_items[i].unit_rate = null
      this.rsForm.delivery_task_items[i].unit_id = null
      this.rsForm.delivery_task_items[i].unit = null
    },
    addNewDetail () {
      const newitem = Object.assign(this.setDefault().delivery_task_items[0], { _autofocus: true })
      this.rsForm.delivery_task_items.push(newitem)
    },
    removeDetail (index) {
      this.rsForm.delivery_task_items.splice(index, 1)
      if (!this.rsForm.delivery_task_items.length) this.addNewDetail()
    },
    onSave () {
      const submit = () => {
        this.FORM.loading = true
        const { apiUrl, method } = this.FORM.meta()
        this.$axios.set(method, apiUrl, this.rsForm)
          .then((response) => {
            let message = (response.data.item ? response.data.item.part_name : 'PART') + ' - #' + response.data.id
            this.FORM.response.success({ message: message })
            this.$router.back()
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
          console.error('ERROR', this.errors)
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
