<template>
  <div>
    <q-btn outline dense :color="isAccurated ? 'white' : 'warning'" icon="mdi-alpha-a" @click="onAccurate"/>
  </div>
</template>

<script>
import { openURL } from 'quasar'
import { mapState, mapActions } from 'vuex'

export default {
  data: () => ({
    //
  }),
  computed: {
    ...mapState('admin', ['ACCURATE']),
    isAccurated () {
      return this.ACCURATE && this.ACCURATE.hasOwnProperty('token') && this.ACCURATE.token
    }
  },
  created() {
    this.setup()
  },
  methods: {
    openURL,
    setup () {
      if (this.isAccurated) {
        this.$axios.setHeader([{ key: 'X-Accurate', value: this.ACCURATE.token}])
      }
    },
    onAccurate () {
      return this.$q.dialog({
        title: 'ACCURATE',
        message: 'Would you like to '+ (!this.isAccurated ? 'connect' : 're-connect') +' on the Accurate?',
        ok: 'Connect',
        cancel: this.isAccurated ? 'Disconnet' : null,
        persistent: true
      }).onOk(() => {
        let redirect = this.$axios.defaults.baseURL + '/accurate/login?redirect_uri=' + window.location.origin + '/%23/accurate'
        window.location.href = redirect
      }).onCancel(() => {
        if (this.$axios.defaults.headers.common['X-Accurate']) {
          delete this.$axios.defaults.headers.common['X-Accurate']
        }
        this.$store.dispatch('admin/assignAccurate', null)
      })
    }
  }
}
</script>
