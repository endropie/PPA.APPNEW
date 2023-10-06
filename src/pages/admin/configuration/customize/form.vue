<template>
<q-page padding style="max-width:900px">
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6">
      <q-list class="main-box " bordered >
        <q-item-label header>Layout</q-item-label>
        <q-item>
          <q-item-section side>Night Mode</q-item-section>
          <q-item-section>
            <q-toggle v-model="NIGHMODE" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section side>Color Themes</q-item-section>
          <q-item-section>
            <q-btn-dropdown label="Themes" color="primary" >
              <div class="row q-gutter-sm justify-around q-my-sm" style="max-width:150px">
                <div class=""
                  v-for="(name, index) in LAYOUT.themes"
                  :key="index">
                  <q-btn :label="name" :color="name" size="sm" dense @click.native="$store.commit('admin/setTheme', name)" />
                </div>
              </div>
            </q-btn-dropdown>
          </q-item-section>
        </q-item>

      </q-list>
    </div>
    <div class="col-12 col-md-6">
      <q-list class="main-box " bordered >
        <q-item-label header>System</q-item-label>
        <q-item>
          <q-item-section>
            <div class="row q-col-gutter-xs ">
              <q-select
                  label="Language"
                  v-model="LANG"
                  class="col-12"
                  :options ="locales"
                />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

  </div>
</q-page>
</template>

<script>

import MixPage from 'src/mixins/mix-page.vue'
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixPage, MixForm],
  data () {
    return {
      LANG: this.$q.lang.isoName,
      locales: [
        { label: 'English (US)', value: 'en-us' },
        { label: 'Bahasa Indonesia', value: 'id' }
      ],
      FORM:{
        resource:{
          // api: '/api/v1/auth',
          // uri: '/admin/configuration/profile'
        },
      },
    }
  },
  created() {
    // Component Page Created!

  },
  mounted(){
    // Component Page Mounted!


  },
  watch: {
     LANG (locale) {
      // dynamic import, so loading on demand only
      import(`quasar/lang/${locale.value}`).then(lang => {
        this.$q.lang.set(lang.default)
      })

      import(`src/i18n/${locale.value}`).then(({ default: messages}) => {
        this.$i18n.locale = locale.value
        this.$i18n.setLocaleMessage(locale.value, messages)
      })
    }
  },
  computed:{
    NIGHMODE: {
      get () {
        return this.$store.state.admin.LAYOUT.isDark
      },
      set (val) {
        this.$store.commit('admin/setMode', val)
      }
    },
  },
}
</script>
