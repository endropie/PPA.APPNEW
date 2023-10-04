import { colors, LocalStorage, Dark } from 'quasar'
import axios from 'axios'

export const SetLeftDrawer = (state, val) => {
  state.PAGE.leftDrawer = val
}

export const SetRightDrawer = (state, val) => {
  state.PAGE.rightDrawer = val
}

export const SetSideTab = (state, val) => {
  state.PAGE.sidetab = val
}

export const setPageShow = (state, val) => {
  state.PAGE.show = val
}

export const setPageMeta = (state, meta) => {
  state.PAGEMETA = {
    title: '',
    hash: '',
    icon: '',
    iframeTabs: false,
    backRoute: '/admin',
    tabs: [],
    ...meta
  }
}

export const setLogin = (state, val) => {
  state.AUTH = val.auth
  state.USER = val.user
  LocalStorage.set('AUTH', JSON.stringify(state.AUTH))
  LocalStorage.set('USER', JSON.stringify(state.USER))
}

export const setLocked = (state) => {
  state.AUTH = Object.assign({})
  LocalStorage.set('AUTH', JSON.stringify(state.AUTH))
}

export const setLogoff = (state) => {
  state.AUTH = Object.assign({})
  state.USER = Object.assign({})
  LocalStorage.set('AUTH', JSON.stringify(state.AUTH))
  LocalStorage.set('USER', JSON.stringify(state.USER))
  // LocalStorage.remove('AUTH')
}

export const setSetting = (state, values) => {
  state.SETTING = Object.assign(state.SETTING, values)
  LocalStorage.set('SETTING', JSON.stringify(state.SETTING))
}

export const setAccurate = (state, values) => {
  state.ACCURATE = Object.assign(state.ACCURATE, values)
  LocalStorage.set('ACCURATE', JSON.stringify(state.ACCURATE))
}

export const unsetAccurate = (state) => {
  state.ACCURATE = null
  if (LocalStorage.has('ACCURATE')) LocalStorage.remove('ACCURATE')
}

export const setConfig = (state, values) => {
  state.CONFIG = Object.assign(state.CONFIG, values)
  LocalStorage.set('CONFIG', JSON.stringify(state.CONFIG))
}

export const setBaseURL = (state, value) => {
  state.CONFIG.general.baseURL = value
  axios.defaults.baseURL = value
  LocalStorage.set('CONFIG', JSON.stringify(state.CONFIG))

  return value
}

export const setTheme = (state, name) => {
  const newColor = state.THEMES[name]
  state.LAYOUT.color = Object.assign(state.LAYOUT.color, newColor)
  const object = state.LAYOUT.color
  for (const i in object) {
    if (object.hasOwnProperty(i)) {
      const c = colors.getBrand(object[i]) || object[i]
      state.LAYOUT.color[i] = c
      colors.setBrand(i, c)
    }
  }
  // Save to storage
  LocalStorage.set('LAYOUT', JSON.stringify(state.LAYOUT))
}

export const setMode = (state, mode) => {
  if (typeof mode === 'boolean') {
    state.LAYOUT.isDark = mode
  } else {
    state.LAYOUT.isDark = !state.LAYOUT.isDark
  }
  // Save to storage
  LocalStorage.set('LAYOUT', JSON.stringify(state.LAYOUT))
}
