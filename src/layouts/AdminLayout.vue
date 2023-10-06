<template>
  <q-layout view="lHh LpR lFf" :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-white text-dark'"
    @mousemove="AUTHLOCK.event"
    @keypress="AUTHLOCK.event"
  >
    <q-header class="header print-hide" elevated :class="$q.dark.isActive ? 'bg-grey-9' :'bg-primary'">

      <q-toolbar color="primary" >
        <q-btn v-if="NODRAWER"
          icon="arrow_back" flat round dense
          aria-label="Menu" class="within-iframe-hide"
          @click.native="$router.go(-1)" />
        <q-btn v-else-if="!LEFTDRAWER"
          icon="menu" flat round dense
          aria-label="Menu" class="within-iframe-hide"
          @click="LEFTDRAWER = !LEFTDRAWER" />
        <q-icon v-else
          :name="$route.meta.icon"
          style="font-size:28px; margin-right: 5px;"
          v-show="$route.meta.icon"
        />
        <!-- <q-btn v-else class="cordova-only electron-only" icon="arrow_back" aria-label="Back" flat rounded dense v-go-back.single="PAGEMETA.backRoute" /> -->
        <q-toolbar-title>
          <!-- <q-avatar v-show="$route.meta.icon" :icon="$route.meta.icon" size="24px"  color="red" /> -->
          <span v-if="$route.meta.lang" class="text-uppercase text-weight-reguler" v-text="$tc($route.meta.lang)" />
          <span v-else class="text-uppercase text-weight-reguler" v-text="$route.meta.title" />
        </q-toolbar-title>
        <admin-header />
        <admin-accurate class="q-ml-sm" />
        <!-- <q-btn v-show="false" aria-label="Menu" class="within-iframe-hide" icon="assignment" flat round dense @click="RIGHTDRAWER = !RIGHTDRAWER" /> -->

      </q-toolbar>
    </q-header>

    <q-drawer class="print-hide" bordered
      content-class="bg-grey-2"
      v-model="LEFTDRAWER"
      :mini="!LEFTDRAWER || miniState"
      @click.capture="leftDrawerCapture"
      show-if-above
      v-if="!NODRAWER">
      <q-scroll-area :class="$q.dark.isActive ? 'bg-black text-primary' : 'bg-white text-primary'" style="width: 100%; height: 100%; overflow-y: hidden">
        <div :style="{'height': miniState ? '50px': '115px'}"
          class="row flex-center opacity-1"
          :class="{
            'bg-primary text-white' : $q.dark.isActive,
            'bg-grey-2 text-primary': !$q.dark.isActive,
          }" >
          <!-- <img alt="Quasar logo" src="~assets/quasar-logo.svg" style="height: 75px; width 75px;"> -->
          <q-icon name="widgets" :class="miniState ? 'text-h4' : 'text-h3'"  />
          <div class="column q-ml-md"  :class="{'hidden' : miniState}">
            <span class="text-h6">{{$app.setting('general.app_brand') || $app.name}}</span>
            <span class="caption text-small text-weight-light">MANUPLAY {{ version }}</span>
          </div>
        </div>
        <q-list class="menu" :class="{'dimmed' : miniState}">
          <template v-for="(node, index) in DataMenu">
            <admin-menu-item :node="node" :isIndent="false" :prefix="`/admin/${node.path}`" :key="index" :dark="$q.dark.isActive"/>
          </template>
        </q-list>
      </q-scroll-area>
       <div class="q-mini-drawer-hide absolute" style="bottom: 35px; right: -17px">
          <q-btn dense round unelevated color="primary" icon="chevron_left"
            @click="[miniState = true]"
          />
        </div>
    </q-drawer>

    <q-page-container>
      <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeIn"
        :duration="1500" @leave="resetScroll">
        <router-view />
      </transition>
      <q-page v-if="!SHOW" >
        <q-inner-loading :showing="!SHOW">
          <q-spinner-facebook  size="70px" color="primary" />
        </q-inner-loading>
      </q-page>
    </q-page-container>

    <q-dialog v-model="AUTHLOCK.dialog" persistent
      content-style="background: rgb(69 90 100 / 50%)"
    >
      <q-card style="min-width:320px">
        <q-bar dark class="bg-blue-grey-8 text-white">
          <div class="col text-center text-weight-bold q-py-md text-uppercase">
            Authorization Timeout
          </div>
        </q-bar>
        <q-card-section class="row items-center">
          <div class="q-pl-sm col q-gutter-sm">
            <q-field outlined tabindex="-1" color="blue-grey">
              <div class="row no-wrap items-center q-gutter-sm">
                <q-avatar icon="person" color="blue-grey" text-color="white" size="36px" />
                <div>
                  <div class="text-uppercase">{{ USER.name }}</div>
                  <div class="text-caption text-italic text-weight-medium" style="line-height:normal">{{ USER.email }}</div>
                </div>
              </div>
            </q-field>
            <q-input autofocus filled color="blue-grey" v-model="AUTHLOCK.form.password" type="password" label="Password" />
          </div>
        </q-card-section>
        <q-card-section>
          <div class="column q-gutter-sm">
            <q-btn label="UNLOCK" color="blue-grey" @click="AUTHLOCK.unlocked" />
            <q-btn label="LOGOUT" color="blue-grey" outline @click="AUTHLOCK.logout" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'
import { mapState } from 'vuex'
import MixPage from 'src/mixins/mix-page'
import DataMenu from 'assets/data-menu.js'

export default {
  mixins: [MixPage],
  data () {
    return {
      AUTHLOCK: {
        dialog: false,
        interval: 600,
        interloop: 5,
        counter: 0,
        wait: false,
        timing: null,
        form: {
          password: null
        },
        isLocked: () => {
          return Boolean(this.$q.localStorage.getItem('AUTHLOCK'))
        },
        unlocked: () => {
          this.$q.loading.hide()
          this.$axios.post('/api/v1/auth/confirm-password', this.AUTHLOCK.form)
            .then(() => {
              this.$q.localStorage.remove('AUTHLOCK')
              this.AUTHLOCK.dialog = false
              this.AUTHLOCK.create()
            })
            .catch(error => {
              this.$app.response.error(error.response || error)
            })
            .finally(() => {
              this.$q.loading.hide()
            })
        },
        locked: () => {
          clearInterval(window.AUTHLOCKING)
          this.$q.localStorage.set('AUTHLOCK', true)
          this.AUTHLOCK.dialog = true
          this.AUTHLOCK.form = {
            password: null
          }
        },
        logout: () => {
          this.$store.commit('admin/setLogoff')
          this.$q.loading.show()
          this.$axios.set('POST', '/api/v1/auth/logout')
            .catch(error => {
              this.$app.response.error(error.response || error)
            })
            .finally(() => {
              this.$q.loading.hide()
              this.$q.localStorage.remove('AUTHLOCK')

              setTimeout(() => {
                this.AUTHLOCK.dialog = false
                this.$router.push('/')
              }, 500)
            })
        },
        create: () => {
          if (this.AUTHLOCK.isLocked()) return this.AUTHLOCK.locked()
          clearInterval(window.AUTHLOCKING)
          this.AUTHLOCK.counter = 0
          window.AUTHLOCKING = setInterval(() => {
            this.AUTHLOCK.counter += this.AUTHLOCK.interloop
            if (this.AUTHLOCK.counter >= this.AUTHLOCK.interval) this.AUTHLOCK.locked()
          }, 1000 * this.AUTHLOCK.interloop)
        },
        event: () => {
          if (this.AUTHLOCK.isLocked()) return undefined
          if (!this.AUTHLOCK.wait) {
            this.AUTHLOCK.wait = true
            this.AUTHLOCK.counter = 0
            this.AUTHLOCK.create()

            setTimeout(() => {
              this.AUTHLOCK.wait = false
            }, 1000)
          }
        }
      },
      version: process.env.APP_VERSION,
      DataMenu,
      miniState: false
    }
  },
  created () {
    this.fetchValidToken()
    this.AUTHLOCK.create()
  },
  computed: {
    ...mapState('admin', [
      'NOW',
      'PAGEMETA',
      'AUTH',
      'USER'
    ]),
    NODRAWER () {
      return ['view', 'print', 'edit', 'create'].some(x => x === this.$route.meta.mode)
    }
  },
  methods: {
    openURL,
    resetScroll (el, done) {
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      done()
    },
    leftDrawerCapture (e) {
      if (this.miniState) {
        this.miniState = false
        e.stopPropagation()
      }
    },
    fetchValidToken () {
      this.$q.loading.show()
      this.$axios.validToken((response) => {
        this.$q.loading.hide()
        if (response.status >= 200 && response.status <= 300) {

        } else if (response.status === 401) {
          this.setLogoff()
        } else if (response.status >= 400) {
          console.error('APA', response)
        } else {
          this.$q.dialog({
            message: 'Netwok error!',
            ok: 'redirect',
            cancel: 'skip'
          }).onOk(() => { this.$router.push('/') })
        }
      })
    },
    setLogoff () {
      this.$axios.setHeader([
        { key: 'Accept', value: 'application/json' },
        { key: 'Authorization', value: null }
      ])
      this.$store.commit('admin/setLogoff')
      setTimeout(() => {
        this.$router.push('/auth')
      }, 500)
    },
    setLogout () {
      this.$axios.setHeader([
        { key: 'Accept', value: 'application/json' },
        { key: 'Authorization', value: null }
      ])
      this.$store.commit('admin/setLogoff')
      setTimeout(() => {
        this.$router.push('/')
      }, 500)
    }
  }
}
</script>
<style lang="stylus">
header.header
  // background-image: linear-gradient(145deg, ()$primary 11%, ()$dark-primary 75%)
  background-image: linear-gradient(145deg, rgba(255,255,255,0) 10%,  rgba(0, 0, 0, 0.5) 90%)

.menu.dimmed:after
  background-color transparent !important

aside.q-drawer
  background #fff0

@media print
  .q-loading-bar
    display none
</style>
