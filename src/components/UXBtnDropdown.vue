<template>
  <span v-if="!EMPTY">
    <q-btn v-if="!$attrs.label && OPTIONS.length == 1"
      :label="FIRST.label"
      v-bind="$attrs"
      v-on="$listeners"
      @click="firstCall"/>
    <q-btn-dropdown v-else
      split
      :label="$attrs.label || FIRST.label || '=='"
      v-bind="$attrs"
      v-on="$listeners"
      @click="firstCall">
      <template v-slot:label>
        <slot name="label"></slot>
      </template>

      <q-list style="min-width:200px">
        <template v-for="(item, index) in OPTIONS">
        <q-item :key="index"
          v-if="!item.hidden && ($attrs.label || index !== 0)"
          clickable
          v-close-popup
          @click="actionsCall(item)" >
          <q-item-section avatar v-if="item.icon">
            <q-avatar :icon="item.icon" :color="item.color || 'primary'" text-color="white" size="38px"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{item.label || 'test'}}</q-item-label>
            <q-item-label caption v-if="item.detail">{{item.detail}}</q-item-label>
          </q-item-section>
          <q-item-section side v-if="item.stamp">
            <q-badge :label="item.stamp"/>
          </q-item-section>
        </q-item>
        </template>
      </q-list>
    </q-btn-dropdown>
  </span>
</template>


<script>
export default {
  props: {
    required: Boolean,
    options: {
      type: Array,
      default: () => []
    }
  },
  computed:{
    OPTIONS() {
      if(!this.options) return []
      return this.options.filter(x => !x.hidden)
    },
    FIRST() {
      let find = null
      if(this.OPTIONS) find = this.OPTIONS.find(x => !x.hidden)
      return find
    },
    EMPTY() {
      return (!this.OPTIONS.length)
    },
  },
  methods: {
    firstCall() {
      if (this.$attrs.label) return
      if (this.FIRST.hasOwnProperty('actions')) this.FIRST.actions()
    },
    actionsCall(item) {
      if (item.hasOwnProperty('actions')) item.actions()
    }
  }
}
</script>
