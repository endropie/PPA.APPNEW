<template>
  <q-btn-dropdown
    flat stretch
    :align="align"
    :class="{'hide-arrow': $q.screen.lt.sm}"
    :content-class="{'bg-faded text-white':$q.dark.isActive}">
    <template v-slot:label>
      <div class="row items-center no-wrap">
        <q-icon v-if="$q.screen.lt.sm" name="person" />
        <span v-else>{{ USER.name || $tc('general.administrator')}}</span>
      </div>
    </template>
    <div class="row no-wrap q-pa-md">
      <div class="column q-gutter-sm">
        <div class="no-wrap">
          <q-btn size="sm" flat @click="LANG='id'" label="ID" />
          <q-btn size="sm" flat @click="LANG='en-US'" label="EN" />
          <q-btn size="sm" flat
            @click="$q.fullscreen.toggle()"
            :icon-right="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'" />
        </div>
        <q-toggle left-label label="NIGHT MODE" class="text-no-wrap text-weight-light text-subtitle" v-model="NIGHMODE" />
        <q-btn-dropdown
          :label="'Themes'"
          color="primary"
          size="sm">
          <div class="row q-gutter-sm justify-around q-my-sm" style="max-width:170px">
            <div class=""
              v-for="(name, index) in LAYOUT.themes"
              :key="index">
              <q-btn :label="name" :color="name" size="sm" dense @click.native="$store.commit('admin/setTheme', name)" />
            </div>
          </div>
        </q-btn-dropdown>
      </div>

      <q-separator vertical inset class="q-mx-lg"/>

      <div class="column items-center">
        <q-avatar size="72px">
            <!-- <img src="https://cdn.quasar.dev/img/avatar4.jpg"> -->
            <q-icon name="person_outline" size="78px" color="primary" class="bg-light"></q-icon>
        </q-avatar>
        <div class="text-subtitle2 text-capitalize q-mt-md q-mb-xs">
          {{ USER.name || $tc('general.administrator')}}
        </div>
        <q-btn color="primary" label="Logout" push size="sm" v-close-popup @click="setLogout()" />
      </div>
    </div>
  </q-btn-dropdown>
</template>

<script>
import { openURL } from 'quasar'
import { mapState, mapActions } from 'vuex'
import MixPage from 'src/mixins/mix-page.vue'

export default {
  mixins: [MixPage],
  data () {
    return {
      LANG: this.$q.lang.isoName,
      locales: [
        { label: 'English (US)', value: 'en-us' },
        { label: 'Bahasa Indonesia', value: 'id' }
      ],
      align: 'left',
      mobileData: true,
      bluetooth: false
    }
  },
  watch: {
     LANG (locale) {
      import(`quasar/lang/${locale.value}`).then(lang => {
        this.$q.lang.set(lang.default)
      })

      import(`src/i18n/${locale.value}`).then(({ default: messages}) => {
        this.$i18n.locale = locale.value
        this.$i18n.setLocaleMessage(locale.value, messages)
      })
    }
  },
  computed: {
    NIGHMODE: {
      get () {
        return this.$q.dark.isActive
      },
      set (val) {
        this.$store.commit('admin/setMode', val)
        this.$q.dark.set(val)
      }
    },
    ...mapState('admin', [
      'PAGEMETA',
      'AUTH',
      'USER',
    ])
  },
  methods: {
    openURL,
    resetScroll (el, done) {
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      done()
    },
    setLogout () {
      this.$store.commit('admin/setLogoff')
      this.$q.loading.show()
      this.$axios.set('POST', '/api/v1/auth/logout')
      .catch(error => {
        this.$app.response.error(error.response || error)
      })
      .finally(() => {
        this.$q.loading.hide()
        setTimeout(() => this.$router.push('/'), 500)
      })
    }
  }
}
</script>
