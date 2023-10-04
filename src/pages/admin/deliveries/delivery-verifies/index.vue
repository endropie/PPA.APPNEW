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
                hidden:!$app.can('delivery-verifies-create'),
                to: `${TABLE.resource.uri}/multi-create`
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

              <ux-date class="col-12 col-sm-3"
                stack-label :label="$tc('label.date')"
                v-model="FILTERABLE.fill.date.value" type="date"  clearable
                dense hide-bottom-space
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                @input="FILTERABLE.submit"/>

              <q-select class="col-12 col-sm-3 "
                v-model="FILTERABLE.fill.rit.value" clearable
                :options="[1,2,3,4,5,6,7,8,9,10]"
                prefix="R I T"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                @input="FILTERABLE.submit" />

              <q-select class="col-12" autocomplete="off"
                multiple use-chips use-input new-value-mode="add"
                dense hide-dropdown-icon
                v-model="FILTERABLE.search" emit-value
                :placeholder="`${$tc('form.search',2)}...`"
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                @input="FILTERABLE.submit">

                <template slot="append">
                  <q-btn flat dense icon="search" dark-percentage color="fadded" @click="FILTERABLE.submit"/>
                </template>
              </q-select>
            </div>
          </table-header>
        </template>

        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:40px" auto-width>
          <q-btn dense flat color="light" icon="description" :to="`${TABLE.resource.uri}/${rs.row.delivery_verify_id}`" v-if="rs.row.delivery_verify_id" />
          <q-btn dense flat color="light" icon="delete" @click="deleteDetail(rs.row)" v-if="isEditable(rs.row)" />
          <q-btn dense flat color="light" icon="clear" disable v-if="rs.row.deleted_at" />
        </q-td>

        <q-td slot="body-cell-customer_id" slot-scope="rs" :props="rs">
            <span v-if="rs.row.customer"> {{ rs.row.customer.code }}</span>
            <span v-else>- undifined -</span>
        </q-td>

        <q-td slot="body-cell-item_id" slot-scope="rs" :props="rs" width="35%" class="q-py-none">
          <span v-if="rs.row.item" class="column">
            <div>{{ rs.row.item.part_name }}</div>
            <small class="text-grey">{{ rs.row.item.part_subname }}</small>

          </span>
            <span v-else>- undifined -</span>
        </q-td>

        <q-td slot="body-cell-unit_id" slot-scope="rs" :props="rs">
          <span v-if="rs.row.unit"> {{ rs.row.unit.code }}</span>
            <span v-else>- undifined -</span>
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
          rit: {
            value: null,
            transform: (value) => { return null }
          }
        }
      },
      TABLE: {
        mode: 'index',
        resource: {
          api: '/api/v1/incomes/delivery-verifies',
          uri: '/admin/deliveries/delivery-verifies'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'date', label: this.$tc('label.date'), field: 'date', format: (v) => v ? this.$app.moment(v).format('DD/MM/YYYY') : '-', sortable: true, classes: 'text-uppercase', align: 'center', width: '50px' },
          { name: 'rit', label: 'R I T', field: 'rit', align: 'center' },
          { name: 'customer_id', label: this.$tc('general.cust'), field: 'customer_id', align: 'left', sortable: true },
          { name: 'item_id', label: this.$tc('label.part'), field: 'item_id', align: 'left' },
          // { name: 'part_subname', label: this.$app.setting('item.subname_label'), field: 'part_subname', align: 'left' },
          { name: 'quantity', label: this.$tc('label.quantity'), field: 'quantity' },
          { name: 'unit_id', label: this.$tc('label.unit'), field: 'unit_id', align: 'left' },
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
      if (row.deleted_at) return false
      if (row.loaded_at) return false
      return true
    },
    onCommentable (row) {
      this.$q.dialog({
        ok: true,
        component: CommentableDialog,
        title: `VERIFY [#${row.id}] - LOG`,
        model: 'App\\Models\\Income\\DeliveryVerifyItem',
        id: row.id
      })
    },
    deleteDetail (row) {
      console.warn('DELETED DETAIL')
      this.$q.dialog({
        title: 'DELETE',
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.delete', 2) }),
        preventClose: true,
        ok: this.$tc('messages.yes_to', 1, { v: this.$tc('form.delete') }),
        cancel: this.$tc('form.cancel')
      }).onOk(() => {
        this.$axios.delete(`${this.TABLE.resource.api}/${row.id}/detail`)
          .then((response) => {
            if (response.data.success) {
              const code = response.data.name || response.data.code || row.id
              this.$app.notify.success({
                message: this.$tc('messages.success_deleted'),
                detail: this.$tc('messages.form_has_deleted', 1, { v: `#${code}` })
              })
              this.TABLE__refresh()
            }
          })
          .catch(error => {
            const title = this.$tc('messages.fail', 1, { v: this.$tc('form.delete') })
            this.$app.response.error(error.response || error, title)
          })
      })
    }
  }
}
</script>
