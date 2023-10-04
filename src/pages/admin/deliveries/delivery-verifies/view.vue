<template>
  <q-page padding class="column justify-start">
    <page-print v-if="VIEW.show">
      <div slot="header-title">DELIVERY - VERIFY</div>

      <div class="row justify-between q-col-gutter-y-sm" >
        <div class="column q-pl-md">
          <span class="text-h6">VERIFY #{{rsView.id}} </span>
          <span v-if="rsView.customer"> {{rsView.customer.name}} </span>
        </div>
        <div class="info">
          <!-- RIGHT SECTION -->
        </div>
        <div class="col-12">
          <q-markup-table dense bordered square class="table-print no-shadow no-highlight th-uppercase" separator="cell">
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
            <q-tr v-for="(row, index) in rsView.delivery_verify_items" :key="index">
              <q-td>{{row.item.part_name}}</q-td>
              <q-td>{{row.item.part_subname}}</q-td>
              <q-td class="text-center">{{row.unit.code}}</q-td>
              <q-td class="text-right">{{$app.number_format(row.quantity, $app.get(row, 'unit.decimal_in') || 0)}}</q-td>
              <q-td>{{row.encasement || '-'}}</q-td>
            </q-tr>
            </tbody>
          </q-markup-table>
        </div>
        <div class="col-12">
            <div class="q-mb-sm text-italic">{{$tc('label.description')}}:</div>
            <div class="q-mb-md text-weight-light" style="">{{ rsView.description }}</div>
        </div>
        <div class="col-12 row q-gutter-xs print-hide " style="padding-top:50px">
          <q-btn :label="$tc('form.back')" icon="cancel"  color="dark" :to="`${VIEW.resource.uri}?return`" />
          <q-btn :label="$tc('form.print')" icon="print" color="grey" @click.native="VIEW.print()" />
          <q-space />
          <ux-btn-dropdown color="blue-grey"
            :options="[
              { label: $tc('form.add_new'), color:'green', icon: 'add',
                detail: $tc('messages.process_create'),
                hidden: !$app.can('delivery-verifies-create'),
                actions: () => {
                  $router.push(`${VIEW.resource.uri}/multi-create`)
                }
              },
              { label: 'DELETE', color:'red', icon: 'delete',
                detail: $tc('messages.process_delete'),
                hidden: !IS_EDITABLE || !$app.can('delivery-verifies-delete'),
                actions: () => {
                  VIEW.delete()
                }
              }
            ]"/>
        </div>
      </div>
    </page-print>
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
          api: '/api/v1/incomes/delivery-verifies',
          uri: '/admin/deliveries/delivery-verifies'
        }
      },
      rsView: {},
      count: 0
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
      if (this.IS_EDITABLE) return false
      if (this.rsView.deleted_at) return false
      return true
    },
    IS_EDITABLE () {
      if (this.rsView.deleted_at) return false
      if (Object.keys(this.rsView.has_relationship || {}).length > 0) return false
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
    }
  }
}
</script>
