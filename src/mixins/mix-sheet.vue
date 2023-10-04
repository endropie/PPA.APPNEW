<script>
export default {
  data () {
    return {
      SHEET: {
        request: (callbacks) => this.SHEET__REQUEST(callbacks),
        assign: (options) => this.SHEET__ASSIGN(options),
        load: (option, params, callback) => this.SHEET__LOAD(option, params, callback),
        default: () => {
          return {
            api : null,
            autoload: true,
            loading: false,
            params: '',
            data: []
          }
        }
      },

    }
  },
  methods: {
    SHEET__ASSIGN (options) {
      if (typeof options === 'undefined') options = JSON.parse(JSON.stringify(this.SHEET))

      for (const i in options) {
        if (options.hasOwnProperty(i)) {
          if(typeof this.SHEET[i] === 'function') {
            console.error('[PLAY] SHEET assign "'+ i +'" invalid!')
          }
          else {
            this.SHEET[i] = Object.assign( this.SHEET.default(), options[i])
          }
        }
      }
      this.SHEET__REQUEST()
    },
    SHEET__GETURI (option, newOption = {}) {
      let saparator = '?',
          { api, params } = option

      if(newOption.api) api = String(newOption.api)
      if(newOption.params) params = String(newOption.params)

      if(api.indexOf('?') !== -1) {
        saparator = '&'
      }

      return api + saparator + params

    },
    SHEET__LOAD (i, newOption, callback = null) {
      if (callback && typeof callback !== 'function') console.warn('[PLAY] Callback is not function!');

      if (this.SHEET.hasOwnProperty(i) && typeof this.SHEET[i] !== 'function') {

        if (typeof newOption === 'string') {
          newOption = {api: null, params: newOption}
        }

        const uri = this.SHEET__GETURI(this.SHEET[i], newOption)

        if(process.env.DEV) console.info('[PLAY] SHEET.LOAD => ', uri)

        this.SHEET[i].loading = true
        this.SHEET[i].data = []
        this.$axios.get(uri)
          .then(response => {
            if(process.env.DEV) console.info('[PLAY] SHEET.LOAD.SUCCESS => ', response)
            this.SHEET[i].data = response.data
            if(typeof callback === 'function') callback(response)
          })
          .catch(error => {
            if(process.env.DEV) console.error('[PLAY] SHEET.LOAD.ERROR => ', error.response || error)
            if(typeof callback === 'function') callback()
          })
          .finally(() => {
            setTimeout(() => {
              this.SHEET[i].loading = false
             }, 500)
          })
      }
    },
    SHEET__REQUEST (callback = null) {
      if (callback && typeof callback !== 'function') console.warn('[PLAY] Callback is not function!');

      let requests = []
      for (const i in this.SHEET) {
        if (this.SHEET.hasOwnProperty(i)) {
          if (typeof this.SHEET[i] !== 'function' && this.SHEET[i].autoload === true && this.SHEET[i].api != null ) {
            const uri = this.SHEET__GETURI(this.SHEET[i])
            this.SHEET[i].loading = true
            requests.push(
              this.$axios.get(this.SHEET[i].api)
                .then(response => {
                  this.SHEET[i].data = response.data
                  return response
                })
                .catch((error) => {
                  if(process.env.DEV) console.error('[PLAY] SHEET.REQUEST.'+i+'.error')
                  this.SHEET[i].errorMessage = error
                })
                .finally(() => {
                  this.SHEET[i].loading = false
                })
            )
          }
        }
      }
      this.$axios.all(requests)
        .finally((final)=> {
          // if(process.env.DEV) console.warn('[PLAY] SHEET.REQUEST.ALL.finally')
          if (callback) callback()
        })

    }
  }
}

</script>
