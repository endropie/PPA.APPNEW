<template>
  <q-page padding class="row justify-center content-center">
    <div class="text-center">
      <p>
        <q-icon class="text-h1" name="not_interested" color="grey"></q-icon>
      </p>
      <p class="text-faded">Sorry, Access forbidden ...<strong>(403)</strong></p>
      <q-btn
        color="secondary"
        style="min-width:200px;"
        @click="goBack()"
      >Go back</q-btn>
    </div>
  </q-page>
</template>

<script>
export default {
  methods: {
    goBack() {
      if(this.$route.query.hasOwnProperty('redirect')) {
        this.$router.replace(this.$route.query.redirect)
        return
      }

      this.$router.go(-1)
    }
  },
}
</script>
