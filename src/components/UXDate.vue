<template>
  <q-input type="date"
    v-model="value"
    v-bind="$attrs"
    v-on="$listeners"
    input-class="no-option-date"
    >
      <template v-slot:append v-if="!$attrs.disable && !$attrs.readonly">
        <q-btn flat dense icon="event" class="self-end cursor-pointer">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
            <q-date :mask="valueFormat"
              v-model="value"
              v-on="$listeners"
              :options="dateOptions"
              :dark="$attrs.dark"
              @input="() => $refs.qDateProxy.hide()" />
          </q-popup-proxy>
        </q-btn>
      </template>

      <template slot="before">
        <slot name="before"></slot>
      </template>
      <template slot="after">
        <slot name="after"></slot>
      </template>
  </q-input>

</template>

<script>

export default {
  name: 'ux-date',
  props: {
    dateOptions: Function,
    labelFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    valueFormat: {
      type: String,
      default: 'YYYY-MM-DD'
    }
  },
  data () {
    return {
      value: this.$attrs.value,
      options: this.$attrs.dateOptions
    }
  },
  created () {
    // console.log('DATE', this.valueFormat)
  },
  watch: {
    '$attrs.value': 'setValue',
    '$attrs.dateOptions': 'setDateOptions'
  },
  computed: {
  },
  methods: {
    setValue (v) {
      this.value = v
    },
    setDateOptions (v) {
      this.options = v
    }
  }
}
</script>

<style lang="stylus">
input.no-option-date[type="date"]::-webkit-clear-button
input.no-option-date[type="date"]::-webkit-inner-spin-button,
input.no-option-date[type="date"]::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
}
</style>
