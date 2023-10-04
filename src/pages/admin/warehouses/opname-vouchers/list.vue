<template>
  <q-card :dark="LAYOUT.isDark" v-bind="$attrs" v-on="$listeners">
    <q-card-section>
      <div class="row q-py-sm" v-show="!tabHide">
        <q-tabs shrink stretch
          v-model="modetab" inline-label align="justify"
          class="text-blue-grey">
          <q-tab name="opname" icon="list" :label="opname.number"
            class="col-12"
            v-if="opname && opname.id">
            <q-badge color="blue-grey"
              :label="$app.number_abbreviate(counter.opname)"
              floating v-if="counter.opname" />
          </q-tab>
          <q-tab name="validated" icon="check_circle" label="Valid">
            <q-badge color="blue-grey"
              :label="$app.number_abbreviate(counter.validated)"
              floating v-if="counter.validated" />
          </q-tab>
          <q-tab name="open" icon="alarm" label="Pending">
            <q-badge color="blue-grey"
              :label="$app.number_abbreviate(counter.open)"
              floating v-if="counter.open" />
          </q-tab>
        </q-tabs>
        <q-space></q-space>
        <div>
          <slot name="opname" :counter="counter.opname" v-if="modetab === 'opname'"></slot>
          <slot name="validated" :counter="counter.validated" v-if="modetab === 'validated'"></slot>
          <slot name="open" :counter="counter.open" v-if="modetab === 'open'"></slot>
        </div>
      </div>
      <q-table class="no-shadow" :dark="LAYOUT.isDark"
        :columns="[
          {name: 'number', label:$tc('label.no',1,{v:'voucher'}), field:'number', align:'left'},
          {name: 'part', label:$tc('label.part'), align:'left'},
          {name: 'stockist', label:$tc('items.stockist'), field:'stockist', align:'left'},
          {name: 'quantity', label:$tc('label.quantity'), field:'quantity', align:'left'},
          {name: 'unit', label:$tc('label.unit'), align:'left'},
          {name: 'status',  align:'center'},
        ]"
        :data="TABLE.data"
        :pagination.sync="TABLE.pagination"
        :loading="TABLE.loading"
        :filter="TABLE.filter"
        @request="onRequest"
      >

        <q-td slot="body-cell-part" slot-scope="rs" :props="rs" class="no-padding">
          <div v-if="rs.row.item" class="column">
            <span>{{rs.row.item.part_name}}</span>
            <small>[{{rs.row.item.customer_code}}] {{rs.row.item.part_subname || '--'}}</small>
          </div>
          <span v-else class="text-grey">undifined!</span>
        </q-td>
        <q-td slot="body-cell-unit" slot-scope="rs" :props="rs">
          <span v-if="rs.row.unit">
            {{rs.row.unit.code}}
          </span>
        </q-td>
        <q-td slot="body-cell-status" slot-scope="rs" :props="rs" class="no-padding">
          <q-chip dense square outline color="blue-grey" text-color="white" label="CALCULATED" v-if="rs.row.opname_stock_id && opname && opname.status == 'VALIDATED'"  />
          <ux-chip-status v-else dense square :row="rs.row" />
        </q-td>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script>
import MixPage from 'src/mixins/mix-page'
export default {
  mixins: [MixPage],
  props: {
    mode: String,
    opname: {
      type: Object,
      default: ()=> null,
    },
    'tab-hide': Boolean,
  },
  data () {
    return {
      // values..
      modetab: this.$props.mode || 'validated',
      counter: {
        opname: 0,
        validated: 0,
        open: 0
      },
      isValidated: true,
      TABLE: {
        api: '/api/v1/warehouses/opname-vouchers',
        data: [],
        loading: false,
        filter: '',
        pagination: {
          sortBy: null,
          descending: false,
          page: 1,
          rowsPerPage: 3,
          rowsNumber: 0
        },
      }
    }
  },
  watch: {
    'modetab': function(val) {
      this.onRequest({pagination:{...this.TABLE.pagination, page:1}, filter:this.TABLE.filter})
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.onRequest({pagination:this.TABLE.pagination, filter:this.TABLE.filter})
      for (const i in this.counter) {
        if (this.counter.hasOwnProperty(i)) {
          this.setCounter(i)
        }
      }
    },
    setCounter(status) {
      const url = (status === 'opname' && this.opname)
        ? `${this.TABLE.api}?mode=counter&opname_id=${this.opname.id}`
        : `${this.TABLE.api}?mode=counter&opname_stock_id=&status=${String(status).toUpperCase()}`
      this.$axios.get(url)
      .then((response) => {
        this.counter[status] = Number(response.data)
      })
      .catch(error => {
        this.$app.response.error(error.response || error)
      })
    },
    getParameters(props) {
      let params = []
      if (props.pagination.rowsPerPage) params.push(`limit=${props.pagination.rowsPerPage}`)
      if (props.pagination.page) params.push(`page=${props.pagination.page}`)
      if (props.pagination.sortBy) params.push(`sort=${props.pagination.sortBy}`)
      if (props.pagination.descending) params.push(`descending=true`)
      if (props.limit) params.push(`limit=${props.limit}`)

      return params
    },
    setParameters(props, response) {
      if (response.data.total) this.TABLE.pagination.rowsNumber = response.data.total
      if (props.pagination.rowsPerPage) this.TABLE.pagination.rowsPerPage = props.pagination.rowsPerPage
      if (props.pagination.page) this.TABLE.pagination.page = props.pagination.page
      if (props.pagination.sortBy) this.TABLE.pagination.sortBy = props.pagination.sortBy
      if (props.pagination.descending) this.TABLE.pagination.descending = props.pagination.descending
    },
    onRequest(props) {
      // const { page, rowsPerPage, rowsNumber, sortBy, descending } = props.pagination
      this.onServer({...props}, (response) => {
        const data = JSON.parse(JSON.stringify(response.data.data))
        this.TABLE.data.splice(0, this.TABLE.data.length, ...data)
        this.setParameters(props, response)
      })

      // clear out existing data and add new
    },
    onServer(props, callback) {
      this.TABLE.loading = true
      const parameter = this.getParameters(props)

      if (this.modetab === 'opname' && this.opname && this.opname.id) {
        parameter.push(`opname_id=${this.opname.id}`)
      }
      else {
        parameter.push('opname_stock_id=')
        parameter.push(`status=${String(this.modetab).toUpperCase()}`)
      }

      this.$axios.get(`${this.TABLE.api}?${parameter.join('&')}`)
      .then((response) => {
        callback(response)
      })
      .catch(error => {
        this.$app.response.error(error.response || error)
      })
      .finally(() => {
        this.TABLE.loading = false
        this.setCounter(this.modetab)
      })
    },
  }
}
</script>
