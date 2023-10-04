<template>
  <div>
    <div class="index-page bg-grey-2 window-height window-width column items-center no-wrap">
      <div class="banner bg-primary flex flex-center">
        <span v-if="$q.screen.gt.xs" >
          {{APP_NAME}}
        </span>
      </div>
      <div class="text-center" >
        <div class="card bg-white shadow-4 column no-wrap flex-center group">
          <!-- <img src="~assets/quasar-play-logo-full.svg"> -->
          <q-icon name="widgets" class="text-h2" color="blue-7" />
          <div class="text-h6 text-orange-14 text-weight-bolder" style="font: courier">
            {{APP_NAME}}
          </div>
          <div class="text-orange-8 text-weight-light">
            {{ $app.description || 'Administration Manufacture' }}
          </div>
          <div class="q-body ">
            <div class="row q-col-gutter-x-md">
              <q-input
                name="email"
                class="col-12"
                v-model="rsLogin.email"
                type="email"
                label="Username"
                placeholder="Username or valid email"
                :disable="FORM.hasEmail"
                v-validate="'required'"
                icon="person"
                :error="errors.has('email')"
                :error-message="errors.first('email')"
              >
                <q-btn icon="edit" size="md" dense flat  color='grey-6' v-if="FORM.hasEmail" @click="FORM.hasEmail = false" :tabindex="5000"></q-btn>
              </q-input>
              <q-input
                name="password"
                label="Password"
                type="password"
                class="col-12"
                icon="lock"
                v-model="rsLogin.password"
                v-validate="'required'"
                :error="errors.has('password')"
                :error-message="errors.first('password')"
                @keyup="(event) => {
                  if (event.keyCode === 13) {
                    event.preventDefault();
                    onLoginSubmit()
                  }
                }"
              />
              <div class="col-12 q-py-xs">
                <q-btn flat color="blue-grey-5" size="sm" class="float-right"
                  label="Forgot" :tabindex="5000"
                  @click="$q.notify('Forgot is not allowed!')"
                />
              </div>
              <div class="col-12 col-sm-6 q-py-xs">
                <q-btn class="full-width" label="Login" color="primary" @click="onLoginSubmit()" :loading="FORM.btnLoadingSubmit">
                  <span slot="loading">Loading...</span>
                </q-btn>
              </div>
              <div class="col-12 col-sm-6 q-py-xs">
                <q-btn class="full-width" label="Register" color="secondary"
                  @click="$q.notify('Register is not allowed!')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fixed-top-left q-ma-md">
      <q-btn-dropdown color="lime-8" label="EXAMPLE USER" v-show="false">
        <q-list v-for="(user, index) in userlists" :key="index" style="max-width:200px">
          <q-item clickable v-close-popup
            @click="rsLogin = {email: `${String(user)}@ppa.com`, password: `${String(user)}ppa`}">
            <q-item-section>
              <q-item-label>{{ `${String(user)}@ppa.com` }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
    <q-inner-loading :showing="FORM.loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import { openURL } from 'quasar'
import { mapGetters } from 'vuex'
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      userlists: [
        'admin',
        'viewer',
        'work.order',
        'work.production',
        'work.process',
        'packing',
        'marketing',
        'outgoing.verify',
        'outgoing.good',
        'sj.delivery',
        'pre.delivery',
        'incoming.good'
      ],
      rsLogin: {
        email: null,
        password: null
      },
      FORM: {
        show: true,
        loading: false,
        hasEmail: false,
        btnLoadingSubmit: false
      }
    }
  },
  computed: {
    ...mapGetters('admin', [
      'USER',
      'AUTH'
    ]),
    APP_NAME () {
      let name = 'MANUFACTURE PLAY'
      if (this.$app.setting('general.app_brand')) {
        name = this.$app.setting('general.app_brand')
      }
      return name
    }
  },
  created () {
    // User Lock System
    if (this.AUTH.hasOwnProperty('user')) {
      this.rsLogin.email = (this.AUTH.user.email || null)
      this.FORM.hasEmail = !!this.rsLogin.email

      // Auto direct when auth on accessible
      if (this.AUTH.isTokenValid && this.USER.email) {
        this.$router.push('/admin')
        this.$q.localStorage.set('AUTHLOCK', false)
      }
    }
  },
  methods: {
    launch () {
      openURL('http://quasar-framework.org')
    },
    viewPrivacyPolicy () {
      this.$refs.privacy.show()
    },
    redirectToAdmin () {
      const redirUrl = this.$route.query.redirect || '/admin'
      this.$router.push(redirUrl)
    },
    onLoginSubmit () {
      const setLoginStore = (response) => {
        if (response && response.data.success === true) {
          this.$axios.setHeader([
            { key: 'Accept', value: 'application/json' },
            { key: 'Authorization', value: `Bearer ${response.data.token}` }
          ])

          this.$store.commit('admin/setLogin', {
            auth: {
              token: response.data.token,
              login_in: response.data.expires_in,
              login_at: new Date()
            },
            user: {
              permiss: response.data.user.all_permission,
              name: response.data.user.name,
              email: response.data.user.email,
              id: response.data.user.id
            }
          })

          this.$store.commit('admin/setSetting', response.data.settings)
        } else {
          this.$axios.setHeader([
            { key: 'Accept', value: 'application/json' },
            { key: 'Authorization', value: null }
          ])
          this.$store.commit('admin/setLocked')
          this.directToLogin()
        }
      }

      this.$validator.validate().then(result => {
        if (!result) {
          this.$q.notify({
            color: 'negative',
            icon: 'error',
            position: 'top-right',
            timeout: 3000,
            message: this.$tc('messages.to_complete_form')
          })

          return
        }
        this.FORM.btnLoadingSubmit = true
        this.$axios.post('/api/v1/login', this.rsLogin)
          .then((response) => {
            setLoginStore(response)
            setTimeout(() => this.redirectToAdmin(), 800)
          })
          .catch(error => {
            this.$app.response.error(error.response)
          })
          .finally(() => {
            setTimeout(() => {
              this.FORM.btnLoadingSubmit = false
            }, 800)
          })
      })
    }
  }
}
</script>

<style lang="stylus">
.index-page
  .banner
    height 50vh
    width 100%
    font-size 10vmax
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
  font-size 15px
  text-decoration none
  text-indent -999999px
  opacity 0.7
  &.fixed
    position fixed
  &:before
    content ''
    padding .38em 0
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
