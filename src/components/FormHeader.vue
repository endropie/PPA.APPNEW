<template>
  <div class="form-header column">
    <div class="header-top">
      <div class="header-menu row justify-end float-right">
        <q-btn round flat icon="more_vert" v-if="!hideMenu">
          <q-menu :content-class="{'bg-faded text-light':LAYOUT.isDark}">
            <slot name="menu" >
              <q-list  :dark="LAYOUT.isDark" class="table-menu" style="min-width: 150px">
                <slot name="menu-item" />

              </q-list>
            </slot>
          </q-menu>
        </q-btn>
        <slot name="menu-append"></slot>
      </div>
      <div class="row justify-between">
        <div class="column header-title">
          <div class="text-subtitle2 no-wrap">{{ title }}</div>
          <div class="text-caption text-faded">{{ subtitle }}</div>
        </div>
        <div class="header-optional">
          <slot name="optional"></slot>
        </div>
      </div>

    </div>
    <div class="header-main full-width">
      <slot />
    </div>
  </div>
</template>

<script>

export default {
  name: 'table-header',
  inheritAttrs: false,
  props:{
      'hide-menu': Boolean,
      'title': {
          type: String,
          default: null
      },
      'subtitle': {
          type: String,
          default: null
      }
  },
  computed: {
    LAYOUT () {
      return this.$store.state.admin.LAYOUT
    },
  },
}
</script>

<style lang="stylus">
.form-header
  min-height 40px
</style>


