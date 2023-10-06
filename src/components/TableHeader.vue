<template>
  <div class="table-header column full-width"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div class="header-top q-pb-xs" style="display:inline-table">
      <div class="row no-wrap float-right">
        <slot name="menu-prepend"></slot>
        <template v-for="(menu, index) in menus">
          <q-btn :key="index" dense round glossy class="q-mx-xs"
            :outline="menu.outline"
            :icon="menu.icon || undefined"
            :color="menu.btnColor || 'primary'"
            :to="menu.to || undefined" v-ripple
            @click="actionsCall(menu)"
            v-show="menu.shortcut && $q.screen.gt.sm"
            v-if="!menu.hidden" >
            <q-tooltip v-if="menu.tooltip" > {{typeof menu.tooltip === 'string' ? menu.tooltip : menu.label}} </q-tooltip>
          </q-btn>
        </template>
        <q-btn v-if="!hideMenu"
          v-show="ShowMenus"
          flat round dense
          color="light"
          icon="more_vert">

          <q-menu :content-class="{'bg-faded text-light': $q.dark.isActive }">
            <slot name="menu" >
              <q-list class="table-menu" style="min-width: 220px">
                <template v-for="(menu, index) in menus">
                  <q-item :key="index"
                    :clickable="typeof menu.clickable === 'undefined' ? true : menu.clickable"
                    :to="menu.to || undefined"
                    @click="actionsCall(menu)"
                    v-close-popup="typeof menu.closePopup === 'undefined' ? true : menu.closePopup"
                    v-show="!menu.shortcut || !$q.screen.gt.sm"
                    v-if="!menu.hidden">
                    <q-item-section>
                      <q-item-label>{{menu.label}}</q-item-label>
                      <q-item-label caption v-if="menu.detail" lines="1">{{menu.detail}}</q-item-label>
                    </q-item-section>
                    <q-item-section avatar style="min-width:40px">
                      <q-avatar :icon="menu.icon" :color="menu.color || 'primary'" text-color="white" />
                    </q-item-section>
                  </q-item>
                </template>
                <slot name="XXmenu-item" />
                <q-separator v-if="PREFERENCE" />
                <q-item v-if="PREFERENCE" clickable>
                  <q-item-section>Preferences</q-item-section>
                  <q-item-section side>
                    <q-icon name="keyboard_arrow_right" />
                  </q-item-section>
                  <q-menu anchor="top right" self="top left">
                    <q-list dense>
                      <q-item
                        v-for="n in 3"
                        :key="n"
                        dense
                        clickable
                      >
                        <q-item-section>Submenu Label</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-item>
              </q-list>
            </slot>
          </q-menu>
        </q-btn>
        <slot name="menu-append"></slot>
      </div>
      <div class="float-left no-margin">
        <div v-if="title" class="text-h6">
          {{title}}
        </div>
        <div v-if="subtitle" class="text-caption  text-light">{{subtitle}}</div>
      </div>
      <div class="float-right row justify-end" :class="{'full-width': $q.screen.lt.sm}">
        <div>
          <slot name="search-prepend"></slot>
        </div>
        <div  v-if="!hideSearch">
          <q-input
            class="table-filter"
            v-model="model.filter"
            v-if="filter !== undefined"
            outlined dense
            autocomplete="off"
            placeholder="Search..."
          >
            <template v-slot:append>
              <q-icon name="search" color="light" dense />
            </template>
          </q-input>

        </div>
        <div>
          <slot name="search-prepend"></slot>
        </div>

      </div>
    </div>
    <div class="header-main full-width">
      <slot></slot>
    </div>
  </div>

</template>

<script>

export default {
  name: 'table-header',
  inheritAttrs: false,
  props:{
      hideSearch: Boolean,
      hideMenu: Boolean,
      filter: String,
      columns: Array,
      menus: Array,
      title: {
          type: String,
          default: null
      },
      subtitle: {
          type: String,
          default: null
      }
  },
  data () {
    return {
      model:  {
        filter: this.$attrs.filter || ''
      },
    }
  },
  computed: {
    PREFERENCE () {
      return Boolean (this.columns)
    },
    LAYOUT () {
      return this.$store.state.admin.LAYOUT
    },
    ShowMenus() {
      if(!this.menus) return false

      const f = this.menus.find(x => {
        if (x.hidden != true && (!this.$q.screen.gt.sm || x.shortcut != true)) return true
      })

      return Boolean(f)
    }
  },
  watch:{
    'model.filter' : 'setFilter'
  },
  methods: {
    setFilter(v) {
      this.$emit('update:filter', v)
    },
    actionsCall(menu) {
      if (menu.hasOwnProperty('actions')) menu.actions()
    }
  }
}
</script>

<style lang="stylus">
.table-filter.q-field.q-field--dense
  .q-field__control, .q-field__marginal, .q-icon
    height 36px
  .q-field__control:before
    border-color rgba(0,0,0,0)

.table-header
  .q-chip
    margin: 2px 4px;
</style>

