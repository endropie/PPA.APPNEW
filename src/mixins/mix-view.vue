<script>
import MixPage from 'src/mixins/mix-page.vue'
import MixSheet from 'src/mixins/mix-sheet.vue'

export default {
  mixins: [MixPage, MixSheet],
  props: {
    route: Object
  },
  data () {
    return {
      VIEW: {
        show: false,
        loading: false,
        title: () => this.VIEW__Title,
        subtitle: () => this.VIEW__Subtitle,
        load: (callback) => this.VIEW__load(callback),
        onCatch: (errors, title) => this.VIEW__onCatch(errors, title),
        toIndex: () => this.VIEW__toIndex(),
        toBack: () => this.VIEW__toBack(),
        delete: () => this.VIEW__delete(),
        state: (mode, callback) => this.VIEW__state(mode, callback),
        void: (callback) => this.VIEW__void(callback),
        print: () => window.print(),
        options: {},
        has_relationship: [],
        getApiUrl: () => this.VIEW.resource.api + '/' + this.ROUTE.params.id,
        getApiParams: () => {
          if (typeof this.VIEW.resource.params === 'object') return this.VIEW.resource.params
          if (typeof this.VIEW.resource.params === 'string') {
            return new URLSearchParams(this.VIEW.resource.params)
          }
        },
        resource: {
          api: null,
          uri: null,
          params: ''
        }
      }
    }
  },
  mounted () {
    // console.info('[PLAY] MIX-VIEW is Mounted!')
  },
  computed: {
    ROUTE () {
      return this.route || this.$route
    },
    VIEW__Title () {
      return (this.ROUTE.meta.title || 'VIEW').toUpperCase()
    },
    VIEW__Subtitle () {
      const stringID = (this.ROUTE.params.id ? '#' + this.ROUTE.params.id : '')
      return 'Data ' + stringID
    }
  },
  methods: {
    VIEW__load (callback) {
      if (typeof callback !== 'function') console.warn('*[PLAY]* - callback is function required')
      this.VIEW.show = false
      this.VIEW.loading = true

      const callBase = () => {
        const url = this.VIEW.getApiUrl()
        const params = this.VIEW.getApiParams()

        this.$axios.get(url, { params })
          .then((response) => {
            this.$app.debug('[PLAY]', 'VIEW API GET', url, response)
            this.VIEW.data = JSON.parse(JSON.stringify(response.data))
            if (typeof callback === 'function') {
              if (callback) callback(response.data)
              setTimeout(() => this.VIEW.show = true, 500)
            }
          })
          .catch(error => {
            console.error(error.response || error)
            // if (!error.response) error.response = {}
            // this.$router.replace({
            //   path: '/admin/error',
            //   query: {
            //     // api: apiUrl,
            //     redirect: this.$route.fullPath,
            //     code: error.response.status || null,
            //     message: error.response.statusText || null
            //   }
            // })

            if (callback) callback()
          })
          .finally(() => {
            setTimeout(() => this.VIEW.loading = false)
          })
      }

      this.SHEET.assign()
      this.SHEET.request(callBase)
    },

    VIEW__onCatch (error, title) { // Handle Catch error of Axios
      this.$app.response.error(error.response, title)
    },

    VIEW__void (callback) {
      this.$q.dialog({
        title: 'VOID',
        message: this.$tc('messages.to_sure', 1, { v: 'void' }),
        preventClose: true,
        ok: this.$tc('messages.yes_to', 1, { v: this.$tc('label.continue') }),
        cancel: this.$tc('form.cancel')
      }).onOk(() => {
        this.$axios.delete(`${this.VIEW.resource.api}/${this.ROUTE.params.id}?mode=void`)
          .then((response) => {
            if (response.data.success) {
              this.$app.notify.success({
                message: this.$tc('messages.success', 1, { v: 'VOID' }).toUpperCase(),
                detail: this.$tc('messages.form_has_void', 1, { v: `[code: #${this.ROUTE.params.id}]` })
              })

              if (typeof callback === 'function') {
                callback()
              }
            }
          })
          .catch(error => {
            this.$app.response.error(error.response)
            if (typeof callback === 'function') {
              callback()
            }
          })
      })
    },

    VIEW__delete () {
      this.$q.dialog({
        title: 'DELETE',
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.delete', 2) }),
        preventClose: true,
        ok: this.$tc('messages.yes_to', 1, { v: this.$tc('form.delete') }),
        cancel: this.$tc('form.cancel')
      }).onOk(() => {
        this.$q.loading.show()
        this.$axios.delete(`${this.VIEW.resource.api}/${this.ROUTE.params.id}`)
          .then((response) => {
            if (response.data.success) {
              this.$app.notify.success({
                message: this.$tc('messages.success_deleted'),
                detail: this.$tc('messages.form_has_deleted', 1, { v: `[code:#${this.ROUTE.params.id}]` })
              })
              this.VIEW__toIndex()
            }
          })
          .catch(error => {
            this.$app.response.error(error.response, 'Deleting Invalid!')
          })
          .finally(() => {
            this.$q.loading.hide()
          })
      })
    },

    VIEW__toIndex () {
      setTimeout(() => {
        this.$router.push(`${this.VIEW.resource.uri}?return=first`)
      }, 500)
    },

    VIEW__toBack () {
      this.$router.go(-1)
    },

    print () {
      window.print()
    }
  }
}
</script>

<style lang="stylus">
.top-table
  .q-table thead tr
    height: 30px
  .q-table thead th
    font-size 16px
    background: rgba(125, 125, 125, 0.12)
  .q-table tbody td
    font-size 16px
    font-weight 500

.main-table
  .q-table thead tr
    height: 40px
  .q-table th, .q-table td
    height: unset
    padding: 10px 12px
</style>
