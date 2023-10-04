<template>
  <q-page padding class="column items-center" :dark="LAYOUT.isDark">
    <page-print v-if="VIEW.show" class="q-ma-md shadow-2">
      <div slot="header-tags" class="print-hide">
        <ux-chip-status :row="rsView" tag outline small square icon='bookmark' />
      </div>
      <span slot="header-subtitle" style="font-size:12px">Planing & Production Control Division</span>

      <div class="row q-col-gutter-xs" >
        <div class="col-12">
          <div class="row justify-between q-col-gutter-sm" >
            <div class="col-auto self-end">
              <span class="text-h6 text-center q-pt-lg q-pl-sm">PRODUKSI</span>
              <q-markup-table dense square class="no-shadow transparent" separator="none" :dark="LAYOUT.isDark">
                <tbody>
                  <tr>
                    <td class="text-left">{{$tc('general.line')}}</td><td>{{ rsView.line.name }}</td>
                  </tr>
                  <tr>
                    <td class="text-left">Worktime</td><td>{{ rsView.worktime }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
            <div class="col-auto">
              <q-markup-table bordered dense square class="super-dense no-shadow transparent" separator="cell" :dark="LAYOUT.isDark">
                <tbody>
                  <tr>
                    <td>{{$tc('label.number')}}</td>
                    <td>{{rsView.number}}</td>
                  </tr>
                  <tr>
                    <td>{{$tc('label.date')}}</td>
                    <td>{{$app.date_format(rsView.date)}}</td>
                  </tr>
                  <tr>
                    <td>{{$tc('label.shift')}}</td>
                    <td>{{rsView.shift.name}}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
        </div>
        <div class="col-12">
          <q-markup-table bordered dense square class="no-shadow transparent" separator="cell" :dark="LAYOUT.isDark" >
            <thead>
              <tr>
                <th>{{this.$tc('general.cust')}}</th>
                <th class="text-left">{{this.$tc('label.no', 1, {v:this.$tc('label.part')})}}</th>
                <th class="text-left">{{this.$tc('label.name', 1, {v:this.$tc('label.part')})}}</th>
                <th>{{$tc('label.unit')}}</th>
                <th class="text-right">{{$tc('label.quantity')}}</th>
              </tr>
            </thead>
            <tbody v-for="(row, index) in rsView.work_production_items" :key="index">
              <q-tr>
                <q-td key="code">
                  {{row.item.customer_code}}
                </q-td>
                <q-td key="part_name" width="30%">
                  {{row.item.part_name}}
                </q-td>
                <q-td key="part_subname" width="30%">
                  {{row.item.part_subname}}
                </q-td>
                <q-td key="unit_id" class="text-left">
                  {{row.unit.code}}
                </q-td>
                <q-td key="quantity" class="text-right">
                  {{ $app.number_format(row.quantity, row.unit.decimal_in) }}
                </q-td>
              </q-tr>
            </tbody>
          </q-markup-table>
        </div>
        <div class="col-12">
            <div class="q-my-xs text-italic">{{$tc('label.description')}}:</div>
            <div class="q-my-xs text-weight-light" style="min-height:30px">{{ rsView.description }}</div>
        </div>
      </div>
      <q-space />
      <div class="row q-gutter-sm print-hide">
        <q-btn :label="$tc('form.edit')" icon="edit" color="green" outline :to="`${VIEW.resource.uri}/${ROUTE.params.id}/edit`" v-if="IS_EDITABLE"></q-btn>
        <q-btn :label="$tc('form.print')" icon="print" color="grey" @click.native="print()" ></q-btn>
        <q-space />
        <q-btn :label="$tc('form.list')" icon-right="list" color="dark" :to="`${VIEW.resource.uri}?return`"/>
        <!-- <q-btn :label="$tc('form.clone')" icon-right="add_circle" color="positive" outline align="right" @click.native="$router.push(`${VIEW.resource.uri}/create?clone=${ROUTE.params.id}`)" ></q-btn> -->
        <ux-btn-dropdown color="blue-grey"
          :options="[
            { label: $tc('form.add_new'), color:'primary', icon: 'add',
              detail: $tc('messages.process_create'),
              hidden: !$app.can('work-orders-create'),
              actions: () => {
                $router.push(`${VIEW.resource.uri}/create`)
              }
            },
            { label: $tc('form.clone').toUpperCase(), color:'positive', icon: 'post_add',
              detail: $tc('messages.process_clone'),
              hidden: !$app.can('work-orders-create'),
              actions: () => {
                $router.push(`${VIEW.resource.uri}/create?clone=${ROUTE.params.id}`)
              }
            },
            { label: 'DELETE', color:'red', icon: 'delete',
              detail: $tc('messages.process_delete'),
              hidden: !IS_EDITABLE || !$app.can('work-orders-delete'),
              actions: () => {
                VIEW.delete()
              }
            },
            { label: 'VOID', color:'red', icon: 'block',
              detail: $tc('messages.process_void'),
              hidden: !IS_EDITABLE || !$app.can('work-orders-void'),
              actions: () => {
                VIEW.void(()=> init() )
              }
            },
          ]">
        </ux-btn-dropdown>
      </div>
    </page-print>

    <q-inner-loading :showing="VIEW.loading">
        <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
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
        resource: {
          api: '/api/v1/factories/work-productions',
          uri: '/admin/factories/work-productions',
          params: '?mode=view'
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
    IS_EDITABLE () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.status !== 'OPEN') return false
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
    print () {
      window.print()
    },
    getStockistFrom (val) {
      const stockist = [
        { value: 'FM', label: 'FRESH MATERIAL' },
        { value: 'NC', label: 'NOT GOOD', color: 'warning' },
        { value: 'NCR', label: 'REPAIR', color: 'orange-8' }
      ]
      const v = stockist.find(x => x.value === val)
      return v ? v.label : 'N/A'
    },
    setView (data) {
      this.rsView = data
    }
  }
}
</script>
