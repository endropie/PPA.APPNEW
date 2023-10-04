<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" inline class="table-index table-striped th-uppercase" color="primary" :dark="LAYOUT.isDark"
        :title="TABLE.getTitle()"
        :data="TABLE.rowData"
        :columns="TABLE.columns"
        :filter="TABLE.filter"
        selection="none"
        :selected.sync="TABLE.selected"
        row-key="id"
        :pagination.sync="TABLE.pagination"
        @request="TABLE.compute"
        :loading="TABLE.loading"
      >
        <template v-slot:top>
          <table-header hide-search
            :title="TABLE.getTitle()"
            :TABLE.sync="TABLE"
            :menus="[
              { label: $tc('form.add_new'),
                detail: $tc('messages.form_new'),
                icon: 'add',
                shortcut: true,
                hidden:!$app.can('packings-create'),
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

            <template slot="default">
              <div class="row q-col-gutter-xs" >
                <ux-select-filter class="col-8 col-sm-4"
                  v-model="FILTERABLE.fill.customer_id.value" clearable
                  :label="$tc('general.customer')" stack-label
                  :placeholder="$tc('form.select_a', null, {v:$tc('general.customer')})"
                  dense hide-bottom-space hide-dropdown-icon
                  standout="bg-blue-grey-5 text-white"
                  :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                  :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                  :options="CustomerOptions"
                  @input="[
                    FILTERABLE.fill.item_id.value=null,
                    SHEET.load('items', `customer_id=${FILTERABLE.fill.customer_id.value}`),
                    FILTERABLE.submit()
                  ]"/>

                <ux-select-filter class="col-8 col-sm-4"
                  v-model="FILTERABLE.fill.item_id.value" clearable
                  :label="$tc('general.item')" stack-label
                  :placeholder="$tc('form.select_a', null, {v:$tc('general.item')})"
                  dense hide-bottom-space hide-dropdown-icon
                  standout="bg-blue-grey-5 text-white"
                  :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                  :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                  :options="ItemOptions"
                  @input="FILTERABLE.submit"
                  :loading="SHEET['items'].loading"/>

                <ux-date class="col-8 col-sm-4"
                  stack-label :label="$tc('label.date')"
                  v-model="FILTERABLE.fill.date.value" type="date"  clearable
                  dense hide-bottom-space
                  standout="bg-blue-grey-5 text-white"
                  :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                  :dark="LAYOUT.isDark"
                  @input="FILTERABLE.submit"/>

                <q-select class="col-12" autocomplete="off"
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
            </template>
          </table-header>
        </template>

        <!-- slot name syntax: body-cell-<column_name> -->
        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">
          <q-btn dense flat color="light" icon="description" :to="`${TABLE.resource.uri}/${rs.row.id}`" />
          <q-btn v-if="isEditable(rs.row) && isCanUpdate" dense flat color="light" icon="edit" :to="`${TABLE.resource.uri}/${rs.row.id}/edit`" />
          <q-btn v-if="isEditable(rs.row) && isCanDelete" dense flat color="light"  icon="delete" @click.native="TABLE.delete(rs.row)"/>
        </q-td>

        <q-td slot="body-cell-customer_id" slot-scope="rs" :props="rs">
          <div v-if="rs.row.customer"> {{ rs.row.customer.code }}</div>
          <div v-else>- undefined -</div>
        </q-td>
        <q-td slot="body-cell-item" slot-scope="rs" :props="rs">
          <div class="column" v-if="rs.row.packing_items && rs.row.packing_items.item">
            <span>{{ rs.row.packing_items.item.part_name }}</span>
            <span class="text-weight-light">{{ rs.row.packing_items.item.part_subname || '--' }}</span>
          </div>
        </q-td>
        <q-td slot="body-cell-item_number" slot-scope="rs" :props="rs">
          <div v-if="rs.row.packing_items.item">
            {{ rs.row.packing_items.item.part_subname }}
          </div>
        </q-td>
        <q-td slot="body-cell-item_name" slot-scope="rs" :props="rs">
          <div v-if="rs.row.packing_items.item" class="text-body2">
            {{ rs.row.packing_items.item.part_name }}
          </div>
        </q-td>
        <q-td slot="body-cell-shift_id" slot-scope="rs" :props="rs">
          <div v-if="rs.row.shift"> {{ rs.row.shift.name }}</div>
          <div v-else class="text-center">-</div>
        </q-td>
        <q-td slot="body-cell-worktime" slot-scope="rs" :props="rs">
          <div v-if="rs.row.worktime"> {{ rs.row.worktime }}</div>
          <div v-else class="text-center">-</div>
        </q-td>
        <q-td slot="body-cell-date" slot-scope="rs" :props="rs">
          <div v-if="rs.row.date"> {{ $app.moment(rs.row.date).format('DD/MM/YYYY') }}</div>
          <div v-else class="text-center">-</div>
        </q-td>

        <q-td slot="body-cell-created_at" slot-scope="rs" :props="rs" class="no-padding">
          <q-btn dense flat no-caps @click="onCommentable(rs.row)" >
            <div class="column text-body">
              <span class="text-uppercase text-grey-8">
                {{rs.row.created_user ? rs.row.created_user.name : 'undefined'}}
              </span>
              <small v-if="rs.row.created_at" class="text-grey">
                <q-icon name="mdi-calendar-clock"></q-icon>
                {{ $app.moment(rs.row.created_at).format('DD/MM/YYYY ') }}
                <q-tooltip>{{ $app.moment(rs.row.created_at).fromNow() }}</q-tooltip>
              </small>
            </div>
          </q-btn>
        </q-td>

      </q-table>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import MixIndex from 'src/mixins/mix-index.vue'
import CommentableDialog from 'components/CommentableDialog.vue'

export default {
  mixins: [MixIndex],
  data () {
    return {
      SHEET: {
        customers: { data: [], api: '/api/v1/incomes/customers?mode=all' },
        items: { data: [], api: '/api/v1/common/items?mode=all', autoload: false }
      },
      FILTERABLE: {
        fill: {
          customer_id: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          },
          item_id: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          },
          date: {
            value: null,
            type: 'string',
            transform: (value) => { return null }
          }
        }
      },
      TABLE: {
        mode: 'index',
        resource: {
          api: '/api/v1/factories/packings',
          uri: '/admin/factories/packings'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },

          { name: 'date', label: this.$tc('label.date'), field: 'date', align: 'left', sortable: true },
          { name: 'number', label: this.$tc('label.number'), field: 'number', align: 'left', sortable: true },
          { name: 'customer_id', label: this.$tc('general.cust'), align: 'left' },
          { name: 'item', label: this.$tc('label.name', 1, { v: this.$tc('label.part') }), align: 'left' },
          { name: 'shift_id', label: 'Shift', field: 'shift_id', align: 'left' },
          { name: 'worktime', label: 'Worktime', field: 'worktime', align: 'left', sortable: true },
          { name: 'created_at', label: this.$tc('form.create', 2), field: 'created_at', align: 'center' }
        ]
      }
    }
  },
  created () {
    this.INDEX.load()
  },
  computed: {
    isCanUpdate () {
      return this.$app.can('packings-update')
    },
    isCanDelete () {
      return this.$app.can('packings-delete')
    },
    CustomerOptions () {
      return (this.SHEET.customers.data.map(item => ({ label: [item.code, item.name].join(' - '), value: item.id })) || [])
    },
    ItemOptions () {
      return (this.SHEET.items.data.map(item => ({
        label: item.part_name,
        sublabel: `[${item.customer_code}] ${item.part_subname || '--'}`,
        value: item.id
      })) || [])
    }
  },
  methods: {
    initItemOptions (val, update, abort) {
      if (String(val).length > 2) {
        this.SHEET.load('items', 'search=' + val)
      }
    },
    isEditable (row) {
      if (row.deleted_at) return false
      if (row.is_relationship) return false
      return true
    },
    onCommentable (row) {
      this.$q.dialog({
        ok: true,
        component: CommentableDialog,
        title: `Packing [${row.fullnumber}] - LOG`,
        model: 'App\\Models\\Factory\\Packing',
        id: row.id
      })
    }
  }
}
</script>
