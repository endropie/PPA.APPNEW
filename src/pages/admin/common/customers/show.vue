<template>
  <q-page padding class="docs-btn row justify-center">
    <div style="width: 500px; max-width: 90vw;">
        This SHOW 
    </div>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      count: 0,
      loading1: false,
      loading2: false,
      loading3: false,
      loading4: false,
      loading5: false,
      loading6: false,
      loading7: false,
      loading8: false,
      progress: false,
      percentage1: 0,
      percentage2: 0,
      sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
      icons: [
        'navigation',
        'add_a_photo',
        'camera',
        'camera_front',
        'my_location'
      ]
    }
  },
  methods: {
    simulateProgress (number) {
      // we set loading state
      this[`loading${number}`] = true

      // simulate a delay
      setTimeout(() => {
        // we're done, we reset loading state
        this[`loading${number}`] = false
      }, 3000)
    },
    startComputing (percentageId, modelId) {
      this[`loading${modelId}`] = true
      this[`percentage${percentageId}`] = 0
      const interval = setInterval(() => {
        this[`percentage${percentageId}`] += Math.floor(Math.random() * 8 + 10)
        if (this[`percentage${percentageId}`] >= 100) {
          clearInterval(interval)
          this[`loading${modelId}`] = false
        }
      }, 700)
    },
    alert () {
      this.$q.dialog({
        title: 'Good job!'
      })
    }
  },
  beforeDestroy () {
    clearInterval(this.interval1)
    clearInterval(this.interval2)
  }
}
</script>

<style lang="stylus">
.docs-btn
  .q-btn
    margin 5px
  .btn-fixed-width
    width 200px
</style>
