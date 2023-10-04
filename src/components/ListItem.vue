<template>
  <q-item
    ref="list-item"
    v-bind="$attrs"
    v-on="$listeners">
   
      <q-item-section v-if="icon && !iconRight" side>
        <q-icon :name="icon" />
      </q-item-section>
      <q-item-section>
         <slot>{{label}}</slot>
      </q-item-section>
      <q-item-section v-if="badge" side>
        <slot name="badge">
          <q-badge :label="badge" />
        </slot>
      </q-item-section>
      <q-item-section v-if="icon && iconRight" side>
        <q-icon :name="icon" />
      </q-item-section>
  </q-item>
</template>
<script>

export default {
  name: 'list-item',
  inheritAttrs: false,
  props: {
    label: String,
    icon: String,
    iconRight: Boolean,
    badge: String,
  },
}
</script>
