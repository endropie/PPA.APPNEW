<template>
<div>
  <!-- TAB:{{PAGEMETA}} -->
  <q-tabs v-if="PAGEMETA.tabs.length > 0" :inverted="$q.theme === 'ios'" :color="$q.dark.isActive ? 'blue-grey-9' : 'primary'"
    :style="$q.theme === 'ios' ? { background: 'rgba(255,255,255,0.95' } : null"
    :class="{
      'within-iframe-hide': !PAGEMETA.iframeTabs
    }"
  >
    <q-route-tab
      v-for="tab in PAGEMETA.tabs"
      :key="tab.hash"
      slot="title"

      :to="`${PAGEMETA.hash}/${tab.path}`"
      :label="tab.name"
      exact
      replace
      :alert="tab.status !== void 0"
    />

  </q-tabs>
</div>
</template>

<script>
import { mapState } from 'vuex'
import MixPage from 'src/mixins/mix-page.vue'

export default {
  name: 'AdminTabs',
  mixins: [MixPage],
  computed: mapState('admin', [
    'PAGEMETA'
  ]),
}
</script>
