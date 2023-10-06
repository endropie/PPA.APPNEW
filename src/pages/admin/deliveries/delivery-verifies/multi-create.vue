<template>
<q-page padding class="form-page flex flex-center">
  <q-card inline class="main-box" v-if="FORM.show" style="">
    <q-card-section class="q-py-xs q-pb-none">
      <form-header :title="FORM.title()" :subtitle="`# ` + (rsForm.fullnumber || rsForm.number || FORM.subtitle())" hide-menu />
    </q-card-section>
    <q-separator />
    <q-card-section class="q-pb-none">
      <div class="row q-col-gutter-sm">
        <ux-select class="col-12 col-sm-6"
          name="customer_id"
          :label="$tc('general.customer')"  stack-label
          v-model="rsForm.customer"
          filter clearable
          source="api/v1/incomes/customers?mode=all"
          :source-keys="['name', 'code']"
          :option-label="(item) => `[${item.code}] ${item.name}`"
          option-value="id"
          :disable="Boolean(rsForm.multi_items.find(x => x.item_id))"
          v-validate="'required'"
          :error="errors.has('customer_id')"
          :error-message="errors.first('customer_id')"
          @input="(v) => {
            rsForm.customer_id = v ? v.id : null
          }"
        />

        <div class="row col-12 col-sm-6 no-wrap">
          <ux-date type="date" no-error-icon
            style="min-width:100px"
            name="date"
            :label="$tc('label.date')" stack-label
            v-model="rsForm.date"
            :disable="Boolean(rsForm.multi_items.find(x => x.item_id))"
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
    <q-separator inset />
    <q-card-section :class="$app.classDimmed(!Boolean(rsForm.customer_id && rsForm.date))">
      <q-markup-table bordered class="main-box no-shadow no-highlight q-mb-sm"
        dense separator="horizontal"
        >
        <thead>
          <q-tr class="text-uppercase" style="line-height:30px">
            <q-th key="prefix" width="50px"></q-th>
            <q-th key="item" width="30%">{{$tc('items.part_name')}}</q-th>
            <q-th key="item_subname" width="30%">{{$tc('items.part_number')}}</q-th>
            <q-th key="quantity" width="15%">{{$tc('label.quantity')}}</q-th>
            <q-th key="unit" width="15%">{{$tc('label.unit')}}</q-th>
            <q-th key="encasement" width="25%">{{$tc('label.encasement')}}</q-th>
          </q-tr>
        </thead>
        <tbody>
          <q-tr v-for="(row, rowIndex) in rsForm.multi_items" :key="rowIndex">
            <q-td key="prefix" class="q-py-none">
              <q-btn dense flat outline tabindex="1000" color="negative" icon="clear" @click="removeDetail(rowIndex)" />
            </q-td>
            <q-td key="item">
              <ux-select dense outlined hide-bottom-space hide-dropdown-icon
                :label="$tc('label.part')"
                v-model="row.item"
                filter clearable
                :source="`/api/v1/common/items?mode=all&--limit=50&enable=1&delivery_date=${rsForm.date}&amount_delivery_to_verify&customer_id=${rsForm.customer_id}`"
                :source-key="['part_name', 'part_number', 'code']"
                option-label="part_name"
                :option-sublabel="(opt) => `[${opt.customer_code}] ${opt.part_number} (${opt.customer_code})`"
                v-validate="'required'"
                :name="`multi_items.${rowIndex}.item_id`"
                :error="errors.has(`multi_items.${rowIndex}.item_id`)"
                @input="(v) => {
                  row.item_id = v ? v.id : null
                  row.unit_id = v ? v.unit_id : null
                  row.unit_rate = v ? 1 : null
                  row.unit = v ? { value: v.unit.id, label: v.unit.code, rate:1 } : null
                }"
              />
            </q-td>
            <q-td key="item_subname">
              <q-field dense outlined hide-bottom-space readonly>
                <div slot="control"  v-if="row.item" class="self-center">[{{ row.item.customer_code }}] {{ row.item.part_subname }}</div>
              </q-field>
            </q-td>
            <q-td key="quantity">
              <q-input type="number" dense outlined no-error-icon hide-bottom-space
                input-style="min-width:75px"
                v-model="row.quantity"
                :name="`multi_items.${rowIndex}.quantity`"
                :data-vv-as="$tc('label.quantity')"
                v-validate="`required|max_value:${UnitMax[rowIndex]}`"
                :error="errors.has(`multi_items.${rowIndex}.quantity`)"
                :error-message="errors.first(`multi_items.${rowIndex}.quantity`)"
              >
                <span slot="append" class="text-subtitle2" >
                  <span v-if="UnitMax[rowIndex] > 0">/ {{$app.number_format(UnitMax[rowIndex])}}</span>
                  <span v-else>[~]</span>
                </span>
              </q-input>
            </q-td>
            <q-td key="unit">
              <q-select type="text" dense outlined hide-dropdown-icon no-error-icon hide-bottom-space
                style="min-width:100px"
                :label="$tc('label.unit')"
                v-model="row.unit"
                :options="ItemUnitOptions[rowIndex]"
                :option-label="opt => opt.code || opt.label"
                :name="`multi_items.${rowIndex}.unit_id`"
                v-validate="'required'"
                :error="errors.has(`multi_items.${rowIndex}.unit_id`)"
                @input="(v) => {
                  row.unit_id = v.value
                  row.unit_rate = v.rate
                }"
              />
            </q-td>
            <q-td key="encesement">
              <q-input type="text" dense outlined hide-bottom-space
                input-style="min-width:100px"
                :label="$tc('label.encasement')"
                v-model="row.encasement"
                :name="`multi_items.${rowIndex}.encasement`"
                :error="errors.has(`multi_items.${rowIndex}.encasement`)"
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
    </q-card-section>
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
          multi_items: [{
            item: null,
            item_id: null,
            unit: null,
            unit_id: null,
            unit_rate: null,
            quantity: null,
            encasement: null
          }]
        }
      }
    }
  },
  created () {
    // Component Page Created!
    this.init()
  },
  computed: {
    UnitMax () {
      let maximum = Object.assign({
        total: {},
        add: function (id, v) {
          if (!maximum.total[id]) maximum.total[id] = 0
          maximum.total[id] += v
        }
      })
      return this.rsForm.multi_items.map((detail, i) => {
        if (!detail.item) return 0
        let available = detail.item.amount_delivery
        if (!maximum.total[detail.item.id]) maximum.total[detail.item.id] = 0
        let result = available - maximum.total[detail.item.id]
        maximum.add(detail.item.id, detail.quantity * detail.unit_rate)
        if (result < 0.1) result = 0
        return result / (detail.unit_rate || 1)
      })
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemUnitOptions () {
      return this.rsForm.multi_items.map(detail => {
        const item = detail.item
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
      this.rsForm.multi_items[i].item_id = v ? v.id : null
      this.rsForm.multi_items[i].unit_rate = null
      this.rsForm.multi_items[i].unit_id = null
      this.rsForm.multi_items[i].unit = null
    },
    addNewDetail () {
      const newitem = Object.assign(this.setDefault().multi_items[0], { _autofocus: true })
      this.rsForm.multi_items.push(newitem)
    },
    removeDetail (index) {
      this.rsForm.multi_items.splice(index, 1)
      if (!this.rsForm.multi_items.length) this.addNewDetail()
    },
    onSave () {
      const submit = () => {
        this.FORM.loading = true
        const { apiUrl, method } = this.FORM.meta()
        this.$axios.set(method, `${apiUrl}?mode=multi-store`, this.rsForm)
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
