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
                hidden:!$app.can('sj-delivery-internals-create'),
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
                :options="['OPEN', 'CONFIRMED', 'VOID']"
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
          <span>{{ rs.row.fullnumber || rs.row.number }}</span>
        </q-td>

        <q-td slot="body-cell-status" slot-scope="rs" :props="rs" class="no-padding">
          <ux-chip-status dense square :row="rs.row"/>
          <!-- <q-chip dense square label="REVISED" color="red-10" text-color="white" v-if="rs.row.revised_number" class="q-my-none q-mr-none text-weight-medium"  /> -->
        </q-td>

        <q-td slot="body-cell-persentase" slot-scope="rs" :props="rs" class="no-padding">
          <q-chip dense square class="text-weight-medium" text-color="white"
            :color="Math.round(rs.row.summary_reconciles) == Math.round(rs.row.summary_items) ? 'red-10' : 'indigo-10'"
            :label="Math.round(rs.row.summary_reconciles) == Math.round(rs.row.summary_items) ? 'RECONCILED' : 'RECON'"
            v-if="rs.row.is_internal">
            <span class="text-weight-normal q-ml-sm" v-if="rs.row.summary_items > 0 && !(Math.round(rs.row.summary_reconciles) == Math.round(rs.row.summary_items))">
              {{$app.number_format(Math.floor(rs.row.summary_reconciles/rs.row.summary_items*100), 0)}} %
            </span>
          </q-chip>
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
          is_internal: { value: '1', type: 'boolean' },
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
          api: '/api/v1/incomes/delivery-orders',
          uri: '/admin/deliveries/delivery-order-internals'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'date', label: this.$tc('label.date'), field: 'date', align: 'center', sortable: true, format: (v) => v ? this.$app.moment(v).format('DD/MM/YYYY') : '-', classes: 'text-uppercase' },
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
    isEditable (row) {
      if (row.status !== 'OPEN') return false
      if (row.is_relationship) return false
      return true
    },
    onCommentable (row) {
      this.$q.dialog({
        ok: true,
        component: CommentableDialog,
        title: `SJ Delivery [${row.fullnumber}] - LOG`,
        model: 'App\\Models\\Income\\DeliveryOrder',
        id: row.id
      })
    }
  }
}
</script>
