<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" inline class="table-index table-striped th-uppercase" color="primary" :dark="LAYOUT.isDark"
        :title="TABLE.getTitle()"
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
            :title="TABLE.getTitle()"
            :TABLE.sync="TABLE"
            :filter.sync="TABLE.filter"
            :menus="[
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

            <div class="row items-start q-col-gutter-xs" >
              <ux-select-filter class="col-12 col-sm-6"
                v-model="FILTERABLE.fill.customer_id.value" clearable
                :label="$tc('general.customer')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                :options="CustomerOptions"
                @input="FILTERABLE.submit" />

              <q-select class="col-12 col-sm-6"
                v-model="FILTERABLE.fill.opname_id.value" clearable
                :options="OpnamePeriodOptions"
                :label=" $tc('general.opname_stock')"
                emit-value map-options
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :dark="LAYOUT.isDark"
                @input="FILTERABLE.submit" />

              <q-select class="col-12 col-sm-stretch" autocomplete="off"
                multiple use-chips use-input new-value-mode="add"
                dense hide-dropdown-icon
                v-model="FILTERABLE.search" emit-value
                :placeholder="`${$tc('form.search',2)}...`"
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :dark="LAYOUT.isDark"
                @input="FILTERABLE.submit">

                <template slot="before">
                </template>
                <template slot="append">
                  <q-btn flat dense icon="search" dark-percentage color="fadded" @click="FILTERABLE.submit"/>
                </template>
              </q-select>

            </div>
          </table-header>
        </template>

        <!-- slot name syntax: body-cell-<column_name> -->
        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">
          <q-btn flat dense color="light" icon="description" :to="`${TABLE.resource.uri}/${rs.row.id}`" />
          <q-btn v-if="isCanUpdate && isEditable(rs.row)" flat dense color="light" icon="edit" :to="`${TABLE.resource.uri}/${rs.row.id}/edit`" />
          <q-btn v-if="isCanDelete && isEditable(rs.row)" flat dense color="light" icon="delete"  @click.native="TABLE.delete(rs.row)" />
        </q-td>

        <q-td slot="body-cell-status" slot-scope="rs" :props="rs" style="width:35px">
          <ux-badge-status :row="rs.row.opname" />
        </q-td>

        <q-td slot="body-cell-part" slot-scope="rs" :props="rs" class="no-padding">
          <div v-if="rs.row.item" class="column text-body2">
            <span>{{ rs.row.item.part_name }}</span>
            <small class="text-weight-light">[{{rs.row.item.customer_code}}] {{rs.row.item.part_subname || '--'}}</small>
          </div>
          <div v-else class="text-caption text-italic">undefined!</div>
        </q-td>

        <q-td slot="body-cell-created_at" slot-scope="rs" :props="rs" class="no-padding">
          <div class="column text-body">
            <span class="text-uppercase text-grey-8">
              {{rs.row.created_user ? rs.row.created_user.name : 'undefined'}}
            </span>
            <small v-if="rs.row.created_at" class="text-grey">
              <q-icon name="mdi-earth"></q-icon>
              {{ $app.moment(rs.row.created_at).fromNow() }}
            </small>
          </div>
        </q-td>
      </q-table>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import MixIndex from 'src/mixins/mix-index.vue'
import MixSheet from 'src/mixins/mix-sheet.vue'
export default {
  mixins: [MixIndex, MixSheet],
  data () {
    return {
      SHEET: {
        customers: {data:[], api:'/api/v1/incomes/customers?mode=all'},
        opnames: { api:'/api/v1/warehouses/opnames?mode=all' },
      },
      FILTERABLE: {
        fill: {
          opname_id: {
            value: null,
            transform: (value) => { return null }
          },
          customer_id: {
            value: null,
            transform: (value) => { return null }
          }
        }
      },
      TABLE: {
        mode: 'index',
        resource:{
          api: '/api/v1/warehouses/opname-stocks',
          uri: '/admin/warehouses/opname-stocks',
        },
        columns: [
          { name: 'prefix', label: '', align: 'left'},
          { name: 'part', label: this.$tc('items.part_name'), field:(v) => v.item, align: 'left'},
          { name: 'stockist', label: 'Stockist', field:'stockist', format:(v) => v, align: 'center'},
          { name: 'init_amount', label: this.$tc('items.stock_init'), field:'init_amount', format:(v) => v, align: 'center'},
          { name: 'final_amount', label: this.$tc('items.stock_final'), field:'final_amount', format:(v) => v, align: 'center'},
          { name: 'number', label: this.$tc('label.number'), field: 'opname_number', align: 'left', sortable: true },
          { name: 'status', label: '', field: 'status', align: 'left'},
          { name: 'created_at', label: this.$tc('form.create', 2), field: 'created_at', align: 'center', sortable: true },
        ],
      },
    }
  },
  created () {
    this.INDEX.load()
    setTimeout(() => {
      this.TABLE.data
    }, 1000);
  },
  computed: {
    isCanUpdate(){
      return this.$app.can('opname-stocks-update')
    },
    isCanDelete(){
      return this.$app.can('opname-stocks-delete')
    },
    OpnamePeriodOptions() {
      return (this.SHEET.opnames.data.map(item => ({label: item.number, value: item.id, stamp: item.status})) || [])
    },
    CustomerOptions() {
      return (this.SHEET.customers.data.map(item => ({label: `${item.code} - ${item.name}`, value: item.id})) || [])
    },
  },
  methods:{
    isEditable(row) {
      if(row.deleted_at) return false
      if(row.status !== 'OPEN') return false
      if(row.hasOwnProperty('is_relationship') && row.is_relationship) return false
      return true
    }
  }
}
</script>
