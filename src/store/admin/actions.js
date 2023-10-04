
export const assignAccurate = ({ commit }, data) => {
  if (data === null) commit('unsetAccurate')
  else {
    commit('setAccurate', JSON.parse(JSON.stringify(data)))
  }
}

export const setItemConfig = ({ state, commit }, data) => {
  commit('setConfig', JSON.parse(JSON.stringify(data)))
}
