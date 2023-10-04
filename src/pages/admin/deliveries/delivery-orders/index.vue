<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" class="table-index th-uppercase" color="primary"
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
                hidden:!$app.can('sj-delivery-orders-create'),
                to: `${TABLE.resource.uri}/create-sample`
              },
              { label: $tc('form.validation'),
                detail: $tc('messages.process_validation'),
                icon: 'check_box',
                shortcut: true,
                hidden:!$app.can('sj-delivery-orders-validation'),
                actions: () => {
                  newMultiValidation()
                }
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
              <ux-select-filter class="col-12 col-sm-4"
                v-model="FILTERABLE.fill.customer_id.value" clearable
                :label="$tc('general.customer')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :options="CustomerOptions"
                @input="FILTERABLE.submit" />

              <q-select class="col-12 col-sm-2"
                v-model="FILTERABLE.fill.status.value" clearable
                :options="['OPEN', 'CONFIRMED', 'VALIDATED', 'RECONCILIATION', 'RECONCILED']"
                :label=" $tc('label.state')"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                @input="FILTERABLE.submit" />

              <!-- <ux-date class="col-12 col-sm-3"
                stack-label :label="$tc('label.date')"
                v-model="FILTERABLE.fill.date.value" type="date"  clearable
                dense hide-bottom-space
                standout="bg-blue-grey-5 text-white"
                @input="FILTERABLE.submit"
              /> -->

              <ux-date class="col-12 col-sm-3"
                stack-label :label="$tc('label.begin')"
                v-model="FILTERABLE.fill.begin_date.value" type="date"  clearable
                dense hide-bottom-space
                standout="bg-blue-grey-5 text-white"
                @input="FILTERABLE.submit"
              />

              <ux-date class="col-12 col-sm-3"
                stack-label :label="$tc('label.until')"
                v-model="FILTERABLE.fill.until_date.value" type="date"  clearable
                dense hide-bottom-space
                standout="bg-blue-grey-5 text-white"
                @input="FILTERABLE.submit"
              />

              <q-select class="col-12" autocomplete="off"
                multiple use-chips use-input new-value-mode="add"
                dense hide-dropdown-icon
                v-model="FILTERABLE.search" emit-value
                :placeholder="`${$tc('form.search',2)}...`"
                standout="bg-blue-grey-5 text-white"
                @input="FILTERABLE.submit"
              >

                <template slot="append">
                  <q-btn flat dense icon="search" dark-percentage color="fadded" @click="FILTERABLE.submit"/>
                </template>
              </q-select>
            </div>
          </table-header>
        </template>

        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:40px">
          <q-btn dense flat color="light" icon="description" :to="`${TABLE.resource.uri}/${rs.row.id}`" />
          <span v-if="multiValidation.show && rs.row.status === 'CONFIRMED'">
            <q-btn dense flat
              color="light"
              icon="check_box_outline_blank"
              v-if="!multiValidation.data.some(x => x.id === rs.row.id)"
              @click="addItemValidation(rs.row)"
            />
            <q-btn v-else dense flat
              color="light"
              icon="check_box"
              @click="clearItemValidationByID(rs.row.id)"
            />
            <q-tooltip> The selected to validation </q-tooltip>
          </span>
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
    <q-dialog persistent seamless
      v-model="multiValidation.show"
      :position="multiValidation.minimize ? 'bottom' : 'right'"
      @hide="unsetMultiValidation"
    >
    <!-- <div class="column "> -->
      <q-card v-if="multiValidation.show" style="min-width:250px">
        <q-card-section class="q-pb-none">
          <q-bar class="bg-primary text-white text-uppercase shadow-2">
            <q-icon size="25px" color="white" name="check_box" class="q-mr-sm"/>
            <span> SJDO Validation</span>
            <q-space />
            <q-btn flat dense icon="remove" @click="multiValidation.minimize = !multiValidation.minimize" />
          </q-bar>
        </q-card-section>
        <q-card-section class="q-py-none" v-if="!multiValidation.minimize">
        <q-markup-table dense flat bordered style="max-height:250px;min-height:200px">
          <tbody>
            <tr v-if="multiValidation.data.length === 0">
              <td colspan="100%" class="text-center text-grey text-caption text-italic q-py-md">
                Please selected SJDO to validation
              </td>
            </tr>
            <tr  v-for="(item, index) in multiValidation.data" :key="index">
              <td>
                <q-btn dense flat color="negative" icon="clear" @click="clearItemValidation(index)" />
              </td>
              <td class="text-left">{{ item.fullnumber }}</td>
              <td class="text-right">{{ $app.moment(item.date).format('DD/MM/YYYY') }}</td>
            </tr>
          </tbody>
        </q-markup-table>
        </q-card-section>
        <q-space />
        <q-card-actions align="right" v-if="!multiValidation.minimize">
          <q-btn flat label="Cancel" color="faded" v-close-popup />
          <q-btn label="Validation" color="positive"
            :disable="!multiValidation.data.length"
            @click="setMultiValidation"
          />
        </q-card-actions>
      </q-card>
    <!-- </div> -->
    </q-dialog>
  </q-page>
</template>

<script>
import MixIndex from 'src/mixins/mix-index.vue'
import CommentableDialog from 'components/CommentableDialog.vue'
export default {
  mixins: [MixIndex],
  data () {
    return {
      multiValidation: {
        show: false,
        minimize: false,
        data: []
      },
      SHEET: {
        customers: { data: [], api: '/api/v1/incomes/customers?mode=all' }
      },
      FILTERABLE: {
        fill: {
          is_internal: { value: '0', type: 'boolean' },
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
          begin_date: {
            value: null,
            type: 'date',
            transform: (value) => { return null }
          },
          until_date: {
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
          uri: '/admin/deliveries/delivery-orders'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'date',
            label: this.$tc('label.date'),
            field: 'date',
            align: 'center',
            sortable: true,
            format: (v) => v ? this.$app.moment(v).format('DD/MM/YYYY') : '-',
            classes: 'text-uppercase' },
          { name: 'number', label: this.$tc('label.number'), field: 'number', align: 'left' },
          { name: 'customer_id', label: this.$tc('general.customer'), field: 'customer_id', align: 'left', sortable: true },
          { name: 'status', label: '', field: 'status', align: 'center' },
          { name: 'persentase', label: '', align: 'center' },
          { name: 'transaction', label: this.$tc('label.transaction'), field: 'transaction', align: 'center', sortable: true },
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
    unsetMultiValidation () {
      this.multiValidation.show = false
    },
    newMultiValidation () {
      this.multiValidation.show = true
      this.multiValidation.minimize = false
      this.multiValidation.data = []
    },
    addItemValidation (item) {
      this.multiValidation.data.push(item)
    },
    clearItemValidation (index) {
      this.multiValidation.data.splice(index, 1)
    },
    clearItemValidationByID (id) {
      const index = this.multiValidation.data.findIndex(x => x.id === id)
      if (typeof index !== 'undefined') this.clearItemValidation(index)
    },
    setMultiValidation () {
      const submit = () => {
        this.$q.loading.show()
        let url = `${this.TABLE.resource.api}/multi-validation?nodata=true`
        this.$axios.post(url, { data: this.multiValidation.data })
          .then(() => {
            this.$app.notify.success('VALIDATION SUCCESS')
            this.multiValidation.show = false
            this.TABLE.refresh()
          })
          .catch(error => {
            this.$app.response.error(error.response, 'VALIDATED FAILED')
          })
          .finally(() => {
            setTimeout(() => {
              this.$q.loading.hide()
            }, 1000)
          })
      }

      this.$validator.validate().then(result => {
        if (!result) {
          return this.$q.notify({
            color: 'negative',
            icon: 'error',
            position: 'top-right',
            timeout: 3000,
            message: this.$tc('messages.to_complete_form')
          })
        }

        this.$q.dialog({
          title: String(this.$tc('form.validation')).toUpperCase(),
          message: this.$t('messages.to_sure', { v: this.$tc('form.validation') }),
          cancel: true,
          persistent: true
        }).onOk(() => {
          submit()
        })
      })
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
