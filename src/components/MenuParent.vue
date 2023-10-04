
<template >
  <q-expansion-item v-if="show" :class="{hidden:!hasChildShow}"
    :label="node.name || ''"
    :dark="dark"
    :icon="node.icon"
    :content-inset-level="0.2"
    expand-separator dense-toggle
    :default-opened="$route.fullPath.startsWith(prefix)">
      <template slot="header">
        <q-item-section avatar>
          <q-icon :name="isChildren ? `keyboard_arrow_right` : node.icon" />
        </q-item-section>
        <q-item-section label>
          <span v-if="node.lang">{{ $tc(node.lang)}}</span>
          <span v-else>{{node.name || '- noname -'}}</span>
        </q-item-section>
      </template>

      <admin-menu-item v-for="(nodeitem, index) in node.children" :key="index"
        :dark="dark"
        :node="nodeitem"
        :prefix="getPrefix(nodeitem)"
        isChildren />
  </q-expansion-item>
</template>

<script>
export default {
  props: {
    dark: {type: Boolean, default: false},
    node: Object,
    prefix: {type: String, default: ''},
    isIndent : {type: Boolean, default: false},
    isChildren: {type: Boolean, default: false},
    countChild: {type: Boolean, default: false}
  },
  data() {
    return {
        hasChildShow: false
    }
  },
  mounted() {
  },
  computed: {
    show() {
      if(this.node.hide) return false
      return this.node.children && this.node.children.length > 0
    }
  },
  methods: {
    getPrefix(item) {
      return this.prefix + (item.path ? ('/' + item.path) : '' )
    }

  },
}
</script>

