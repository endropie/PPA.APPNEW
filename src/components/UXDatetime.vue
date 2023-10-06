<template>
  <q-field
    stack-label
    v-model="value"
    v-bind="$attrs"
    v-on="$listeners"
    class="ux-datetime"
  >
    <template v-slot:before v-if="!$attrs.disable && !$attrs.readonly">
      <q-btn flat dense icon="event" tabindex="100" class="self-end cursor-pointer">
        <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
          <q-date :mask="valueDateFormat"
            v-model="valueDate"
            :options="dateOptions"
            :dark="$attrs.dark"
            @input="() => $refs.qDateProxy.hide()" />
        </q-popup-proxy>
      </q-btn>
    </template>

    <!-- <template v-slot:after v-if="!$attrs.disable && !$attrs.readonly">
      <q-btn flat dense icon="timer" class="self-end cursor-pointer" />
    </template> -->
    <div slot="control" class="fit row no-wrap">
      <q-input type="date" dense borderless hide-bottom-space input-style="min-width:60px"
        v-model="valueDate"
        input-class="no-option-date"
        >
      </q-input>
      <!-- <q-space /> -->
      <q-input type="time" dense borderless hide-bottom-space input-style="min-width:40px"
        v-model="valueTime"
      >
      </q-input>
    </div>
  </q-field>

</template>

<script>

export default {
  name: 'ux-datetime',
  props: {
    dateOptions: Function,
    labelDateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    valueDateFormat: {
      type: String,
      default: 'YYYY-MM-DD'
    }
  },
  data () {
    return {
      value: this.$attrs.value,
      valueDate: this.$app.moment(this.$attrs.value).format(this.valueDateFormat),
      valueTime: this.$app.moment(this.$attrs.value).format('HH:mm:ss'),
      options: this.$attrs.dateOptions
    }
  },
  watch: {
    'value': 'setValueDatetime',
    'valueDate': 'setValueDate',
    'valueTime': 'setValueTime',
    '$attrs.dateOptions': 'setDateOptions'
  },
  computed: {
  },
  methods: {
    setValue (v) {
      this.value = v
    },
    setValueDate (v) {
      this.value = (this.valueTime && v)
        ? v + ' ' + this.valueTime
        : null
    },
    setValueTime (v) {
      this.value = (this.valueDate && v)
        ? this.valueDate + ' ' + v
        : null
    },
    setValueDatetime (v) {
      this.$emit('input', v)
    },
    setDateOptions (v) {
      this.options = v
    }
  }
}
</script>

<style lang="stylus">
.ux-datetime .q-field--borderless
  .q-field__control::before
    border-bottom none !important

  .q-field__control::after
    height 0 !important

.ux-datetime.q-field--auto-height
  .q-field__control-container
    padding-top 8px !important
  .q-field__control
    min-height: 48px
  .q-field__control input.q-field__native
    padding-bottom 0 !important

 .q-field__native.row
    padding-bottom 0px !important

input.no-option-date[type="date"]::-webkit-clear-button
input.no-option-date[type="date"]::-webkit-inner-spin-button,
input.no-option-date[type="date"]::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
}
</style>
