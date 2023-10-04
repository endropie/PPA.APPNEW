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
                hidden:!$app.can('delivery-checkouts-create'),
                to: `${TABLE.resource.uri}/create`
              }
            ]">

            <div class="row q-col-gutter-xs" >
              <ux-date class="col-12 col-sm-3"
                stack-label :label="$tc('label.date')"
                v-model="FILTERABLE.fill.date.value" type="date"  clearable
                dense hide-bottom-space
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                @input="FILTERABLE.submit"/>

              <ux-select-filter class="col-12 col-sm-3"
                v-model="FILTERABLE.fill.vehicle_id.value" clearable
                :label="$tc('general.vehicle')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :options="VehicleOptions"
                @input="FILTERABLE.submit" />

              <q-select class="col-12 col-sm-6" autocomplete="off"
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
          <q-btn dense flat color="light" icon="description" :to="`${TABLE.resource.uri}/${rs.row.id}`" />
        </q-td>

        <q-td slot="body-cell-vehicle_id" slot-scope="rs" :props="rs">
          <!-- {{rs.row}} -->
          <div class="column">
            <span v-if="rs.row.vehicle"> {{ rs.row.vehicle.number }}</span>
            <span v-else>- undifined -</span>
            <small class="text-blue-grey" v-if="rs.row.fullnumber_index">INDEX: {{rs.row.fullnumber_index}}</small>
          </div>
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
        vehicles: { data: [], api: '/api/v1/references/vehicles?mode=all&type=DELIVERY' }
      },
      FILTERABLE: {
        fill: {
          vehicle_id: {
            value: null,
            type: 'integer',
            transform: (value) => { return null }
          },
          date: {
            value: null,
            type: 'date',
            transform: (value) => { return null }
          }
        }
      },
      TABLE: {
        mode: 'index',
        resource: {
          api: '/api/v1/incomes/delivery-checkouts',
          uri: '/admin/deliveries/delivery-checkouts'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'date', label: this.$tc('label.date'), field: 'date', format: (v) => v ? this.$app.moment(v).format('DD/MM/YYYY') : '-', sortable: true, classes: 'text-uppercase', align: 'center', width: '50px' },
          { name: 'number', label: this.$tc('label.number'), field: 'fullnumber', format: (v) => `#${v}`, align: 'left' },
          { name: 'vehicle_id', label: this.$tc('general.vehicle'), field: 'vehicle_id', align: 'left', sortable: true, style: 'width:60%' },
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
    VehicleOptions () {
      return (this.SHEET.vehicles.data.map(item => ({ label: item.number, value: item.id })) || [])
    }
  },
  methods: {
    onCommentable (row) {
      this.$q.dialog({
        ok: true,
        component: CommentableDialog,
        title: `Delivery Checkout [${row.fullnumber}] - LOG`,
        model: 'App\\Models\\Income\\DeliveryCheckout',
        id: row.id
      })
    }
  }
}
</script>
