
export default ({ app, router, store, Vue}) => {
  router.beforeEach((to, from, next) => {
    if (to.path == '/accurate' && to.query['X-Accurate'])
    {
      store.dispatch('admin/assignAccurate', {'token': to.query['X-Accurate']})
      next('/admin')
    }
    else next()
  })
}
