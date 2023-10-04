<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" inline class="table-index th-uppercase" color="primary" :dark="LAYOUT.isDark"
        :title="TABLE.getTitle()"
        :data="TABLE.rowData"
        :columns="TABLE.columns"
        :filter="TABLE.filter"
        selection="none"
        :selected.sync="TABLE.selected"
        row-key="id"
        :pagination.sync="TABLE.pagination"
        @request="TABLE.compute"
        :loading="TABLE.loading">

        <!-- Table Header -->
        <template v-slot:top>
          <table-header hide-search
            :title="TABLE.getTitle()"
            :TABLE.sync="TABLE"
            :menus="[
              { label: $tc('form.add'),
                detail: $tc('messages.form_new'),
                icon: 'add',
                shortcut: true,
                hidden:!$app.can('forecasts-create'),
                to: `${TABLE.resource.uri}/create`
              },
              { label: $tc('label.trash'),
                detail:  $tc('messages.show_deleted'),
                shortcut: true,
                icon: Boolean(FILTERABLE.fill.withTrashed.value)? 'mdi-cup' : 'mdi-cup-off',
                closePopup: false,
                outline: true,
                actions:() => {
                  FILTERABLE.toggleTrash()
                  FILTERABLE.submit()
                }
              }
            ]">

            <div class="row q-col-gutter-xs" >
              <ux-select-filter class="col-12 col-sm-6 items-start self-start"
                v-model="FILTERABLE.fill.customer_id.value" clearable
                :label="$tc('general.customer')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                :options="CustomerOptions"
                @input="FILTERABLE.submit" />

              <q-select class="col-12 col-sm-6" autocomplete="off"
                multiple use-chips use-input new-value-mode="add"
                dense hide-dropdown-icon
                v-model="FILTERABLE.search" emit-value
                :placeholder="`${$tc('form.search',2)}...`"
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :dark="LAYOUT.isDark"
                @input="FILTERABLE.submit">

                <template slot="append">
                  <q-btn flat dense icon="search" dark-percentage color="fadded" @click="FILTERABLE.submit"/>
                </template>
              </q-select>
            </div>
          </table-header>
        </template>

        <!-- slot name syntax: body-cell-<column_name> -->
        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">
          <q-btn dense flat color="light" icon="description" :to="`${TABLE.resource.uri}/${rs.row.id}`" />
          <q-btn v-if="isCanUpdate" dense flat color="light" icon="edit"   :to="`${TABLE.resource.uri}/${rs.row.id}/edit`" :class="{'hidden':  !isEditable(rs.row)}"/>
          <q-btn v-if="isCanDelete" dense flat color="light" icon="delete" @click.native="TABLE.delete(rs.row)" :class="{'hidden':  !isEditable(rs.row)}"/>

        </q-td>

        <q-td slot="body-cell-customer_id" slot-scope="rs" :props="rs">
          <span v-if="rs.row.customer"> {{ rs.row.customer.name }}</span>
          <span v-else>- undifined -</span>
        </q-td>

        <q-td slot="body-cell-begin_date" slot-scope="rs" :props="rs">
          <span v-if="rs.row.begin_date"> {{ $app.moment(rs.row.begin_date).format('DD/MM/YY') }}</span>
          <span v-else>- undifined -</span>
        </q-td>

        <q-td slot="body-cell-until_date" slot-scope="rs" :props="rs">
          <span v-if="rs.row.until_date"> {{ $app.moment(rs.row.until_date).format('DD/MM/YY') }}</span>
          <span v-else>- undifined -</span>
        </q-td>

        <q-td slot="body-cell-interval_date" slot-scope="rs" :props="rs">
          <span>
            {{ rs.row.begin_date ? $app.moment(rs.row.begin_date).format('DD/MM/YY') : 'undefined'}} -
            {{ rs.row.until_date ? $app.moment(rs.row.until_date).format('DD/MM/YY') : 'undefined'}}
          </span>
        </q-td>

        <q-td slot="body-cell-created" slot-scope="rs" :props="rs">
          <span v-if="rs.row.created_at"> {{ $app.moment(rs.row.created_at).format('DD/MM/YY HH:mm') }}</span>
          <span v-else>- undifined -</span>
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
          customer_id: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          }
        }
      },
      TABLE: {
        mode: 'index',
        resource: {
          api: '/api/v1/incomes/forecasts',
          uri: '/admin/incomes/forecasts'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },

          { name: 'number', label: this.$tc('label.number'), field: 'number', align: 'left', sortable: true },
          { name: 'customer_id', label: this.$tc('general.customer'), field: 'customer_id', align: 'left', sortable: true },
          { name: 'period', label: 'Period', field: (row) => (row.period) ? this.$app.moment(row.period.period).format('MMMM YYYY') : '--', align: 'center' },
          { name: 'created', label: this.$tc('form.create', 2), field: 'created_at', align: 'center', sortable: true }

        ]
      }
    }
  },
  computed: {
    isCanUpdate () {
      return this.$app.can('forecasts-update')
    },
    isCanDelete () {
      return this.$app.can('forecasts-delete')
    },
    CustomerOptions () {
      return (this.SHEET.customers.data.map(item => ({ label: [item.code, item.name].join(' - '), value: item.id })) || [])
    }
  },
  created () {
    this.INDEX.load()
  },
  methods: {
    isEditable (row) {
      if (row.hasOwnProperty('status') && row.status !== 'OPEN') return false
      if (row.hasOwnProperty('is_relationship') && row.is_relationship) return false
      return true
    }
  }
}
</script>
