<template>
  <q-page padding class="page-index">
    <q-pull-to-refresh @refresh="TABLE.refresh">
      <q-table ref="table"
        class="table-index table-striped table-sticky-column th-uppercase"
        :dense="$q.screen.lt.md"
        :title="TABLE.getTitle()"
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
        :loading="TABLE.loading">

        <template v-slot:top>
          <table-header
            :title="TABLE.getTitle()"
            :TABLE.sync="TABLE"
            :menus="[
              { shortcut: true,
                tooltip: true,
                label: $tc('form.add_new'),
                detail: $tc('messages.form_new'),
                icon: 'add',
                hidden: !$app.can('items-create'),
                to: `${TABLE.resource.uri}/create`
              },
              { shortcut: true,
                tooltip: true,
                label: $tc('items.sample.add'),
                detail: $tc('messages.form_new'),
                icon: 'mdi-tag-plus',
                hidden: !$app.can('items-sample'),
                to: `${TABLE.resource.uri}/create-sample`
              },
              { shortcut: true,
                tooltip: true,
                label: 'All sync',
                detail: $tc('messages.form_new'),
                icon: 'mdi-database-refresh',
                hidden:!$app.can('items-push'),
                actions: () => pushAll()
              },
            ]">

            <div class="row q-col-gutter-xs" >
              <ux-select-filter class="col-12 col-sm-3"
                v-model="FILTERABLE.fill.customer_id.value" clearable
                :label="$tc('general.customer')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                :options="CustomerOptions"
                @input="FILTERABLE.submit" />

              <q-select class="col-12 col-sm-3"
                dense use-chips hide-dropdown-icon
                placeholder="Stock"
                :options="['FM','WIP','FG','NC','NCR']"
                v-model="FILTERABLE.fill.has_stocks.value" multiple
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                @input="FILTERABLE.submit">
                <span slot="prepend" class="text-caption" v-text="'STOCK'" />
                <q-btn slot="append"
                  dense rounded color="light" size="sm"
                  label="ALL"
                  v-if="!FILTERABLE.fill.has_stocks.value || FILTERABLE.fill.has_stocks.value.length < 6 "
                  @click="[FILTERABLE.fill.has_stocks.value = ['FM','WIP','FG','NC','NCR'], FILTERABLE.submit()]" >
                  <q-tooltip>{{$tc('label.all')}}</q-tooltip>
                </q-btn>
              </q-select>
              <q-select class="col-12 col-sm-3" input-class="no-wrap"
                dense standout="bg-blue-grey-5 text-white"
                :options="['REGULER','SAMPLE']"
                v-model="FILTERABLE.fill.sample_in.value"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                @input="FILTERABLE.submit"
              />

              <div class="col-12 col-sm-3">
                <div class="row justify-end no-wrap">
                  <q-checkbox
                    left-label label="Disable"
                    v-model="FILTERABLE.fill.enable.value"
                    true-value="0"
                    false-value=""
                    @input="FILTERABLE.submit"
                  />
                </div>
              </div>

              <q-select class="col-12" autocomplete="off"
                multiple use-chips use-input new-value-mode="add"
                dense hide-dropdown-icon
                v-model="FILTERABLE.search" emit-value
                :placeholder="`${$tc('form.search',2)}...`"
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                @input="FILTERABLE.submit" >

                <template slot="append">
                  <q-btn flat dense icon="search" dark-percentage color="fadded" @click="FILTERABLE.submit"/>
                </template>
              </q-select>
            </div>

          </table-header>
        </template>

        <q-td slot="body-cell" slot-scope="rs" :props="rs">
          <div v-if="rs.col.name === 'prefix'">
            <q-btn dense flat color="grey" icon="description" :to="`${TABLE.resource.uri}/${rs.row.id}`"/>
            <!-- <q-btn v-if="isCanUpdate" dense flat color="grey" icon="edit" :to="`${TABLE.resource.uri}/${rs.row.id}/edit`"/>
            <q-btn v-if="isCanDelete" dense flat color="grey" icon="delete" @click.native="TABLE.delete(rs.row)" />
            <q-btn v-if="isCanPush" dense flat color="light" icon="mdi-database-export" title="upload"
              @click.native="push(rs.row)"
            /> -->
          </div>

          <div v-else-if="rs.col.name === 'customer'">
            <span v-if="rs.row.customer" v-text="rs.row.customer.code"/>
            <span v-else v-text="'-'" />
          </div>

          <div v-else-if="rs.col.name === 'brand'">
            <span v-if="rs.row.brand" v-text="rs.row.brand.name"/>
            <span v-else v-text="'-'" />
          </div>

          <div v-else-if="rs.col.name === 'specification'">
            <span v-if="rs.row.specification" v-text="rs.row.specification.name"/>
            <span v-else v-text="'-'" />
          </div>

          <div v-else-if="rs.col.name === 'enable'">
            <q-avatar size="24px" class="shadow-1"
            :color="rs.row.enable ? 'green' : 'red'" text-color="white"
            :icon="rs.row.enable ? 'mdi-check-outline' : 'block'" />
          </div>

          <div v-else-if="rs.col.name === 'FM'">
            {{ Number(rs.row.totals['FM'] || 0) - Number(rs.row.totals['WO_FM'] || 0) }}
            <span class="text-faded">({{ rs.row.totals['WO_FM'] || ' -- '}})</span>
          </div>

          <div v-else-if="rs.col.name === 'NC'">
            {{ Number(rs.row.totals['NC'] || 0) - Number(rs.row.totals['WO_NC'] || 0) }}
            <span class="text-faded">({{ rs.row.totals['WO_NC'] || ' -- '}})</span>
          </div>

          <div v-else-if="rs.col.name === 'NCR'">
            {{ Number(rs.row.totals['NCR'] || 0) - Number(rs.row.totals['WO_NCR'] || 0) }}
            <span class="text-faded">({{ rs.row.totals['WO_NCR'] || ' -- '}})</span>
          </div>

          <div v-else>{{rs.value}}</div>

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
      stockAll: false,
      SHEET: {
        customers: { data: [], api: '/api/v1/incomes/customers?mode=all' }
      },
      FILTERABLE: {
        fill: {
          appends: {
            value: ['total_work_order']
          },
          sample_in: {
            value: 'REGULER',
            type: 'string',
            transform: (value) => { return null }
          },
          enable: {
            value: '',
            type: 'string',
            transform: (value) => { return '' }
          },
          customer_id: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          },
          has_stocks: {
            value: null,
            type: 'array',
            transform: (value) => { return String(value).split(',') }
          }
        }
      },
      TABLE: {
        mode: 'index',
        resource: {
          api: '/api/v1/common/items',
          uri: '/admin/common/items'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left', required: true },

          { name: 'customer', label: this.$tc('general.cust') + '.', field: 'customer_id', align: 'left', sortable: true },
          { name: 'part_name', label: this.$tc('items.part_name'), field: 'part_name', align: 'left', sortable: true },
          { name: 'part_subname', label: this.$app.setting('item.subname_label'), field: 'part_subname', align: 'left', sortable: true },
          // { name: 'enable', label:this.$tc('label.active'), field: 'enable', align: 'center', sortable: true },

          // Item stocks
          { name: 'ALL', label: 'ALL', sortable: true, field: (item) => Number(item.totals['*']), format: (v) => v ? this.$app.number_format(v) : '-', style: 'text-weight-medium' },
          { name: 'FM', label: 'FM (WO)', sortable: true, field: (item) => item.totals['FM'], format: (v) => v ? this.$app.number_format(v) : '-' },
          { name: 'WIP', label: 'WIP', sortable: true, field: (item) => item.totals['WIP'], format: (v) => v ? this.$app.number_format(v) : '-' },
          { name: 'FG', label: 'FG', sortable: true, field: (item) => item.totals['FG'], format: (v) => v ? this.$app.number_format(v) : '-' },
          { name: 'NC', label: 'NC (WO)', sortable: true, field: (item) => item.totals['NC'], format: (v) => v ? this.$app.number_format(v) : '-' },
          { name: 'NCR', label: 'NCR (WO)', sortable: true, field: (item) => item.totals['NCR'], format: (v) => v ? this.$app.number_format(v) : '-' },
          { name: 'NG', label: 'NG', sortable: true, field: (item) => item.totals['NG'], format: (v) => v ? this.$app.number_format(v) : '-' },
          { name: 'price', label: 'Price', field: 'price', sortable: true, hidden: !this.$app.can('items.price') },
          { name: 'price_dm', label: 'Price(DM)', field: 'price', sortable: true, hidden: !this.$app.can('items.price') },
          { name: 'price_brl', label: 'Price(BRL)', field: 'price', sortable: true, hidden: !this.$app.can('items.price') },
          // { name: 'brand', label: this.$tc('general.brand'), field: 'bran_id', align: 'left', sortable: true},
          // { name: 'specification', label: 'Specification', field: 'specification_id', align: 'left', sortable: true},
          // { name: 'part_alias', label: 'Part alias', field: 'part_alias', sortable: true },
          { name: 'code', field: 'code', label: 'Intern code', align: 'left', sortable: true, required: true }

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
    totalStock (id, label) {
      if (!this.MAPINGKEY['itemstocks'][id]) return 0
      return Number(this.MAPINGKEY['itemstocks'][id][label])
    },
    push (row) {
      let url = `${this.TABLE.resource.api}/${row.id}/accurate/push`
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
    },
    pushAll () {
      let url = `${this.TABLE.resource.api}/all/accurate/push`
      this.$q.loading.show()
      this.$axios.post(url)
        .then((response) => {
          let arrMsg = []
          if (response.data.filter(x => x.s === true).length) {
            arrMsg.push(response.data.filter(x => x.s === true).length + ' success')
          }
          if (response.data.filter(x => x.s === false).length) {
            arrMsg.push(response.data.filter(x => x.s === false).length + ' failed')
          }
          this.$app.notify.info('ACCURATE SYNC', String(arrMsg.join(',') + ' to customer sync.'))
        }).catch((error) => {
          this.$app.response.error(error.response || error)
        }).finally(() => {
          this.$q.loading.hide()
        })
    }
  }
}
</script>
