<template>
  <q-page padding class="column justify-start items-center">

    <div class="content" :style="{'min-width': $q.screen.gt.sm ? '70%' : '100%'}">
      <div class="row q-gutter-xs print-hide q-mb-sm"  v-if="rsView">
        <q-btn :label="$tc('form.back')" icon="cancel"  color="dark" :to="`${VIEW.resource.uri}?return`" />
        <q-btn :label="$tc('form.print')" icon="print" color="grey" @click="setPrint()" />
        <q-btn :label="$tc('general.sj_delivery')" icon="print"  color="dark" :to="`${VIEW.resource.uri}/${ROUTE.params.id}/delivery-orders`" />
        <q-space />
        <q-btn-dropdown outline class="no-dropdown-icon"
          color="primary" icon="local_shipping"
          menu-anchor="bottom left" menu-self="top left">
          <span slot="label" class="on-right">
            {{`SJDO (${rsView.delivery_orders.length})`}}
          </span>
          <q-list bordered>
            <q-item-label header class="text-subtitle2">
              SJ-DELIVERY ORDER
            </q-item-label>
            <q-separator />
            <q-item clickable v-ripple
              v-for="(link, index) in rsView.delivery_orders" :key="index"
              @click="showDO(link.id, link.is_internal)"
            >
              <q-item-section>{{ link.fullnumber }}</q-item-section>
              <q-item-section side>
                <q-icon color="primary" name="open_in_new" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <ux-btn-dropdown color="blue-grey"
          :options="[
            { label: $tc('form.add_new'), color:'green', icon: 'add',
              detail: $tc('messages.process_create'),
              hidden: !$app.can('delivery-loads-create'),
              actions: () => {
                $router.push(`${VIEW.resource.uri}/create`)
              }
            },
            { label: 'RESTORE', color:'green', icon: 'refresh',
              detail: $tc('messages.process_reopen'),
              hidden: !IS_RESTORE || !$app.can('delivery-loads-void'),
              actions: () => {
                setRestore()
              }
            },
            { label: 'VOID', color:'red', icon: 'block',
              detail: $tc('messages.process_void'),
              hidden: !IS_VOID || !$app.can('delivery-loads-void'),
              actions: () => {
                VIEW.void(()=> init() )
              }
            },
          ]"
        />
      </div>
      <page-print v-if="VIEW.show">
        <div slot="header-title" class="text-uppercase">{{$tc('general.delivery_load')}}</div>
        <div slot="header-tags" class="print-hide">
          <ux-chip-status :row="rsView" tag outline small square icon='bookmark' />
          <q-chip tag outline small square color="orange-10" icon='bookmark' label="MANUAL" v-if="rsView.is_manual" />
        </div>
        <div class="column" style="min-height:3.25in;height:auto">

          <div class="row q-gutter-x-sm q-pb-sm" >
            <ux-qrcode :value="valQrCode(rsView)" :options="{ width: 96, height: 96, margin: 1 }" />
            <div class="" style="max-width:50%">
              <q-markup-table dense separator="none" class="super-dense no-shadow no-highlight text-weight-medium">
                <tbody>
                  <tr>
                    <td>{{$tc('general.customer')}}</td>
                    <td>
                      <span v-if="rsView.customer"> {{rsView.customer.name}} </span>
                    </td>
                  </tr>
                  <tr>
                    <td>{{$tc('label.transaction')}}</td>
                    <td>{{ rsView.transaction }}</td>
                  </tr>
                  <tr>
                    <td>{{$tc('general.vehicle')}}</td>
                    <td>
                      <span v-if="rsView.vehicle"> {{rsView.vehicle.number}} </span>
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
            <q-space />
            <div class="info">
              <q-markup-table dense square bordered class="table-print dotted super-dense no-shadow no-highlight" separator="cell">
                <tbody>
                  <tr>
                    <td class="text-weight-medium">{{$tc('label.number')}}</td>
                    <td>{{ rsView.fullnumber }}</td>
                  </tr>
                  <tr>
                    <td class="text-weight-medium">{{$tc('label.date')}}</td>
                    <td>{{$app.date_format(rsView.date)}}</td>
                  </tr>
                  <tr v-if="rsView.checkout_number">
                    <td class="text-weight-medium">CHECKOUT</td>
                    <td>#{{rsView.checkout_number}}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
          <div>
            <q-markup-table square dense bordered class="table-print dotted no-shadow no-highlight th-uppercase" separator="cell">
              <thead>
              <q-tr>
                <q-th>{{ $tc('label.name', 1, {v: $tc('label.part')}) }}</q-th>
                <q-th>{{ $app.setting('item.subname_label') }}</q-th>
                <q-th>{{ $tc('label.unit') }}</q-th>
                <q-th>{{ $tc('label.quantity') }}</q-th>
                <q-th>{{ $tc('label.encasement') }}</q-th>
              </q-tr>
              </thead>
              <tbody>
              <q-tr v-for="(row, index) in rsView.delivery_load_items" :key="index">
                <q-td>{{row.item.part_name}}</q-td>
                <q-td>{{row.item.part_subname}}</q-td>
                <q-td class="text-center">{{ row.unit.code }}</q-td>
                <q-td class="text-right">{{ $app.number_format(row.quantity, $app.get(row, 'unit.decimal_in') || 0) }}</q-td>
                <q-td>{{row.encasement || '-'}}</q-td>
              </q-tr>
              </tbody>
            </q-markup-table>
          </div>
          <div>
            <div class="q-mb-sm text-italic">{{$tc('label.description')}}:</div>
            <div class="q-mb-md text-weight-light" style="">{{ rsView.description }}</div>
          </div>
          <div>
            <div class="text-black text-weight-medium">
              SJDO:
              <span v-for="(link, i) in rsView.delivery_orders" :key="i" @click="showDO(link.id, link.is_internal)" class="cursor-pointer">
                ({{ i+1 }}) {{ link.fullnumber }}
              </span>
            </div>
          </div>
        </div>
      </page-print>
    </div>
    <ux-modal-view ref="modal"  fit icon="local_shipping" :title="$tc('general.sj_delivery')" />
  </q-page>
</template>

<script>

import MixView from 'src/mixins/mix-view.vue'
import PagePrint from 'components/page-print'

export default {
  mixins: [MixView],
  components: { PagePrint },
  data () {
    return {
      VIEW: {
        data: {},
        resource: {
          api: '/api/v1/incomes/delivery-loads',
          uri: '/admin/deliveries/delivery-loads'
        }
      },
      rsView: null,
      rsForm: null
    }
  },
  created () {
    this.init()
  },
  computed: {
    IS_CLOSE () {
      if (this.rsView.deleted_at) return false
      if (['CLOSED'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_VOID () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.revise_id) return false
      if (this.rsView.status !== 'OPEN') return false
      return true
    },
    IS_RESTORE () {
      if (!this.rsView.deleted_at) return false
      if (this.rsView.status !== 'VOID') return false
      return true
    },
    IS_EDITABLE () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.revise_id) return false
      if (this.rsView.status !== 'OPEN') return false
      return true
    }
  },
  methods: {
    init () {
      this.VIEW.load((data) => {
        this.setView(data || {})
      })
    },
    setView (data) {
      this.rsView = data
    },
    setRestore () {
      const submit = () => {
        this.VIEW.loading = true
        let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}/restore`
        this.$axios.put(url)
          .then(() => {
            this.init()
          })
          .catch(error => {
            this.$app.response.error(error.response, 'RESTORE')
          })
          .finally(() => {
            this.VIEW.loading = false
          })
      }

      this.$q.dialog({
        title: String(this.$tc('form.confirm', 1, { v: 'RESTORE' })).toUpperCase(),
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('messages.process_reopen') }),
        cancel: true,
        persistent: true
      }).onOk(() => {
        submit()
      })
    },
    setPrint () {
      const submit = () => {
        this.VIEW.loading = true
        let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}/print-log`
        this.$axios.put(url)
          .then(() => {
            this.VIEW.print()
          })
          .catch(error => {
            this.$app.response.error(error.response, 'PRINT LOG')
          })
          .finally(() => {
            this.VIEW.loading = false
          })
      }

      this.$q.dialog({
        title: String(this.$tc('form.confirm', 1, { v: 'PRINT LOG' })).toUpperCase(),
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('messages.process_printlog') }),
        cancel: true,
        persistent: true
      }).onOk(() => {
        submit()
      })
    },
    valQrCode (data) {
      return `/delivery-loads/${data.id}`
      // return `${window.location.origin}/#/admin/deliveries/delivery-loads/${data.id}`
    },
    showDO (id, internal = false) {
      const path = internal
        ? '/admin/deliveries/delivery-order-internals/view'
        : '/admin/deliveries/delivery-orders/view'

      let mode = {
        path,
        params: { id: id },
        meta: { mode: 'view' },
        actions: {
          // actions
        }
      }
      this.$refs.modal.show(mode)
    }
  }
}
</script>
