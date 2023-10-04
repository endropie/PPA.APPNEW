<template>
    <q-btn-dropdown :label="Label">
      <q-list>
        <q-item v-for="(item, index) in options" clickable v-close-popup @click="setItemValue(index)" :key="index">
          <q-item-section>
            <q-item-label>{{ getItemLabel(index) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
</template>

<script>

export default {
  name : 'ux-badge-status',
    props: {
      label: String,
      options: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
          value: this.$attrs.value
      }
    },
    watch: {
      '$attrs.value': 'setValue'
    },
    computed:{
      Label() {
        if(this.value) {
          if(this.options.length) {
            const f = this.options.indexOf((x,index) => {
              if(!this.emitValue)  return this.value === x.value
              if(this.optionValue)  return this.value === x[optionValue]
              return this.value === x
            })
            return this.getItemLabel(f)
          }
          return 'undifined'
        }
        if(this.label) return this.label
        return null
      },
    },
    methods: {
      setValue(v) {
        this.value = v
      },
      setItemValue(index) {
        let val
        if(!this.emitValue) val = this.options[index]
        if(this.optionValue) val = this.options[index][optionValue]
        val = this.options[index].value

        this.$emit('value', val)
      },
      getItemLabel(index) {
        if(!index) return null
        if(!this.emitValue) return this.options[index]
        if(this.optionLabel) return this.options[index][optionLabel]
        if(this.options[index].label) return this.options[index].label
        return this.options[index].value

      }
    }
}
</script>
