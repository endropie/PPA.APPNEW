<script>
// import GlobalMix from './mix-global.vue'
import MixPage from 'src/mixins/mix-page.vue'
import MixSheet from 'src/mixins/mix-sheet.vue'
import FormCard from 'components/FormCard'
import FormHeader from 'components/FormHeader'
import FormDetail from 'components/FormDetail'
import 'src/css/form-page.styl'

export default {
  mixins: [MixPage, MixSheet],
  components: {
    FormCard,
    FormHeader,
    FormDetail
    // QNumeric
  },
  props: {
    route: Object
  },
  data () {
    return {
      SHEET: {},
      FORM: {
        // show: false,
        loading: false,
        data: {},
        title: (mode) => String(`${mode || 'FORM'} - ${this.FORM__Title}`).toUpperCase(),
        subtitle: () => this.FORM__Subtitle,
        toIndex: () => this.FORM__toIndex(),
        toBack: () => this.FORM__toBack(),
        toView: (id) => this.FORM__toView(id),
        meta: () => this.FORM__meta(),
        load: (callback) => this.FORM__load(callback),
        void: () => this.FORM__void(),
        delete: () => this.FORM__delete(),
        reset: (data) => this.FORM__reset(data),
        ifCreate: (val, defined) => this.ROUTE.meta.mode === 'create' ? val : defined,
        ifEdit: (val, defined) => this.ROUTE.meta.mode === 'edit' ? val : defined,
        response: {
          relationship: (values) => this.FORM__response_relationship(values),
          fields: (ErrRes = {}, form) => this.FORM__response_fields(ErrRes, form),
          error: (ErrRes = {}, title = '') => this.FORM__response_error(ErrRes, title),
          success: (values) => this.FORM__response_success(values)
        },
        options: {},
        has_relationship: [],
        resource: {
          api: null,
          uri: null,
          params: ''
        }
      }
    }
  },
  computed: {
    ROUTE () {
      return this.route || this.$route
    },
    FORM__Title () {
      return (this.ROUTE.meta.title || '').toUpperCase()
    },
    FORM__Subtitle () {
      if (this.ROUTE.meta.mode === 'edit') {
        return 'Update data #' + this.ROUTE.params.id
      } else if (this.ROUTE.meta.mode === 'revision') {
        return 'Correction from #' + this.ROUTE.params.id
      } else return 'Create new  ' + (this.ROUTE.meta.title || '').toLowerCase()
    }
  },
  methods: {
    FORM__load (callback = null) {
      if (typeof callback !== 'function') console.error('[PLAY] - callback is function required')

      this.FORM.show = false
      this.FORM.loading = true
      const callBase = () => {
        if (['edit', 'revision'].find(x => x === this.ROUTE.meta.mode)) {
          let api = `${this.FORM.resource.api}/${this.ROUTE.params.id}${this.FORM.resource.params}`
          this.$app.debug('[PLAY]', 'FORM API GET', api)
          this.$axios.get(api)
            .then((response) => {
              this.FORM.data = JSON.parse(JSON.stringify(response.data))
              setTimeout(() => this.FORM.show = true, 500)

              if (callback) callback(response.data)
            })
            .catch(error => {
              console.error(error.response || error)
              if (!error.response) {
                error.response = {}
              }
              this.$router.replace({
                path: '/admin/error',
                query: {
                  redirect: this.$route.fullPath,
                  code: error.response.status || null,
                  message: error.response.statusText || null
                }
              })

              if (callback) callback()
            })
            .finally(() => {
              setTimeout(() => this.FORM.loading = false, 500)
            })
        } else {
          const data = this.setDefault()
          this.FORM.data = JSON.parse(JSON.stringify(data))
          callback(data)
          setTimeout(() => {
            this.FORM.loading = false
            this.FORM.show = true
          }, 1000)
        }
      }

      this.SHEET.assign()
      this.SHEET.request(callBase)
    },

    FORM__meta () { // Return Properties for axios set(POST, PATCH, PUT)
      let status = 'create',
        method = 'POST',
        apiUrl = this.FORM.resource.api

      if (this.ROUTE.meta.mode === 'edit') {
        status = 'update'
        method = 'PUT'
        apiUrl += `/${this.ROUTE.params.id}`
      }

      return {
        method: method,
        status: status,
        apiUrl: apiUrl
      }
    },

    FORM__change (data, rsForm) {
      if (typeof data === 'undefined') data = this.FORM.data
      if (typeof rsForm === 'undefined') rsForm = this.rsForm
      const isEquivalent = (a, b) => {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a)
        var bProps = Object.getOwnPropertyNames(b)

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length !== bProps.length) {
          return false
        }

        for (var i = 0; i < aProps.length; i++) {
          var propName = aProps[i]

          // If values of same property are not equal,
          // objects are not equivalent
          if (a[propName] !== b[propName]) {
            return false
          }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true
      }

      return isEquivalent(data, rsForm)
    },

    FORM__response_fields (ErrRes, form = null) {
      if (ErrRes.hasOwnProperty('status') && ErrRes.status === 422) {
        if (this.hasOwnProperty('$validator') && ErrRes.data.hasOwnProperty('errors')) {
          this.$validator.errors.clear()
          const ErrorFields = ErrRes.data.errors
          const scope = form ? { scope: form } : {}

          for (const field in ErrorFields) {
            if (ErrorFields.hasOwnProperty(field)) {
              const basefield = Object.assign({ field: field, msg: ErrorFields[field][0] }, scope)
              this.$validator.errors.add(basefield)
            }
          }
        }
      }
    },

    FORM__response_relationship (dialog = {}) {
      if (!dialog) {
        this.$app.notify.warning({ message: 'This data form has been relationship' })
      } else {
        if (dialog.messages) {
          let messages = []
          for (const key in dialog.messages) {
            if (dialog.messages.hasOwnProperty(key)) {
              messages.push(key)
            }
          }
          dialog.messages = 'The data was relationships with: \n' + messages.join('\n')
        }
        this.$q.dialog({
          title: dialog.title || 'The data was Related',
          message: dialog.messages || dialog.message || '',
          preventClose: true,
          stackLabel: true,
          color: 'orange',
          icon: 'warning',
          ok: {
            label: 'Direct to Detail Page',
            color: 'warning'
          },
          cancel: 'Continue'
        }).onOk(() => {
          if (dialog.hasOwnProperty('then')) {
            dialog.then()
          }
        }).onCancel(() => {
          if (dialog.hasOwnProperty('catch')) {
            dialog.catch()
          } else this.$q.notify({ message: `The form is not allowed to be changed!`, type: 'warning' })
        })
      }
    },

    FORM__response_error (ErrRes, title) {
      if (typeof ErrRes === 'string') ErrRes = Object.assign({ message: ErrRes })
      this.$app.response.error(ErrRes, title)
    },

    FORM__response_success (params = {}, text = null) {
      let mode = Object.assign({
        icon: 'check_circle_outline',
        message: (params.mode || this.ROUTE.meta.mode || 'SUBMIT').toUpperCase() + ' SUCCESS',
        detail: (params.message || 'The processing has excecute!')
      })

      if (typeof params === 'string' & params.length) {
        if (this.ROUTE.meta.mode === 'create') {
          mode.message = text || this.$tc('messages.success_created')
          mode.detail = this.$tc('messages.form_has_created', { v: params })
        }
        if (this.ROUTE.meta.mode === 'edit') {
          mode.message = text || this.$tc('messages.success_updated')
          mode.detail = this.$tc('messages.form_has_updated', { v: params })
        }
      }

      this.$app.notify.success(mode)
    },

    FORM__void () {
      this.$q.dialog({
        title: 'Void',
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.void', 2) }),
        preventClose: true,
        ok: this.$tc('messages.yes_to', 1, { v: this.$tc('form.void') }),
        cancel: this.$tc('form.cancel')
      }).onOk(() => {
        this.$axios.delete(`${this.FORM.resource.api}/${this.ROUTE.params.id}?mode=void`)
          .then((response) => {
            if (response.data.success) {
              this.$app.notify.success({
                message: this.$tc('messages.success', 1, 'VOID').toUpperCase(),
                detail: this.$tc('messages.form_has_void', 1, { v: `[code: #${this.ROUTE.params.id}]` })
              })
              this.FORM__toIndex()
            }
          })
          .catch(error => {
            this.FORM.response.error(error.response || error)
          })
      })
    },

    FORM__delete () {
      this.$q.dialog({
        title: 'DELETE',
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.delete', 2) }),
        preventClose: true,
        ok: this.$tc('messages.yes_to', 1, { v: this.$tc('form.delete') }),
        cancel: this.$tc('form.cancel')
      }).onOk(() => {
        this.$axios.delete(`${this.FORM.resource.api}/${this.ROUTE.params.id}`)
          .then((response) => {
            if (response.data.success) {
              const code = response.data.name || response.data.code || this.ROUTE.params.id
              this.$app.notify.success({
                message: this.$tc('messages.success_deleted'),
                detail: this.$tc('messages.form_has_deleted', 1, { v: `#${code}` })
              })
              this.FORM__toIndex()
            }
          })
          .catch(error => {
            const title = this.$tc('messages.fail', 1, { v: this.$tc('form.delete') })
            this.$app.response.error(error.response || error, title)
          })
      }).onCancel(() => {
        // DELETE CANCELED!
      })
    },

    FORM__toIndex () {
      setTimeout(() => {
        this.$router.replace(`${this.FORM.resource.uri}?return=first`)
      }, 500)
    },

    FORM__toView (id) { // Back history page with 1 step
      setTimeout(() => {
        this.$router.replace(`${this.FORM.resource.uri}/${id}`)
      }, 500)
    },

    FORM__toBack () { // Back history page with 1 step
      setTimeout(() => {
        this.$router.push(this.FORM.resource.uri + '?return')
      }, 500)
    },

    FORM__reset (data = null) {
      if (data === null) data = this.FORM.data
      this.$nextTick(() => {
        this.$validator.reset()
        this.setForm(data)
      })
    }
  }
}

</script>
