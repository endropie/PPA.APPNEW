<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" inline class="table-index table-striped th-uppercase" color="primary"
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
              { label: $tc('form.add'),
                detail: $tc('messages.form_new'),
                icon: 'add',
                shortcut: true,
                hidden:!$app.can('deportation-goods-create'),
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
              <div class="col-12 col-sm-6">
                <div class="row q-col-gutter-x-xs">
                  <ux-select class="col-12 col-sm-4"
                    v-model="FILTERABLE.fill.customer_id.value" clearable
                    :label="$tc('general.customer')" stack-label
                    :placeholder="$tc('form.select', 1, {v:$tc('general.customer')})"
                    dense hide-bottom-space hide-dropdown-icon
                    standout="bg-blue-grey-5 text-white"
                    :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
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
                    :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                    :options="ItemOptions"
                    @input="FILTERABLE.submit"
                    :loading="SHEET['items'].loading"/>
                </div>
              </div>
              <q-select class="col-4 col-sm-2 "
                v-model="FILTERABLE.fill.status.value" clearable
                :options="['OPEN','REJECTED','VALIDATED','CLOSED']"
                :label=" $tc('label.state')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                @input="FILTERABLE.submit"
              />

              <ux-date class="col-8 col-sm-4"
                stack-label :label="$tc('label.date')"
                v-model="FILTERABLE.fill.date.value" type="date"  clearable
                dense hide-bottom-space
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                @input="FILTERABLE.submit"
              />

              <q-select class="col-12" autocomplete="off"
                multiple use-chips use-input new-value-mode="add"
                dense hide-dropdown-icon
                v-model="FILTERABLE.search" emit-value
                :placeholder="`${$tc('form.search',2)}...`"
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
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
        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:50px">
          <q-btn flat dense color="light" icon="description" :to="`${TABLE.resource.uri}/${rs.row.id}`" />
        </q-td>

        <q-td slot="body-cell-number" slot-scope="rs" :props="rs" style="40%">
          <div :class="(rs.row.revise_id ? 'text-strike' : 'text-weight-medium')">
            {{ rs.row.fullnumber || rs.row.number}}
          </div>
        </q-td>

        <q-td slot="body-cell-status" slot-scope="rs" :props="rs" class="no-padding" align="center">
          <div class="row q-gutter-xs no-wrap">
            <ux-chip-status dense square :row="rs.row"/>
            <q-chip dense square label="CHECKOUT" color="blue-grey" text-color="white" v-if="rs.row.delivery_checkout_id" />
          </div>
        </q-td>

        <q-td slot="body-cell-customer_id" slot-scope="rs" :props="rs" style="style:40%">
          <span v-if="rs.row.customer"> {{ rs.row.customer.name }}</span>
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
import MixSheet from 'src/mixins/mix-sheet.vue'
import CommentableDialog from 'components/CommentableDialog.vue'
export default {
  mixins: [MixIndex, MixSheet],
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
          status: {
            value: null,
            transform: (value) => { return null }
          },
          date: {
            value: null,
            transform: (value) => { return null }
          }
        }
      },
      TABLE: {
        mode: 'index',
        resource: {
          api: '/api/v1/warehouses/deportation-goods',
          uri: '/admin/deliveries/deportation-goods'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'date', label: this.$tc('label.date'), field: 'date', format: (v) => this.$app.moment(v).format('DD/MM/YYYY'), align: 'center', style: 'width:120px', sortable: true },
          { name: 'number', label: this.$tc('label.number'), field: 'number', align: 'left', sortable: true },
          { name: 'customer_id', label: this.$tc('general.customer'), field: 'customer_id', align: 'left', sortable: true },
          { name: 'status', label: '', field: 'status', align: 'left' },
          { name: 'created_at', label: this.$tc('form.create', 2), field: 'created_at', align: 'center', sortable: true }
        ]
      }
    }
  },
  created () {
    this.INDEX.load()
  },
  computed: {
    isCanUpdate () {
      return this.$app.can('deportation-goods-update')
    },
    isCanDelete () {
      return this.$app.can('deportation-goods-delete')
    },
    CustomerOptions () {
      return (this.SHEET.customers.data.map(item => ({ label: [item.code, item.name].join(' - '), value: item.id })) || [])
    },
    ItemOptions () {
      return (this.SHEET.items.data.map(item => ({
        // item: item,
        label: `${item.part_name} - ${item.part_subname}`,
        sublabel: `[${item.customer_code}] ${item.part_subname || '--'}`,
        value: item.id
      })) || [])
    }
  },
  methods: {
    isEditable (row) {
      if (row.deleted_at) return false
      if (row.status !== 'OPEN') return false
      if (row.hasOwnProperty('is_relationship') && row.is_relationship) return false
      return true
    },
    onCommentable (row) {
      this.$q.dialog({
        ok: true,
        component: CommentableDialog,
        title: `Deportation [${row.fullnumber}] - LOG`,
        model: 'App\\Models\\Income\\DeliveryOrder',
        id: row.id
      })
    }
  }
}
</script>
