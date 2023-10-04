<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" inline class="table-index table-striped th-uppercase" color="primary" :dark="LAYOUT.isDark"
        :data="TABLE.rowData"
        :columns="TABLE.columns"
        :pagination.sync="TABLE.pagination"
        @request="TABLE.compute"
        row-key="id"
        :loading="TABLE.loading">

        <!-- Table Header -->
        <template v-slot:top>
          <table-header hide-search
            :title="TABLE.getTitle()"
            :TABLE.sync="TABLE"
            :menus="[
              { label: $tc('form.add_new'),
                detail: $tc('messages.form_new'),
                icon: 'add',
                shortcut: true,
                hidden:!$app.can('work-orders-create'),
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

            <div class="row q-col-gutter-xs q-pb-xs" >
              <ux-select-filter class="col-8 col-sm-4"
                name="line_id"
                v-model="FILTERABLE.fill.line_id.value" clearable
                :label="$tc('items.preline')" stack-label
                :placeholder="$tc('form.select', 1, {v:$tc('items.preline')})"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                :options="LineOptions"
                @input="FILTERABLE.submit" />

              <q-select class="col-4 col-sm-2 "
                v-model="FILTERABLE.fill.status.value" clearable
                :options="['OPEN', 'PROCESSED', 'CLOSED']"
                :label=" $tc('label.state')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :dark="LAYOUT.isDark"
                @input="FILTERABLE.submit" />

              <ux-date class="col-8 col-sm-4"
                stack-label :label="$tc('label.date')"
                v-model="FILTERABLE.fill.date.value" type="date"  clearable
                dense hide-bottom-space
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :dark="LAYOUT.isDark"
                @input="FILTERABLE.submit"/>

              <q-select class="col-4 col-sm-2"
                map-options emit-value
                v-model="FILTERABLE.fill.shift_id.value" clearable
                :options="ShiftOptions"
                :label="$tc('label.shift')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :dark="LAYOUT.isDark"
                @input="FILTERABLE.submit"/>
            </div>

            <div class="row q-col-gutter-xs q-pb-xs">
              <div class="col-12 col-sm-6">
                <div class="row q-col-gutter-xs">
                  <ux-select class="col-12 col-sm-4"
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

                  <ux-select-filter class="col-12 col-sm-8"
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
                </div>
              </div>
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
                  <q-btn flat dense icon="search" color="blue-grey-10" @click="FILTERABLE.submit"/>
                </template>
              </q-select>
            </div>
          </table-header>
        </template>

        <!-- slot name syntax: body-cell-<column_name> -->
        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">
          <q-btn dense flat color="light" icon="description" :to="`${TABLE.resource.uri}/${rs.row.id}`" />
          <q-btn v-if="isCanUpdate(rs.row)" dense flat color="light" icon="edit" :to="`${TABLE.resource.uri}/${rs.row.id}/edit`" />
          <q-btn v-if="isCanDelete(rs.row)" dense flat color="light"  icon="delete" @click.native="TABLE.delete(rs.row)" />
        </q-td>

        <q-td slot="body-cell-status" slot-scope="rs" :props="rs" class="no-padding">
          <ux-chip-status :row="rs.row" dense square/>
        </q-td>

        <q-td slot="body-cell-shift_id" slot-scope="rs" :props="rs">
          <q-badge class="shadow-1 q-pa-xs text-uppercase"
            :label="rs.row.shift.name"
            dense color="faded" text-color="white"
            v-if="rs.row.shift" />
        </q-td>

        <q-td slot="body-cell-created_at" slot-scope="rs" :props="rs" class="no-padding">
          <q-btn dense flat no-caps @click="onCommentable(rs.row)" >
            <div class="column text-body">
              <span class="text-uppercase text-grey-8">
                {{rs.row.created_user ? rs.row.created_user.name : 'undefined'}}
              </span>
              <small v-if="rs.row.created_at" class="text-grey">
                <q-icon name="mdi-calendar-clock"></q-icon>
                {{ $app.moment(rs.row.created_at).format('DD/MM/YYYY HH:mm') }}
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
          api: '/api/v1/factories/work-productions',
          uri: '/admin/factories/work-productions'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'date', label: this.$tc('label.date'), field: (rs) => rs.date, format: (v) => this.$app.moment(v).format('DD/MM/YY'), align: 'center', sortable: true },
          { name: 'number', label: this.$tc('label.number'), field: 'number', align: 'left', sortable: true },
          { name: 'status', align: 'right' },
          { name: 'line_id', label: this.$tc('general.line'), field: (rs) => rs.line.name, align: 'left', sortable: true },
          { name: 'shift_id', label: this.$tc('label.shift'), field: (rs) => rs.shift.name, align: 'center', sortable: true },
          { name: 'created_at', label: this.$tc('form.create', 2), field: 'created_at', align: 'center' }
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
      return (this.SHEET.customers.data.map(item => ({ label: [item.code, item.name].join(' - '), value: item.id })) || [])
    },
    ItemOptions () {
      return (this.SHEET.items.data.map(item => ({
        // item: item,
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
      return this.$app.can('work-productions-update')
    },
    isCanDelete (row) {
      if (row.status !== 'OPEN') return false
      if (row.is_relationship) return false
      return this.$app.can('work-productions-delete')
    },
    onCommentable (row) {
      this.$q.dialog({
        ok: true,
        component: CommentableDialog,
        title: `SPK [${row.fullnumber}] - LOG`,
        model: 'App\\Models\\Factory\\WorkProduction',
        id: row.id
      })
    }
  }
}
</script>
