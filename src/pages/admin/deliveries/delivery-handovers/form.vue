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
            :hint="rsForm.order_mode ? `[${rsForm.order_mode}]` : undefined"
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

          <q-input type="textarea" autogrow filled
            class="col-12"
            input-style="overflow-y: hidden; min-height:60px"
            v-model="rsForm.description"
            :label="$tc('label.description')"
          />
        </div>
        <div v-if="rsForm.customer">
          <q-table title="SJ Delivery"
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
            <q-td slot="body-cell-date" slot-scope="rs" :props="rs" align="center">
              {{$app.moment(rs.row.date).format('DD/MM/YYYY')}}
            </q-td>
            <q-td slot="body-cell-action" slot-scope="rs" :props="rs" class="q-pa-xs" auto-width>
              <q-checkbox dense
                :disable="rs.row.status !== 'CONFIRMED'"
                :value="Boolean(rsForm.delivery_orders.find(e => e.id === rs.row.id))"
                @input="!Boolean(rsForm.delivery_orders.find(e => e.id === rs.row.id))
                  ? rsForm.delivery_orders.push(rs.row)
                  : rsForm.delivery_orders = rsForm.delivery_orders.filter(e => e.id !== rs.row.id)
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
          params: '?--with=customer;delivery_orders',
          api: '/api/v1/incomes/delivery-handovers',
          uri: '/admin/deliveries/delivery-handovers'
        }
      },
      rsForm: null,
      setDefault: () => ({
        number: null,
        date: this.$app.moment().format('YYYY-MM-DD'),
        customer_id: null,
        description: null,
        delivery_orders: []
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
        hideChecked: true,
        begin_date: this.$app.moment().startOf('month').format('YYYY-MM-DD'),
        until_date: this.$app.moment().endOf('month').format('YYYY-MM-DD'),
        filters: null,
        request: this.loadDelivery
      }
    }
  },
  created () {
    // Component Page Created!
    this.init()
  },
  computed: {
    ValCheckDeliveryTable () {
      const data = this.deliveryTable.data.filter(x => x.status === 'CONFIRMED')
      if (!data.length) return false
      return data.length === data.filter(x => this.rsForm.delivery_orders.find(z => z.id === x.id)).length
    },
    ItemSelected () {
      if (this.rsForm.delivery_orders.length) return this.rsForm.delivery_orders
      return []
    }
  },
  methods: {
    init () {
      this.FORM.load((data) => {
        this.rsForm = Object.assign(this.rsForm || this.setDefault(), data)

        if (this.rsForm.customer) this.loadDelivery()

        this.rsForm.delivery_orders = data.delivery_orders
      })
    },
    setCustomer (v) {
      this.rsForm.customer = v
      this.rsForm.customer_id = v ? v.id : null
      this.rsForm.order_mode = v ? v.order_mode : null
      this.rsForm.invoice_mode = v ? v.invoice_mode : null
      this.deliveryTable.data = []
      this.rsForm.delivery_orders = []

      if (this.rsForm.customer) this.loadDelivery()
    },
    setAllDeliveryTable (checkAll) {
      this.deliveryTable.data.filter(x => x.status === 'CONFIRMED').map(row => {
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
      if (!this.rsForm.customer_id) return this.$q.notify('CUSTOMER INPUT FIRST!')
      parameter.push(`customer_id=${this.rsForm.customer_id}`)
      const paginate = request.pagination || {}
      const limit = paginate.rowsPerPage || this.deliveryTable.pagination.rowsPerPage
      const page = Number(paginate.rowsPerPage) === Number(this.deliveryTable.pagination.rowsPerPage) ? paginate.page : 1
      const begin = this.deliveryTable.begin_date ? `&begin_date=${this.deliveryTable.begin_date}` : ''
      const until = this.deliveryTable.until_date ? `&until_date=${this.deliveryTable.until_date}` : ''
      const filters = this.deliveryTable.filters ? `&search=${this.deliveryTable.filters.join('+')}` : ''

      let api = `${this.deliveryTable.api}?handovering=1&or_delivery_handover_id=${this.rsForm.id || ''}&status=CONFIRMED&limit=${limit}&page=${page}&${parameter.join('&')}${filters}${begin}${until}`
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

        if (this.rsForm.customer && !this.rsForm.delivery_orders.length) {
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
