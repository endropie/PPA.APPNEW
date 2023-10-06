<template>
<q-page padding class="form-page row justify-center">
  <q-card inline class="main-box self-start" v-if="FORM.show">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
      </form-header>
    </q-card-section>
    <q-card-section>
      <div class="row q-col-gutter-md">
        <q-input class="col-12 col-sm-6"
          name="number"
          :label="$tc('label.number')"
          icon="code"
          autocomplete="off"
          v-model="rsForm.number"
          v-validate="'required'"
          :error="errors.has('number')"
          :error-message="errors.first('number')"
        />

        <q-select class="col-12 col-sm-6"
          name="owner"
          :label="$tc('label.owner', 3)"
          v-model="rsForm.owner"
          :options="CONFIG.references.vehicle_owner"
          v-validate="'required'"
          :error="errors.has('owner')"
          :error-message="errors.first('owner')"/>

        <q-select class="col-12 col-sm-6"
          name="type"
          :label="$tc('label.mode')"
          v-model="rsForm.type"
          :options="CONFIG.references.vehicle_type"
          v-validate="'required'"
          :error="errors.has('type')"
          :error-message="errors.first('type')"/>

        <q-select class="col-12 col-sm-6"
          name="department_id"
          :label="$tc('general.department')"
          v-model="rsForm.department_id"
          :options="DepartmentOptions"
          emit-value map-options
          :error="errors.has('department_id')"
          :error-message="errors.first('department_id')"/>
        <div class="col-12">
          <q-toggle :label="$tc('form.show', 1, {v:'Shedule'})"
            v-model="rsForm.is_scheduled"
            :true-value="1" :false-value="0"/>
        </div>
        <q-input class="col-12"
          v-model="rsForm.description"
          type="textarea"
          rows="3"
          :label="$tc('label.description')"  stack-label
        />
      </div>
    </q-card-section>
    <q-separator/>
    <q-card-actions class="group">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="FORM.reset()"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading">
    <q-spinner-dots size="70px" color="primary" />
  </q-inner-loading>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      SHEET: {
        departments: {api : '/api/v1/references/departments?mode=all'}
      },
      FORM: {
        resource: {
          uri: '/admin/common/vehicles',
          api: '/api/v1/references/vehicles',
        },
      },
      rsForm: {},
      setDefault:()=>{
        return {
          id:null,
          number:null,
          type:null,
          owner:null,
          department_id:null,
          is_scheduled:0,
          description:null,
        }
      }
    }
  },
  created() {
    // Component Page Mounted!
    this.init()

  },
  computed: {
    DepartmentOptions() {
      return (this.SHEET['departments'].data.map(item => ({label: item.name, value: item.id})) || [])
    },
  },
  watch: {
      '$route' : 'init',
  },
  methods: {
    init() {
      this.FORM.load((data) => {
        this.setForm(data || this.setDefault())
      })
    },
    setForm(data) {
      this.rsForm = JSON.parse(JSON.stringify(data))
    },
    onReset(){
      this.$nextTick(() => {
        this.$validator.reset();
        this.setForm(this.FORM.data)
      });
    },
    onSave() {

      this.$validator.validate().then(result => {
        if (!result) {
          this.$q.notify({
            color:'negative', icon:'error', position:'top-right', timeout: 3000,
            message:this.$tc('messages.to_complete_form')
          });

          return;
        }
        this.FORM.loading = true
        let {method, mode, apiUrl} = this.FORM.meta();
        this.$axios.set(method, apiUrl, this.rsForm)
        .then((response) => {
          const label = response.data.name + ' - #' + response.data.id
          this.FORM.response.success({message:label})
          this.FORM.toIndex()
        })
        .catch((error) => {
          this.FORM.response.fields(error.response)
          this.FORM.response.error(error.response || error, 'Submit')
        })
        .finally(()=>{
          this.FORM.loading = false
        });

      });
    },
  },
}
</script>
