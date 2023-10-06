<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" inline class="table-index table-striped th-uppercase" color="primary"
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
            :title="$tc('general.work_order_items',2)"
            :TABLE.sync="TABLE"
            :menus="[]">

            <div class="column" >
              <div class="row q-col-gutter-xs q-pb-xs">
                <ux-select class="col-auto"
                  name="line_id"
                  v-model="FILTERABLE.fill.line_id.value" clearable
                  :label="$tc('items.preline')" stack-label
                  :placeholder="$tc('form.select', 1, {v:$tc('items.preline')})"
                  dense hide-bottom-space hide-dropdown-icon
                  standout="bg-blue-grey-5 text-white"
                  :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                  filter emit-value map-options
                  :options="LineOptions"
                  @input="FILTERABLE.submit"
                />

                <q-select class="col" style="min-width:150px"
                  label="Stockist"
                  v-model="FILTERABLE.fill.stockist_from.value" clearable
                  :options="stockist_options" map-options emit-value
                  dense hide-bottom-space hide-dropdown-icon
                  standout="bg-blue-grey-5 text-white"
                  :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                  @input="FILTERABLE.submit" />

                <ux-date class="col" style="min-width:150px"
                  stack-label :label="$tc('label.date')"
                  v-model="FILTERABLE.fill.date.value" type="date"  clearable
                  dense hide-bottom-space
                  standout="bg-blue-grey-5 text-white"
                  :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                  @input="FILTERABLE.submit"/>

                <q-select class="col" style="min-width:120px"
                  map-options emit-value
                  v-model="FILTERABLE.fill.shift_id.value" clearable
                  :options="ShiftOptions"
                  :label="$tc('label.shift')"
                  dense hide-bottom-space hide-dropdown-icon
                  standout="bg-blue-grey-5 text-white"
                  :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                  @input="FILTERABLE.submit"/>

              </div>
              <div class="row q-col-gutter-xs q-pb-xs">
                <div class="col-12 col-md-6">
                  <div class="row q-col-gutter-xs">
                    <ux-select class="col-12 col-sm-4"
                      v-model="FILTERABLE.fill.customer_id.value" clearable
                      :label="$tc('general.customer')" stack-label
                      :placeholder="$tc('form.select', 1, {v:$tc('general.customer')})"
                      dense hide-bottom-space hide-dropdown-icon
                      standout="bg-blue-grey-5 text-white"
                      :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                      :options="CustomerOptions"
                      filter emit-value map-options
                      @input="[
                        FILTERABLE.fill.item_id.value=null,
                        SHEET.load('items', `customer_id=${FILTERABLE.fill.customer_id.value}`),
                        FILTERABLE.submit()
                      ]"/>

                    <ux-select-filter class="col-12 col-sm-8"
                      v-model="FILTERABLE.fill.item_id.value" clearable
                      :label="$tc('general.item')" stack-label
                      :placeholder="$tc('form.select', 1, {v:$tc('general.item')})"
                      dense hide-bottom-space hide-dropdown-icon
                      standout="bg-blue-grey-5 text-white"
                      :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                      :options="ItemOptions"
                      @input="FILTERABLE.submit"
                      :loading="SHEET['items'].loading"/>
                  </div>
                </div>
                <q-select class="col-12 col-md-6" autocomplete="off"
                  multiple use-chips use-input new-value-mode="add"
                  dense hide-dropdown-icon
                  v-model="FILTERABLE.search" emit-value
                  :placeholder="`${$tc('form.search',2)}...`"
                  standout="bg-blue-grey-5 text-white"
                  :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                  @input="FILTERABLE.submit">

                  <template slot="append">
                    <q-btn flat dense icon="search" color="blue-grey-10" @click="FILTERABLE.submit"/>
                  </template>
                </q-select>
              </div>

            </div>
          </table-header>
        </template>

        <!-- slot name syntax: body-cell-<column_name> -->
        <q-td slot="body-cell-prefix" :work-order_item-id="rs.row.id" slot-scope="rs" :props="rs" style="width:35px">

        </q-td>

        <q-td slot="body-cell-date" slot-scope="rs" :props="rs">
          <span v-if="rs.row.work_order"> {{ $app.moment(rs.row.work_order.date).format('DD/MM/YY') }}</span>
        </q-td>

        <q-td slot="body-cell-number" slot-scope="rs" :props="rs" style="width:35px">
          <span v-if="!Boolean(rs.row.work_order)" v-text="'-'" />
          <q-btn v-else dense unelevated type="a" :to="`/admin/factories/work-orders/${rs.row.work_order.id}`">
            <div :class="{'text-strike': Boolean(rs.row.work_order.revise_id)}">
              {{ rs.row.work_order.fullnumber || rs.row.work_order.number }}
            </div>
          </q-btn>
        </q-td>

        <q-td slot="body-cell-item" slot-scope="rs" :props="rs" style="width:35px">
          <div class="column" v-if="rs.row.item">
            <span>{{rs.row.item.part_name}}</span>
            <span class="text-weight-light">[{{rs.row.item.customer_code}}] <font>{{rs.row.item.part_subname || '--'}}</font></span>
          </div>
        </q-td>

        <q-td slot="body-cell-stockist" slot-scope="rs" :props="rs" style="width:35px">
          <span v-if="rs.row.work_order">
            {{Object.assign({}, stockist_options.find(x => x.value === rs.row.work_order.stockist_from)).label || '-'}}
          </span>
        </q-td>

        <template v-slot:bottom-row>
          <q-tr class="bg-blue-grey-2 text-weight-medium">
            <q-td key="prefix" colspan="2"></q-td>
            <q-td key="part_name" class="text-right">{{ $tc('label.grandtotal') }}</q-td>
            <q-td key="quantity" class="text-right">
              {{TABLE.rowData.reduce((total, item) => total += (item.quantity), 0) }}
            </q-td>
            <q-td key="unit">{{ $tc('label.unit') }}</q-td>
            <q-td colspan="100%">
            </q-td>
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
        lines: { data: [], api: '/api/v1/references/lines?mode=all' },
        shifts: { data: [], api: '/api/v1/references/shifts?mode=all' },
        customers: { data: [], api: '/api/v1/incomes/customers?mode=all' },
        items: { data: [], api: '/api/v1/common/items?mode=all', autoload: false }
      },
      FILTERABLE: {
        fill: {
          line_id: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          },
          status: {
            value: null,
            type: 'string',
            transform: (value) => { return null }
          },
          stockist_from: {
            value: null,
            type: 'string',
            transform: (value) => { return null }
          },
          date: {
            value: null,
            type: 'date',
            transform: (value) => { return null }
          },
          shift_id: {
            value: null,
            type: 'integer',
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
          api: '/api/v1/factories/work-orders/items',
          uri: '/admin/factories/work-orders/items',
          params: ['--with=work_order']
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'date', label: this.$tc('label.date'), align: 'center', sortable: true },
          { name: 'number', label: this.$tc('label.number'), align: 'left', sortable: true },
          { name: 'item', label: this.$tc('items.part_name'), align: 'left' },
          { name: 'quantity', label: this.$tc('label.quantity'), field: (row) => row.quantity, align: 'right', sortable: true },
          { name: 'unit', label: this.$tc('label.unit'), field: (row) => row.unit ? row.unit.code : '', align: 'left' },
          { name: 'shift_id', label: 'Shift', field: (row) => row.work_order && row.work_order.shift ? row.work_order.shift.name : '', align: 'center', sortable: true },
          { name: 'stockist', xlabel: (row) => row.work_order.stockist_from, align: 'left' }
        ]
      }
    }
  },
  created () {
    this.INDEX.load()
  },
  computed: {
    ShiftOptions () {
      return (this.SHEET.shifts.data.map(line => ({ label: line.name, value: line.id })) || [])
    },
    LineOptions () {
      return (this.SHEET.lines.data.map(item => ({ label: item.name, value: item.id })) || [])
    },
    CustomerOptions () {
      return (this.SHEET.customers.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemOptions () {
      return (this.SHEET.items.data.map(item => ({
        label: `${item.part_name}`,
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
