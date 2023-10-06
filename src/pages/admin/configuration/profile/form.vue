<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-list class="main-box " bordered >
          <q-item-label header>User Setting</q-item-label>
          <q-item>
            <q-item-section avatar>
              <q-avatar rounded color="purple" text-color="white" icon="people" />
            </q-item-section>
            <q-item-section label>
              <q-item-label>{{rsUser.name}}</q-item-label>
              <q-item-label caption>{{rsUser.email}}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item-label header>Change Password</q-item-label>
          <q-item>
            <q-item-section>
              <form class="form" novalidate @submit.prevent="validateForm('form-pass')" data-vv-scope="form-pass">
                <div class="row q-col-gutter-xs" >
                  <q-input  class="col-12 col-sm-4"
                    name="newpassword"
                    label="New password"
                    type="password"
                    v-model="rsPass.newpassword"
                    v-validate="'required|min:8'"
                    :error="errors.has('form-pass.newpassword')"
                    :error-message="errors.first('form-pass.newpassword')"
                  />
                  <q-input  class="col-12 col-sm-4"
                    name="c_newpassword"
                    label="Confirm New password"
                    type="password"
                    no-pass-toggle
                    v-model="rsPass.c_newpassword"
                    v-validate="'required'"
                    :error="errors.has('form-pass.c_newpassword')"
                    :error-message="errors.first('form-pass.c_newpassword')"
                  />
                  <q-input class="col-12 col-sm-4"
                    name="password"
                    label="Current password"
                    type="password"
                    v-model="rsPass.password"
                    v-validate="'required|min:8'"
                    :error="errors.has('form-pass.password')"
                    :error-message="errors.first('form-pass.password')"
                  />
                  <div class="col-12" align="right">
                    <!-- <q-btn color="light" size="sm" @click="setForm(FORM.data)">Reset</q-btn> -->
                    <q-btn color="positive" size="sm" @click="onChangePassword()">Save</q-btn>
                  </div>
                </div>
              </form>
            </q-item-section>
          </q-item>

        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      FORM:{
        resource:{
          api: '/api/v1/auth',
          uri: '/admin/configuration/profile'
        },
        options:{
          roles: {data:[], api:'/api/v1/auth/roles?mode=all'},
          permissions: {data:[], api:'/api/v1/auth/permissions?mode=all'},
        },
      },
      rsUser: {
        id: null,
        name: null,
        email: null,
      },
      rsPass: {
        password: null,
        newpassword: null,
        c_newpassword: null,
      }
    }
  },
  created() {
    this.routing()
  },
  computed:{
    RoleOptions() {
      return (this.SHEET.roles.data.map(item => ({label: item.name, value: item.name})))
    },
    PermissionOptions() {
      return (this.SHEET.permissions.data.map(item => ({label: item.name, value: item.name})))
    },
  },
  watch:{
      '$route' : 'init',
  },
  methods: {
    routing() {
      if(!this.$store.state.admin.USER) return
      const user = this.$store.state.admin.USER
      this.rsUser = Object.assign(this.rsUser, JSON.parse(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
      })))
      setTimeout(() => {
        this.FORM.loading = true
      }, 800);

    },

    onChangePassword() {

      this.$validator.validateAll('form-pass').then(result => {
        if (!result) {
          this.$q.notify({
            color:'negative', icon:'error', position:'top-right', timeout: 3000,
            message:this.$tc('messages.to_complete_form')
          });

          return;
        }
        this.FORM.loading = true
        this.$axios.set('POST', `${this.FORM.resource.api}/change-password`, this.rsPass)
          .then((response) => {
            this.FORM.response.success({ mode:'change password'})
            this.rsPass = {
              password:null,
              newpassword:null,
              c_newpassword:null,
            }
            this.$nextTick(() => this.$validator.reset())
          })
          .catch((error) => {

            this.FORM.response.fields(error.response,  'form-pass')
            this.FORM.response.error(error.response || error, 'Change Password')

          })
          .finally(()=>{
            this.FORM.loading = false
          });
      });
    },
  },
}
</script>
