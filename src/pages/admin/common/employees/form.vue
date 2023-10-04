<template>
<q-page padding class="form-page row justify-center">
  <q-card inline class="main-box self-start" :dark="LAYOUT.isDark" v-if="FORM.show">
    <q-card-section>
      <form-header
        :title="FORM.title()"
        :subtitle="FORM.subtitle()"
        :menus="[
          { label: $tc('form.remove'),
            detail: $tc('messages.process_delete'),
            icon: 'add',
            hidden:!$app.can('customers-create'),
            actions: `${FORM.resource.uri}/create`
          }
        ]">
        <template slot="menu-item">
          <list-item :label="$tc('form.remove')" icon="delete" clickable @click="FORM.delete" v-close-popup v-if="ROUTE.params.id"/>
        </template>
      </form-header>
    </q-card-section>
    <q-card-section class="row  q-col-gutter-x-md">
      <q-input class="col-12 col-sm-6"
        name="code"
        label="NIK" data-vv-as="NIK"
        v-model="rsForm.code"
        v-validate="'required'"
        :dark="LAYOUT.isDark"
        :error="errors.has('code')"
        :error-message="errors.first('code')"/>
      <q-input class="col-12 col-sm-6"
        name="name"
        :label="$tc('label.name')"
        v-model="rsForm.name"
        v-validate="'required'"
        :dark="LAYOUT.isDark"
        :error="errors.has('name')"
        :error-message="errors.first('name')"/>
      <q-input class="col-12 col-sm-6"
        name="phone" type="phone"
        :label="$tc('label.phone')"
        v-model="rsForm.phone"
        :dark="LAYOUT.isDark"
        v-validate="'phone'"
        :error="errors.has('phone')"
        :error-message="errors.first('phone')" />

      <q-input autocomplete="off" class="col-12 col-sm-6"
        name="email" type="email"
        :label="$tc('label.email')"
        v-model="rsForm.email"
        :dark="LAYOUT.isDark"
        v-validate="'required|email'"
        :error="errors.has('email')"
        :error-message="errors.first('email')" />

      <q-select class="col-12 col-sm-6"
        name="position_id"
        v-model="rsForm.position_id"
        :label="$tc('general.position')"
        v-validate="'required'"
        :dark="LAYOUT.isDark"
        :options="PositionOptions"
        emit-value map-options
        :error="errors.has('position_id')"
        :error-message="errors.first('position_id')"/>

      <q-select class="col-12 col-sm-6"
        name="department_id"
        v-model="rsForm.department_id"
        :label="$tc('general.position')"
        v-validate="'required'"
        :dark="LAYOUT.isDark"
        :options="DepartmentOptions"
        emit-value map-options
        :error="errors.has('department_id')"
        :error-message="errors.first('department_id')"
      />
    </q-card-section>
    <q-card-section>
      <q-list dense bordered>
        <q-item>
          <q-item-section avatar>
            <q-avatar icon="person" />
          </q-item-section>
          <q-item-section v-if="rsForm.user">
            <span>{{rsForm.user.name}}</span>
            <span class="text-caption">{{rsForm.user.email}}</span>
          </q-item-section>
          <q-item-section>
            <div v-if="rsForm.setup_user"  class="row no-wrap">
              <div class="row col q-col-gutter-xs" >
                <q-input class="col-12 col-md-4" disable autocomplete="off" v-if="!rsForm.user"
                  name="email" type="email"
                  :label="$tc('label.email')"
                  v-model="rsForm.email"
                  :dark="LAYOUT.isDark"
                  v-validate="'required|email'"
                  :error="errors.has('email')"
                  :error-message="errors.first('email')" />
                <q-input class="col-12 col-md-4" :class="{'col-md-6': rsForm.user}" type="password"
                  ref="password"
                  name="setup_user.password"
                  label="Password"
                  v-model="rsForm.setup_user.password"
                  :dark="LAYOUT.isDark"
                  v-validate="'required'"
                  :error="errors.has('setup_user.password')"/>
                <q-input class="col-12 col-md-4" :class="{'col-md-6': rsForm.user}" type="password"
                  name="setup_user.password_confirmation"
                  label="Re-password"
                  v-model="rsForm.setup_user.password_confirmation"
                  :dark="LAYOUT.isDark"
                  v-validate="'required|confirmed:password'"
                  :error="errors.has('setup_user.password_confirmation')"/>
              </div>
              <span class="self-center col-auto" style="">
                <q-btn dense flat icon="clear" @click="cancelSetup()"/>
              </span>
            </div>
          </q-item-section>
          <q-item-section side v-if="!rsForm.setup_user">
            <q-btn v-if="rsForm.user" color="blue-grey" label="reset password" @click="rsForm.setup_user = {password:null, password_confirmation:null, is_reset:true}"/>
            <q-btn v-else color="blue-grey" label="create user" @click="rsForm.setup_user = {password:null, password_confirmation:null}"/>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark" />
    <q-card-actions class="group">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="FORM.reset()"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()"></q-btn>
    </q-card-actions>
  </q-card>
    <q-inner-loading :showing="FORM.loading" :dark="LAYOUT.isDark"><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      SHEET: {
        positions: {api:'/api/v1/references/positions?mode=all'},
        departments: {api:'/api/v1/references/departments?mode=all'},
      },
      FORM:{
        resource:{
          uri: '/admin/common/employees',
          api: '/api/v1/common/employees',
        },
      },
      rsForm:{},
      setDefault:()=>{
        return {
          name:null,
          phone:null,
          employee_jobs: [],
          setup_user: null,
        }
      }
    }
  },
  mounted(){
    // Component Page Mounted!
    this.init()

  },
  watch:{
      '$route' : 'init',
  },
  computed: {
    PositionOptions() {
      return (this.SHEET.positions.data.map(item => ({label: item.name, value: item.id})) || [])
    },
    DepartmentOptions() {
      return (this.SHEET.departments.data.map(item => ({label: item.name, value: item.id})) || [])
    },
  },
  methods: {
    init() {
      this.FORM.load((data) => {
        this.setForm(Object.assign(this.setDefault(), data))
      })
    },
    setForm(data) {
      this.rsForm = JSON.parse(JSON.stringify(data))
    },

    cancelSetup () {
      this.$validator.reset()
      this.rsForm.setup_user = {}
      setTimeout(() => {
        this.rsForm.setup_user = null
      }, 0)
    },
    onSave() {
      this.$validator.validate().then(result => {
        if (!result) {
          this.$q.notify({
            color:'negative', icon:'error', position:'top-right', timeout: 3000,
            message:this.$tc('messages.to_complete_form')
          });

          return
        }
        this.FORM.loading = true
        let {method, mode, apiUrl} = this.FORM.meta();
        this.$axios.set(method, apiUrl, this.rsForm)
        .then((response) => {
          let message = response.data.name + ' - #' + response.data.id
          this.FORM.response.success({message:message})
          this.FORM.toIndex()
        })
        .catch((error) => {

          this.FORM.response.fields(error.response)
          this.FORM.response.error(error.response || error, 'Create')
        })
        .finally(()=>{
          this.FORM.loading = false
        });
      });
    },
  },
}
</script>
