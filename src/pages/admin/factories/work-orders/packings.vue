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
            :title="$tc('general.work_order_packings').toUpperCase()"
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

                <q-btn icon="search" color="blue-grey-10" @click="FILTERABLE.submit"/>
              </div>
            </div>
          </table-header>
        </template>

        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">

        </q-td>

        <q-td slot="body-cell-amount" slot-scope="rs" :props="rs" style="width:25%">
          <span class="on-left text-small text-grey">({{$app.number_format(100 * rs.row.summary_packing / (rs.row.summary_production || 0))}}%)</span>
          {{rs.row.summary_packing}} / {{rs.row.summary_production}}
        </q-td>

        <q-td slot="body-cell-code" slot-scope="rs" :props="rs">
          <div v-if="rs.row.item">
            <div class="">{{ rs.row.item.customer_code }}</div>
          </div>
        </q-td>

        <q-td slot="body-cell-part" slot-scope="rs" :props="rs" style="width:50%">
          <div v-if="rs.row.item">
            <div class="">{{ rs.row.item.part_name }}</div>
            <div class="text-caption">{{ rs.row.item.part_subname }}</div>
          </div>
        </q-td>

        <template v-slot:bottom-row>
          <q-tr class="text-weight-medium" v-if="TABLE.rowData.length > 0">
            <q-td key="prefix" colspan="3"></q-td>
            <q-td key="part_name" class="text-right text-uppercase">UNIT {{ $tc('label.summary') }} </q-td>
            <q-td key="summary_production" class="text-right">
              <span class="on-left text-small text-grey">
                ({{
                  $app.number_format(
                    100* TABLE.rowData.reduce((total, item) => total += (item.summary_packing), 0) / TABLE.rowData.reduce((total, item) => total += (item.summary_production), 0))
                }}%)
              </span>
              {{ $app.number_format(TABLE.rowData.reduce((total, item) => total += (item.summary_packing), 0)) }} /
              {{ $app.number_format(TABLE.rowData.reduce((total, item) => total += (item.summary_production), 0)) }}
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
      SHEET: {
        customers: { data: [], api: '/api/v1/incomes/customers?mode=all' },
        shifts: { data: [], api: '/api/v1/references/shifts?mode=all' }
      },
      FILTERABLE: {
        fill: {
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
          api: '/api/v1/factories/work-orders/packings',
          uri: '/admin/factories/work-orders/packings'
        },
        pagination: {
          rowsPerPage: 0
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'code', label: this.$tc('general.cust'), align: 'center' },
          { name: 'part', label: this.$tc('label.part'), align: 'left' },
          { name: 'status', label: '', align: 'center' },
          { name: 'amount', label: 'Amount', format: (v) => this.$app.number_format(v) }
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
    },
    getTextStatus (row) {
      if (row.document_total === row.document_closed) return ''
      return `[ ${row.document_closed} / ${row.document_total} ]`
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
