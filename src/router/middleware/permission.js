
export default function permission (v) {
  return function ({ store, next, from }, permiss = v) {
    if (permiss === 1) {
      if (!Array.isArray(permiss)) permiss = [permiss]
      const userPermiss = store.state.admin.AUTH.user.permiss

      permiss.forEach(name => {
        if (userPermiss.some(p => {
          return p === name
        })) return next()

        return next({
          path: '/admin/403',
          query: { redirect: from.fullPath }
        })
      })
    }

    return next()
  }
}
