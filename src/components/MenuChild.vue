
<template>
  <q-item v-if="show" :ref="node.name"
    :dark="dark"
    :to="getLink(prefix, node)"
    exact
    :class="{ 'active': $route.fullPath.startsWith(prefix)}"
    :label="node.name || '- Undefine name -'">

    <q-item-section avatar v-if="!node.children">
    <q-icon :name="isChildren ? `keyboard_arrow_right` : node.icon"/>
    </q-item-section>
    <q-item-section  v-if="!node.children">
      <span v-if="node.lang">{{ $tc(node.lang)}}</span>
      <span v-else>{{node.name || '- noname -'}}</span>
    </q-item-section>
  </q-item>
</template>


<script>
export default {
  props: {
    dark: {type: Boolean, default: false},
    node: Object,
    prefix: {type: String, default: ''},
    isIndent : {type: Boolean, default: false},
    isChildren: {type: Boolean, default: false},
  },
  created() {
    if (this.show) {
      this.$parent.$vnode.context.$vnode.context.hasChildShow = true
    //   console.warn(this.node.name, this.$parent.$vnode.context.$vnode.context.childrens)
    }
  },
  computed: {
    show() {
      if(this.node.hide) return false

      if (this.node.children && this.node.children.length > 0) return false

      if (this.permission && this.permission.length > 0) {
        return this.$app.can(this.permission)
      }

      return true
    },
    permission() {
        let menu = this.$router.resolve({
            path: this.prefix,
        });
        return menu.route.meta.permission
    },
  },
  methods: {
    getLink(prefix, node) {
      if(node.param) {
        return `${prefix}${node.param}`
      }

      return prefix

    }
  }
}
</script>
