<template>
  <q-dialog v-model="opened" >
    <!-- :content-css="{minWidth: `50vw`, minHeight: `50vh`, maxWidth: `80vw`, maxHeight: `80vh`}" -->
    <q-layout v-if="layout" class="bg-white" container  :class="'scroll'" >
      <q-header class="bg-primary">
        <q-toolbar>
          <slot name="header">
            <slot name="icon">
              <q-avatar>
                <q-icon name="widgets" size="lg" />
              </q-avatar>
            </slot>
          
            <q-toolbar-title>
              <slot name="title">
                <span class="text-weight-bold">APP PLAY</span>Modal
              </slot>
            </q-toolbar-title>

            <q-btn flat round dense icon="close" v-close-popup />
          </slot>
        </q-toolbar>
      </q-header>

      <q-footer class="bg-light text-white" style="height:10px">
        <q-toolbar inset>
          <slot name="footer"></slot>
        </q-toolbar>
      </q-footer>

      <q-page-container style="max-height:50vh">
        <q-page>
          <q-scroll-area
            class="scroll"
            :style="{
              height:'calc(50vh - 25px)',
              maxHeight:'calc(50vh - 10px)',
            }"
          >
          <slot />
          </q-scroll-area>
        </q-page>
      </q-page-container>
    </q-layout>
    <q-card style="max-width:100vh">
      <q-card-section class="row bg-primary text-white q-pa-sm content-center">
        <slot name="header">
          <slot name="icon">
            <q-avatar size="30px" font-size="24px" icon="widgets" class="on-left">
              
            </q-avatar>
          </slot>
          
          <span class="title text-h6" >
            <slot name="title">  APP PLAY </slot>
          </span>

        </slot>
      
        <q-btn class="absolute-top-right q-ma-sm" flat round dense icon="close" v-close-popup />
      </q-card-section>
      <q-separator />

      <q-card-section 
        
        class="">
        <q-scroll-area style="height:20vh;max-height:50vw;" >

        <slot />
        </q-scroll-area>
      </q-card-section>

      <q-separator />
      <q-card-actions class="text-dark q-pa-xs">
        <slot name="footer">

        </slot>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    hideFotter: Boolean,
    hideHeader: Boolean,
    layout: Boolean,
    size: {
      type: Number,
      default: 80
    }
  },
  data () {
    return {
      opened: false
    }
  },
  methods: {
    show () {
      this.opened = true
    }
  }
}
</script>

<style lang="stylus">
.privacy-policy
  h6
    margin-top 25px
    margin-bottom 10px
  p.caption
    margin-top 0
    &:first-child
      margin-bottom 35px
</style>
