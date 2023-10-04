<template>
  <q-page padding class="column justify-start items-center">
    <page-print v-if="rsView">
      <span slot="header-subtitle">WAREHOUSE - INCOMING GOOD</span>
      <div slot="header-tags" class="print-hide">
        <q-chip square outline icon='bookmark'
          color="blue-grey" text-color="white"
          label="NCR" v-if="rsView.transaction === 'RETURN'" />
        <q-chip square outline icon='bookmark'
          color="blue-grey" text-color="white"
          label="SAMPLE" v-if="rsView.transaction === 'SAMPLE'" />
        <q-chip square outline icon='bookmark'
          color="blue-grey" text-color="white"
          label="INTERNAL" v-if="rsView.transaction === 'INTERNAL'" />
        <ux-chip-status :row="rsView" tag outline small square icon='bookmark' :color-options="{STANDARDIZED: 'green-8'}" />

        <q-btn dense flat round color="blue-grey" icon="settings" @click="$refs['config'].show()" />
        <config-page ref="config" persistent />
      </div>
      <div class="row q-col-gutter-md" >
        <div class="col-12">
          <div class="row justify-between q-gutter-sm" >
            <div class="items-end q-pt-lg">
              <q-markup-table class="super-dense no-shadow">
                <tr>
                  <th class="text-left">{{$tc('general.customer')}}</th>
                  <td>{{ rsView.customer.name }}</td>
                </tr>
                <tr>
                  <th class="text-left">{{$tc('warehouses.reference_number')}}</th>
                  <td>{{ rsView.reference_number || '-'}}</td>
                </tr>
              </q-markup-table>
            </div>
            <div class="row items-start q-gutter-x-sm">
              <q-markup-table class="super-dense no-shadow no-highlight"
                dense square bordered separator="cell">
                <tbody>
                  <tr>
                    <td>{{$tc('warehouses.registration')}}</td>
                    <td>{{rsView.registration}}</td>
                  </tr>
                  <tr>
                    <td>{{'No. Indexed'}}</td>
                    <td>{{rsView.indexed_number}}</td>
                  </tr>
                  <tr v-if="rsView.request_order">
                    <td>{{$tc('general.request_order')}}</td>
                    <td>
                      <span v-if="!$app.can('request-orders-read')">{{rsView.request_order.number}}</span>
                      <q-btn v-else dense flat
                        :label="rsView.request_order.number"
                        class="q-py-none" style="line-height:normal"
                        :to="`/admin/incomes/request-orders/${rsView.request_order.id}`"/>
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
              <q-markup-table class="super-dense no-shadow no-highlight"
                dense square bordered separator="cell">
                <tbody>
                  <tr>
                    <td>{{$tc('label.number')}}</td>
                    <td>{{rsView.fullnumber || rsView.number}}</td>
                  </tr>
                  <tr>
                    <td>{{$tc('label.date')}}</td>
                    <td>{{ $app.date_format(rsView.date) }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
        </div>
        <div class="col-12">
          <q-markup-table dense bordered square separator="cell" class="table-print no-shadow no-highlight">
            <thead>
            <q-tr style="line-height:25px;text-transform:uppercase">
              <q-th width="15%" v-if="IS_LOTS">{{ $tc('label.lots') }}</q-th>
              <q-th width="25%" v-if="!isHideColumn('part_name')">{{ $tc('label.name', 1, {v: $tc('label.part')}) }}</q-th>
              <q-th width="20%" v-if="!isHideColumn('part_subname')">{{ $app.setting('item.subname_label') }}</q-th>
              <q-th width="10%" v-if="!isHideColumn('unit')">{{ $tc('label.unit') }}</q-th>
              <q-th width="10%" v-if="!isHideColumn('quantity')">{{ $tc('label.quantity') }}</q-th>
              <q-th width="10%" v-if="!isHideColumn('quantity')">VALID</q-th>
              <q-th width="20%" v-if="!isHideColumn('note')">{{ $tc('label.note') }}</q-th>
            </q-tr>
            </thead>
            <tbody>
              <q-tr v-for="(row, index) in rsView.incoming_good_items" :key="index" :request-order-item-id="row.id">
                <q-td v-if="IS_LOTS">{{row.lots || '-'}}</q-td>
                <q-td v-if="!isHideColumn('part_name')">{{row.item.part_name}}</q-td>
                <q-td v-if="!isHideColumn('part_subname')">{{row.item.part_subname}}</q-td>
                <q-td v-if="!isHideColumn('unit')" class="text-center">{{row.unit.code}}</q-td>
                <q-td v-if="!isHideColumn('quantity')" class="text-right">{{$app.number_format(row.quantity, row.unit.decimal_in) }}</q-td>
                <q-td v-if="!isHideColumn('quantity')" class="text-right">{{$app.number_format(row.valid, row.unit.decimal_in) }}</q-td>
                <q-td v-if="!isHideColumn('note')" style="width:180px"> {{row.note}} </q-td>
              </q-tr>
            </tbody>
          </q-markup-table>
        </div>
        <div class="col-12">
            <div class="q-my-xs text-italic">{{$tc('label.description')}}:</div>
            <div class="q-my-xs text-weight-light" style="min-height:30px">{{ rsView.description }}</div>
        </div>
      </div>
      <div class="row q-gutter-xs print-hide" style="padding-top:50px">
        <q-btn :label="$tc('form.back')" color="dark" icon="cancel" :to="`${VIEW.resource.uri}?return`" />
        <q-btn :label="$tc('form.print')" color="grey" icon="print" @click.native="print()" />
        <q-btn :label="$tc('form.edit')" color="green" icon="edit" :to="`${VIEW.resource.uri}/${ROUTE.params.id}/edit`"
          v-if="IS_EDITABLE && isCanUpdate" />
        <q-space />
        <ux-btn-dropdown color="blue-grey"
          :options="[
            { label: $tc('form.add_new'), color:'green', icon: 'add',
              hidden: !isCanCreate,
              detail: $tc('messages.process_create'),
              actions: () => {
                $router.push(`${VIEW.resource.uri}/create`)
              }
            },
            { label: String('Delete').toUpperCase(), color:'red', icon: 'delete',
              hidden: !IS_EDITABLE || !isCanDelete,
              detail: $tc('messages.process_delete'),
              actions: () => {
                VIEW.delete()
              }
            },
            { label: $tc('form.standardization').toUpperCase(), color:'green-8', icon: 'check',
              hidden: !IS_STANDARDIZED || !this.$app.can('incoming-goods-standardization'),
              detail:$tc('messages.process_standardization'),
              actions: () => {
                setReguled()
              }
            },
            { label: $tc('form.validation').toUpperCase(), color:'teal', icon: 'check',
              hidden: !IS_EDITABLE || !this.$app.can('incoming-goods-validation') || rsView.customer.partialidate_allowed,
              detail:$tc('messages.process_validation'),
              actions: () => {
                setValidation()
              }
            },
            { label: 'PARTIAL - VALIDATION', color:'teal', icon: 'check',
              hidden: !IS_PARTIALIDATE || !this.$app.can('incoming-goods-validation') || !rsView.customer.partialidate_allowed,
              detail:$tc('messages.process_validation'),
              actions: () => {
                setMultiValidation()
              }
            },
            { label: (`${$tc('form.revision')}`).toUpperCase(), color:'orange', icon: 'edit',
              hidden: !IS_REVISE || !['STANDARDIZED', 'VALIDATED'].some(x => x === rsView.status) || rsView.customer.partialidate_allowed || !this.$app.can('incoming-goods-revision'),
              detail:$tc('messages.process_revise'),
              actions: () => {
                setRevision()
              }
            },
            { label: (`${$tc('form.revision')} [${rsView.status}]`).toUpperCase(), color:'teal', icon: 'check',
              hidden: !IS_REVISE || rsView.status !== 'REJECTED' || !this.$app.can('incoming-goods-create'),
              // detail:$tc('messages.process_revision'),
              actions: () => {
                setRestoration()
              }
            },
            { label: 'VOID', color:'red', icon: 'block',
              hidden: !IS_VOID,
              detail: $tc('messages.process_void'),
              actions: () => {
                VIEW.void(()=> init() )
              }
            },
            { label: $tc('general.delivery_task'), color:'blue-10', icon: 'assignment',
              hidden: !this.$app.can('delivery-tasks-create') || rsView.status !== 'VALIDATED' || rsView.has_relationship.delivery_task === true,
              detail: $tc('form.add_new',1, {v:'PDO'}),
              actions: () => {
                $router.push(`/admin/deliveries/delivery-tasks/create?incoming_good_id=${ROUTE.params.id}`)
              }
            },
          ]"/>
      </div>
    </page-print>
    <div class="column fit">
      <div class="row justify-end print-hide fit">
        <div class="col-12 col-md-4">
          <view-validation v-if="rsView" :record="rsView" @reload="init" />
        </div>
      </div>
    </div>
    <q-inner-loading :showing="VIEW.loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script>

import MixView from 'src/mixins/mix-view.vue'
import PagePrint from 'components/page-print'
import ConfigPage from './config.vue'
import ViewValidation from './view-validation'

export default {
  mixins: [MixView],
  components: { PagePrint, ConfigPage, ViewValidation },
  data () {
    return {
      VIEW: {
        resource: {
          api: '/api/v1/warehouses/incoming-goods',
          uri: '/admin/deliveries/incoming-goods',
          params: '?mode=view'
        }
      },
      rsView: null,
      count: 0
    }
  },
  created () {
    this.init()
  },
  computed: {
    isCanCreate () {
      return this.$app.can('incoming-goods-create')
    },
    isCanUpdate () {
      return this.$app.can('incoming-goods-update')
    },
    isCanDelete () {
      return this.$app.can('incoming-goods-delete')
    },
    IS_LOTS () {
      if (this.rsView.transaction !== 'REGULER') return false
      if (this.rsView.order_mode !== 'NONE') return false
      if (!this.rsView.customer) return false
      return this.rsView.customer.order_lots
    },
    IS_PARTIALIDATE () {
      if (this.rsView.deleted_at) return false
      return Boolean(['PARTIAL-VALIDATED', 'OPEN'].find(x => x === this.rsView.status))
    },
    IS_REVISE () {
      if (this.rsView.deleted_at) return false
      if (this.IS_EDITABLE) return false
      if (['VOID', 'OPEN'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_VOID () {
      if (this.rsView.deleted_at) return false
      if (this.IS_EDITABLE) return false
      if (!this.$app.can('incoming-goods-void')) return false
      if (['VOID'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_STANDARDIZED () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.transaction !== 'INTERNAL') return false
      if (this.rsView.status !== 'VALIDATED') return false
      return true
    },
    IS_EDITABLE () {
      if (this.rsView.deleted_at || this.rsView.status !== 'OPEN') return false
      if (Object.keys(this.rsView.has_relationship || {}).length > 0) return false
      return true
    }
  },
  methods: {
    isHideColumn (val) {
      const setting = this.$store.state.admin.SETTING.incoming_good
        ? this.$store.state.admin.SETTING.incoming_good['hide_view_columns'] || []
        : []

      if (setting.some(v => val === v)) return true

      const hidden = this.$store.state.admin.CONFIG.incoming_good['hide_view_columns'] || []
      return Boolean(hidden.some(v => val === v))
    },
    setRestoration () {
      this.$router.push(`${this.VIEW.resource.uri}/${this.ROUTE.params.id}/restoration`)
    },
    setRevision () {
      this.$router.push(`${this.VIEW.resource.uri}/${this.ROUTE.params.id}/revision`)
    },
    setValidation () {
      this.$router.push(`${this.VIEW.resource.uri}/${this.ROUTE.params.id}/validation`)
    },
    setReguled () {
      this.$router.push(`${this.VIEW.resource.uri}/${this.ROUTE.params.id}/standardization`)
    },
    setMultiValidation () {
      this.$router.push(`${this.VIEW.resource.uri}/${this.ROUTE.params.id}/partial-validation`)
    },
    init () {
      this.VIEW.load((data) => {
        this.setView(data || {})
      })
    },

    setView (data) {
      this.rsView = JSON.parse(JSON.stringify(data))
    }
  }
}
</script>
