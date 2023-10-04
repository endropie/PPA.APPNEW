<template>
  <div>
    <div class="index-page bg-grey-2 window-height window-width column items-center no-wrap">
      <div class="banner bg-primary flex flex-center">
        <span v-if="$q.screen.gt.xs" >
          {{APP_NAME}}
        </span>
      </div>
      <div class="text-center">
        <div class="card bg-white shadow-4 column no-wrap flex-center group q-gutter-xs">
          <!-- <img src="~assets/quasar-play-logo-full.svg"> -->
          <q-icon name="widgets" class="text-h2" color="blue-7" />
          <div class="text-h4 text-orange-14 text-weight-bolder" style="font: courier">
            {{ APP_NAME }}
          </div>
          <div class="text-orange-8 text-weight-light">
            {{ APP_DESCRIPTION }}
          </div>
          <br>

          <q-btn no-wrap
            to="/admin"
            color="primary"
            class="full-width"
            no-ripple
          >
            <div>
              MANUPLAY SYSTEM
              <div class="text-caption self-end">VERSION {{ version }}</div>
            </div>
          </q-btn>

          <div class="fit row justify-center q-mt-lg" :class="{'justify-between': $q.screen.gt.xs}">

            <q-btn no-ripple
              color="green-8"
              icon="android"
              type="a" href="/statics/apps/ppa-system.apk"
              aria-multiline >
              <span class="q-ml-sm column" style="line-height:normal">
                <span>ANDROID APP V.1</span>
                <span style="font-size:70%">Build.10</span>
              </span>
              <q-tooltip>Download Mobile App</q-tooltip>
            </q-btn>

            <q-btn flat no-caps color="grey-7"
              label="Privacy Policy"
              @click.native="$refs.privacy.show()"
              class="q-mt-sm" />
          </div>

          <privacy-policy ref="privacy" />
        </div>
      </div>
    </div>
    <q-btn class="fixed-bottom-right" flat color="blue-grey" icon="device_hub" @click="openSetURL" />

    <q-dialog ref="modal" style="min-width:300px" persistent>
      <q-card style="min-width:280px">
        <q-bar dark class="bg-blue-grey text-white">
          <div class="col text-left text-weight-bold"> Host-API</div>
          <q-space />
          <q-btn dense flat round icon="clear" v-close-popup />
        </q-bar>
        <q-card-section>
          <q-select dense
            v-model="baseURL"
            :options="servers">
            <q-btn slot="before" flat dense icon="edit" color="blue-grey">
              <q-popup-edit v-model="baseURL" :offset="[0, 10]" >
                <template  v-slot="{ set, cancel }">
                  <q-input v-model="baseURL" dense autofocus>
                    <template v-slot:prepend>
                      <q-icon name="device_hub" color="blue-grey" />
                    </template>
                    <template v-slot:after>
                      <q-btn flat dense color="negative" icon="cancel" @click.stop="cancel" />
                      <q-btn flat dense color="positive" icon="check_circle" @click.stop="val => { set(val); saveBaseURL() }"/>
                    </template>
                  </q-input>
                </template>
              </q-popup-edit>
            </q-btn>
            <template slot="after">
              <q-btn dense
                :disable="baseURL === BASEURL"
                :flat="baseURL === BASEURL"
                :icon="baseURL !== BASEURL ? 'save' : 'done'"
                :color="baseURL !== BASEURL ? 'warning' : 'primary'"
                @click="saveBaseURL()"
              />
            </template>
          </q-select>
        </q-card-section>
        <q-separator/>
        <q-card-actions align="right" class="text-blue-grey">
          <div><q-icon name="language" class="q-mr-xs" />{{$axios.defaults.baseURL}}</div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { openURL } from 'quasar'
import PrivacyPolicy from 'components/PrivacyPolicy'

export default {
  components: {
    PrivacyPolicy
  },
  data () {
    return {
      version: process.env.APP_VERSION,
      servers: ['http://localhost:8000', 'http://localhost:8001', 'http://ppa.virmata.com'],
      baseURL: null
    }
  },
  created () {
    // component created!
  },
  computed: {
    BASEURL () {
      return this.$q.localStorage.getItem('BASE_URL')
    },
    APP_NAME () {
      let name = 'MANUFACTURE PLAY'
      if (this.$app.setting('general.app_brand')) {
        name = this.$app.setting('general.app_brand')
      }
      return name
    },
    APP_DESCRIPTION () {
      let name = 'Administration Manufacture'
      if (this.$app.setting('general.app_description')) {
        name = this.$app.setting('general.app_description')
      }
      return name
    }
  },
  methods: {
    launch () {
      openURL('http://quasar-framework.org')
    },
    openSetURL () {
      this.baseURL = this.$q.localStorage.getItem('BASE_URL')
      this.$refs.modal.show()
    },
    saveBaseURL () {
      this.$q.loading.show()
      this.$q.localStorage.set('BASE_URL', this.baseURL)
      this.$axios.setHeader([{ key: 'baseURL', value: this.baseURL }])
      window.location.reload()
      setTimeout(() => {
        this.$q.loading.hide()
      }, 2000)
    },
    addBaseURL (val) {
      this.baseURL = val
      this.saveBaseURL()
    },
    viewPrivacyPolicy () {
      this.$refs.privacy.show()
    }
  }
}
</script>

<style lang="stylus">
.index-page
  .banner
    height 50vh
    width 100%
    font-size 12vmax
    color rgba(255, 255, 255, .2)
    overflow hidden
  .card
    width 80vw
    max-width 500px
    padding 10px 25px
    margin-top -90px
    border-radius 2px
    img
      height 140px
      width 140px

.ribbon
  width 14.1em
  height 14.1em
  position absolute
  overflow hidden
  top 0
  right 0
  z-index 39
  pointer-events none
  font-size 17px
  text-decoration none
  text-indent -999999px
  opacity 0.7
  &.fixed
    position fixed
  &:before
    content ''
    padding 4px
    background-color white
    background-image linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, .15))
    box-shadow 0 .15em .23em 0 rgba(0, 0, 0, .5)
    pointer-events auto
  &:after
    content attr(title)
    color #027be3
    line-height 1.54em
    text-decoration none
    text-align center
    text-indent 0
    padding .15em 0
    margin .15em 0

  &:before, &:after
    position absolute
    display block
    width 23.38em
    height 1.74em
    top 4.8em
    right -5.8em
    transform rotate(45deg)
</style>
