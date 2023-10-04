<template>
  <q-card dense>
    <q-card-section class="bg-primary text-white q-py-sm" style="opacity: 0.85">
      <q-btn dense flat round
        class="float-right relative-position" style="top:-5px"
        :icon="show ? 'arrow_drop_up' : 'arrow_drop_down'"
        @click="show = !show"/>
      <div class="text-subtitle2 text-uppercase text-truncate ellipsis">Part Histories</div>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark" />
    <q-card-section v-show="show" class="q-pa-sm">
      <q-table dense class="no-shadow" style="height:200px"
        :data="data"
        :columns="columns"
        :loading="loading"
        :pagination.sync="pagination"
        @request="onRequest"
        :no-data-label="TEXT_BOTTOM"
        row-key="id">

        <q-tr slot="body" slot-scope="rs" :props="rs"
          class="cursor-pointer"
          @click.native="redirect(rs.row.base_type, rs.row.base_data)">
          <q-td>
            <span v-if="rs.row.base_data">{{ getDataLabel(rs.row.base_type, rs.row.base_data) }}</span>
            <span v-else class="text-italic">undefined</span>
            <br/>
            <span v-if="rs.row.base_data" class="text-caption text-faded">
              {{$app.moment(rs.row.base_data.date || rs.row.base_data.created_at || null).format('D MMM YYYY')}}
            </span>
          </q-td>
          <q-td >
            <div v-if="rs.row.item">
              {{rs.row.item.part_name}}<br/>
              <span class="text-caption text-faded">
                [{{rs.row.item.customer_code}}] {{ rs.row.item.part_subname }}
              </span>
            </div>
            <div v-else v-text="$tc('messages.no_data')" />
          </q-td>
          <q-td class="text-center">
            <span>{{ rs.row.stockist }}</span>
            <!-- <span class="">undefined</span> -->
          </q-td>
          <q-td class="text-right">
            <span>{{ $app.number_format(Math.abs(rs.row.unit_amount)) }}</span>
            <span class="">
              <q-icon
                :color="rs.row.unit_amount < 0 ? 'negative': 'green'"
                :name="rs.row.unit_amount < 0 ? 'mdi-arrow-down-bold' : 'mdi-arrow-up-bold'" />
            </span>
          </q-td>
        </q-tr>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script>
import MixPage from 'src/mixins/mix-page.vue'
export default {
  mixins: [MixPage],
  data () {
    return {
      resource: {
        api: '/api/v1/common/items/stockables',
        uri: '/admin/common/items'
      },
      show: true,
      loading: false,
      filter: '',
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 50
      },
      columns: [
        {
          name: 'number',
          required: true,
          label: '', // this.$tc('label.number'),
          align: 'left',
          style: 'with:25%'
        },
        {
          name: 'date',
          align: 'center',
          label: '', // this.$tc('label.date'),
          field: 'date',
          style: 'with:25%'
        },
        {
          name: 'stockist',
          align: 'center',
          style: 'with:25%'
        },
        {
          name: 'amount',
          align: 'right',
          style: 'with:25%'
        }
      ],
      data: [],
      original: [],
      isLoadError: false
    }
  },
  created () {
    // this.init()
    this.onRequest({
      pagination: this.pagination,
      filter: undefined
    })
  },
  computed: {
    TEXT_BOTTOM () {
      if (this.textLoadError) return this.isLoadError

      if (this.data.length > 0) return 'Terdapat (' + this.data.length + ') Data untuk Validasi'

      return 'Good Job!. Tidak terdapat Data untuk Validasi'
    }
  },
  methods: {
    reload () {
      this.loading = true
      setTimeout(() => {
        this.init()
      }, 500)
    },
    init () {
      this.loading = true
      let params = ['--with=item.unit']
      this.$axios.get(`${this.resource.api}?${params.join('&')}`)
        .then((response) => {
          this.original = JSON.parse(JSON.stringify(response.data.data))
          let rows = JSON.parse(JSON.stringify(response.data.data))
          this.data = rows.slice(0)

          this.isLoadError = false
          this.textLoadError = null
        })
        .catch((error) => {
          this.isLoadError = true
          this.textLoadError = error.response ? error.response.statusText : error
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false
          }, 500)
        })
    },

    onRequest (props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } = props.pagination
      // let filter = props.filter

      // emulate server
      setTimeout(() => {
        // ## get all rows if "All" (0) is selected
        // let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage

        // ## calculate starting row of data
        // let startRow = (page - 1) * rowsPerPage

        // fetch data from "server"
        const callback = (returnedData) => {
          this.data.splice(0, this.data.length, ...returnedData)

          // don't forget to update local pagination object
          this.pagination.page = page
          this.pagination.rowsPerPage = rowsPerPage
          this.pagination.sortBy = sortBy
          this.pagination.descending = descending

          // ...and turn of loading indicator
          this.loading = false
        }

        this.onServe(callback, { page, rowsPerPage, rowsNumber, sortBy, descending })
        // console.warn('returnedData', returnedData)
        // clear out existing data and add new
      }, 500)
    },

    getReqestParams (attrs) {
      let params = ['--with=item.unit']
      params.push(`page=${attrs.page || this.pagination.page || 1}`)
      params.push(`limit=${attrs.rowsPerPage || this.pagination.rowsPerPage || 10}`)
      return params
    },

    onServe (callback, attrs) {
      this.loading = true

      const params = this.getReqestParams(attrs)
      const data = this.$axios.get(`${this.resource.api}?${params.join('&')}`)
        .then((response) => {
          if (response.data.total) this.pagination.rowsNumber = Number(response.data.total)
          callback(response.data.data)
        })
        .catch((error) => {
          console.warn(error.response || error)
          return []
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false
          }, 500)
        })

      return data
    },
    getRowsCount () {
      let count = this.original.length
      return count
    },
    redirect (type, data) {
      if (data) {
        let link = null
        switch (type) {
          case 'App\\Models\\Warehouse\\IncomingGoodItem': link = '/admin/deliveries/incoming-goods/' + data.id
            break

          case 'App\\Models\\Warehouse\\OpnameStockItem': link = '/admin/opname-stocks/' + data.id
            break

          case 'App\\Models\\Warehouse\\TransferStockItem': link = '/admin/transfer-stocks/' + data.id
            break

          case 'App\\Models\\Factory\\WorkOrderItem': link = '/admin/factories/work-orders/' + data.id
            break

          case 'App\\Models\\Factory\\WorkProductionItem': link = '/admin/factories/work-productions/' + data.id
            break

          case 'App\\Models\\Factory\\PackingItem': link = '/admin/factories/packings/' + data.id
            break

          case 'App\\Models\\Income\\RequestOrderItem': link = '/admin/incomes/request-orders/' + data.id
            break

          case 'App\\Models\\Income\\DeliveryOrderItem': link = '/admin/deliveries/delivery-orders/' + data.id
            break
        }
        if (link) this.$router.push(link)
        else {
          this.$q.notify('Sory.. Link Undifined!')
        }
      }
    },
    getDataLabel (type, data) {
      const others = (id) => {
        switch (type) {
          case 'App\\Models\\Warehouse\\OutgoingGoodVerification': return `OUT VERIFY [#${data.id}]`

          default:
            return `[#${data.id}]`
        }
      }
      return data.fullnumber || data.number || others(data.id)
    }
  }
}
</script>
