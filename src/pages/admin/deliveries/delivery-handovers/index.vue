<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" inline class="table-index th-uppercase" color="primary"
        :title="TABLE.getTitle()"
        :data="TABLE.rowData"
        :columns="TABLE.columns"
        selection="none"
        :selected.sync="TABLE.selected"
        row-key="id"
        :pagination.sync="TABLE.pagination"
        :rows-per-page-options="[10, 20, 50, 100, 500, 0]"
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
                hidden: !$app.can('delivery-handovers-create'),
                to: `${TABLE.resource.uri}/create`
              }
            ]">

            <div class="row q-col-gutter-xs" >
              <ux-select-filter class="col-12 col-sm-6"
                v-model="FILTERABLE.fill.customer_id.value" clearable
                :label="$tc('general.customer')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                :options="CustomerOptions"
                @input="FILTERABLE.submit" />

              <ux-date class="col-12 col-sm-3"
                stack-label :label="$tc('label.begin')"
                v-model="FILTERABLE.fill.begin_date.value" type="date"  clearable
                dense hide-bottom-space
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                @input="FILTERABLE.submit"/>

              <ux-date class="col-12 col-sm-3"
                stack-label :label="$tc('label.until')"
                v-model="FILTERABLE.fill.until_date.value" type="date"  clearable
                dense hide-bottom-space
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                @input="FILTERABLE.submit"/>

              <q-select class="col-12" autocomplete="off"
                multiple use-chips use-input new-value-mode="add"
                dense hide-dropdown-icon
                v-model="FILTERABLE.search" emit-value
                :placeholder="`${$tc('form.search',2)}...`"
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                @input="FILTERABLE.submit">

                <template slot="append">
                  <q-btn flat dense icon="search" dark-percentage color="fadded" @click="FILTERABLE.submit"/>
                </template>
              </q-select>
            </div>
          </table-header>
        </template>

        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">
          <q-btn dense flat color="light" icon="description" :to="`${TABLE.resource.uri}/${rs.row.id}`"/>
        </q-td>

        <q-td slot="body-cell-date" slot-scope="rs" :props="rs" class="text-uppercase">
          <span v-if="rs.row.date"> {{ $app.moment(rs.row.date).format('DD/MM/YYYY') }}</span>
          <span v-else>-</span>
        </q-td>

        <q-td slot="body-cell-status" slot-scope="rs" :props="rs" class="q-py-none" style="width:35px">
          <ux-chip-status dense square :row="rs.row" :color-options="{INVOICED: 'green'}" />
        </q-td>

        <q-td slot="body-cell-customer_id" slot-scope="rs" :props="rs" class="text-uppercase no-padding">
          <div class="column">
            <span v-if="rs.value"> {{ rs.value }}</span>
            <span v-else>-</span>
            <span v-if="rs.row.reference_number" class="text-caption text-small text-grey"> No. {{rs.row.reference_number}} </span>
          </div>
        </q-td>

        <q-td slot="body-cell-created_at" slot-scope="rs" :props="rs" class="no-padding">
          <div class="column text-body">
            <span class="text-uppercase text-grey-8">
              {{rs.row.created_user ? rs.row.created_user.name : 'undefined'}}
            </span>
            <small v-if="rs.row.created_at" class="text-grey">
              <q-icon name="mdi-earth"></q-icon>
              {{ $app.moment(rs.row.created_at).format('DD/MM/YYYY HH:mm') }}
            </small>
          </div>
          <q-tooltip>
              {{ $app.moment(rs.row.created_at).fromNow() }}
          </q-tooltip>
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
          },
          begin_date: {
            value: null,
            type: 'date',
            transform: (value) => { return null }
          },
          until_date: {
            value: null,
            type: 'date',
            transform: (value) => { return null }
          }
        }
      },
      TABLE: {
        mode: 'index',
        resource: {
          api: '/api/v1/incomes/delivery-handovers',
          uri: '/admin/deliveries/delivery-handovers'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'date', label: this.$tc('label.date'), field: 'date', align: 'center', sortable: true },
          { name: 'number', label: this.$tc('label.number'), field: 'number', align: 'left', sortable: true },
          { name: 'customer_id', label: this.$tc('general.customer'), align: 'left', field: (row) => row.customer ? row.customer.name : '- N/A -', sortable: true, style: 'width:50%' },
          { name: 'created_at', label: this.$tc('form.create', 2), align: 'center', sortable: true, field: 'created_at' }
        ]
      }
    }
  },
  created () {
    this.INDEX.load()
  },
  computed: {
    CustomerOptions () {
      return (this.SHEET.customers.data.map(item => ({ label: [item.code, item.name].join(' - '), value: item.id })) || [])
    }
  },
  methods: {
    isEditable (row) {
      if (row.deleted_at) return false
      if (row.order_mode !== 'PO') return false
      if (row.status !== 'OPEN') return false
      if (row.hasOwnProperty('is_relationship') && row.is_relationship) return false
      return true
    },
    isEditRef (row) {
      if (row.deleted_at) return false
      if (row.order_mode === 'PO') return false
      if (row.status === 'CLOSED') return false
      return true
    },
    isEditRefExpired (row) {
      if (row.deleted_at) return false
      if (row.order_mode !== 'PO') return false
      if (row.status === 'CLOSED') return false
      return row.is_relationship
    }
  }
}
</script>
