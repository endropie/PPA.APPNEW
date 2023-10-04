<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" inline class="table-index table-striped th-uppercase" color="primary" :dark="LAYOUT.isDark"
        :data="TABLE.rowData"
        :columns="TABLE.columns"
        selection="none"
        :selected.sync="TABLE.selected"
        row-key="id"
        :pagination.sync="TABLE.pagination"
        @request="TABLE.compute"
        :loading="TABLE.loading">

        <!-- Table Header -->
        <template v-slot:top>
          <table-header hide-search

            :title="String($tc('general.incoming_good_items', 1)).toUpperCase()"
            :TABLE.sync="TABLE"
            :menus="[]">

            <div class="column" >
              <div class="row q-col-gutter-xs q-pb-xs">
                <ux-date class="col" style="min-width:150px"
                  stack-label :label="$tc('label.date')"
                  v-model="FILTERABLE.fill.date.value" type="date"  clearable
                  dense hide-bottom-space
                  standout="bg-blue-grey-5 text-white"
                  :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                  :dark="LAYOUT.isDark"
                  @input="FILTERABLE.submit"/>
                <ux-select class="col"
                  v-model="FILTERABLE.fill.customer_id.value" clearable
                  :label="$tc('general.customer')" stack-label
                  :placeholder="$tc('form.select', 1, {v:$tc('general.customer')})"
                  dense hide-bottom-space hide-dropdown-icon
                  standout="bg-blue-grey-5 text-white"
                  :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                  :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                  :options="CustomerOptions"
                  filter emit-value map-options
                  @input="[
                    FILTERABLE.fill.item_id.value=null,
                    SHEET.load('items', `customer_id=${FILTERABLE.fill.customer_id.value}`),
                    FILTERABLE.submit()
                  ]"/>

                <ux-select-filter class="col"
                  v-model="FILTERABLE.fill.item_id.value" clearable
                  :label="$tc('general.item')" stack-label
                  :placeholder="$tc('form.select', 1, {v:$tc('general.item')})"
                  dense hide-bottom-space hide-dropdown-icon
                  standout="bg-blue-grey-5 text-white"
                  :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                  :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                  :options="ItemOptions"
                  @input="FILTERABLE.submit"
                  :loading="SHEET['items'].loading"/>

                <q-select class="col" autocomplete="off"
                  multiple use-chips use-input new-value-mode="add"
                  dense hide-dropdown-icon
                  v-model="FILTERABLE.search" emit-value
                  :placeholder="`${$tc('form.search',2)}...`"
                  standout="bg-blue-grey-5 text-white"
                  :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                  :dark="LAYOUT.isDark"
                  @input="FILTERABLE.submit">

                  <template slot="append">
                    <q-btn flat dense icon="search" color="blue-grey-10" @click="FILTERABLE.submit"/>
                  </template>
                </q-select>
              </div>

            </div>
          </table-header>
        </template>

        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">
          <!-- {{rs}} -->
        </q-td>

        <q-td slot="body-cell-item" slot-scope="rs" :props="rs" style="width:35px">
          <div class="column" v-if="rs.row.item">
            <span>{{rs.row.item.part_name}}</span>
            <span class="text-weight-light">[{{rs.row.item.customer_code}}] <font>{{rs.row.item.part_subname}}</font></span>
          </div>
        </q-td>

        <template v-slot:bottom-row>
          <q-tr class="bg-blue-grey-2 text-weight-medium">
            <q-td key="prefix" colspan="3"></q-td>
            <q-td key="part_name" class="text-right">{{ $tc('label.grandtotal') }}</q-td>
            <q-td key="quantity" class="text-right">
              {{TABLE.rowData.reduce((total, item) => total += (item.quantity), 0) }}
            </q-td>
            <q-td key="unit">{{ $tc('label.unit') }}</q-td>
          </q-tr>
        </template>
      </q-table>
    </q-pull-to-refresh>

  </q-page>
</template>

<script>
import MixIndex from 'src/mixins/mix-index.vue'

export default {
  mixins: [MixIndex],
  data () {
    return {
      stockist_options: [
        { value: 'FM', label: 'FRESH' },
        { value: 'NC', label: 'NC-REPAIR' },
        { value: 'NCR', label: 'NCR-REPAIR' }
      ],
      SHEET: {
        customers: { data: [], api: '/api/v1/incomes/customers?mode=all' },
        items: { data: [], api: '/api/v1/common/items?mode=all', autoload: false }
      },
      FILTERABLE: {
        fill: {
          status: {
            value: null,
            type: 'string',
            transform: (value) => { return null }
          },
          date: {
            value: null,
            type: 'date',
            transform: (value) => { return null }
          },
          customer_id: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          },
          item_id: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          }
        }
      },
      TABLE: {
        mode: 'index',
        resource: {
          api: '/api/v1/warehouses/incoming-goods/items',
          uri: '/admin/deliveries/incoming-goods/items'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'date', label: this.$tc('label.date'), field: (rs) => rs.incoming_good ? rs.incoming_good.date : '-', format: (v) => this.$app.moment(v).format('DD/MM/YYYY'), align: 'center', sortable: true },
          { name: 'number', label: this.$tc('label.number'), field: (rs) => rs.incoming_good ? rs.incoming_good.fullnumber : '-', align: 'left', sortable: true },
          { name: 'item', label: this.$tc('items.part_name'), field: 'part_name', align: 'left' },
          { name: 'quantity', label: this.$tc('label.quantity'), field: (rs) => rs.quantity, align: 'right', sortable: true },
          { name: 'unit', label: this.$tc('label.unit'), field: (rs) => rs.unit.code, align: 'left' }
        ]
      }
    }
  },
  created () {
    this.INDEX.load()
  },
  computed: {
    CustomerOptions () {
      return (this.SHEET.customers.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemOptions () {
      return (this.SHEET.items.data.map(item => ({
        label: `${item.part_name} - ${item.part_subname}`,
        sublabel: `[${item.customer_code}] ${item.part_subname || '--'}`,
        value: item.id
      })) || [])
    }
  },
  methods: {
    isCanUpdate (row) {
      if (row.status !== 'OPEN') return false
      if (row.is_relationship) return false
      return this.$app.can('work-orders-update')
    },
    isCanDelete (row) {
      if (row.status !== 'OPEN') return false
      if (row.is_relationship) return false
      return this.$app.can('work-orders-delete')
    }
  }
}
</script>

<style lang="stylus">
.status-chip, .status-chip-badge
  height: 20px
.status-chip
  margin :2px
.status-chip-badge
  position: relative;
  right: -6px;
  border-bottom-left-radius: 0
  border-top-left-radius: 0
