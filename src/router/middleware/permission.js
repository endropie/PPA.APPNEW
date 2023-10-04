
export default function permission (v) {
  return function ({ store, next, from }, permiss = v) {
    if (permiss === 1) {
      if (!Array.isArray(permiss)) permiss = [permiss]
      const userPermiss = store.state.admin.AUTH.user.permiss

      permiss.forEach(name => {
        console.warn('PERMISS:', name, userPermiss.some(val => val === name))

        if (userPermiss.some(p => {
          // console.log('check', p, name)
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
