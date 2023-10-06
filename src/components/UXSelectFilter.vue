<template>
  <q-select
    ref="QSelect"
    class="ux-selet-filter"
    v-model="value"
    v-bind="$attrs"
    v-on="$listeners"
    @filter="filterFunc"
    :options="opt"
    :hide-selected="hideSelected"
    :use-input="useInput"
    :fill-input="fillInput"
    :emit-value="emitValue"
    :map-options="mapOptions"
    autocomplete="off">
    <!-- :options="this.selfFilter ? this.options : this.$attrs.options" -->
    <!-- @filter="(v, f, c) => { this.selfFilter ? filterFn(v, f, c) : $emit('filter', v, f, c) }" -->
    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents"
      >

        <slot name="option-prepend" :option="scope.opt">
          <q-item-section side  v-if="scope.opt.icon">
            <q-item-section avatar v-if="scope.opt.icon">
              <q-icon :name="scope.opt.icon" />
            </q-item-section>
          </q-item-section>
        </slot>
        <q-item-section>
          <slot name="option-item" :option="scope.opt">
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <q-item-label caption>{{ scope.opt.sublabel }}</q-item-label>
          </slot>
        </q-item-section>
        <slot name="option-append" :option="scope.opt">
          <q-item-section side v-if="scope.opt.stamp">
            <q-badge :label="scope.opt.stamp" />
          </q-item-section>
          <q-item-section side v-if="scope.opt.disable">
            <q-icon name="block" color="red"/>
          </q-item-section>
        </slot>
      </q-item>
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">No results</q-item-section>
      </q-item>
    </template>

    <template v-slot:selected-item="scope">
      <slot name="selected-item" :scope="scope" />
    </template>
    <!-- <template v-slot:selected-item="scope">
      <span >
        <slot v-if="(scope.opt.label)" name="selected-item" :scope="scope" />
        <template v-else>{{noSelectedLabel}}</template>
      </span>
    </template> -->

    <template v-slot:before><slot name="before" /></template>
    <template v-slot:prepend><slot name="prepend" /></template>
    <template v-slot:append><slot name="append" /></template>
    <template v-slot:after><slot name="after" /></template>

    <template v-slot:hint><slot name="hint" /></template>
    <template v-slot:counter><slot name="counter" /></template>

    <template v-slot:default>
      <slot></slot>
    </template>

  </q-select>

</template>
<script>

export default {
  name: 'ux-select-filter',
  inheritAttrs: false,
  props: {
    initFilter: Function,
    injectFilter: Function,
    selfFilter: {type: Boolean, default: true },
    useInput: {type: Boolean, default: true },
    fillInput: {type: Boolean, default: true },
    emitValue: {type: Boolean, default: true },
    mapOptions: {type: Boolean, default: true },
    hideSelected: {type: Boolean, default: false },
  },
  data () {
    return {
      value: this.$attrs.value,
      options: this.$attrs.options || []
    }
  },
  watch:{
    '$attrs.value': 'setValue',
    '$attrs.options': 'setOptions',
  },
  methods: {
    setValue(v) {
      this.value = v
    },
    setOptions(v) {
      this.options = v
    },
    // use this default filter function
    filterFn (val, update, abort) {
      if (!this.selfFilter) {
        this.$emit('filter', v, u, a)
        return
      }

      if(this.initFilter) {
        this.initFilter(val, update, abort)
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.$attrs.options.filter(v => {

          if(typeof this.injectFilter === 'function' && this.selfFilter ) {
            const injector = this.injectFilter(v, this.options)
            if (typeof injector === 'boolean') return injector
          }

          if(!v.hasOwnProperty('sublabel')) v.sublabel = ''

          let needles = String(needle).split(' ')
          for (let i = 0; i < needles.length; i++) {
            if (needles[i] && !String(v.label + v.sublabel).toLowerCase().includes(needles[i])) return false
          }

          return true
          // return String(v.label).toLowerCase().includes(needle) || String(v.sublabel).toLowerCase().includes(needle)
        })
      })
    },
    filterFunc (v, u, a) {
      this.selfFilter ? this.filterFn(v, u) : this.$emit('filter', v, u, a)
    }
  },
  computed: {
    QSelect() {
      return this.$refs.QSelect
    },
    opt () {
      return (!this.selfFilter) ? this.$attrs.options : this.options
    },
    inner() {
      let data = Object.assign({})
      if (!this.$refs.hasOwnProperty('QSelect')) return null
      data.innerValue = this.$refs.QSelect.innerValue
      return data
    }
  }
}
</script>

<style lang="stylus">
.q-field__before:empty,
.q-field__prepend:empty
  display none

.q-field__bottom
  // display none
  min-height: 0px;
  padding-top: 0;

  .q-field__messages:not(:empty),
  .q-field__counter:not(:empty)
    min-height: 12px
    margin-top: 4px


</style>
