import axios from 'axios'
import { LocalStorage } from 'quasar'

export default async ({ app, Vue }) => {
  Vue.prototype.$axios = axios

  // axios.defaults.baseURL = 'http://laravel.ppa'
  // axios.defaults.baseURL = 'localhost:8000'
  // axios.defaults.baseURL = 'ppa-laravel'

  const devHOST = process.env.DEV ?  `${document.location.protocol}//${document.location.hostname}:8000` : null;

  const BASE_URL = LocalStorage.getItem('BASE_URL') || devHOST
  const CONFIG = app.store.getters['admin/CONFIG']
  const AUTH = app.store.getters['admin/AUTH']
  const ACCURATE = app.store.getters['admin/ACCURATE']

  if (CONFIG) {
    axios.defaults.baseURL = CONFIG.general.baseURL
    if (!axios.defaults.baseURL) {
      axios.defaults.baseURL = `${document.location.protocol}//${document.location.hostname}:8000`
    }
  }

  if (BASE_URL) axios.defaults.baseURL = BASE_URL

  if (AUTH.hasOwnProperty('token')) {
    axios.defaults.headers.common['Accept'] = 'application/json'
    axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH.token}`
  }

  if (ACCURATE.hasOwnProperty('token')) {
    axios.defaults.headers.common['X-Accurate'] = ACCURATE['token']
  }

  axios.set = (method, url, data) => {
    if (method.toUpperCase() === 'POST') return axios.post(url, data)

    if (method.toUpperCase() === 'PUT') return axios({ method: method, url: url, data: data })

    if (method.toUpperCase() === 'PATCH') return axios({ method: method, url: url, data: data })
  }
  axios.setHeader = (values = []) => {
    values.map((data) => {
      axios.defaults.headers.common[data.key] = data.value
    }
    )
  }

  axios.validToken = (callback) => {
    axios.post('/api/v1/auth/valid-token', {})
      .then((response) => callback(response))
      .catch((error) => callback(error.response || error))
  }

  axios.serverURL = (url = '') => {
    return axios.defaults.baseURL + url
  }
}
