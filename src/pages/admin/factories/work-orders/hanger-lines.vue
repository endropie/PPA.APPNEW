<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" inline class="table-index table-striped th-uppercase" color="primary"
        :data="TABLE.rowData"
        :columns="TABLE.columns"
        selection="none"
        :selected.sync="TABLE.selected"
        row-key="id"
        @request="TABLE.compute"
        :loading="TABLE.loading"
        :rows-per-page-options="[0]"
        hide-pagination
      >
        <!-- :pagination.sync="TABLE.pagination" -->

        <!-- Table Header -->
        <template v-slot:top>
          <table-header hide-search
            :title="$tc('general.work_order_hanger_lines',2).toUpperCase()"
            :TABLE.sync="TABLE"
            :menus="[]">

            <div class="column" >
              <div class="row q-gutter-xs q-pb-xs">
                <ux-date class="" style="min-width:150px"
                  stack-label :label="$tc('label.date')"
                  v-model="FILTERABLE.fill.date.value" type="date"
                  dense hide-bottom-space
                  standout="bg-blue-grey-5 text-white"
                />

                <q-select class="" style="min-width:150px"
                  map-options emit-value
                  v-model="FILTERABLE.fill.shift_id.value" clearable
                  :options="ShiftOptions"
                  :label="$tc('label.shift')"
                  dense hide-bottom-space hide-dropdown-icon
                  standout="bg-blue-grey-5 text-white"
                />

                <q-select class="" style="min-width:150px"
                  map-options emit-value
                  v-model="FILTERABLE.fill.line_id.value" clearable
                  :options="LineOptions"
                  :label="$tc('general.line')"
                  dense hide-bottom-space hide-dropdown-icon
                  standout="bg-blue-grey-5 text-white"
                />

                <!-- <q-select style="min-width:100px"
                  label="Stockist"
                  v-model="FILTERABLE.fill.stockist_from.value" clearable
                  :options="stockist_options" map-options emit-value
                  dense hide-bottom-space hide-dropdown-icon
                  standout="bg-blue-grey-5 text-white"
                /> -->

                <q-btn icon="search" color="blue-grey-10" @click="FILTERABLE.submit"/>
              </div>
            </div>
          </table-header>
        </template>

        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">

        </q-td>

        <q-td slot="body-cell-production" slot-scope="rs" :props="rs" style="width:35px">
          <span class="on-left text-small text-grey">({{$app.number_format(100 * rs.row.hanger_production / (rs.row.hanger_amount || 0))}}%)</span>
          {{rs.value}}
        </q-td>

        <q-td slot="body-cell-packing" slot-scope="rs" :props="rs" style="width:35px">
          <span class="on-left text-small text-grey">({{$app.number_format(100 * rs.row.hanger_packing / (rs.row.hanger_production || 0))}}%)</span>
          {{rs.value}}
        </q-td>

        <q-td slot="body-cell-date" slot-scope="rs" :props="rs">
          <span v-if="rs.row.date"> {{ $app.moment(rs.row.date).format('DD/MM/YY') }}</span>
        </q-td>

        <q-td slot="body-cell-amount" slot-scope="rs" :props="rs">
          {{ rs.value }}
          <span class="text-grey">
            / {{ rs.row.line.load_capacity || '-' }}
          </span>
        </q-td>

        <q-td slot="body-cell-line_id" slot-scope="rs" :props="rs" style="width:35px">
          <span v-if="rs">
            {{rs.value}}
          </span>
        </q-td>

        <template v-slot:bottom-row>
          <q-tr class="text-weight-medium" v-if="TABLE.rowData.length > 0">
            <q-td key="prefix" colspan="3"></q-td>
            <q-td key="part_name" class="text-right text-uppercase">HANGER {{ $tc('label.summary') }} </q-td>
            <q-td key="hanger_production" class="text-right">
              <span class="on-left text-small text-grey">
                ({{$app.number_format(100 * TABLE.rowData.reduce((total, item) => total += (item.hanger_production), 0) / TABLE.rowData.reduce((total, item) => total += (item.hanger_amount), 0))}}%)
              </span>
              {{ $app.number_format(TABLE.rowData.reduce((total, item) => total += (item.hanger_production), 0)) }}
            </q-td>
            <q-td key="hanger_packing" class="text-right">
              <span class="on-left text-small text-grey">
                ({{$app.number_format(100 * TABLE.rowData.reduce((total, item) => total += (item.hanger_packing), 0) / TABLE.rowData.reduce((total, item) => total += (item.hanger_production), 0))}}%)
              </span>
              {{ $app.number_format(TABLE.rowData.reduce((total, item) => total += (item.hanger_packing), 0)) }}
            </q-td>
            <q-td key="hanger_amount" class="text-right">{{
              $app.number_format(TABLE.rowData.reduce((total, item) => total += (item.hanger_amount), 0)) }}
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
        shifts: { data: [], api: '/api/v1/references/shifts?mode=all' }
      },
      FILTERABLE: {
        fill: {
          line_id: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          },
          date: {
            value: null, // this.$app.moment().format('YYYY-MM-DD'),
            type: 'date',
            transform: (value) => { return null }
          },
          shift_id: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          }
        }
      },
      TABLE: {
        mode: 'index',
        resource: {
          api: '/api/v1/factories/work-orders/hanger-lines',
          uri: '/admin/factories/work-orders/hanger-lines'
        },
        pagination: {
          rowsPerPage: 0
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'date', label: this.$tc('label.date'), field: (rs) => rs.date, align: 'center', sortable: true },
          { name: 'line_id', label: 'Line Production', field: (rs) => rs.line.name, align: 'left', sortable: true },
          { name: 'shift_id', label: 'Shift', field: (rs) => rs.shift.name, align: 'center', sortable: true },
          // { name: 'stockist', label: 'stockist', field: (rs) => rs.stockist_from, align: 'left' },
          { name: 'production', label: 'Production', field: (rs) => rs.hanger_production, format: (v) => this.$app.number_format(v) },
          { name: 'packing', label: 'Packing', field: (rs) => rs.hanger_packing, format: (v) => this.$app.number_format(v) },
          { name: 'amount', label: 'Amount', field: (rs) => rs.hanger_amount, format: (v) => this.$app.number_format(v) }
        ]
      }
    }
  },
  created () {
    // this.INDEX.load()
    this.SHEET.assign()
    this.SHEET.request()
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
