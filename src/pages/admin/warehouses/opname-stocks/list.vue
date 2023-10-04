<template>
  <q-card :dark="LAYOUT.isDark" v-bind="$attrs" v-on="$listeners">
    <q-card-section>
      <q-table class="no-shadow" :dark="LAYOUT.isDark"
        :columns="[
          {name: 'part', label:$tc('label.part'), align:'left'},
          {name: 'stockist', label:$tc('items.stockist'), field:'stockist', align:'left'},
          {name: 'unit', label:$tc('label.unit'), align:'left'},
          {name: 'init', label:$tc('items.stock_init'), field:'init_amount', format:(v)=> $app.number_format(v,0)},
          {name: 'final', label:$tc('items.stock_final'), field:'final_amount', format:(v)=> $app.number_format(v,0)},
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
            <small>[{{rs.row.item.customer_code}}] {{rs.row.item.part_subname}}</small>
          </div>
          <span v-else class="text-grey">undifined!</span>
        </q-td>
        <q-td slot="body-cell-unit" slot-scope="rs" :props="rs">
          <span v-if="rs.row.item.unit">
            {{rs.row.item.unit.code}}
          </span>
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
    opname: {
      type: Object,
      default: ()=> null,
    },
  },
  data () {
    return {
      // values..
      isValidated: true,
      TABLE: {
        api: '/api/v1/warehouses/opname-stocks',
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

      if (this.opname && this.opname.id) {
        parameter.push(`opname_id=${this.opname.id}`)
      }
      if (this.opname.deleted_at) {
        parameter.push(`withTrashed=1`)
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
      })
    },
  }
}
</script>
