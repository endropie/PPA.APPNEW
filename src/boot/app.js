import { Dialog, Notify, date, Dark } from 'quasar'
import _lodash from 'lodash'
import moment from 'moment'

moment.locale('id')

// leave the export, even if you don't use it
export default async ({ app, store, router, Vue }) => {
  Vue.prototype.$_ = _lodash
  Vue.prototype.$app = {
    name: process.env.APP_NAME,
    description: process.env.APP_DESCRIPTION,
    get: _lodash.get,
    set: _lodash.set,
    clone: (v) => JSON.parse(JSON.stringify(v)),
    setting: (aval) => {
      const setting = Object.assign({}, store.getters['admin/SETTING'])
      return _lodash.get(setting, aval)
    },
    config: (attr, val = undefined) => {
      if (val === undefined) return store.getters['admin/CONFIG'][attr]
      const newData = Object.assign({}, { [attr]: val })
      store.dispatch('admin/setItemConfig', newData)
    },
    can: (v = null) => {
      if (v === null || (typeof v === 'string' && v === '') || (typeof v === 'object' && v.length === 0)) return true

      const UserPermiss = (store.getters['admin/USER'].permiss || [])
      let permiss = []

      if (typeof v === 'string' && v !== '') permiss = v.split(';')
      if (Array.isArray(v) && v.length > 0) permiss = v

      if (permiss.length > 0) {
        for (const i in permiss) {
          if (UserPermiss.some(x => x === permiss[i])) {
            return true
          }
        }

        return false
      }
      return true
    },
    response: {
      error: function (ErrRes, title = null) {
        if (!ErrRes) {
          Notify.create({
            message: 'Resource connection failed!',
            detail: 'Please contact administrator!',
            position: 'top-left',
            type: 'negative'
          })
        } else {
          const bugdev = router.history.current.query.DEV
          if (process.env.DEV || bugdev) console.error('[PLAY] response errors!', ErrRes)

          let mode = {
            icon: 'error',
            color: 'negative',
            position: 'top-right',
            timeout: 3000
          }
          switch (ErrRes.status) {
            case 401:
              // mode.message = 'Ops, Authorization invalid!'
              // mode.title = (ErrRes.data.message || ErrRes.statusText)
              if (router.history.current.fullPath === '/auth') return false

              Dialog.create({
                title: (ErrRes.data.message || ErrRes.statusText),
                message: 'Ops, Authorization invalid! please to login again'
              }).onOk(() => {
                router.replace({
                  path: '/auth',
                  query: { redirect: router.history.current.fullPath }
                })
              })

              return false

            case 403:
              mode.message = 'Ops, Authorization forbidden!'
              mode.detail = (ErrRes.data.message || ErrRes.statusText)
              mode.color = 'warning'
              break
            case 404:
              mode.message = 'Ops, Data resource not found!'
              mode.detail = (ErrRes.data.message || ErrRes.statusText)
              mode.color = 'warning'
              break
            case 422:
              mode.message = 'The fields was not failed!'
              mode.detail = (ErrRes.data.message || ErrRes.statusText)
              if (ErrRes.data.errors && ErrRes.data.errors) {
                mode.detail = ErrRes.data.errors[Object.keys(ErrRes.data.errors)[0]][0]
              }
              break
            case 501:
              mode.message = (title || 'PROCESS NOT ALLOWED!')
              mode.detail = (ErrRes.data.message || ErrRes.statusText)
              break

            case 500:
              mode.message = 'Ops, Please contact administrator!'
              mode.detail = (ErrRes.data.message || ErrRes.statusText)
              break
            default:
              if (ErrRes.data) {
                mode.message = (ErrRes.data.message || ErrRes.statusText)
              } else mode.message = ErrRes.statusText
              break
          }

          if (mode.detail) {
            mode.html = true
            mode.message += `<br><smal style="font-size:80%">${mode.detail}</small>`
          }
          if (mode.message) Notify.create(Object.assign({ classes: 'print-hide' }, mode))
        }
      }
    },
    notify: {
      prevent: {
        message: 'Application Notify',
        detail: 'The description detail of notification.',
        type: 'negative',
        position: 'top-right',
        timeout: 3000
      },
      getMode: function (values, desc = null) {
        if (typeof values === 'string' || values instanceof String) values = { message: values, detail: desc }
        if (values.hasOwnProperty('detail') && values.detail) {
          values.message += `<BR><small style="display:block;line-height:90%">${values.detail}</small>`
          values.html = true
        }
        return Object.assign(this.prevent, values)
      },
      error: function (values = {}, desc) {
        Notify.create({ ...this.getMode(values, desc), color: 'red-10', icon: 'error', classes: 'print-hide' })
      },
      warning: function (values = {}, desc) {
        Notify.create({ ...this.getMode(values, desc), color: 'orange-7', icon: 'warning', classes: 'print-hide' })
      },
      info: function (values = {}, desc) {
        Notify.create({ ...this.getMode(values, desc), color: 'cyan-7', icon: 'info', classes: 'print-hide' })
      },
      success: function (values = {}, desc) {
        Notify.create({ ...this.getMode(values, desc), color: 'green-7', icon: 'check_circle', classes: 'print-hide' })
      }
    },
    debug(...porps) {
      if (process.env.DEV || router.history.current.query.debug) console.info(...porps)
    },
    number_abbreviate (num, fixed) {
      if (num === null) return null
      if (num === 0) return '0'
      fixed = (!fixed || fixed < 0) ? 0 : fixed
      let b = (num).toPrecision(2).split('e'),
        k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
        c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed), // divide by power
        d = c < 0 ? c : Math.abs(c),
        e = d + ['', 'K', 'M', 'B', 'T'][k]
      return e
    },
    number_format (number, decimals, decimator, separator, isABS = false) {
      var settings = {
        decimals: 2,
        decimator: ',',
        separator: '.'
      }

      if (isABS) number = Math.abs(number)

      let n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? Math.abs(settings.decimals) : Math.abs(decimals),
        sep = (typeof separator === 'undefined') ? settings.separator : separator,
        dec = (typeof decimator === 'undefined') ? settings.decimator : decimator,
        toFixedFix = function (n, prec) {
          // Fix for IE parseFloat(0.55).toFixed(0) = 0;
          let k = Math.pow(10, prec)
          return Math.round(n * k) / k
        },
        s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.')
      if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
      }
      if ((s[1] || '').length < prec && Number(decimals) > 0) {
        s[1] = s[1] || ''
        s[1] += new Array(prec - s[1].length + 1).join('0')
      }
      return s.join(dec)
    },
    date_format (date, format = undefined) {
      if (!date) return ''
      return moment(date).format(format || 'DD/MM/YYYY')
    },
    classDimmed (bool) {
      if (bool) return Dark.isActive ? 'dimmed' : 'light-dimmed'
      return ''
    },
    moment: moment,
    date: date
  }

  setTimeout(() => {
    Dark.set(store.getters['admin/LAYOUT'].isDark)
  }, 100)
}
