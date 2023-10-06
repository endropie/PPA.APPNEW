<template>
  <q-page padding>
    <q-list highlight class="main-box">
      <q-item-label header icon="settings">Module setting</q-item-label>

      <q-separator />
    </q-list>
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
      }
    }
  },
  created() {
    // Component Page Created!

  },
  mounted(){
    // Component Page Mounted!
    this.FORM__onLoaded(
      ()=> this.routing()
    )

  },
  computed:{
    // code..
  },
  watch:{
      '$route' : 'init',
  },
  methods: {
    routing() {

      setTimeout(() => {
        this.FORM.loading = true
      }, 800);

    },
  },
}
</script>
