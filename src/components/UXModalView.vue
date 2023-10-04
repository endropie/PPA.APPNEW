<template>
  <q-dialog
    v-bind="$attrs"
    v-on="$listeners"
    v-model="opened"
    :persistent="persistent"
    :full-width="fit"
    :full-height="fit">
    <q-layout class="bg-white" container  :class="'scroll'" >
      <q-header class="bg-primary">
        <q-toolbar>
          <slot name="header">
            <slot name="icon">
              <q-avatar color="white">
                <q-icon :name="icon" size="24px" color="primary" />
              </q-avatar>
            </slot>

            <q-toolbar-title>
              <slot name="title">
                <span class="text-weight-bold">{{title}}</span>
              </slot>
            </q-toolbar-title>

            <q-btn flat dense icon="open_in_new" @click="redirect()" />
            <q-btn flat dense icon="close" v-close-popup />
          </slot>
        </q-toolbar>
      </q-header>

      <q-footer class="bg-light text-white" >
        <q-toolbar inset class="row justify-end">
          <slot name="footer"></slot>
          <q-btn v-if="!noBtnClose" dense icon="mdi-close-circle" color="dark" :label="$tc('form.close')" v-close-popup />
        </q-toolbar>
      </q-footer>

      <q-page-container style="max-height: clac(100vh - 155px)">
        <!-- <q-page> -->
          <q-scroll-area class="scroll"
            :style="{height:'calc(100vh - 148px)'}"
          >
          <component ref="page" :is='component' v-if="component" :route="route" class="modal-page"/>
          <slot />

          </q-scroll-area>
        <!-- </q-page> -->
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script>
export default {
  props: {
    fit: Boolean,
    hideFotter: Boolean,
    hideHeader: Boolean,
    noBtnClose: Boolean,
    title: { type: String, default: 'APP PLAY'},
    icon: { type: String, default: 'widgets'},
    persistent: {
      type: Boolean,
      default: true
    },
    size: {
      type: Number,
      default: 80
    }
  },
  data () {
    return {
      path: null,
      route: {
        meta: {},
        params: {},
      },
      opened: false
    }
  },
  computed: {
    component () {
      if (!this.path) return false
      return () => import(`pages/${this.path.substring(1)}`)
    }
  },
  methods: {
    redirect() {
      let uri = ''
      uri = `${this.$refs.page.VIEW.resource.uri}/${this.route.params.id}`
      if (this.$refs.page.VIEW.resource.params) uri += this.$refs.page.VIEW.resource.params

      this.$router.push(uri)
    },

    show (mode = {}) {
      this.path = mode.path
      this.route.meta = mode.meta
      this.route.params = mode.params

      this.opened = true
    }
  }
}
</script>

<style lang="stylus">
.modal-page
  .modal-hide
    display none

</style>
