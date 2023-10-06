import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function ({ store, ssrContext }) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach((to, from, next) => {
    if (to.meta) {
      store.commit('admin/setPageMeta', to.meta)
    }

    to.matched.forEach(Route => {
      if (Route.meta.authenticated === true) {
        if (!store.state.admin.AUTH.hasOwnProperty('token')) {
          return next({
            path: '/auth',
            query: { redirect: to.fullPath }
          })
        }
      }

      if (Route.meta.permission && Route.meta.permission.length > 0) {
        const
          userPermiss = store.state.admin.USER.permiss || [],
          permiss = Route.meta.permission.split(';')
        let forbiden = true

        permiss.forEach(name => {
          if (userPermiss.some(val => val === name)) forbiden = false
        })

        if (forbiden) {
          return next({
            path: '/admin/403',
            query: { redirect: from.fullPath }
          })
        }
      }

      return next()
    })

    return next()
  })

  return Router
}
