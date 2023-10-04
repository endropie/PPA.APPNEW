<template>
<q-page padding class="form-page row justify-center">
  <q-card inline class="main-box self-start" :dark="LAYOUT.isDark" v-if="FORM.show">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
      </form-header>
    </q-card-section>
    <q-card-section>
      <div class="row q-col-gutter-md">
        <q-input class="col-12"
          ref="name"
          name="name"
          :label="$tc('label.name')"
          v-model="rsForm.name"
          v-validate="'required'"
          :dark="LAYOUT.isDark"
          :error="errors.has('name')"
          :error-message="errors.first('name')"/>
        <q-input class="col-12"
          v-model="rsForm.description"
          type="textarea"
          rows="3"
          :label="$tc('label.description')"  stack-label
          :dark="LAYOUT.isDark"
        />
      </div>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark" />
    <q-card-actions class="group">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="FORM.reset()"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" :dark="LAYOUT.isDark">
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
      FORM: {
        resource: {
          uri: '/admin/references/positions',
          api: '/api/v1/references/positions',
        },
      },
      rsForm: {},
      setDefault:()=>{
        return {
          name:null,
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
    // code ...
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
