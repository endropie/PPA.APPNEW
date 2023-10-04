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
              {
                label: $tc('form.add'),
                detail: $tc('messages.form_new'),
                icon: 'add',
                shortcut: true,
                hidden:!$app.can('forecasts-create'),
                actions: () => {
                  addLoad()
                }
              },
              {
                label: $tc('label.trash'),
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
          <q-btn dense flat color="light" icon="contact_page" :to="`${TABLE.resource.uri}/${rs.row.id}/man-power`" />
          <q-btn v-if="isCanDelete" dense flat color="light" icon="delete" @click.native="TABLE.delete(rs.row)" :class="{'hidden':  !isEditable(rs.row)}"/>
        </q-td>

        <q-td slot="body-cell-created" slot-scope="rs" :props="rs">
          <span v-if="rs.row.created_at"> {{ $app.moment(rs.row.created_at).format('DD/MM/YY HH:mm') }}</span>
          <span v-else>- undifined -</span>
        </q-td>

      </q-table>
    </q-pull-to-refresh>

    <q-dialog ref="dialogNewLoad" persistent>
      <q-card style="min-width: 300px">
        <q-card-section v-if="newLoad">
          <div class="text-subtitle2">NEW COLLECTION</div>
          <div class="">
            <forecast-period-select class="col-12 col-sm-3"
              name="period.id"
              v-model="newLoad.period" clearable
              @input="(v) => newLoad.period_id = v ? v.id : null"
              :label="$tc('label.period')"
              v-validate="'required'"
              option-value="id"
              :option-label="(opt) => $app.moment(opt.period).format('MMMM YYYY')"
              source="/api/v1/incomes/forecast-periods?mode=datagrid"
              :error="errors.has('period.id')" :error-message="errors.first('period.id')"
            />
            <q-input type="text"
              v-model="newLoad.number"
              label="No. Remaks"
              name="number" v-validate="'required'"
              :error="errors.has('number')"
              :error-message="errors.first('number')"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveLoad" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import MixIndex from 'src/mixins/mix-index.vue'
import ForecastPeriodSelect from 'components/ForecastPeriodSelect.vue'

export default {
  mixins: [MixIndex],
  components: { ForecastPeriodSelect },
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
          api: '/api/v1/incomes/forecast-loads',
          uri: '/admin/incomes/forecast-loads'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'number', label: this.$tc('label.number'), field: 'number', align: 'left', sortable: true },
          { name: 'period', label: 'Period', field: (row) => (row.period) ? this.$app.moment(row.period.period).format('MMMM YYYY') : '--', align: 'center' },
          { name: 'created', label: this.$tc('form.create', 2), field: 'created_at', align: 'center', sortable: true }

        ]
      },
      newLoad: null,
      setNewLoad: () => {
        return Object.assign({
          number: null,
          period_id: null,
          period: null
        })
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
    },
    addLoad () {
      this.newLoad = this.setNewLoad()
      this.$refs.dialogNewLoad.show()
    },
    saveLoad () {
      const submit = () => {
        this.$q.loading.show()
        this.$axios.post(this.TABLE.resource.api, Object.assign(this.newLoad))
          .then((response) => {
            this.$refs.dialogNewLoad.hide()
            this.INDEX.load()
          })
          .catch((error) => {
            console.error(error.response || error)

            this.$app.response.error(error.response || error)

            if (this.$validator && error.response && error.response.status === 422) {
              for (const field in error.response.data.errors || {}) {
                this.$validator.errors.add(Object.assign({ field: field, msg: error.response.data.errors[field][0] }))
              }
            }
          })
          .finally(() => {
            this.$q.loading.hide()
          })
      }

      this.$validator.validate().then(result => {
        return (result) ? submit()
          : this.$q.notify({
            color: 'negative',
            icon: 'error',
            position: 'top-right',
            timeout: 3000,
            message: this.$tc('messages.to_complete_form')
          })
      })
    }
  }
}
</script>
