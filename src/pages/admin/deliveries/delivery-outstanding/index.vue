<template>
  <q-page padding class="page-index">
    <q-pull-to-refresh @refresh="TABLE.refresh">
      <q-table ref="table"
        class="table-index table-striped th-uppercase"
        table-header-class="top-header"
        :dense="$q.screen.lt.md"
        :dark="LAYOUT.isDark"
        :title="TABLE.getTitle()"
        separator="vertical"
        :data="TABLE.rowData"
        :columns="TABLE.columns"
        :visible-columns="COLUMNS"
        :filter="TABLE.filter"
        selection="none"
        :selected.sync="TABLE.selected"
        row-key="code"
        :rows-per-page-options="[10,25,50,100,200,500,0]"
        :pagination.sync="TABLE.pagination"
        @request="TABLE.compute"
        :loading="TABLE.loading"
      >

        <template v-slot:top>
          <table-header
            title="DELIVERY OUTSTANDING"
            :TABLE.sync="TABLE"
          >

            <div class="row q-col-gutter-xs">
              <ux-date
                v-model="FILTERABLE.fill.delivery_date.value"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                @input="FILTERABLE.submit"
              />
              <ux-select
                filter map-options emit-value
                class="col-12 col-sm-3"
                v-model="FILTERABLE.fill.customer_id.value" clearable
                :label="$tc('general.customer')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :options="CustomerOptions"
                @input="FILTERABLE.submit"
              />

              <q-select class="col" autocomplete="off"
                multiple use-chips use-input new-value-mode="add"
                dense hide-dropdown-icon
                v-model="FILTERABLE.search" emit-value
                :placeholder="`${$tc('form.search',2)}...`"
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                @input="FILTERABLE.submit" >

                <template slot="append">
                  <q-btn flat dense icon="search" dark-percentage color="fadded" @click="FILTERABLE.submit"/>
                </template>
              </q-select>
            </div>

          </table-header>
        </template>

        <q-tr slot="top-row" slot-scope="rs" :props="rs" class="top-row">
          <q-th key="prefix"></q-th>
          <q-th key="part" colspan="3"></q-th>
          <q-th key="fg" colspan="1"></q-th>
          <q-th key="task" colspan="2">Task</q-th>
          <q-th key="verify" colspan="1"></q-th>
          <q-th key="load" colspan="2">Loading</q-th>
          <q-th key="balance" colspan="2">Balance</q-th>
        </q-tr>

        <q-td slot="body-cell-amount_delivery_task_reguler" slot-scope="rs" :props="rs">
          {{getAmountDelivery("TASK.REG", rs.row.amount_delivery)}}
        </q-td>
        <q-td slot="body-cell-amount_delivery_task_return" slot-scope="rs" :props="rs">
          {{getAmountDelivery("TASK.RET", rs.row.amount_delivery)}}
        </q-td>
        <q-td slot="body-cell-amount_delivery_load_reguler" slot-scope="rs" :props="rs">
          {{getAmountDelivery("LOAD.REG", rs.row.amount_delivery)}}
        </q-td>
        <q-td slot="body-cell-amount_delivery_load_return" slot-scope="rs" :props="rs">
          {{getAmountDelivery("LOAD.RET", rs.row.amount_delivery)}}
        </q-td>
        <q-td slot="body-cell-amount_delivery_verify" slot-scope="rs" :props="rs">
          {{getAmountDelivery("VERIFY", rs.row.amount_delivery)}}
        </q-td>
        <q-td slot="body-cell-amount_delivery_fg" slot-scope="rs" :props="rs">
          {{getAmountDelivery("FG", rs.row.amount_delivery)}}
        </q-td>
        <q-td slot="body-cell-amount_delivery_balance_reguler" slot-scope="rs" :props="rs">
          <span v-if="rs.row.amount_delivery">
            {{(rs.row.amount_delivery['TASK.REG'] || 0) - (rs.row.amount_delivery['LOAD.REG'] || 0)}}
          </span>
        </q-td>
        <q-td slot="body-cell-amount_delivery_balance_return" slot-scope="rs" :props="rs">
          <span v-if="rs.row.amount_delivery">
            {{(rs.row.amount_delivery['TASK.RET'] || 0) - (rs.row.amount_delivery['LOAD.RET'] || 0)}}
          </span>
        </q-td>
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
        customers: { data: [], api: '/api/v1/incomes/customers?mode=all' }
      },
      FILTERABLE: {
        fill: {
          // date: {
          //   value: this.$app.moment().format('YYY-MM-DD'),
          //   type: 'string',
          //   transform: (value) => { return '' }
          // },
          customer_id: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          },
          delivery_date: {
            value: this.$app.moment().format('YYYY-MM-DD'),
            type: 'string',
            transform: (value) => { return '' }
          }
        }
      },
      TABLE: {
        mode: 'index',
        resource: {
          api: '/api/v1/common/items',
          uri: '/admin/deliveries/delivery-outstanding'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left', required: true },

          { name: 'customer_code', label: this.$tc('general.cust') + '.', field: 'customer_code', align: 'center', sortable: true },
          { name: 'part_name', label: this.$tc('items.part_name'), field: 'part_name', align: 'left', sortable: true },
          { name: 'part_subname', label: this.$app.setting('item.subname_label'), field: 'part_subname', align: 'left', sortable: true },
          { name: 'amount_delivery_fg', label: `F G`, field: 'amount_delivery', align: 'center' },
          { name: 'amount_delivery_task_reguler', label: `REGULER`, field: 'amount_delivery', align: 'center' },
          { name: 'amount_delivery_task_return', label: `RETURN`, field: 'amount_delivery', align: 'center' },
          { name: 'amount_delivery_verify', label: this.$tc('general.delivery_verify', 2), field: 'amount_delivery', align: 'center' },
          { name: 'amount_delivery_load_reguler', label: `REGULER`, field: 'amount_delivery', align: 'center' },
          { name: 'amount_delivery_load_return', label: `RETURN`, field: 'amount_delivery', align: 'center' },
          { name: 'amount_delivery_balance_reguler', label: 'REGULER', align: 'center' },
          { name: 'amount_delivery_balance_return', label: 'RETURN', align: 'center' }
        ],
        hideColumns: ['code']
      }
    }
  },
  created () {
    if (!this.$app.can('items-price')) {
      this.TABLE.visibleColumns = this.TABLE.columns.filter(x => {
        return ['price', 'price_dm', 'price_brl'].indexOf(x.name) < 0
      }).map(x => {
        return x.name
      })
    }

    this.INDEX.load()
  },
  computed: {
    isCanPush () {
      return this.$app.can('items-push')
    },
    isCanUpdate () {
      return this.$app.can('items-update')
    },
    isCanDelete () {
      return this.$app.can('items-delete')
    },
    CustomerOptions () {
      return (this.SHEET.customers.data.map(item => ({ label: `${item.code} - ${item.name}`, value: item.id, rowdata: item })) || [])
    },
    MAPINGKEY () {
      let variables = {
        'itemstocks': {}
      }
      // this.SHEET['itemstocks'].data.map(value => { variables['itemstocks'][value.id] = value.totals })

      return variables
    }
  },
  methods: {
    getAmountDelivery (code, data) {
      if (!data) return '-'
      if (!data.hasOwnProperty(code)) return '-'
      return Math.round(data[code])
    },
    push (row) {
      let url = `${this.TABLE.resource.api}/${row.id}/accurate/push`
      console.warn('pusher', url)
      this.$q.loading.show()
      this.$axios.post(url)
        .then((response) => {
          let msg = response.data.d[0] || ''
          return (response.data.s)
            ? this.$app.notify.success('ACCURATE PUSH', msg)
            : this.$app.notify.warning('ACCURATE PUSH', msg)
        }).catch((error) => {
          this.$app.response.error(error.response || error)
        }).finally(() => {
          this.$q.loading.hide()
        })
    }
  }
}
</script>
<style lang="stylus">
.table-index
  tr.top-row, tr.top-header
    height unset !important

tr.top-row th
  padding: 2px 5px
  border-bottom-width: thin
</style>
