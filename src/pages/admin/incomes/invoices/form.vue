<template>
  <q-page padding>
    <q-card inline class="main-box" v-if="rsForm">
      <q-card-section class="q-x-md">
        <div class="row q-col-gutter-x-sm q-pb-md">
          <ux-select
            class="col-12 col-sm-6"
            name="customer_id"
            :label="$tc('general.customer')" stack-label
            v-model="rsForm.customer"
            filter clearable
            source="/api/v1/incomes/customers?mode=all"
            option-value="id"
            :option-label="(e) => `[${e.code}] ${e.name}`"
            map-options
            v-validate="'required'"
            :error="errors.has('customer_id')"
            :error-message="errors.first('customer_id')"
            @input="setCustomer"
            :hint="rsForm.order_mode ? `[${rsForm.order_mode}]` : ''"
          />

          <ux-date
            class="col-12 col-sm-6"
            name="date"
            :label="$tc('label.date')" stack-label
            v-model="rsForm.date"
            v-validate="'required'"
            :error="errors.has('date')"
            :error-message="errors.first('date')"
          />
        </div>
        <div v-if="rsForm.customer">
          <q-table title="SJ Delivery"
            v-if="!rsForm.customer.is_invoice_request"
            flat dense bordered separator='cell'
            style="max-height: calc( 100vh - 100px )"
            table-header-class="text-uppercase"
            :data="deliveryTable.data"
            :columns="deliveryTable.columns"
            :pagination.sync="deliveryTable.pagination"
            :rows-per-page-options="[10, 25, 50, 100, 200, 500, 'all']"
            :loading="deliveryTable.loading"
            @request="deliveryTable.request"
          >

            <template slot="top">
              <div class="row fit">
                <div class="q-table__control" style="max-width:300px">
                  <span class="text-h6">SJ DELIVERY</span>
                  <q-btn rounded unelevated
                    class="q-mx-sm" size="sm"
                    color="blue-grey-5"
                    :label="`${rsForm.delivery_orders.length} record`"
                    @click="deliveryTable.hideChecked = !deliveryTable.hideChecked"
                    v-if="rsForm.delivery_orders.length"
                  />
                </div>
                <div class="q-table__separator col"></div>
                <div class="q-table__control">
                  <div class="q-gutter-sm" :class="{'row':1}">
                    <ux-date dense outlined
                      :label="$tc('label.begin')" stack-label
                      v-model="deliveryTable.begin_date"
                      :date-options="(date) => date <=  $app.moment(deliveryTable.until_date).format('YYYY/MM/DD')"
                      @input="deliveryTable.begin_date && deliveryTable.until_date ? loadDelivery() : undefined"
                    />
                    <ux-date dense outlined
                      :label="$tc('label.until')" stack-label
                      v-model="deliveryTable.until_date"
                      :date-options="(date) => date >=  $app.moment(deliveryTable.begin_date).format('YYYY/MM/DD')"
                      @input="deliveryTable.begin_date && deliveryTable.until_date ? loadDelivery() : undefined"
                    />
                    <q-field dense outlined>
                      <q-checkbox
                        slot="control"
                        class="no-padding"
                        dense
                        left-label label="VALIDATED"
                        v-model="deliveryTable.isValidated"
                        @input="loadDelivery"
                      />
                    </q-field>

                    <ux-select v-model="deliveryTable.request_order_id"
                      dense outlined hide-dropdown-icon
                      :placeholder="$tc('general.request_order')"
                      style="min-width:180px"
                      :source="`/api/v1/incomes/request-orders?mode=all&--limit=50&customer_id=${rsForm.customer_id}`"
                      :source-key="['number', 'reference_number', 'indexed_number', 'description']"
                      option-label="fullnumber"
                      :option-sublabel="(opt) =>  `Ref: ${opt.reference_number || '-'}` "
                      option-value="id"
                      filter clearable emit-value map-options
                      @input="loadDelivery()"
                    />

                    <q-select v-model="deliveryTable.poreference"
                      dense outlined hide-dropdown-icon
                      multiple use-input use-chips new-value-mode="add"
                      :max-values="1"
                      placeholder="PO Reference"
                      @input="loadDelivery()"
                    />

                    <q-select v-model="deliveryTable.filters"
                      dense outlined hide-dropdown-icon
                      multiple use-input use-chips new-value-mode="add"
                      placeholder="Searching..."
                      @input="loadDelivery()"
                    />

                  </div>
                </div>
              </div>
              <div class="row fit" v-if="!deliveryTable.hideChecked && rsForm.delivery_orders.length">
                <q-card flat bordered class="fit q-mt-sm">
                  <q-card-section class="no-padding">
                    <q-chip v-for="(value, ikey) in rsForm.delivery_orders" :key="value.id"
                      square removable
                      class="glossy"
                      icon="bookmark"
                      color="primary" text-color="white"
                      :label="value.fullnumber"
                      @remove="rsForm.delivery_orders.splice(ikey, 1)"
                    />
                  </q-card-section>
                </q-card>
              </div>
            </template>
            <q-th slot="header-cell-action">
              <q-checkbox dense keep-color :value="ValCheckDeliveryTable" @input="setAllDeliveryTable" />
            </q-th>
            <q-th slot="body-cell-date" slot-scope="rs" :props="rs" align="center">
              {{$app.moment(rs.row.date).format('DD/MM/YYYY')}}
            </q-th>
            <q-th slot="body-cell-action" slot-scope="rs" :props="rs" class="q-pa-xs" auto-width>
              <q-checkbox dense
                :disable="rs.row.status !== 'VALIDATED'"
                :value="Boolean(rsForm.delivery_orders.find(e => e.id === rs.row.id))"
                @input="!Boolean(rsForm.delivery_orders.find(e => e.id === rs.row.id))
                  ? rsForm.delivery_orders.push(rs.row)
                  : rsForm.delivery_orders = rsForm.delivery_orders.filter(e => e.id !== rs.row.id)
                "
              />
            </q-th>
          </q-table>
          <q-table v-else title="Sales Order"
            flat dense bordered separator='cell'
            style="max-height: calc( 100vh - 100px )"
            table-header-class="text-uppercase"
            :data="orderTable.data"
            :columns="orderTable.columns"
            :pagination.sync="orderTable.pagination"
            :rows-per-page-options="[10, 25, 50, 100, 200, 500, 'all']"
            :loading="orderTable.loading"
            @request="orderTable.request"
          >
            <template slot="top">
              <div class="row fit">
                <div class="q-table__control" style="max-width:300px">
                  <span class="text-h6">SALES ORDER</span>
                  <q-btn rounded unelevated
                    class="q-mx-sm" size="sm"
                    color="blue-grey-5"
                    :label="`${rsForm.request_orders.length} record`"
                    @click="orderTable.hideChecked = !orderTable.hideChecked"
                    v-if="rsForm.request_orders.length"
                  />
                </div>
                <div class="q-table__separator col"></div>
                <div class="q-table__control">
                  <div :class="{'row justify-end q-gutter-sm':1}">
                    <ux-date dense outlined
                      :label="$tc('label.begin')" stack-label
                      v-model="orderTable.begin_date"
                      :date-options="(date) => date <=  $app.moment(orderTable.until_date).format('YYYY/MM/DD')"
                      @input="orderTable.begin_date && orderTable.until_date ? loadOrder() : undefined"
                    />
                    <ux-date dense outlined
                      :label="$tc('label.until')" stack-label
                      v-model="orderTable.until_date"
                      :date-options="(date) => date >=  $app.moment(orderTable.begin_date).format('YYYY/MM/DD')"
                      @input="orderTable.begin_date && orderTable.until_date ? loadOrder() : undefined"
                    />
                    <q-field dense outlined>
                      <q-checkbox slot="control" dense class="on-right"
                        left-label label="CLOSED"
                        v-model="orderTable.isClosed"
                        @input="loadOrder()"
                      />
                    </q-field>
                    <q-select
                      dense outlined hide-dropdown-icon
                      v-model="orderTable.filters"
                      multiple use-input use-chips new-value-mode="add"
                      placeholder="Searching..."
                      @input="loadOrder()"
                    />
                  </div>
                </div>
              </div>
              <div class="row fit" v-if="!orderTable.hideChecked && rsForm.request_orders.length">
                <q-card flat bordered class="fit q-mt-sm">
                  <q-card-section class="no-padding">
                    <q-chip v-for="(value, ikey) in rsForm.request_orders" :key="value.id"
                      square removable
                      class="glossy"
                      icon="bookmark"
                      color="primary" text-color="white"
                      :label="value.fullnumber"
                      @remove="rsForm.request_orders.splice(ikey, 1)"
                    />
                  </q-card-section>
                </q-card>
              </div>
            </template>
            <q-th slot="header-cell-action">
              <q-checkbox dense :value="ValCheckOrderTable" @input="setAllOrderTable" />
            </q-th>
            <q-td slot="body-cell-date" slot-scope="rs" :props="rs" align="center">
              {{$app.moment(rs.row.date).format('DD/MM/YYYY')}}
            </q-td>
            <q-td slot="body-cell-action" slot-scope="rs" :props="rs" class="q-pa-xs" auto-width>
              <q-checkbox  dense
                :disable="rs.row.status !== 'CLOSED'"
                :value="Boolean(rsForm.request_orders.find(e => e.id === rs.row.id))"
                @input="!Boolean(rsForm.request_orders.find(e => e.id === rs.row.id))
                  ? rsForm.request_orders.push(rs.row)
                  : rsForm.request_orders = rsForm.request_orders.filter(e => e.id !== rs.row.id)
                "
              />
            </q-td>
          </q-table>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="grey-5" :label="$tc('form.reset')" @click="init()" />
        <q-btn color="positive" :label="$tc('form.save')" @click="save()" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'
export default {
  mixins: [MixForm],
  data () {
    return {
      FORM: {
        resource: {
          params: '?--with=customer;request_orders;delivery_orders',
          api: '/api/v1/incomes/invoices',
          uri: '/admin/incomes/invoices'
        }
      },
      rsForm: null,
      setDefault: () => ({
        number: null,
        date: this.$app.moment().format('YYYY-MM-DD'),
        customer_id: null,
        order_mode: null,
        invoice_mode: null,
        delivery_orders: [],
        request_orders: []
      }),
      deliveryTable: {
        api: '/api/v1/incomes/delivery-orders',
        data: [],
        loading: false,
        columns: [
          { name: 'date', label: this.$tc('label.date'), field: 'date', align: 'center' },
          { name: 'number', label: 'number', field: 'fullnumber', align: 'left' },
          { name: 'indexed_number', label: 'index', field: 'indexed_number', align: 'left' },
          { name: 'confirmed_number', label: 'No. Confirm', field: 'confirmed_number', align: 'left' },
          { name: 'status', label: '', field: 'status', align: 'center' },
          { name: 'action', label: '', align: 'center' }
        ],
        pagination: {
          // sortBy: 'desc',
          // descending: false,
          page: 1,
          rowsPerPage: 10,
          rowsNumber: 0
        },
        request_order_id: null,
        hideChecked: true,
        isValidated: false,
        begin_date: this.$app.moment().startOf('month').format('YYYY-MM-DD'),
        until_date: this.$app.moment().endOf('month').format('YYYY-MM-DD'),
        filters: null,
        poreference: null,
        request: this.loadDelivery
      },
      orderTable: {
        api: '/api/v1/incomes/request-orders',
        data: [],
        loading: false,
        columns: [
          { name: 'date', label: this.$tc('label.date'), field: 'date', align: 'center' },
          { name: 'number', label: 'number', field: 'fullnumber', align: 'left' },
          { name: 'reference_number', label: 'Reference', field: 'reference_number', align: 'left' },
          { name: 'status', label: '', field: 'status', align: 'center' },
          { name: 'action', label: '', align: 'center' }
        ],
        pagination: {
          page: 1,
          rowsPerPage: 10,
          rowsNumber: 0
        },
        hideChecked: true,
        isClosed: false,
        filters: null,
        begin_date: this.$app.moment().startOf('month').format('YYYY-MM-DD'),
        until_date: this.$app.moment().endOf('month').format('YYYY-MM-DD'),
        request: this.loadOrder
      }
    }
  },
  created () {
    // Component Page Created!
    this.init()
  },
  computed: {
    ValCheckOrderTable () {
      const data = this.orderTable.data.filter(x => x.status === 'CLOSED')
      if (!data.length) return false
      return data.length === data.filter(x => this.rsForm.request_orders.find(z => z.id === x.id)).length
    },
    ValCheckDeliveryTable () {
      const data = this.deliveryTable.data.filter(x => x.status === 'CONFIRMED')
      if (!data.length) return false
      return data.length === data.filter(x => this.rsForm.delivery_orders.find(z => z.id === x.id)).length
    },
    ItemSelected () {
      if (this.rsForm.request_orders.length) return this.rsForm.request_orders
      if (this.rsForm.delivery_orders.length) return this.rsForm.delivery_orders
      return []
    }
  },
  methods: {
    init () {
      this.FORM.load((data) => {
        this.rsForm = Object.assign(this.rsForm || this.setDefault(), data)

        if (this.rsForm.customer && !this.rsForm.customer.is_invoice_request) this.loadDelivery()
        if (this.rsForm.customer && this.rsForm.customer.is_invoice_request) this.loadOrder()

        if (this.rsForm.customer && !this.rsForm.customer.is_invoice_request) this.rsForm.delivery_orders = data.delivery_orders
        if (this.rsForm.customer && this.rsForm.customer.is_invoice_request) this.rsForm.request_orders = data.request_orders
      })
    },
    setCustomer (v) {
      this.rsForm.customer = v
      this.rsForm.customer_id = v ? v.id : null
      this.rsForm.order_mode = v ? v.order_mode : null
      this.rsForm.invoice_mode = v ? v.invoice_mode : null
      this.deliveryTable.data = []
      this.orderTable.data = []
      this.rsForm.request_orders = []
      this.rsForm.delivery_orders = []

      if (this.rsForm.customer && !this.rsForm.customer.is_invoice_request) this.loadDelivery()
      if (this.rsForm.customer && this.rsForm.customer.is_invoice_request) this.loadOrder()
    },
    setAllOrderTable (checkAll) {
      this.orderTable.data.filter(x => x.status === 'CLOSED').map(row => {
        const found = this.rsForm.request_orders.find(e => e.id === row.id)
        if (checkAll === true && !found) {
          this.rsForm.request_orders.push(row)
        }
        if (checkAll === false && found) {
          this.rsForm.request_orders = this.rsForm.request_orders.filter(e => e.id !== row.id)
        }
      })
    },
    setAllDeliveryTable (checkAll) {
      this.deliveryTable.data.filter(x => x.status === 'VALIDATED').map(row => {
        const found = this.rsForm.delivery_orders.find(e => e.id === row.id)
        if (checkAll === true && !found) {
          this.rsForm.delivery_orders.push(row)
        }
        if (checkAll === false && found) {
          this.rsForm.delivery_orders = this.rsForm.delivery_orders.filter(e => e.id !== row.id)
        }
      })
    },
    loadDelivery (request = Object.assign({})) {
      let parameter = []
      if (!this.rsForm.customer_id) return console.warn('CUSTOMER INPUT FIRST!')
      parameter.push(`customer_id=${this.rsForm.customer_id}`)
      const paginate = request.pagination || {}
      const limit = paginate.rowsPerPage || this.deliveryTable.pagination.rowsPerPage
      const page = Number(paginate.rowsPerPage) === Number(this.deliveryTable.pagination.rowsPerPage) ? paginate.page : 1
      const status = this.deliveryTable.isValidated ? '&status=VALIDATED' : ''
      const begin = this.deliveryTable.begin_date ? `&begin_date=${this.deliveryTable.begin_date}` : ''
      const until = this.deliveryTable.until_date ? `&until_date=${this.deliveryTable.until_date}` : ''
      // const filters = this.deliveryTable.filters ? `&search=${this.deliveryTable.filters.join('+')}` : ''
      const poreference = this.deliveryTable.poreference ? `&request_reference_number=${this.deliveryTable.poreference.join('+')}` : ''
      const order = this.deliveryTable.request_order_id ? `&request_order_id=${this.deliveryTable.request_order_id}` : ''

      let api = `${this.deliveryTable.api}?invoicing=true&or_acc_invoice_id=${this.rsForm.id}&limit=${limit}&page=${page}&${parameter.join('&')}${status}${poreference}${order}${begin}${until}`
      console.info('[PLAY] API GET:', api)
      this.deliveryTable.loading = true
      this.$axios.get(api)
        .then((response) => {
          this.deliveryTable.data = []
          if (response.data.data) {
            response.data.data.map(e => this.deliveryTable.data.push(e))
          }
          this.deliveryTable.pagination.page = response.data.current_page
          this.deliveryTable.pagination.rowsPerPage = response.data.per_page
          this.deliveryTable.pagination.rowsNumber = response.data.total
        }).catch((error) => {
          console.error('NO', error.response || error)
        }).finally(() => {
          this.deliveryTable.loading = false
        })
    },
    loadOrder (request = Object.assign({})) {
      let parameter = []
      if (!this.rsForm.customer_id) return console.warn('CUSTOMER INPUT FIRST!')
      parameter.push(`customer_id=${this.rsForm.customer_id}`)
      const paginate = request.pagination || {}
      const limit = paginate.rowsPerPage || this.orderTable.pagination.rowsPerPage
      const page = Number(paginate.rowsPerPage) === Number(this.orderTable.pagination.rowsPerPage) ? paginate.page : 1
      const status = this.orderTable.isClosed ? '&status=CLOSED' : ''
      const begin = this.orderTable.begin_date ? `&begin_date=${this.orderTable.begin_date}` : ''
      const until = this.orderTable.until_date ? `&until_date=${this.orderTable.until_date}` : ''
      const filters = this.orderTable.filters ? `&search=${this.orderTable.filters.join('+')}` : ''

      let api = `${this.orderTable.api}?invoicing=true&or_acc_invoice_id=${this.rsForm.id}&limit=${limit}&page=${page}&${parameter.join('&')}${status}${filters}${begin}${until}`
      console.info('[PLAY] API GET:', api)
      this.orderTable.loading = true
      this.$axios.get(api)
        .then((response) => {
          this.orderTable.data = []
          if (response.data.data) {
            response.data.data.map(e => this.orderTable.data.push(e))
          }
          this.orderTable.pagination.page = response.data.current_page
          this.orderTable.pagination.rowsPerPage = response.data.per_page
          this.orderTable.pagination.rowsNumber = response.data.total
        })
        .catch((error) => {
          this.$app.notify.error({ message: error.response ? (error.response.data.message || error.response.statusText) : error })
        })
        .finally(() => {
          this.orderTable.loading = false
        })
    },
    save () {
      const submit = () => {
        this.$q.loading.show()
        const { apiUrl, method } = this.FORM.meta()
        this.$axios.set(method, apiUrl, this.rsForm)
          .then((response) => {
            let message = response.data.number
            this.FORM.response.success({ message: message })
            this.FORM.toView(response.data.id)
          })
          .catch(error => {
            this.FORM.response.fields(error.response)
            this.FORM.response.error(error.response || error, 'Submit')
            if (error.response && error.response.data.errors) {
              if (error.response.data.errors.hasOwnProperty('order_mode')) {
                this.$app.notify.error(String(error.response.data.errors.order_mode))
              }
              if (error.response.data.errors.hasOwnProperty('invoice_mode')) {
                this.$app.notify.error(String(error.response.data.errors.invoice_mode))
              }
            }
          })
          .finally(() => {
            this.$q.loading.hide()
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

        if (this.rsForm.customer && this.rsForm.customer.is_invoice_request && !this.rsForm.request_orders.length) {
          return this.$q.dialog({
            html: true,
            message: 'SO/PO not selected!. <br>Please pick some sales orders, first.'
          })
        }

        if (this.rsForm.customer && !this.rsForm.customer.is_invoice_request && !this.rsForm.delivery_orders.length) {
          return this.$q.dialog({
            html: true,
            message: 'SJDO not selected!. <br>Please pick some delivery, first.'
          })
        }

        submit()
      })
    }
  }
}

</script>
