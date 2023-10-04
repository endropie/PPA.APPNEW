<template>
  <q-field v-model="value" v-bind="$attrs" borderless>
    <div slot="control" class="row q-col-gutter-xs justify-start full-width">
      <q-select class="col-12  no-padding no-margin"
        :label="$tc('recurring.frequency')" stack-label
        :placeholder="$tc('form.select')"
        v-model="value.frequency"
        :options="frequencies" clearable
        v-on="obListeners"
      >
      <q-checkbox slot="after" class="text-subtitle2"
        :label="$tc('label.advance')"
        :true-value="1" :false-value="0"
        v-model="value.custom"
        v-on="obListeners"/>
      </q-select>

      <q-input slot="hint" class="col-6 "
        type="number"
        :label="$tc('recurring.interval')" stack-label
        v-model="value.interval" min="1"
        v-on="obListeners"
        input-style="text-align:center"
        v-if="value.custom"/>

      <q-input slot="hint" class="col-6 "
        type="number"
        :label="$tc('recurring.count')" stack-label
        v-model="value.count" min="0"
        v-on="obListeners"
        input-style="text-align:center"
        v-if="value.custom"/>
    </div>
  </q-field>
</template>
<script>
export default {
  name: 'ux-recurring',
  data () {
    const setDefault = {
      frequency: null,
      custom: 0,
      interval: 1,
      count: null,
      optional: null
    }
    return {
      value: {...setDefault, ...this.$attrs.value},

      // value: this.$attrs.value,
      options: this.$attrs.options || [],
      frequencies: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']
    }
  },
  created() {
    this.$nextTick(() => {
      // run::
    })
  },
  watch:{
    '$attrs.value': 'setValue',
  },
  computed: {
    obListeners() {
      return Object.assign({},
        this.$listeners,
        {
          input: () => {
            this.$emit('input', this.value)
          }
        }
      )
    }
  },
  methods: {
    setValue(v) {
      this.value = v
    }
  }
}
</script>

<style lang="stylus">
// stylesheet
</style>
