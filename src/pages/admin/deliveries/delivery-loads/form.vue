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
      <q-field borderless dense hide-bottom-space
        :label="$tc('label.mode', 0, 1 , { v: $tc('label.transaction') })" stack-label
        :error="errors.has('transaction')"
        :error-message="errors.first('transaction')"
      >
        <q-option-group slot="control" type="radio" inline class="q-mt-sm"
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
            :label="$tc('general.customer')"  stack-label
            v-model="rsForm.customer"
            filter clearable
            source="api/v1/incomes/customers?mode=all&--with=customer_trips"
            :source-keys="['name', 'code']"
            :option-label="(item) => `[${item.code}] ${item.name}`"
            :disable="Boolean(!rsForm.transaction) || Boolean(rsForm.trip_time) || Boolean(rsForm.delivery_load_items.find(i => i.item_id))"
            v-validate="'required'"
            name="customer_id" :data-vv-as="$tc('general.customer')"
            :error="errors.has('customer_id')"
            :error-message="errors.first('customer_id')"
            @input="(v) => {
              rsForm.customer_id = v ? v.id : null
              rsForm.customer_name = v ? v.name : null
              rsForm.customer_phone = v ? v.phone : null
              rsForm.customer_address = v ? v.address : null
              rsForm.order_mode = v ? v.order_mode : null
              loadTrip()
            }"
          />
          <div class="row q-col-gutter-x-sm">
            <ux-date type="date" no-error-icon
              class="col-12 col-sm-6"
              :label="$tc('label.date')" stack-label
              v-model="rsForm.date"
              :disable="Boolean(!rsForm.transaction) || Boolean(rsForm.trip_time) || Boolean(rsForm.delivery_load_items.find(i => i.item_id))"
              v-validate="'required'"
              name="date"
              :error="errors.has('date')"
              :error-message="errors.first('date')"
              @input="loadTrip"
            />
            <q-field borderless no-error-icon class="col-12 col-sm-6"
              :disable="!rsForm.customer || !rsForm.date"
              :error="errors.has('trip_time')"
              :error-message="errors.first('trip_time')"
            >
              <q-input slot="control" type="time" step="1800" no-error-icon
                name="trip_time" :data-vv-as="$tc('label.time')"
                class="no-padding no-margin"
                :label="$tc('label.time')" stack-label
                :disable="Boolean(!rsForm.customer_id || rsForm.is_untriped)"
                v-model="rsForm.trip_time"
                v-validate="Boolean(rsForm.is_untriped) ? '' : 'required'"
              >
              <q-btn slot="append" icon="arrow_drop_down" :disable="!rsForm.customer" flat dense  class="no-padding self-end">
                <q-menu auto-close>
                  <q-list bordered v-if="rsForm.customer">
                    <q-item clickable v-for="(trip, indexCT) in TripOptions" :key="indexCT"
                      @click="rsForm.trip_time = trip"
                    >
                      <q-item-section>{{String(trip).substring(0,5)}}</q-item-section>
                      <q-item-section avatar>
                        <q-icon color="primary" name="timer" />
                      </q-item-section>
                    </q-item>
                    <q-separator inset />
                  </q-list>
                </q-menu>
              </q-btn>
            </q-input>
            <q-checkbox slot="append" class="self-end text-subtitle2"
                v-model="rsForm.is_untriped"
                label="NO TRIP" left-label
                :true-value="1" :false-value="0"
                @input="() => {
                  if (rsForm.is_untriped) rsForm.trip_time = null
                }"
              />
            </q-field>
          </div>
          <div class="row q-col-gutter-x-sm">
            <ux-select class="col-12 col-sm-6"
              name="vehicle_id"
              :label="$tc('general.vehicle')"
              v-model="rsForm.vehicle"
              source="api/v1/references/vehicles?mode=all&type=DELIVERY"
              :option-label="(item) => `${item.number}`"
              option-value="id"
              filter clearable
              :error="errors.has('vehicle_id')"
              :error-message="errors.first('vehicle_id')"
              @input="(v) => {
                rsForm.vehicle = v ? v : null
                rsForm.vehicle_id = v ? v.id : null
              }"
            />
            <q-input type="text" class="col-12 col-sm-6"
              :label="$tc('label.delivery_note')"
              v-model="rsForm.customer_note"
              hint=" "
              :error="errors.has('delivery_note')"
              :error-message="errors.first('delivery_note')"
            />
          </div>
        </div>
        <div class="col-12 col-md-6" >
          <div class="row q-col-gutter-x-sm">
            <q-input class="col" name="customer_name"
              :label="$tc('label.name')"  stack-label
              v-model="rsForm.customer_name"
              v-validate="'required'"
              :error="errors.has('customer_name')" />

            <q-input class="col-12 col-sm-auto" name="customer_phone"
              :label="$tc('label.phone')"  stack-label
              v-model="rsForm.customer_phone"
              v-validate="''"
              :error="errors.has('customer_phone')"/>
          </div>
          <q-input type="textarea" autogrow
            input-style="min-height: 87px"
            name="customer_address"
            :label="$tc('label.address')"  stack-label
            v-model="rsForm.customer_address"
          />
        </div>
      </div>
    </q-card-section>
    <q-separator inset />
    <!-- SINGLE-REVISION -->
    <q-card-section :class="$app.classDimmed(!Boolean(rsForm.customer_id && rsForm.date))" >
      <!-- {{rsForm.customer}} -->
      <div class="column q-mb-sm" v-if="rsForm.customer && rsForm.order_mode !== 'ACCUMULATE' && rsForm.customer.delivery_manual_allowed">
        <ux-select outlined dense hide-bottom-space
          class="self-end"
          label="SJDO Manual"
          v-model="rsForm.request_order"
          :disable="Boolean(rsForm.delivery_load_items.find(x => x.item))"
          filter clearable use-chips
          :source="`/api/v1/incomes/request-orders?mode=all&--limit=20&status=open&customer_id=${rsForm.customer_id}`"
          :source-key="['number', 'reference_number']"
          option-label="fullnumber"
          :option-sublabel="(opt) => `[${$app.moment(opt.date).format('DD/MM/YYYY')}] ${opt.reference_number}`"
          v-validate="''"
          :name="`request_order_id`"
          :error-message="errors.first(`request_order_id`)"
          @input="(v) => {
            rsForm.request_order_id = v ? v.id : null
          }"
        />
      </div>
      <!-- COLUMN:: Part items lists -->
      <q-markup-table bordered class="main-box no-shadow no-highlight q-mb-sm"
        dense separator="horizontal">
        <thead>
          <q-tr class="text-uppercase" style="line-height:30px">
            <q-th key="prefix" width="50px"></q-th>
            <q-th key="part" width="30%">{{$tc('items.part_name')}}</q-th>
            <q-th key="part_subname" width="30%">{{$tc('items.part_number')}}</q-th>
            <q-th key="quantity" width="15%">{{$tc('label.quantity')}}</q-th>
            <q-th key="unit" width="10%">{{$tc('label.unit')}}</q-th>
            <q-th key="note" width="25%">{{$tc('label.encasement')}}</q-th>
          </q-tr>
        </thead>
        <tbody>
          <q-tr v-for="(row, rowIndex) in rsForm.delivery_load_items" :key="rowIndex">
            <q-td name="prefix">
              <q-btn dense flat outline tabindex="1000" color="negative" icon="clear" @click="removeDetail(rowIndex)" />
            </q-td>
            <q-td name="part">
              <ux-select dense outlined hide-bottom-space
                class="field-native-top"
                v-if="rsForm.request_order"
                v-model="row.request_order_item"
                filter clearable
                :source="`/api/v1/incomes/request-order-items?mode=all&--limit=50&--with=item;unit&delivery_date=${rsForm.date}&request_order_id=${rsForm.request_order_id}`"
                :option-label="(opt) => `${opt.item.part_name}`"
                :option-sublabel="(opt) => `${opt.item.part_subname} (${opt.quantity} ${opt.unit.code})`"
                v-validate="'required'"
                :name="`delivery_load_items.${rowIndex}.request_order_item_id`"
                :error-message="errors.first(`delivery_load_items.${rowIndex}.request_order_item_id`)"
                @input="(v) => {
                  row.request_order_item_id = v ? v.id : null
                  row.item_id = v ? v.item.id : null
                  row.item = v ? v.item : null
                  row.unit_rate = v ? 1 : null
                  row.unit_id = v ? v.item.unit.id : null
                  row.unit = v ? { value: v.item.unit.id, label: v.item.unit.code, rate:1 } : null
                }"
              />
              <ux-select dense outlined hide-bottom-space
                class="field-native-top"
                v-show="!rsForm.request_order"
                v-model="row.item"
                filter clearable
                :source="`/api/v1/common/items?mode=all&--limit=50&delivery_date=${rsForm.date}&amount_delivery_to_load&customer_id=${rsForm.customer_id}${rsForm.request_order_id ? '&in_request_order_id='+rsForm.request_order_id : '' }`"
                :source-key="['part_name', 'part_number', 'code']"
                option-label="part_name"
                :option-sublabel="(opt) => `[${opt.customer_code}] ${opt.part_number}`"
                v-validate="'required'"
                :name="`delivery_load_items.${rowIndex}.item_id`"
                :error-message="errors.first(`delivery_load_items.${rowIndex}.item_id`)"
                :autofocus="row.hasOwnProperty('_autofocus')"
                @focus="delete row._autofocus"
                @input="(v) => {
                  row.item_id = v ? v.id : null
                  row.unit_id = v ? v.unit_id : null
                  row.unit_rate = v ? 1 : null
                  row.unit = v ? { ...v.unit, value: v.unit.id, label: v.unit.code, rate:1 } : null
                }"
              />
            </q-td>
            <q-td name="part_subname">
              <q-field dense outlined hide-bottom-space readonly>
                <div slot="control"  v-if="row.item" class="self-center">[{{ row.item.customer_code }}] {{ row.item.part_subname }}</div>
              </q-field>
            </q-td>
            <q-td name="quantity">
              <ux-numeric dense outlined hide-bottom-space
                :options="{ decimalPlaces: row.unit ? row.unit.decimal_in : 0 }"
                :disable="!Boolean(row.item)"
                :name="`delivery_load_items.${rowIndex}.quantity`"
                :data-vv-as="$tc('label.quantity')"
                v-model="row.quantity" type="number" :min="0"
                v-validate="`required|max_value:${UnitMax[rowIndex]}`"
                :suffix="row.item ? `/ ${$app.number_format(UnitMax[rowIndex])}` : ''"
                :error="errors.has(`delivery_load_items.${rowIndex}.quantity`)"
                :error-message="errors.first(`delivery_load_items.${rowIndex}.quantity`)"
              />
            </q-td>
            <q-td name="satuan">
              <q-select type="text" dense outlined hide-bottom-space no-error-icon
                v-model="row.unit"
                :options="ItemUnitOptions[rowIndex]"
                :option-label="opt => opt.code || opt.label"
                v-validate="'required'"
                :name="`delivery_load_items.${rowIndex}.unit_id`"
                :error="errors.has(`delivery_load_items.${rowIndex}.unit_id`)"
                @input="(v) => {
                  row.unit_id = v.value
                  row.unit_rate = v.rate
                }"
              />
            </q-td>
            <q-td name="encasement">
              <q-input type="text" dense outlined hide-bottom-space
                v-model="row.encasement"
                :name="`delivery_load_items.${rowIndex}.encasement`"
                :error="errors.has(`delivery_load_items.${rowIndex}.encasement`)"
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
    <q-separator  />
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
          api: '/api/v1/incomes/delivery-loads',
          uri: '/admin/deliveries/delivery-loads'
        }
      },
      dataTrips: [],
      rsForm: null,
      setDefault: () => {
        return {
          number: null,
          transaction: null,
          order_mode: null,
          date: this.$app.moment().format('YYYY-MM-DD'),
          trip_time: null,
          is_untriped: 0,
          customer: null,
          customer_id: null,
          customer_name: null,
          customer_phone: null,
          customer_address: null,
          vehicle: null,
          vehicle_id: null,
          customer_note: null,
          request_order_id: null,
          request_order: null,
          delivery_load_items: [
            {
              request_order_item_id: null,
              request_order_item: null,
              item_id: null,
              item: null,
              quantity: null,
              unit: null,
              notes: null
            }
          ],
          description: null
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
      return this.rsForm.delivery_load_items.map((detail, i) => {
        if (!detail.item) return 0
        let available = detail.item.amount_delivery
        if (!maximum.total[detail.item.id]) maximum.total[detail.item.id] = 0
        const result = available - maximum.total[detail.item.id]
        maximum.add(detail.item.id, detail.quantity * detail.unit_rate)
        return result / (detail.unit_rate || 1)
      })
    },
    TripOptions () {
      let options = []
      this.dataTrips.map(item => {
        if (!options.find(x => x === item.trip_time)) options.push(item.trip_time)
      })
      return options
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemUnitOptions () {
      // return varItemUnits
      return this.rsForm.delivery_load_items.map((rsItem, key) => {
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
    init () {
      this.FORM.load((data) => {
        this.setForm(data || this.setDefault())
      })
    },
    setForm (data) {
      this.rsForm = Object.assign({}, this.setDefault(), data)
    },
    loadTrip () {
      if (this.rsForm.customer_id && this.rsForm.date) {
        const apiUrl = `/api/v1/incomes/delivery-tasks?mode=all&date=${this.rsForm.date}&customer_id=${this.rsForm.customer_id}`
        this.$axios.get(apiUrl, this.rsForm)
          .then(response => {
            this.dataTrips = JSON.parse(JSON.stringify(response.data))
          }).catch(error => {
            this.$app.response.error(error.response || error)
          })
      } else {
        this.dataTrips = []
      }
    },
    addNewDetail () {
      const newitem = Object.assign(this.setDefault().delivery_load_items[0], { _autofocus: true })
      this.rsForm.delivery_load_items.push(newitem)
    },
    removeDetail (index) {
      this.rsForm.delivery_load_items.splice(index, 1)
      if (!this.rsForm.delivery_load_items.length) this.addNewDetail()
    },
    onSave () {
      const submit = (overload = 0) => {
        this.FORM.loading = true
        const { apiUrl, method } = this.FORM.meta()
        this.$axios.set(method, apiUrl, Object.assign(this.rsForm, { overload }))
          .then((response) => {
            let message = response.data.number + ' - #' + response.data.id
            this.FORM.response.success({ message: message })
            this.FORM.toView(response.data.id)
          })
          .catch((error) => {
            this.FORM.response.fields(error.response)

            if (typeof error === 'object') {
              let message = ''
              if (error.response.data.over && error.response.data.over.length) {
                message += error.response.data.over.map(item => `<br>${item.name} [${item.subname}] => ${item.amount} ${item.unit}`).join(' ')
              }

              if (error.response.status === 428) {
                message = 'NEXT, to overload as SJDO internal!<br>' + message
                return this.$q.dialog({
                  title: 'OVER STOCK BY PO',
                  message: message,
                  html: true,
                  cancel: { color: 'red-2', textColor: 'red-5' },
                  ok: { label: 'NEXT', textColor: 'white', flat: true },
                  focus: 'cancel',
                  class: 'bg-red-5 text-white'
                }).onOk(() => submit(1))
              }

              if (error.response.status === 430) {
                message = 'Delivery loading is Failed!<br>' + message
                return this.$q.dialog({
                  title: 'OVER STOCK BY PO',
                  message: message,
                  html: true,
                  cancel: { color: 'blue-grey' },
                  ok: false,
                  focus: 'cancel'
                })
              }
            }
            this.FORM.response.error(error.response || error, 'SUBMIT LOAD FAILED')
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
<style lang="stylus">
.field-native-top
  .q-field__native
    align-items flex-start
</style>
