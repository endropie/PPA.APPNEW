<template>
<q-page padding class="form-page row justify-center">
  <q-card inline class="main-box"  v-if="FORM.show">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
        <template slot="menu-item">
          <list-item :label="$tc('form.remove')" icon="delete" clickable @click="FORM.delete" v-close-popup v-if="ROUTE.params.id"/>
        </template>
      </form-header>
    </q-card-section>
    <q-card-section style="min-height: calc(100vh - 200px);">
      <div class="row q-gutter-sm " >
        <q-input class="col-12"
          name="name"
          :label="$tc('label.name')"
          v-model="rsForm.name"
          v-validate="'required'"
          :error="errors.has('name')"
          :error-message="errors.first('name')"
        />
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions class="q-mx-lg">
        <q-btn color="dark" @click="FORM.toBack()">Cancel</q-btn>
        <q-btn color="light" @click="setForm(FORM.data)">Reset</q-btn>
        <q-btn color="positive" @click="onSave()">Save</q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" ><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
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
          api: '/api/v1/auth/permissions',
          uri: '/admin/configuration/auth/permissions',
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
  mounted() {
    // Component Page Created!
    this.init()
  },
  computed:{
    // code ...
  },
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
