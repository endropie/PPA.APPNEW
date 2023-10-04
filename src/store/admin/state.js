import { colors, LocalStorage } from 'quasar'
import config from 'src/assets/app-config'

function getData () {
  const layout = Object.assign({}, JSON.parse(LocalStorage.getItem('LAYOUT')))
  if (layout.hasOwnProperty('color')) {
    for (const i in layout.color) {
      if (layout.color.hasOwnProperty(i)) {
        const c = colors.getBrand(layout.color[i]) || layout.color[i]
        colors.setBrand(i, c)
      }
    }
  }

  return layout
}

export default {
  NOW: new Date(),
  CONFIG: Object.assign({}, config),
  AUTH: Object.assign({}, JSON.parse(LocalStorage.getItem('AUTH'))),
  USER: Object.assign({}, JSON.parse(LocalStorage.getItem('USER'))),
  SETTING: Object.assign({}, JSON.parse(LocalStorage.getItem('SETTING'))),
  ACCURATE: Object.assign({}, JSON.parse(LocalStorage.getItem('ACCURATE'))),
  PAGEMETA: {},
  PAGE: {
    show: true,
    sidetab: 'messages',
    leftDrawer: true,
    rightDrawer: false
  },
  LAYOUT: {
    isDark: false,
    color: {

    },
    ...getData()
  },
  THEMES: {
    default: {
      primary: '#027be3',
      // secondary: '#3044a3',
      // accent: '#2b3c91',
      info: '#31ccec',
      warning: '#f2c037',
      negative: '#db2828'
    },
    indigo: {
      primary: '#3f51b5',
      // secondary: '#3044a3',
      // accent: '#2b3c91',
      info: '#31ccec',
      warning: '#f2c037',
      negative: '#db2828'
    },
    pink: {
      primary: '#e91e63',
      // secondary: '#ca0b4c',
      // accent: '#ae0840',
      info: '#31ccec',
      warning: '#f2c037',
      negative: '#db2828'
    },
    green: {
      primary: '#26a69a',
      // secondary: '#1f8279',
      // accent: '#196861',
      info: '#31ccec',
      warning: '#f2c037',
      negative: '#db2828'
    },
    yellow: {
      primary: '#dcc700',
      // secondary: '#938719',
      // accent: '#766c14',
      info: '#31ccec',
      warning: '#f2c037',
      negative: '#db2828'
    },
    red: {
      primary: '#f44336',
      // secondary: '#a51b11',
      // accent: '#8d2018',
      info: '#31ccec',
      warning: '#f2c037',
      negative: '#db2828'
    },
    orange: {
      primary: '#d88100',
      // secondary: '#d28513',
      // accent: '#a36406',
      info: '#31ccec',
      warning: '#f2c037',
      negative: '#db2828'
    },
    purple: {
      primary: '#9c27b0',
      // secondary: '#7f218f',
      // accent: '#64066a',
      info: '#31ccec',
      warning: '#f2c037',
      negative: '#db2828'
    },
    blue: {
      primary: '#2196f3',
      // secondary: '#156fb6',
      // accent: '#0b5493',
      info: '#31ccec',
      warning: '#f2c037',
      negative: '#db2828'
    },
    cyan: {
      primary: '#00bcd4',
      // secondary: '#0c8797',
      // accent: '#046774',
      info: '#31ccec',
      warning: '#f2c037',
      negative: '#db2828'
    },
    lime: {
      primary: '#cddc39',
      // secondary: '#8f9924',
      // accent: '#6c7415',
      info: '#31ccec',
      warning: '#f2c037',
      negative: '#db2828'
    },
    brown: {
      primary: '#8c5743',
      // secondary: '#5b3122',
      // accent: '#430e06',
      info: '#31ccec',
      warning: '#f2c037',
      negative: '#db2828'
    }
  }
}
