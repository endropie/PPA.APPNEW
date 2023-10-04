<template>
 <q-card inline class="main-box" :dark="dark" v-show="show">
    <q-card-section>
      <div class="form-header column">
        <div class="header-top">
          <div class="header-menu row justify-end float-right">
            <q-btn round flat icon="more_vert" v-if="!hideMenu">
              <q-menu :content-class="{'bg-faded text-light':dark}">
                <slot name="menu" >
                  <q-list :dark="dark" class="table-menu" style="min-width: 150px">
                    <slot name="menu-item" />

                  </q-list>
                </slot>
              </q-menu>
            </q-btn>
            <slot name="menu-append"></slot>
          </div>
          <div class="row justify-between">
            <div class="header-title">
              <div class="text-h6 no-wrap">{{ title }}</div>
              <div class="text-subtitle-2 text-faded text-weight-light">{{ subtitle }}</div>
            </div>
            <div class="header-optional">
              <slot name="optional"></slot>
            </div>
          </div>

        </div>
        <div class="header-main">
          <slot name="header-main" />
        </div>
      </div>
    </q-card-section>
    <q-separator :dark="dark"></q-separator>
    <slot></slot>
    <q-card-actions class="q-mx-lg">
      <slot name="actions" />
    </q-card-actions>
    <q-inner-loading :showing="loading" :dark="dark"><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
 </q-card>
</template>

<script>

export default {
  name: 'form-card',
  inheritAttrs: false,
  props:{
    dark: Boolean,
    loading: Boolean,
    show: Boolean,
    hideMenu: Boolean,
    title: {
        type: String,
        default: null
    },
    subtitle: {
        type: String,
        default: null
    }
  }
}
</script>

<style lang="stylus">
.form-header
  min-height 40px
</style>


