import { date } from 'quasar'

export const NOW = (state, getters) => state.NOW

export const CONFIG = (state, getters) => state.CONFIG

export const SETTING = (state, getters) => state.SETTING

export const ACCURATE = (state, getters) => state.ACCURATE

export const AUTH = (state, getters) => {
  if (!state.AUTH) return null

  return {
    isTokenValid: (state.AUTH.hasOwnProperty('token')
      ? state.AUTH.token && !getters.isTokenExpired
      : false
    ),
    isTokenExpired: (state.AUTH.login_in
      ? getters.numTokenExpired >= Number(state.AUTH.login_in)
      : undefined
    ),
    numTokenExpired: (state.AUTH.login_at
      ? date.getDateDiff(state.NOW, new Date(state.AUTH.login_at), 'seconds')
      : undefined
    ),
    ...state.AUTH
  }
}

export const USER = (state, getters) => {
  return state.USER
}

export const LAYOUT = (state) => {
  const themes = []
  for (const i in state.THEMES) {
    if (state.THEMES.hasOwnProperty(i)) {
      themes.push(i)
    }
  }
  return {
    themes: themes,
    ...state.LAYOUT
  }
}
