
export default function access ({ store, next, to }) {
  // console.warn('app', store.state.admin.AUTH)
  if (!store.state.admin.AUTH.access || !store.state.admin.AUTH.access.hasOwnProperty('token')) {
    return next({
      path: '/auth',
      query: { redirect: to.fullPath }
    })
  }
  return next()
}
