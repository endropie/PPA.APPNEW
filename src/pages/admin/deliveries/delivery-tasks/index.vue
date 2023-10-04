<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" class="table-index th-uppercase" color="primary" :dark="LAYOUT.isDark"
        :title="TABLE.getTitle()"
        subtitle="cskc"
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
                hidden:!$app.can('delivery-tasks-create'),
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
              <ux-select-filter class="col-12 col-sm-6"
                v-model="FILTERABLE.fill.customer_id.value" clearable
                :label="$tc('general.customer')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
                :options="CustomerOptions"
                @input="FILTERABLE.submit" />

              <q-select class="col-12 col-sm-3 "
                v-model="FILTERABLE.fill.status.value" clearable
                :options="['OPEN', 'CONFIRMED','RECONCILIATION', 'RECONCILED']"
                :label=" $tc('label.state')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :dark="LAYOUT.isDark"
                @input="FILTERABLE.submit" />

              <ux-date class="col-12 col-sm-3"
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
                  <q-btn flat dense icon="search" dark-percentage color="fadded" @click="FILTERABLE.submit"/>
                </template>
              </q-select>
            </div>
          </table-header>
        </template>

        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:40px" auto-width>
          <q-btn dense flat color="light" icon="description" :to="`${TABLE.resource.uri}/${rs.row.id}`" />
        </q-td>

        <q-td slot="body-cell-customer_id" slot-scope="rs" :props="rs">
          <div class="column">
            <span v-if="rs.row.customer"> {{ rs.row.customer.name }}</span>
            <span v-else>- undifined -</span>
            <small class="text-blue-grey" v-if="rs.row.fullnumber_index">INDEX: {{rs.row.fullnumber_index}}</small>
          </div>
        </q-td>

        <q-td slot="body-cell-number" slot-scope="rs" :props="rs">
          <span v-if="rs.row.number" class="column text-weight-medium" :class="{'text-strike text-faded': rs.row.status == 'REVISED'}">
            <span>{{ rs.row.fullnumber || rs.row.number }}</span>
            <!-- <small  class="text-blue-grey" v-if="rs.row.reconcile_number"> -->
              <!-- REC.{{rs.row.reconcile_number}} -->
            <!-- </small> -->
            <div>
              <q-btn flat dense color="blue-grey" size="sm" class="text-caption" style="line-height:normal"
                :label="`REC.${rs.row.reconcile_number}`"
                :to="`${TABLE.resource.uri}/${rs.row.reconcile_id}`"
                v-if="rs.row.reconcile_id"
              />
              <q-btn flat dense color="blue-grey" size="sm" class="text-caption" style="line-height:normal"
                :label="`REV.${rs.row.fullnumber_revise}`"
                :to="`${TABLE.resource.uri}/${rs.row.revise_id}`"
                v-if="rs.row.revise_id"
              />
            </div>

          </span>
          <span v-else>- undifined -</span>
        </q-td>

        <q-td slot="body-cell-status" slot-scope="rs" :props="rs" class="no-padding">
          <ux-chip-status dense square :row="rs.row"/>
        </q-td>

        <q-td slot="body-cell-transaction" slot-scope="rs" :props="rs" style="width:35px">
          <q-chip dense square text-color="white" class="text-weight-medium"
            :color="rs.row.transaction === 'RETURN' ? 'dark' : 'blue-grey-5'"
            :label="rs.row.transaction" />
        </q-td>

        <q-td slot="body-cell-created_at" slot-scope="rs" :props="rs" class="no-padding">
          <q-btn dense flat no-caps @click="onCommentable(rs.row)" >
            <div class="column text-body" style="line-height:normal">
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
        customers: { data: [], api: '/api/v1/incomes/customers?mode=all' }
      },
      FILTERABLE: {
        fill: {
          // reconcile_id: { value: null, type: 'integer' },
          // revise_id: { value: null, type: 'integer' },
          customer_id: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          },
          date: {
            value: null,
            type: 'date',
            transform: (value) => { return null }
          },
          status: {
            value: null,
            transform: (value) => { return null }
          }
        }
      },
      TABLE: {
        mode: 'index',
        resource: {
          api: '/api/v1/incomes/delivery-tasks',
          uri: '/admin/deliveries/delivery-tasks'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'date', label: this.$tc('label.delivery_date'), field: 'date', format: (v) => v ? this.$app.moment(v).format('DD/MM/YYYY') : '-', sortable: true, classes: 'text-uppercase', align: 'center', width: '50px' },
          { name: 'trip_time', label: 'time', field: 'trip_time', format: (v) => v ? String(v).substring(0, 5) : '-', sortable: true, align: 'center', width: '50px' },
          { name: 'number', label: this.$tc('label.number'), field: 'number', align: 'left' },
          { name: 'customer_id', label: this.$tc('general.customer'), field: 'customer_id', align: 'left', sortable: true },
          { name: 'status', label: '', field: 'status', align: 'center' },
          { name: 'created_at', label: this.$tc('form.create', 2), field: 'created_at', align: 'center' }
        ],
        rowData: [],
        resData: [],
        pagination: {
          page: 1,
          rowsPerPage: 10,
          rowsNumber: 10 // specifying this determines pagination is server-side,
        },
        filter: '',
        selected: [
          // initial selection => { id: 5 }
        ],
        loading: false
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
    onCommentable (row) {
      this.$q.dialog({
        ok: true,
        component: CommentableDialog,
        title: `PDO ${row.fullnumber} - LOG`,
        model: 'App\\Models\\Income\\DeliveryTask',
        id: row.id
      })
    }
  }
}
</script>
