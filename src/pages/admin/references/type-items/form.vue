<template>
<q-page padding class="form-page row justify-center">
  <q-card v-if="FORM.show" class="main-box self-start" :dark="LAYOUT.isDark">
    <q-card-section>
     <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
        <template slot="menu-item">
          <list-item :label="$tc('form.remove')" icon="delete" clickable @click="FORM.delete" v-close-popup v-if="ROUTE.params.id"/>
        </template>
      </form-header>
    </q-card-section>
    <q-card-section>
      <form ref="MainForm" class="column">
        <q-input
          name="name"
          :label="$tc('label.name')"
          v-model="rsForm.name"
          v-validate="'required'"
          :dark="LAYOUT.isDark"
          :error="errors.has('name')"
          :error-message="errors.first('name')" />

       <q-input
          :label="$tc('label.description')"  stack-label
          type="textarea"  rows="3"
          v-model="rsForm.description"
          :dark="LAYOUT.isDark" />
      </form>
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
      FORM:{
        resource:{
          uri: '/admin/references/type-items',
          api: '/api/v1/references/type-items',
        },
      },
      rsForm:{},
      setDefault:()=>{
        return {
          name:null,
          description:null,
        }
      }
    }
  },
  created() {
    // Component Page Created!
    this.init()
  },
  computed:{},
  watch:{
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
          let message = response.data.name + ' - #' + response.data.id
          this.FORM.response.success({message:message})
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
