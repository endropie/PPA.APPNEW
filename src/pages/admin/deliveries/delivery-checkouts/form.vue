<template>
<q-page padding class="justify-center form-page">
  <q-card inline class="main-box" v-if="FORM.show && rsForm">
    <q-card-section class="q-py-xs">
      <form-header :title="FORM.title()" :subtitle="`# ` + (rsForm.fullnumber || rsForm.number || FORM.subtitle())" hide-menu>
        <template  slot="menu-append">
          <ux-chip-status square outline :row="rsForm" v-if="rsForm.status" />
        </template>
      </form-header>
    </q-card-section>
    <q-separator />
    <q-card-section :class="$app.classDimmed(rsForm.rute_id) + ' q-pb-none'">
      <div class="row q-col-gutter-x-md">
        <ux-select class="col-12 col-sm-6" autofocus
          name="vehicle_id"
          :label="$tc('general.vehicle')"  stack-label
          v-model="rsForm.vehicle"
          filter clearable
          source="/api/v1/references/vehicles?mode=all&type=DELIVERY"
          option-label="number"
          option-value="id"
          :disable="Boolean(rsForm.delivery_checkout_loads.find(i => i.delivery_load_id))"
          v-validate="'required'"
          :error="errors.has('vehicle_id')"
          :error-message="errors.first('vehicle_id')"
          @input="(v) => {
            rsForm.vehicle_id = v ? v.id : null
          }"
        />
        <ux-date class="col-12 col-sm-6"
          type="date"
          name="date"
          :label="$tc('label.date')" stack-label
          v-model="rsForm.date"
          :disable="Boolean(rsForm.delivery_checkout_loads.find(i => i.delivery_load_id))"
          v-validate="'required'"
          :error="errors.has('date')"
          :error-message="errors.first('date')"
        />
      </div>
    </q-card-section>
    <!-- SINGLE-REVISION -->
    <q-card-section :class="$app.classDimmed(!rsForm.vehicle || rsForm.rute_id) ">
      <!-- COLUMN:: Part items lists -->
      <q-card flat bordered class="q-mb-sm" v-for="(row, rowIndex) in rsForm.delivery_checkout_loads" :key="rowIndex">
        <q-card-section>
          <ux-select dense hide-bottom-space
            input-style="margin-top:-4px"
            prefix="LOAD: "
            v-model="row.delivery_load"
            filter
            :source="`/api/v1/incomes/delivery-loads?mode=all&--limit=5&--with=customer;delivery_orders&has_checkout=0&vehicle_id=${rsForm.vehicle_id}&date=${rsForm.date}`"
            :source-key="['number', 'description', 'customer']"
            :option-disable="(opt) => opt"
            option-label="fullnumber"
            :option-sublabel="(opt) => `[${opt.customer.code}]`"
            v-validate="`required`"
            data-vv-as="Delivery Load"
            :name="`delivery_checkout_loads.${rowIndex}.delivery_load_id`"
            :error="errors.has(`delivery_checkout_loads.${rowIndex}.delivery_load_id`)"
            :error-message="errors.first(`delivery_checkout_loads.${rowIndex}.delivery_load_id`)"
            :disable="Boolean(row.delivery_orders.length > 0 || row.delivery_load)"
            @input="(v) => {
              row.delivery_load_id = v ? v.id : null
            }"
            @abort="() => false"
          >
            <q-btn slot="after" dense flat color="blue-grey" icon="clear" @click="removeLoadDetail(rowIndex)" tabindex="100" />
          </ux-select>
          <div class="row q-my-sm" v-if="row.delivery_load">
            <q-input type="hidden" class="hidden"
              :value="row.delivery_orders.length"
              :name="`delivery_checkout_loads.${rowIndex}.delivery_orders`"
              :error="errors.has(`delivery_checkout_loads.${rowIndex}.delivery_orders`)"
              v-validate="`min_value:${row.delivery_load.delivery_orders.length}`"
            />
            <q-chip square size="16px" class="q-ml-none"
              v-for="(sjdo, indexSJDO) in row.delivery_orders" :key="indexSJDO"
              :label="sjdo.fullnumber"
              removable
              @remove="removeLoadDetailSJDO(rowIndex, indexSJDO)"
            />
            <div class="row q-gutter-sm q-pa-xs">
              <q-btn dense outline icon="qr_code" color="blue-grey" @click="addLoadScanner(rowIndex)" />
              <q-btn dense outline slot="before" icon="add" color="blue-grey" >
                <q-popup-edit v-model="row.__option.select" auto-save
                  anchor="top left" cover
                  @before-show="row.__option.select = null"
                >
                  <q-select dense no-error-icon
                    hint="Pick a SJDO"
                    style="min-width:200px"
                    v-model="row.__option.select"
                    :error="Boolean(row.__option.error)"
                    :error-message="row.__option.error"
                    :options="row.delivery_load.delivery_orders"
                    option-label="fullnumber" option-value="id"
                    @input="filterSelectSJDO(rowIndex)"
                    @blur="[row.__option.select = null, row.__option.error = null]"
                  />
                </q-popup-edit>
              </q-btn>
            </div>

          </div>
          <div v-show="errors.has(`delivery_checkout_loads.${rowIndex}.delivery_orders`)" class="text-caption text-negative">
            SJDO is not completed.
          </div>
        </q-card-section>
      </q-card>
      <!-- DELIVERY INTERNAL -->
      <q-card flat bordered class="q-mb-sm" v-for="(row, rowIndex) in rsForm.delivery_checkout_internals" :key="`internal-${rowIndex}`">
        <q-card-section>
          <ux-select dense hide-bottom-space
            input-style="margin-top:-4px"
            prefix="INTERNAL: "
            v-model="row.delivery_order"
            filter
            :source="`/api/v1/incomes/delivery-orders?mode=all&--limit=5&--with=customer&is_internal=1&has_load=0&has_checkout=0&vehicle_id=${rsForm.vehicle_id}&date=${rsForm.date}`"
            :source-key="['number', 'description', 'customer']"
            :option-disable="(opt) => opt"
            option-label="fullnumber"
            :option-sublabel="(opt) => `[${opt.customer.code}]`"
            v-validate="`required`"
            data-vv-as="Delivery Load"
            :name="`delivery_checkout_internals.${rowIndex}.delivery_order_id`"
            :error="errors.has(`delivery_checkout_internals.${rowIndex}.delivery_order_id`)"
            :error-message="errors.first(`delivery_checkout_internals.${rowIndex}.delivery_order_id`)"
            :disable="Boolean(row.delivery_order)"
            @input="(v) => {
              row.delivery_order_id = v ? v.id : null
            }"
            @abort="() => false"
          >
            <q-btn slot="after" dense flat color="blue-grey" icon="clear" @click="removeInternalDetail(rowIndex)" tabindex="100" />
          </ux-select>
        </q-card-section>
        <q-card-actions :vertical="$q.screen.lt.sm" class="q-pt-none" v-if="false">
          <q-btn outline class="" icon="add_circle" color="positive" :label="$tc('form.add', 2)" @click="addInternalDetail" />
          <q-btn outline class="" icon="qr_code" color="blue-grey" label="Scan" @click="addInternalScanner()" />
        </q-card-actions>
      </q-card>
      <!-- DELIVERY DEPORTATION -->
        <q-card flat bordered class="q-mb-sm" v-for="(row, rowIndex) in rsForm.delivery_checkout_deportations" :key="`deportation-${rowIndex}`">
        <q-card-section>
          <ux-select dense hide-bottom-space
            input-style="margin-top:-4px"
            prefix="DEPORTATION: "
            v-model="row.deportation_good"
            filter
            :source="`/api/v1/warehouses/deportation-goods?mode=all&--limit=5&--with=customer&has_checkout=0&date=${rsForm.date}`"
            :source-key="['number', 'description', 'customer']"
            :option-disable="(opt) => opt"
            option-label="fullnumber"
            :option-sublabel="(opt) => `[${opt.customer.code}]`"
            v-validate="`required`"
            data-vv-as="Delivery Load"
            :name="`delivery_checkout_deportations.${rowIndex}.delivery_order_id`"
            :error="errors.has(`delivery_checkout_deportations.${rowIndex}.delivery_order_id`)"
            :error-message="errors.first(`delivery_checkout_deportations.${rowIndex}.delivery_order_id`)"
            :disable="Boolean(row.deportation_good)"
            @input="(v) => {
              row.deportation_good_id = v ? v.id : null
            }"
            @abort="() => false"
          >
            <q-btn slot="after" dense flat color="blue-grey" icon="clear" @click="removeDeportationDetail(rowIndex)" tabindex="100" />
          </ux-select>
        </q-card-section>
        <q-card-actions :vertical="$q.screen.lt.sm" class="q-pt-none" v-if="false">
          <q-btn outline class="" icon="add_circle" color="positive" :label="$tc('form.add', 2)" @click="addInternalDetail" />
          <q-btn outline class="" icon="qr_code" color="blue-grey" label="Scan" @click="addInternalScanner()" />
        </q-card-actions>
      </q-card>
      <!-- ACTION -->
      <q-card flat class="q-mb-md">
        <q-card-actions :vertical="$q.screen.lt.sm" class="no-padding">
          <q-btn outline class="" icon="add_circle" color="positive" label="LOADING" @click="addLoadDetail" />
          <q-btn outline class="" icon="add_circle" color="positive" label="INTERNAL" @click="addInternalDetail" />
          <q-btn outline class="" icon="add_circle" color="positive" label="DEPORTATION" @click="addDeporationDetail" />
          <q-btn outline class="" icon="qr_code" color="blue-grey" label="Scan" @click="addLoadScanner()" />
        </q-card-actions>
      </q-card>
    </q-card-section>
    <q-card-section class="q-pt-none q-gutter-sm">
      <q-select filled dense hide-bottom-space
        input-style="margin-top:-4px"
        label="RUTE: "
        v-model="rsForm.rute" clearable
        :options="RouteOptions"
        option-value="id"
        option-label="name"
        v-validate="RouteOptions.length ? 'required' : ''"
        data-vv-as="Rute"
        :name="`rute_id`"
        :error="errors.has(`rute_id`)"
        :error-message="errors.first(`rute_id`)"
        :disablexx="!Boolean(RuteCustomers.length)"
        :loading="SHEET.rutes.loading"
        @input="(v) => {
          rsForm.rute_id = v ? v.id : null
          rsForm.rute_amount = v ? v.cost : null
        }"
      />

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
  <q-inner-loading :showing="FORM.loading">
    <q-spinner-dots size="70px" color="primary" />
  </q-inner-loading>
  <q-dialog ref="dialogScanner">
    <q-card>
      <q-card-section class="items-center row">
        <q-avatar icon="qr_code" color="primary" text-color="white" />
        <span class="q-ml-sm text-h6">Scaninng code...</span>
      </q-card-section>
      <q-card-actions align="right">
        <StreamBarcodeReader
          @decode="(v) => onDecode(v)"
        />
      </q-card-actions>
      <q-card-actions align="right">
        <!-- <q-btn flat label="SJDO(9)" v-close-popup @click="onDecode('http://192.168.107.104:8080/#/admin/deliveries/delivery-orders/9')" /> -->
        <!-- <q-btn flat label="LOAD(72)" v-close-popup @click="onDecode('http://192.168.107.104:8080/#/admin/deliveries/delivery-loads/72')" /> -->
        <q-btn flat label="Close" v-close-popup  />
      </q-card-actions>
    </q-card>
  </q-dialog>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'
import { StreamBarcodeReader } from 'vue-barcode-reader'
export default {
  mixins: [MixForm],
  components: { StreamBarcodeReader },
  data () {
    return {
      SHEET: {
        rutes: { api: '/api/v1/common/rutes?mode=all', autoload: false }
      },
      FORM: {
        resource: {
          api: '/api/v1/incomes/delivery-checkouts',
          uri: '/admin/deliveries/delivery-checkouts'
        }
      },
      rsForm: null,
      scanner: { key: null },
      setDefault: () => {
        return {
          number: null,
          date: this.$app.moment().format('YYYY-MM-DD'),
          vehicle: null,
          vehicle_id: null,
          operator: null,
          operator_id: null,
          description: null,
          delivery_checkout_loads: [],
          delivery_checkout_internals: [],
          delivery_checkout_deportations: []
        }
      },
      setInternalDefault: () => ({
        delivery_order_id: null,
        delivery_order: null
      }),
      setDeportationDefault: () => ({
        deportation_good_id: null,
        deportation_good: null
      }),
      setLoadDefault: () => ({
        delivery_load_id: null,
        delivery_load: null,
        delivery_orders: [],
        __option: {
          select: null,
          input: null,
          error: null
        }
      })
    }
  },
  created () {
    // Component Page Created!
    this.init()
  },
  computed: {
    RuteCustomers () {
      if (!this.rsForm) return []
      const res = {}
      this.rsForm.delivery_checkout_loads.map(x => {
        if (x.delivery_load) res[x.delivery_load.customer_id] = true
      })
      this.rsForm.delivery_checkout_internals.map(x => {
        if (x.delivery_order) res[x.delivery_order.customer_id] = true
      })
      this.rsForm.delivery_checkout_deportations.map(x => {
        if (x.deportation_good) res[x.deportation_good.customer_id] = true
      })

      this.SHEET.load('rutes', `customers=${Object.keys(res).join(',')}`)
      return Object.keys(res).join(',')
    },
    RouteOptions () {
      return this.SHEET.rutes.data
    }
  },
  watch: {
    '$route': 'init'
  },
  methods: {
    init () {
      this.FORM.load((data) => {
        return this.setForm(data || this.setDefault())
      })
    },
    setForm (data) {
      this.rsForm = Object.assign({}, this.setDefault(), data)
    },
    addLoadScanner (index = null) {
      this.scanner.key = index
      this.$refs['dialogScanner'].show()
    },
    onDecode (v) {
      this.$refs.dialogScanner.hide()
      const n = String(v).split('/')
      const id = n[n.length - 1]
      const model = n[n.length - 2]

      switch (model) {
        case 'deportation-goods':
          if (this.scanner.key !== null) {
            this.scanner.key = null
            return this.$q.notify({ message: `DELIVERY DEPORTATION INVALID`, type: 'negative' })
          }
          this.scannedDeportationGood(id)
          break

        case 'internals':
          if (this.scanner.key !== null) {
            this.scanner.key = null
            return this.$q.notify({ message: `DELIVERY INTERNAL INVALID`, type: 'negative' })
          }
          this.scannedDeliveryInternal(id)
          break

        case 'delivery-loads':
          if (this.scanner.key !== null) {
            this.scanner.key = null
            return this.$q.notify({ message: `DELIVERY LOAD INVALID`, type: 'negative' })
          }
          this.scannedDeliveryLoad(id)
          break

        case 'delivery-orders':
          if (this.scanner.key === null) return this.$q.notify({ message: `SJDO INVALID`, type: 'negative' })

          this.scannedDeliveryOrder(id, this.scanner.key)
          this.scanner.key = null
          break

        default:
          this.$q.notify({ message: `[MODEL INVALID]`, type: 'negative' })
          break
      }
    },
    scannedDeliveryInternal (id) {
      const added = (data) => {
        const len = this.rsForm.delivery_checkout_internals.length
        const newitem = Object.assign(this.setInternalDefault())
        if (this.rsForm.delivery_checkout_internals[len - 1]) {
          if (!this.rsForm.delivery_checkout_internals[len - 1].delivery_order_id) {
            this.rsForm.delivery_checkout_internals.splice(len - 1, 1)
          }
        }
        this.rsForm.delivery_checkout_internals.push({ ...newitem, delivery_order: data, delivery_order_id: data.id })
      }

      if (this.rsForm.delivery_checkout_internals.find(x => x.delivery_order_id === parseInt(id))) {
        return this.$q.notify({ message: 'DELIVERY INTERNAL HAS ADDED!', type: 'warning' })
      }

      this.$axios.get(`/api/v1/incomes/delivery-orders?mode=all&--with=customer&has_checkout=0&vehicle_id=${this.rsForm.vehicle_id}&date=${this.rsForm.date}&id=${id}`)
        .then(response => {
          if (!response.data.length) this.$q.notify({ message: `DELIVERY INTERNAL [${id}] INVALID!`, type: 'warning' })
          else added(response.data[0])
        })
        .catch(error => {
          this.$q.notify(`DELIVERY INTERNAL FETCH ERROR ${String(error)}`)
          console.warn(error.response || error)
        })
    },
    scannedDeportationGood (id) {
      const added = (data) => {
        const len = this.rsForm.delivery_checkout_deportations.length
        const newitem = Object.assign(this.setDeportationDefault())
        if (this.rsForm.delivery_checkout_deportations[len - 1]) {
          if (!this.rsForm.delivery_checkout_deportations[len - 1].deportation_good_id) {
            this.rsForm.delivery_checkout_deportations.splice(len - 1, 1)
          }
        }
        this.rsForm.delivery_checkout_deportations.push({ ...newitem, deportation_good: data, deportation_good_id: data.id })
      }

      if (this.rsForm.delivery_checkout_deportations.find(x => x.deportation_good_id === parseInt(id))) {
        return this.$q.notify({ message: 'DELIVERY DEPORTATION HAS ADDED!', type: 'warning' })
      }

      this.$axios.get(`/api/v1/warehouses/deportation-goods?mode=all&has_checkout=0&date=${this.rsForm.date}&id=${id}`)
        .then(response => {
          if (!response.data.length) this.$q.notify({ message: `DELIVERY DEPORTATION [#${id}] INVALID!`, type: 'warning' })
          else added(response.data[0])
        })
        .catch(error => {
          this.$q.notify(`DELIVERY INTERNAL FETCH ERROR ${String(error)}`)
          console.warn(error.response || error)
        })
    },
    scannedDeliveryLoad (id) {
      const added = (data) => {
        // console.warn('ADDED', data);
        const len = this.rsForm.delivery_checkout_loads.length
        const newitem = Object.assign(this.setLoadDefault())
        if (this.rsForm.delivery_checkout_loads[len - 1]) {
          if (!this.rsForm.delivery_checkout_loads[len - 1].delivery_load_id) {
            this.rsForm.delivery_checkout_loads.splice(len - 1, 1)
          }
        }
        this.rsForm.delivery_checkout_loads.push({ ...newitem, delivery_load: data, delivery_load_id: data.id })
      }

      if (this.rsForm.delivery_checkout_loads.find(x => x.delivery_load_id === parseInt(id))) {
        return this.$q.notify({ message: 'DELIVERY LOAD HAS ADDED!', type: 'warning' })
      }

      this.$axios.get(`/api/v1/incomes/delivery-loads?mode=all&--with=customer;delivery_orders&has_checkout=0&vehicle_id=${this.rsForm.vehicle_id}&date=${this.rsForm.date}&id=${id}`)
        .then(response => {
          if (!response.data.length) this.$q.notify({ message: `DELIVERY LOAD [${id}] INVALID!`, type: 'warning' })
          else added(response.data[0])
        })
        .catch(error => {
          console.warn(error.response || error)
        })
    },
    scannedDeliveryOrder (id, index) {
      const newItem = this.rsForm.delivery_checkout_loads[index].delivery_load.delivery_orders.find(x => x.id === parseInt(id))
      if (!newItem) return this.$q.notify({ message: 'SJDO FAILED!', type: 'negative' })

      if (!this.rsForm.delivery_checkout_loads[index].delivery_orders.find(x => x.id === newItem.id)) {
        this.rsForm.delivery_checkout_loads[index].delivery_orders.push(newItem)
      } else {
        this.$q.notify({ message: 'SJDO HAS ADDED!', type: 'warning' })
      }
    },
    filterSelectSJDO (index) {
      const notifi = () => this.$q.notify({ message: 'SJDO FAILED!', type: 'negative' })
      const newItem = (this.rsForm.delivery_checkout_loads[index].__option.select)
      if (!newItem) return notifi()
      if (this.rsForm.delivery_checkout_loads[index].delivery_orders.find(x => x.id === newItem.id)) {
        return notifi()
      }
      this.rsForm.delivery_checkout_loads[index].delivery_orders.push(newItem)
    },
    addLoadDetail () {
      const newitem = Object.assign(this.setLoadDefault())
      this.rsForm.delivery_checkout_loads.push(newitem)
    },
    removeLoadDetailSJDO (index, key) {
      this.rsForm.delivery_checkout_loads[index].delivery_orders.splice(key, 1)
    },
    removeLoadDetail (index) {
      this.rsForm.delivery_checkout_loads.splice(index, 1)
      // if (!this.rsForm.delivery_checkout_loads.length) this.addLoadDetail()
    },
    addInternalDetail () {
      const newitem = Object.assign(this.setInternalDefault())
      this.rsForm.delivery_checkout_internals.push(newitem)
    },
    removeInternalDetail (index) {
      this.rsForm.delivery_checkout_internals.splice(index, 1)
      // if (!this.rsForm.delivery_checkout_loads.length) this.addLoadDetail()
    },
    addDeporationDetail () {
      const newitem = Object.assign(this.setDeportationDefault())
      this.rsForm.delivery_checkout_deportations.push(newitem)
    },
    removeDeportationDetail (index) {
      this.rsForm.delivery_checkout_deportations.splice(index, 1)
      // if (!this.rsForm.delivery_checkout_deportations.length) this.addLoadDetail()
    },
    onSave () {
      const submit = () => {
        this.FORM.loading = true
        const { apiUrl, method } = this.FORM.meta()
        console.warn(this.rsForm)
        this.$axios.set(method, apiUrl, this.rsForm)
          .then((response) => {
            let message = this.rsForm.vehicle.number + ' - #' + response.data.fullnumber
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
