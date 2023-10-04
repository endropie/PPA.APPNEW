<template>
    <q-card highlight class="main-box no-margin no-shadow" :dark="LAYOUT.isDark">
      <q-card-section>
        <span class="text-h4" header>{{$tc('general.item')}}</span>
      </q-card-section>
      <q-card-section class="row q-col-gutter-xs" v-if="FORM.show">
          <q-select class="col-12 col-sm-6"
            name="subname_mode"
            label="Subname mode"
            v-model="rsForm.subname_mode"
            :options="['SPECIFICATION', 'PART_NUMBER']"
            clearable
            :error="errors.has('subname_mode')"
            :error-message="errors.first('subname_mode')"
          />
          <q-input class="col-12 col-sm-6"
            type="text"
            name="subname_label"
            label="Subname label"
            v-model="rsForm.subname_label"
            :disable="!rsForm.subname_mode"
            :error="errors.has('subname_label')"
            :error-message="errors.first('subname_label')"
          />


      </q-card-section>
      <q-card-actions class="q-gutter-sm" align="right">
          <!-- <q-btn color="light" size="sm" @click="setForm(FORM.data)">Reset</q-btn> -->
          <q-btn dense color="positive"  @click="onSave()">Save</q-btn>
      </q-card-actions>

    <q-inner-loading :showing="FORM.loading" :dark="LAYOUT.isDark">
      <q-spinner-dots size="70px" color="primary" />
    </q-inner-loading>
    </q-card>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [ MixForm ],
  data () {
    return {
      FORM: {
        show: false,
        resource:{
          name: 'item',
          api: '/api/v1/setting',
        },
      },
      rsForm: {
        subname_mode: null,
        subname_label: ''
      },
      subnames : ['PART_NUMBER', 'SPECIFICATION']
    }
  },
  created() {
    // Component Page Created!
    this.init()
  },
  watch:{
      '$route' : 'init',
  },
  computed:{

  },
  methods: {
    init() {
      this.FORM.loading = true
      this.FORM.show = false
      const data = this.$store.state.admin.SETTING[this.FORM.resource.name] || {}
      this.rsForm = Object.assign(this.rsForm, JSON.parse(JSON.stringify(data)))

      setTimeout(() => {
        this.FORM.loading = false
        this.FORM.show = true
      }, 500)
    },
    onSave() {
      this.$validator.validateAll().then(result => {
        if (!result) {
          this.$q.notify({
            color:'negative', icon:'error', position:'top-right', timeout: 3000,
            message:this.$tc('messages.to_complete_form')
          });

          return;
        }
        this.FORM.loading = true
        this.$axios.set('POST', `${this.FORM.resource.api}/${this.FORM.resource.name}`, this.rsForm)
          .then((response) => {
            this.FORM.response.success({ mode:'edit', label:'Setting'})
            this.$store.commit('admin/setSetting', response.data)
            this.$nextTick(() => this.$validator.reset())
          })
          .catch((error) => {
            this.FORM.response.fields(error.response)
            this.FORM.response.error(error.response || error, 'Setting')
          })
          .finally(()=>{
            this.FORM.loading = false
          });
      });
    },
  },
}
</script>
