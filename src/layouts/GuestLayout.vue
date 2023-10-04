<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'Layout',
  data () {
    return {
    }
  },
  methods: {
    openURL
  }
}
</script>

<style>
</style>
