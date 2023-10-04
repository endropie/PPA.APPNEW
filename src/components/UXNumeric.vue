<template>
  <q-field
    v-bind="$attrs"
    v-on="$listeners"
    class="ux-numeric-field">
    <template slot="control">
      <vue-autonumeric
        :disabled="$attrs.disable"
        :readonly="$attrs.readonly"
        v-model="value"
        v-on="$listeners"
        class="ux-numeric q-field__input"
        :options="{
          digitGroupSeparator: '.',
          decimalCharacter: ',',
          decimalCharacterAlternative: '.',
          currencySymbol: '', // Ex: \u00a0€
          currencySymbolPlacement: 's',
          roundingMethod: 'U',
          minimumValue: '0',
          ...options
        }" >
      </vue-autonumeric>
    </template>
  </q-field>
</template>

<script>
import VueAutonumeric from 'vue-autonumeric/src/components/VueAutonumeric.vue'

export default {
  name: 'ux-numeric',
  components: {
    VueAutonumeric
  },
  props: {
    options: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      value: this.$attrs.value,
      setDefault: {
        digitGroupSeparator: '.',
        decimalCharacter: ',',
        decimalCharacterAlternative: '.',
        currencySymbol: '', // Ex: \u00a0€
        currencySymbolPlacement: 's',
        roundingMethod: 'U',
        minimumValue: '0'
      }
    }
  },
  watch: {
    '$attrs.value': 'setValue'
  },
  methods: {
    setValue (v) {
      this.value = v
    }
  }
}
</script>

<style lang="stylus">
.ux-numeric-field
  .q-field__native.row
    padding unset

.ux-numeric-field input.ux-numeric
  text-align right
</style>
