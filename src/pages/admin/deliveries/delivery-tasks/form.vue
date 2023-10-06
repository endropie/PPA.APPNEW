<template>
<q-page padding class="form-page justify-center">
  <q-card inline class="main-box" v-if="FORM.show && rsForm">
    <q-card-section class="q-py-xs">
      <form-header :title="FORM.title()" :subtitle="`# ` + (rsForm.fullnumber || rsForm.number || FORM.subtitle())" hide-menu>
        <template  slot="menu-append">
          <ux-chip-status square outline :row="rsForm" v-if="rsForm.status" />
        </template>
      </form-header>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-field borderless
        :label="$tc('label.mode', 0, 1 , { v: $tc('label.transaction') })" stack-label
        :error="errors.has('transaction')"
        :error-message="errors.first('transaction')"
      >
        <q-option-group slot="control" type="radio" inline
          name="transaction"
          v-model="rsForm.transaction"
          :options="CONFIG.options.transaction_mode"
          v-validate="'required'"
          :disable="Boolean(rsForm.customer_id)"
        />
      </q-field>
      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-md-6">
          <ux-select
            name="customer_id"
            :label="$tc('general.customer')"  stack-label
            v-model="rsForm.customer"
            filter clearable
            source="api/v1/incomes/customers?mode=all&--with=customer_trips"
            :source-keys="['name', 'code']"
            :option-label="(item) => `[${item.code}] ${item.name}`"
            option-value="id"
            :disable="!Boolean(rsForm.transaction) || Boolean(rsForm.trip_time) || Boolean(rsForm.delivery_task_items.find(i => i.item_id))"
            v-validate="'required'"
            :error="errors.has('customer_id')"
            :error-message="errors.first('customer_id')"
            @input="(v) => {
              rsForm.customer_id = v ? v.id : null
            }"
          />
        </div>
        <div class="col-12 col-md-6" >
          <div class="row q-gutter-xs">
            <ux-date type="date" class="col"
              name="date"
              :label="$tc('label.delivery_date')" stack-label
              :disable="!Boolean(rsForm.transaction) || Boolean(rsForm.trip_time) || Boolean(rsForm.delivery_task_items.find(i => i.item_id))"
              v-model="rsForm.date"
              v-validate="'required'"
              :error="errors.has('date')"
              :error-message="errors.first('date')"
            />
            <q-input type="time" class="col" no-error-icon
              name="trip_time"
              :label="$tc('label.time')" stack-label
              v-model="rsForm.trip_time"
              v-validate="'required'"
              :error="errors.has('trip_time')"
              :error-message="errors.first('trip_time')"
            >
            <q-btn slot="append" icon="arrow_drop_down" :disable="!rsForm.customer" dense flat class="no-padding self-end">
              <q-menu auto-close>
                <q-list bordered v-if="rsForm.customer && rsForm.customer.customer_trip">
                  <q-item clickable v-for="(ct, indexCT) in rsForm.customer.customer_trips.filter(x => x.intday === $app.moment(rsForm.date).day()) || []" :key="indexCT"
                    @click="rsForm.trip_time = ct.time"
                  >
                    <q-item-section>{{String(ct.time).substring(0,5)}}</q-item-section>
                    <q-item-section avatar>
                      <q-icon color="primary" name="timer" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            </q-input>
          </div>
        </div>
      </div>
    </q-card-section>
    <q-separator inset />
    <!-- SINGLE-REVISION -->
    <q-card-section :class="$app.classDimmed(!rsForm.customer_id) ">
      <!-- COLUMN:: Part items lists -->
      <q-markup-table bordered class="main-box no-shadow no-highlight q-mb-sm"
        dense separator="horizontal"
        >
        <thead>
          <q-tr class="text-uppercase" style="line-height:30px">
            <q-th key="prefix" width="50px"></q-th>
            <q-th key="part_name" width="30%">{{$tc('items.part_name')}}</q-th>
            <q-th key="part_number" width="30%">{{$tc('items.part_number')}}</q-th>
            <q-th key="quantity" width="15%">{{$tc('label.quantity')}}</q-th>
            <q-th key="unit" width="15%">{{$tc('label.unit')}}</q-th>
            <q-th key="encasement" width="25%">{{$tc('label.encasement')}}</q-th>
          </q-tr>
        </thead>
        <tbody>
          <q-tr v-for="(row, rowIndex) in rsForm.delivery_task_items" :key="rowIndex">
            <q-td name="prefix">
              <q-btn dense flat outline tabindex="1000" color="negative" icon="clear" @click="removeDetail(rowIndex)" />
            </q-td>
            <q-td name="name">
              <ux-select dense outlined hide-bottom-space
                v-model="row.item"
                filter clearable
                :source="`/api/v1/common/items?mode=all&--limit=50&enable=1&customer_id=${rsForm.customer_id}`"
                :source-key="['part_name', 'part_number', 'code']"
                option-label="part_name"
                :option-sublabel="(opt) => `[${opt.customer_code}] ${opt.part_number}`"
                v-validate="'required'"
                :name="`delivery_task_items.${rowIndex}.item_id`"
                :error-message="errors.first(`delivery_task_items.${rowIndex}.item_id`)"
                :autofocus="row.hasOwnProperty('_autofocus')"
                @focus="delete row._autofocus"
                @input="(v) => {
                  row.item_id = v ? v.id : null
                  row.unit_id = v ? v.unit_id : null
                  row.unit_rate = v ? 1 : null
                  row.unit = v ? { value: v.unit.id, label: v.unit.code, rate:1 } : null
                }"
              />
            </q-td>
            <q-td name="subname">
              <q-field dense outlined hide-bottom-space readonly v-if="row.item">
                <div slot="control" class="self-center">[{{ row.item.customer_code }}] {{ row.item.part_subname }}</div>
              </q-field>
            </q-td>
            <q-td name="quantity">
              <q-input type="number" dense outlined hide-bottom-space
                v-model="row.quantity"
                v-validate="'required'"
                :name="`delivery_task_items.${rowIndex}.quantity`"
                :error="errors.has(`delivery_task_items.${rowIndex}.quantity`)"
              />
            </q-td>
            <q-td name="satuan">
              <q-select type="text" dense outlined hide-bottom-space
                v-model="row.unit"
                :options="ItemUnitOptions[rowIndex]"
                :option-label="opt => opt.code || opt.label"
                v-validate="'required'"
                :name="`delivery_task_items.${rowIndex}.unit_id`"
                :error="errors.has(`delivery_task_items.${rowIndex}.unit_id`)"
                @input="(v) => {
                  row.unit_id = v.value
                  row.unit_rate = v.rate
                }"
              />
            </q-td>
            <q-td name="encasement">
              <q-input type="text" dense outlined hide-bottom-space
                v-model="row.encasement"
                :name="`delivery_task_items.${rowIndex}.encasement`"
                :error="errors.has(`delivery_task_items.${rowIndex}.encasement`)"
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

      <q-input type="textarea" autogrow
        filled class="q-mb-sm" input-style="min-height:45px"
        v-model="rsForm.description"
        :label="$tc('label.description')" stack-label
      />
    </q-card-section>
    <q-separator />
    <q-card-actions class="q-mx-sm" :vertical="$q.screen.lt.sm">
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
          api: '/api/v1/incomes/delivery-tasks',
          uri: '/admin/deliveries/delivery-tasks'
        }
      },
      rsForm: null,
      setDefault: () => {
        return {
          number: null,
          date: this.$app.moment().format('YYYY-MM-DD'),
          trip_time: null,
          customer: null,
          customer_id: null,
          description: null,
          delivery_task_items: [
            {
              item: null,
              item_id: null,
              unit: null,
              unit_id: null,
              unit_rate: null,
              quantity: null,
              encasement: null
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
      return this.rsForm.delivery_task_items.map((rsItem, key) => {
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
    }
  },
  watch: {
    '$route': 'init'
  },
  methods: {
    loadIncomingGood (id, data) {
      this.$axios.get(`/api/v1/warehouses/incoming-goods/${id}`)
        .then((response) => {
          data = Object.assign(data, {
            incoming_good_id: response.data.id,
            customer: response.data.customer,
            customer_id: response.data.customer_id,
            transaction: response.data.transaction,
            // date: response.data.date,
            delivery_task_items: response.data.incoming_good_items.map(detail => ({
              item: detail.item,
              item_id: detail.item_id,
              unit: detail.unit,
              unit_id: detail.unit_id,
              quantity: detail.quantity,
              unit_rate: detail.unit_rate

            }))
          })
          this.setForm(data || this.setDefault())
        })
        .catch((error) => {
          let message = 'Incoming Good cant load!'
          if (error.response) message += ` [${error.response.statusText}:${error.response.status}]`

          this.$q.dialog({ title: 'LOAD ERROR', message }).onDismiss(() => this.$router.back())
        })
    },
    init () {
      this.FORM.load((data) => {
        if (!this.$route.query.incoming_good_id) {
          return this.setForm(data || this.setDefault())
        }

        this.loadIncomingGood(this.$route.query.incoming_good_id, data)
      })
    },
    setForm (data) {
      this.rsForm = Object.assign({}, this.setDefault(), data)
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
