<script>
import MixSheet from 'src/mixins/mix-sheet.vue'
import MixPage from 'src/mixins/mix-page.vue'

import TableHeader from 'components/TableHeader'
import TablePreferences from 'components/TablePreferences'
import 'src/css/index-page.styl'

export default {
  mixins: [MixPage, MixSheet],
  components: {
    TableHeader,
    TablePreferences
  },
  data () {
    return {
      INDEX: {
        load: (callbacks) => this.INDEX__load(callbacks)
      },
      TABLE: {
        mode: 'datagrid',
        show: false,
        loading: false,
        resource: {},
        hideColumns: [],
        columns: [],
        rowData: [],
        resData: [],
        pagination: {
          page: 1,
          rowsPerPage: 10,
          rowsNumber: 0,
          sortBy: null,
          descending: false,
          default: () => { // default properties :
            return {
              page: 1,
              rowsPerPage: 10,
              rowsNumber: 0,
              sortBy: null,
              descending: false
            }
          }
        },
        filter: '',
        selected: [
          // initial selection => { id: 5 }
        ],
        // init: () => this.__onPagination(),
        compute: (props) => this.TABLE__compute(props),
        delete: (val) => this.TABLE__delete(val),
        refresh: (done) => this.TABLE__refresh(done),
        getTitle: () => this.TABLE__getTitle()
      },
      FILTERABLE: {
        value: null,
        model: [],
        search: [],
        fill: {

          withTrashed: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          }
        },
        transform: {},
        params: '',
        // init: () => this.__onFilterable(),

        setCreate: ({ val }) => this.FILLABEL__setCreate({ val }),
        setRemove: ({ index, value }) => this.FILLABEL__setRemove({ index, value }),
        toggleTrash: () => this.FILLABEL__toggleTrash(),
        submit: () => {
          let apiParamlink = this.TABLE__getParams().join('&')
          this.TABLE.pagination.page = 1
          this.DATAINDEX__route(this.TABLE.resource.uri + `?` + apiParamlink)
        }
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    if (!to.query.hasOwnProperty('return')) {
      to.meta.lastest = {
        query: to.query,
        fullPath: to.fullPath
      }
    }
    next(vm => {
      if (to.query.hasOwnProperty('return')) {
        const link = to.meta.hasOwnProperty('lastest')
          ? to.meta.lastest.fullPath
          : vm.$route.path

        vm.$router.replace(link)
        return false
      }
    })
  },
  beforeRouteUpdate (to, from, next) {
    to.meta.lastest = {
      query: to.query,
      fullPath: to.fullPath
    }
    if (this.TABLE.mode !== 'datagrid' && to.fullPath !== from.fullPath) {
      this.DATAINDEX__getData(next)
    }

    next()
  },
  computed: {
    COLUMNS () {
      let columns = this.TABLE.columns.filter(col => {
        if (col.hidden) return false
        if (this.TABLE.hideColumns.length) {
          if (this.TABLE.hideColumns.find(x => x === col.name)) return false
        }
        return true
      })
      columns = columns.map(col => col.name)

      return columns
    },
    FILLABEL () {
      let value = [], indexes = []

      for (const i in this.FILTERABLE.fill) {
        if (this.FILTERABLE.fill.hasOwnProperty(i)) {
          const fill = this.FILTERABLE.fill[i]
          if (fill.value) break
          if (fill.hasOwnProperty('transform')) {
            let trans = fill.transform(fill.value)
            if (!trans) break
            let count = value.push(trans)
            indexes[count - 1] = i
          } else {
            let count = value.push('[' + i + '-' + fill + ']')
            indexes[count - 1] = i
          }
        }
      }

      for (const i in this.FILTERABLE.search) {
        if (this.FILTERABLE.search.hasOwnProperty(i)) {
          const fill = this.FILTERABLE.search[i]
          let count = value.push(fill)
          indexes[count - 1] = null
        }
      }

      return { value: value, indexes: indexes }
    }
  },
  methods: {
    INDEX__load (callbacks = null) {
      const callBase = () => {
        if (this.TABLE.mode === 'datagrid') {
          this.TABLE__init()
          this.$nextTick(() => {
            this.DATAGRID__getData(null, callbacks)
          })
        } else {
          this.TABLE__init(this.$route)
          this.$nextTick(() => {
            this.DATAINDEX__getData(callbacks)
          })
        }
      }

      this.SHEET.assign()
      this.SHEET.request(callBase)
    },
    DATAINDEX__compute (props) {
      setTimeout(() => {
        if (props) this.TABLE.pagination = props.pagination

        const apiParamlink = this.TABLE__getParams().join('&')
        this.DATAINDEX__route(this.TABLE.resource.uri + `?` + apiParamlink)
      }, 500)
    },
    DATAINDEX__route (paramUrl) {
      this.$router.push(paramUrl)
    },
    DATAINDEX__getData (callback = null) {
      if (this.$route.query.hasOwnProperty('return')) {
        if (callback !== null) callback()
        return
      }

      let pagination = this.TABLE.pagination
      this.TABLE.loading = true
      let apiParamlink = this.TABLE__getParams().join('&')

      this.$axios
      .get(this.TABLE.resource.api + `?` + apiParamlink)
      .then(response => {
        if (process.env.DEV) console.info('[PLAY] API GET "' + (this.TABLE.resource.api + `?` + apiParamlink) + '"', response)
          this.TABLE.pagination = pagination
          this.TABLE.rowData = response.data.data || response.data || []

          this.TABLE.pagination.page = Number(response.data.current_page)
          this.TABLE.pagination.rowsNumber = Number(response.data.total)
          // this.TABLE.pagination.rowsPerPage = Number(response.data.per_page)

          setTimeout(() => {
            // if (callback !== null) setTimeout(() => { callback() }, 800)
          }, 500)
        })
        .catch(error => {
          this.$app.response.error(error.response)
        })
        .finally(() => {
          setTimeout(() => {
            if (callback !== null) callback()
            this.TABLE.loading = false
            this.TABLE.show = true
          }, 500)
        })
    },

    // ************** DATAGRID ******************
    DATAGRID__compute (props) {
      this.TABLE.loading = true
      setTimeout(() => {
        this.TABLE.pagination = props.pagination

        let
          table = this.$refs.table,
          rows = [],
          { page, rowsPerPage, sortBy, descending } = props.pagination

        // res -> MAP -> map -> row

        if (this.TABLE.resData && this.TABLE.resData.length > 0) rows = this.TABLE.resData.slice()

        if (props.filter) {
          rows = table.filterMethod(rows, props.filter)
        }

        if (table && sortBy) {
          rows = table.sortMethod(rows, sortBy, descending)
        }

        this.TABLE.pagination.rowsNumber = rows.length

        if (rowsPerPage) {
          rows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage)
        }

        this.TABLE.rowData = rows

        setTimeout(() => {
          // const params = this.TABLE__getParams()
          // const paramUrl = (params.length > 0) ? params.join('&') : ''
          // this.DATAGRID__route(paramUrl)

          this.TABLE.loading = false
        }, 400)
      }, 200)
    },
    DATAGRID__route (paramUrl) {
      this.$router.push(this.TABLE.resource.uri + `?` + paramUrl)
    },
    DATAGRID__setData (data) {
      return JSON.parse(JSON.stringify(data))
    },
    DATAGRID__getData (refresh = null, callbacks) {
      this.$axios
        .get(this.TABLE.resource.api + '?mode=datagrid')
        .then(response => {
          // this.TABLE.resData = response.data;
          this.TABLE.resData = this.DATAGRID__setData(response.data)

          this.TABLE.compute({
            pagination: this.TABLE.pagination,
            filter: this.TABLE.filter
          })

          if (refresh !== null) setTimeout(() => { refresh() }, 800)

          const call = (f) => {
            if (typeof f === 'function') return f()
            else if (typeof f === 'undefined') return f
          }

          if (typeof callbacks === 'function') call(callbacks)
        })
        .catch(error => {
          this.$app.response.error(error.response, 'Load Items')
        })
    },

    // ************** TABLE ********************
    TABLE__init (to) {
      if (!to) to = this.$route
      const params = (to.query.hasOwnProperty('return') && to.meta.hasOwnProperty('lastest'))
        ? to.meta.lastest.query
        : to.query

      if (to.query['return'] === 'first') delete params.page

      if (params.hasOwnProperty('limit')) this.TABLE.pagination.rowsPerPage = Number(params.limit)
      if (params.hasOwnProperty('page')) this.TABLE.pagination.page = Number(params.page)
      if (params.hasOwnProperty('sort')) this.TABLE.pagination.sortBy = params.sort
      if (params.hasOwnProperty('descending')) this.TABLE.pagination.descending = true

      if (this.TABLE.mode === 'datagrid') {
        if (params.hasOwnProperty('search')) this.TABLE.filter = params.search
      } else {
        for (const key in params) {
          if (params.hasOwnProperty(key)) {
            if (key === 'search') this.FILTERABLE.search = params[key].split('|')
            else if (this.FILTERABLE.fill.hasOwnProperty(key)) {
              let type = this.FILTERABLE.fill[key].type || ''
              switch (type) {
                case 'integer':
                  this.FILTERABLE.fill[key].value = Number(params[key])
                  break

                case 'array':
                  this.FILTERABLE.fill[key].value = params[key] ? String(params[key]).split(',') : null
                  break

                default:
                  this.FILTERABLE.fill[key].value = params[key]
                  break
              }
            }
          }
        }
      }
    },
    TABLE__refresh (done = null) {
      if (this.TABLE.mode === 'datagrid') {
        this.DATAGRID__getData(done)
      } else {
        this.DATAINDEX__getData(done)
      }
    },
    TABLE__compute (prop) {
      if (this.TABLE.mode === 'datagrid') {
        this.DATAGRID__compute(prop)
      } else {
        this.DATAINDEX__compute(prop)
      }
    },
    TABLE__delete (row) {
      this.$q.dialog({
        title: 'DELETE',
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.delete', 2) }),
        preventClose: true,
        ok: this.$tc('messages.yes_to', 1, { v: this.$tc('form.delete') }),
        cancel: this.$tc('form.cancel')
      }).onOk(() => {
        this.$axios.delete(`${this.TABLE.resource.api}/${row.id}`)
          .then((response) => {
            if (response.data.success) {
              const code = response.data.name || response.data.code || row.id
              this.$app.notify.success({
                message: this.$tc('messages.success_deleted'),
                detail: this.$tc('messages.form_has_deleted', 1, { v: `#${code}` })
              })
              this.TABLE__refresh()
            }
          })
          .catch(error => {
            const title = this.$tc('messages.fail', 1, { v: this.$tc('form.delete') })
            this.$app.response.error(error.response || error, title)
          })
      })
    },
    TABLE__rowDelete (id) {
      this.TABLE.resData = this.TABLE.resData.filter((item) => {
        if (item.id === id) return
        return item
      })
      this.TABLE.compute({
        pagination: this.TABLE.pagination,
        filter: this.TABLE.filter
      })
    },
    TABLE__getTitle () {
      let title = this.$route.meta.lang
        ? this.$tc(this.$route.meta.lang)
        : this.$route.meta.title

      return this.$tc('label.list', 1, { v: title }).toUpperCase()
    },
    TABLE__getParams () {
      let params = []
      const pagination = this.TABLE.pagination
      if (pagination.page > 1) params.push(`page=${pagination.page}`)
      if (pagination.sortBy) params.push(`sort=${pagination.sortBy}`)
      if (pagination.descending) params.push(`descending`)

      if (pagination.hasOwnProperty('rowsPerPage')) params.push(`limit=${pagination.rowsPerPage}`)

      if (this.TABLE.mode === 'datagrid') {
        if (this.TABLE.filter) params.push(`search=${this.TABLE.filter}`)
      } else {
        params = params.concat(this.FILTERABLE_getParams())
      }
      return params
    },
    FILTERABLE_getParams () {
      let params = []
      for (const i in this.FILTERABLE.fill) {
        if (this.FILTERABLE.fill.hasOwnProperty(i)) {
          const fill = this.FILTERABLE.fill[i]
          if (!fill.value) continue
          if (typeof fill.value === 'array') {
            fill.value.foreach(value => params.push(`${i}[]` + '=' + value))
          }
          params.push(i + '=' + fill.value)
        }
      }
      let search = ''
      for (const i in this.FILTERABLE.search) {
        if (this.FILTERABLE.search.hasOwnProperty(i)) {
          const fill = this.FILTERABLE.search[i]
          search = search === '' ? (fill) : (search + '|' + fill)
        }
      }
      if (search) params.push('search=' + search)
      return params
    },
    FILLABEL__toggleTrash (values) {
      this.FILTERABLE.fill.withTrashed.value = this.FILTERABLE.fill.withTrashed.value === 1 ? null : 1
    },
    FILLABEL__setChange (values) {
      // code..
    },
    FILLABEL__setCreate ({ val }) {
      this.FILTERABLE.search.push(val)
    },
    FILLABEL__setRemove ({ index, value }) {
      if (this.FILLABEL.indexes[index]) {
        let field = this.FILLABEL.indexes[index]
        if (this.FILTERABLE[field].hasOwnProperty('transform')) {
          this.FILTERABLE.fill[field] = this.FILTERABLE[field].transform(value)
        } else this.FILTERABLE.fill[field] = null
      } else {
        this.FILTERABLE.search = this.FILTERABLE.search.filter((s) => s !== value[0])
      }
      return false
    }
  }
}
</script>
