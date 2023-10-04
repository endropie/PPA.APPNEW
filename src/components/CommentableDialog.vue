<template>
  <q-dialog ref="dialog">
    <q-card class="" style="min-width:200px;min-height:250px">
      <q-bar align="right">
        <div class="text-subtitle2 text-no-wrap truncate ellipsis">
          {{title}}
        </div>
        <q-space />
        <q-btn flat round icon="refresh" color="blue-grey" @click="$refs.commentable.fetch({loadup: true})" />
        <q-btn flat round icon="clear" color="blue-grey" v-close-popup />
      </q-bar>
      <commentable ref="commentable" no-header v-bind="$props" v-on="$listeners" />
    </q-card>
  </q-dialog>
</template>
<script>
export default {
  name: 'CommentableDialog',
  props: {
    title: { type: String, default: 'LOG' },
    model: { type: String, default: '' },
    id: { type: Number, default: null }
  },
  data () {
    return {

    }
  },
  created () {

  },
  methods: {
    show () {
      this.$refs.dialog.show()
    },
    hide () {
      this.$refs.dialog.hide()
    }
  }
}
</script>
