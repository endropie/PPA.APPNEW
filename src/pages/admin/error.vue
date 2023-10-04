<template>
  <q-page padding class="row justify-center content-center">
    <div class="text-center">
      <p>
        <!-- <img src="~assets/sad.svg" style="width:30vw;max-width:150px;"> -->
        <q-avatar v-show="!this.$route.query.code"
          size="80px"
          icon="mdi-wifi-off"
          color="grey-4" text-color="grey-6"> </q-avatar>
        <q-chip v-show="$route.query.code"
          :label="$route.query.code"
          color="grey-4" text-color="grey-6"
          class="text-weight-bolder"
          style="font-size:60px;height:72px"  />
      </p>
      <p class="text-faded text-weight-light">{{MESSAGE}}
        <!-- <strong v-show="this.$route.query.code">({{this.$route.query.code}})</strong> -->
      </p>
      <p class="row q-gutter-sm">
        <q-btn style="width:150px;"
          v-if="DIRECT"
          label="Go back"
          color="green" outline glossy
          @click="$router.go(-1)"/>
        <q-btn style="width:150px;"
          label="Desktop"
          color="primary" outline glossy
          @click="$router.replace('/admin/desktop')"/>
      </p>
    </div>

    <div class="fixed-bottom-right q-ma-md text-primary" v-if="RECONNECT">
      <q-btn flat dense outline
        class="text-caption q-px-md"
        style="font-size:10px;text-transform: capitalize;"
        :label="`${$tc('messages.reconecting')} (${TIME})`"
        color="indigo"
        @click="$router.replace($route.query.redirect)">
         <q-tooltip>{{ $tc('messages.reconecting_now') }}</q-tooltip>
      </q-btn>
    </div>

  </q-page>
</template>

<script>
export default {
  data() {
    return {
      count: Number(this.$route.meta.counter) || 10,
      timer: null,

    }
  },
  created() {
    console.warn('HANDLING', this.$route)
    this.$nextTick(() => {
      if(this.RECONNECT) {
        this.recounter()
        this.timer = setInterval(() => {
          this.counter()
        }, 1000)
      }
    })
  },
  beforeRouteLeave: function(to, from, next) {
    clearInterval(this.timer);
    next();
  },
  computed: {
    TIME() {
      if (this.count <= 60) return this.count
      const minute = Math.floor(this.count/60)
      return `${minute} ${this.$tc('label.minute')}`
    },
    RECONNECT() {
      return this.DIRECT && !this.$route.query.code
    },
    DIRECT() {
      return Boolean(this.$route.query.redirect)
    },
    MESSAGE() {
      if(!this.$route.query.code) return 'Lost Network Connection!'

      if(this.$route.query.code == 404) return 'Sorry, nothing here...'
      if(this.$route.query.message) return this.$route.query.message
      return 'Sorry, System has error..'
    }
  },
  methods: {
    counter () {
      this.count -= 1
      if(this.count <= 0) {
        clearInterval(this.timer);
        this.$router.replace(this.$route.query.redirect)
      }
    },
    recounter() {
      if (this.$route.meta.counter < 200) {
        this.$route.meta.counter += 20
      }
    }
  }
}
</script>

