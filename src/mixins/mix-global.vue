<script>
// import moment from 'moment'
export default {
  data () {
    return {
      ARRAY: {
        insert: (arr, index, ...arrays) => [
          // part of the array before the specified index
          ...arr.slice(0, index),
          // inserted items
          ...arrays,
          // part of the array after the specified index
          ...arr.slice(index)
        ]
      }
    }
  },
  mounted () {
    // console.info('MIX-GLOBAL mounted!')
  },
  methods: {

    formatNumberAmount (number, decimals, decimator, separator) {
      if (number === 0) return '-'

      if (number < 0) return String('(' + this.formatNumber(number, decimals, decimator, separator, true) + ')')

      return this.formatNumber(number, decimals, decimator, separator)
    },

    formatNumberText (number, decimals, decimator, separator) {
      if (number === 0) {
        return '-'
      }
      return this.formatNumber(number, decimals, decimator, separator)
    },

    formatNumber (number, decimals, decimator, separator, isABS = false) {
      var settings = {
        decimals: 2,
        decimator: ',',
        separator: '.'
      }

      if (isABS) number = Math.abs(number)

      var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? Math.abs(settings.decimals) : Math.abs(decimals),
        sep = (typeof separator === 'undefined') ? settings.separator : separator,
        dec = (typeof decimator === 'undefined') ? settings.decimator : decimator,
        toFixedFix = function (n, prec) {
          // Fix for IE parseFloat(0.55).toFixed(0) = 0;
          var k = Math.pow(10, prec)
          return Math.round(n * k) / k
        },
        s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.')
      if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
      }
      if ((s[1] || '').length < prec) {
        s[1] = s[1] || ''
        s[1] += new Array(prec - s[1].length + 1).join('0')
      }
      return s.join(dec)
    },

    formatDate (date, to = 'DD/MM/YYYY', from = 'YYYY-MM-DD') {
      if (date) {
        return this.$app.moment(date, from).format(to)
      }
    },

    parseDate (date, to = 'YYYY-MM-DD', from = 'DD/MM/YYYY') {
      if (date) {
        return this.$app.moment(date, from).format(to)
      }
    },

    isAvailable (value, center = false) {
      if (value) return value
      else {
        return 'N/A'
      }
    },

    setLabelText (text) {
      if (text !== undefined && text !== null) {
        text = text.replace(/_/gi, ' ')
        text = text.charAt(0).toUpperCase() + text.slice(1)
      }

      return text
    },

    setLocation (link) {
      window.location.href = link
    },

    onCatch (ErrRes, setValues = null) {
      if (!ErrRes) {
        this.$q.notify({
          message: 'Resource connection failed. Please contact administrator!',
          color: 'negative',
          icon: 'error',
          position: 'top-left',
          timeout: 3000
        })
        return
      }

      let values = {
        message: '',
        color: 'red-4',
        icon: 'error',
        position: 'top-right',
        timeout: 3000
      }

      switch (ErrRes.status) {
        case 401:
          values.message = 'Ops, Authorization invalid!'

          values.color = 'red-6'
          values.icon = 'warning'
          break
        case 404:
          values.message = 'Ops, Data resource not found!'
          values.color = 'orange-6'
          values.icon = 'warning'
          break
        case 500:
          values.message = ErrRes.statusText + '. Please contact administrator!'
          break
        default:
          if (ErrRes.data) {
            values.message = (ErrRes.data.message || ErrRes.statusText)
          }
          else values.message = ErrRes.statusText
          break
      }

      if (setValues) {
        values = Object.assign({}, values, setValues)
      }

      if (ErrRes.status) values.message = ' [CODE:' + ErrRes.status + '] ' + values.message

      this.$q.notify(values)
    },

    JSONconsole (values) {
      console.log(JSON.stringify(values, null, '  '))
      return false
    }
  }
}
</script>
