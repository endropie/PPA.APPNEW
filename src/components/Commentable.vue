<template>
  <q-card :class="{'fullscreen' : isFullscreen}">
    <q-card-section horizontal v-if="!noHeader">
      <div class="q-px-md q-py-sm ellipsis on-left">
        <div class="text-h6 text-no-wrap ellipsis">{{title}}</div>
        <div class="text-subtitle2 text-no-wrap ellipsis" v-if="subtitle">{{subtitle}}</div>
      </div>
      <q-space />
      <div class="row no-wrap items-center q-px-sm">
        <q-btn flat dense icon="refresh" @click="fetch({loadup: true})" />
        <q-btn flat dense icon="fullscreen" @click="isFullscreen = !isFullscreen" />
      </div>
    </q-card-section>
    <q-list separator bordered>
      <div v-if="isLoading" class="relative" style="height:0">
        <div class="absolute text-center full-width">
          <span class="q-pa-sm bg-blue-grey text-white">LOADING...</span>
        </div>
      </div>
      <q-item v-for="(comment, index) in lists" :key="index" :commentable-id="comment.id">
        <q-item-section avatar style="justify-content:start">
          <q-avatar color="primary" text-color="white" class="self-start">
            <q-img v-if="!comment.user.avatar" src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <div class="row no-wrap" style="max-width:100%">
            <div class="text-no-wrap truncate ellipsis text-uppercase text-weight-medium">{{comment.user.name}}</div>
            <q-space />
            <div class="text-no-wrap text-caption text-grey">{{$app.moment(comment.created_at).fromNow()}}</div>
          </div>
          <div class="text-caption text-grey-9" v-text="comment.text"></div>
        </q-item-section>
      </q-item>
      <q-item v-if="!lists.length && fetched">
        <q-item-section class="text-center">
          No result
        </q-item-section>
      </q-item>
      <q-item v-if="lists.length && !isLatest">
        <q-item-section>
          <q-btn dense flat label="LOAD MORE..." @click="fetch()"  />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>
<script>
export default {
  name: 'commentable',
  props: {
    fetchSize: { type: Number, default: 5 },
    noHeader: Boolean,
    subtitle: { type: String, default: null },
    title: { type: String, default: 'LOG' },
    model: { type: String, default: '' },
    id: { type: Number, default: null }
  },
  data () {
    return {
      fetchOffset: 0,
      lists: [],
      total: null,
      lastime: null,
      fetched: false,
      isLoading: false,
      isFullscreen: false,
      isLatest: false
    }
  },
  created () {
    this.fetch()
  },
  methods: {
    fetch (fv = { fresh: Boolean(), loadup: Boolean() }) {
      const latest = this.lastime || ''
      const loadup = fv.loadup ? 'true' : ''
      const apiUrl = `/api/v1/commentables?commentable_id=${this.id || ''}&commentable_type=${this.model}&latest=${latest}&loadup=${loadup}&limit=${this.fetchSize}&offset=${this.lists.length}`
      this.isLoading = true

      this.$axios.get(apiUrl)
        .then(response => {
          if (fv.loadup) {
            this.lastime = response.data.latest
            response.data.data.map(comment => {
              this.lists.unshift(comment)
            })
          } else {
            this.isLatest = Boolean(response.data.data.length < 1 || (this.lists.length + response.data.data.length) >= parseInt(response.data.total))
            this.lastime = response.data.latest

            response.data.data.map(comment => {
              this.lists.push(comment)
            })
          }
        })
        .catch(error => {
          console.error(error || error.response)
        })
        .finally(() => {
          this.fetched = true
          this.isLoading = false
        })
    }
  }
}
</script>
