<template>
<!-- slot:
* list => template for list
* - list-item
* - list-append (not yet)
* - list-prepend (not yet)
* - list-item-[name]
* tabel => template for table
* - body-cell
* - body-cell-[name]

* field-[name] => for body-cell-[name] or list-item-[name]
-->
  <div class="form-detail"
    v-bind="$attrs"
    v-on="$listeners">
    <slot>
      <slot name="list" v-if="list">
        <q-list bordered dense :dark="dark" :separator="!!('cell' && 'horizontal')">
          <q-item-label v-if="title" header>{{title}}</q-item-label>
          <q-item-label v-if="subtitle" caption :lines="subtitleLines">{{subtitle}}</q-item-label>
          <q-separator inset :dark="dark"/>
          <q-separator inset :dark="dark" style="margin-top:1px;margin-bottom:10px"/>
          <q-item v-for="(item, index) in data" :key="index" >
            <!-- prepend -->
            <slot name="list-append"  />
            <q-item-section>
              <slot name="list-item" v-bind="item">
                <!-- col-start -->
                <template v-for="(column, key) in columns">
                  <div :class="{ rowClass}" class="row q-col-gutter-xs q-pa-xs" :key="key">
                    <div class="col-12 col-sm-3">
                      {{column.label || column.name || ''}}
                    </div>
                    <div class="col-12 col-sm-9">
                      <slot :name="`field-${column.name}`" :row="{__index:index, ...item}" >
                        <div :field="column.name"></div>
                      </slot>
                    </div>
                    <!-- col-body -->
                  </div>
                </template>
                <!-- col-end -->
              </slot>
            </q-item-section>
            <!-- append -->
            <slot name="append"  />

            <div class="absolute-top-right q-pr-sm">
              <q-btn size="xs" round dense icon="clear" color="red-5" @click="removeRow(index)"/>
            </div>
          </q-item>
          <q-item class="text-caption text-light" v-if="data.length === 0">
            <div class="full-width q-pa-xs bordered text-center">{{noDataLabel}}</div>
          </q-item>
          <!-- <q-separator inset spaced :dark="dark"/> -->
          <q-item>
            <q-item-section>
              <slot name="action-new">
                <q-btn flat outline dense color="green-5" :label="labelNew" @click="addRow()" />
              </slot>
            </q-item-section>
          </q-item>
        </q-list>
      </slot>
      <slot name="table" v-else>
        <q-markup-table bordered>
          <thead>
            <tr>
              <th> </th>
              <th v-for="(column, key) in columns" :key="key">
                {{ column.label || column.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cell, index) in data" :key="index">
              <td align="center">
                <q-btn dense flat icon="clear" color="negative" @click="removeRow(index)"/>
              </td>
              <td v-for="(column, key) in columns" :key="key">
                <slot :name="`body-cell-${column.name}`" :row="{__index:index, ...cell}" :index="index">
                  <slot :name="`field-${column.name}`" :row="{__index:index, ...cell}" :index="index">
                    <div ></div>
                  </slot>
                </slot>
              </td>
            </tr>
            <tr>
              <td colspan="100%">
                <div class="row justify-center">
                  <q-btn flat outline dense color="green-5" :label="labelNew" @click="addRow()" />
                </div>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </slot>
    </slot>
  </div>
</template>

<script>

export default {
  name: 'form-detail',
  inheritAttrs: false,
  props:{
      list: Boolean,
      rows: {
        type: Array,
        required: true
      },
      columns: {
        type: Array,
        required: true
      },
      minLength:{
        type: [Number, String],
        default: 0
      },
      dark: Boolean,
      rowClass: {
        type: String,
        default: 'row q-col-gutter-xs'
      },
      rowSpace: String,
      separator: {
        type: String,
        default: 'horizontal'
      },
      title: {
          type: String,
          default: null
      },
      subtitle: {
          type: String,
          default: null
      },
      subtitleLines: {
          type: Number,
          default: 1
      },
      labelNew: {
        type: String,
        default:'Submit'
      },
      noDataLabel: {
        type: String,
        default: 'No data details',
      }
  },
  computed: {
    StrRowClass() {
      let result = []
      const size = this.rowSpace == !!('xs' && 'sm' && 'md' && 'lg' && 'xl') ? this.rowSpace : 'xs'
      result.push(this.rowClass)
      result.push(`q-gutter-${size} q-col-gutter-${size}`)

      return result.join(' ')
    }
  },
  mounted() {
    this.data = rows
  },
  methods: {
    addRow() {
      const newEntri = {}
      for (const col in this.columns) {
        if (this.columns.hasOwnProperty(col)) {
          newEntri[col] = this.columns[col].default || null
        }
      }
      this.data.push(newEntri)
      this.$emit('added')
    },
    removeRow(index) {
      const minimal = Number(this.minLength) > 0 ? Number(this.minLength) : 0
      this.data.splice(index, 1)
      if(this.data < minimal) this.addRow()
      this.$emit('removed')
    }
  }
}
</script>

<style lang="stylus">
.form-detail
  // min-height 40px
</style>


