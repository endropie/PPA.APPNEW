<template>
  <q-page padding class="content-center justify-start column">
    <page-print v-if="rsView && VIEW.show" style="width:75%;min-width:210mm;min-height:85vh">
      <div slot="header-tags" class="print-hide">
        <ux-chip-status :row="rsView" tag outline small square icon='bookmark'/>
      </div>
      <span slot="header-subtitle">Planing & Production Control Division</span>

      <div class="column q-gutter-md" >
        <div class="row q-col-gutter-sm" >
          <div class="self-end col-stretch">
            <div class=" q-pa-lg text-no-wrap text-truncate">
              <div class="text-h6 text-uppercase">{{$tc('general.packing_load')}}</div>
              <div class="text-uppercase" v-if="rsView.customer">{{ rsView.customer.name }} [{{ rsView.customer.code }}]</div>
            </div>
          </div>
          <q-space />
          <div class="col-auto">
            <q-markup-table bordered dense square class="no-shadow no-highlight transparent" separator="cell">
              <tbody>
                <tr>
                  <td>{{$tc('label.number')}}</td>
                  <td>{{rsView.number}}</td>
                </tr>
                <tr>
                  <td>{{$tc('label.date')}}</td>
                  <td>{{$app.date_format(rsView.created_at)}}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </div>
        <div class="column">
          <q-markup-table bordered dense square separator="cell" class="no-shadow no-highlight transparent">
            <thead>
              <tr class="text-uppercase" style="line-height:30px">
                <th width="10%" class="text-center">{{ this.$tc('label.code') }}</th>
                <th width="50%" class="text-left">{{ this.$tc('label.name', 1, {v:this.$tc('label.part')}) }}</th>
                <th width="50%" class="text-left">{{ this.$tc('label.code', 1, {v:this.$tc('label.part')}) }}</th>
                <th width="30%" class="text-right">QTY</th>
                <th width="10%">{{ $tc('label.unit') }}</th>
              </tr>
            </thead>
            <tbody >
              <q-tr v-for="(row, rowIndex) in rsView.packing_load_items" :key="rowIndex" :packing-item-id="row.id">
                <q-td key="code" width="10%" class="text-center">
                  {{ row.item.code }}
                </q-td>
                <q-td key="name" width="30%">
                  <div>{{ row.item.part_name }}</div>
                </q-td>
                <q-td key="subname" width="30%">
                  <div>[{{ row.item.customer_code }}] {{row.item.part_subname}}</div>
                </q-td>
                <q-td key="quantity" class="text-right">
                  {{ $app.number_format(row.quantity, row.unit.decimal_in) }}
                </q-td>
                <q-td key="unit" class="text-left">
                  {{ row.unit.code }}
                </q-td>
              </q-tr>
            </tbody>
          </q-markup-table>
        </div>
        <div class="">
            <div class="q-my-xs text-italic">{{$tc('label.description')}}:</div>
            <div class="q-my-xs text-weight-light" style="min-height:30px">{{ rsView.description }}</div>
        </div>
      </div>
      <div slot="actions" class="row q-gutter-sm print-hide">
        <q-btn :label="$tc('form.edit')" icon="edit" color="green" outline :to="`${VIEW.resource.uri}/${ROUTE.params.id}/edit`" v-if="IS_EDITABLE" />
        <q-btn :label="$tc('form.print')" icon="print" color="grey" @click.native="print()" />
        <q-space />
        <q-btn :label="$tc('form.list')" icon-right="list" color="dark" :to="`${VIEW.resource.uri}?return`"/>
        <ux-btn-dropdown split color="blue-grey"
          @click="IS_EDITABLE ? $router.push(`${VIEW.resource.uri}/create`) : false"
          :options="[
            { label: $tc('form.add_new'), color:'green', icon: 'add',
              detail: $tc('messages.process_create'),
              hidden: !$app.can('packing-loads-create'),
              actions: () => {
                $router.push(`${VIEW.resource.uri}/create`)
              }
            },
            { label: 'DELETE', color:'red', icon: 'delete',
              detail: $tc('messages.process_delete'),
              hidden: !IS_EDITABLE || !$app.can('packing-loads-delete'),
              actions: () => {
                VIEW.delete()
              }
            }
        ]"/>
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
          api: '/api/v1/factories/packing-loads',
          uri: '/admin/factories/packing-loads',
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
    IS_EDITABLE () {
      if (this.rsView.deleted_at) return false
      return true
    }
  },
  methods: {
    init () {
      this.VIEW.load((data) => {
        this.setView(data || {})
      })
    },
    btnIcon (str) {
      return !this.$q.screen.lt.sm ? str : ''
    },
    print () {
      window.print()
    },
    getWorktime (val) {
      const worktimes = this.CONFIG.options['worktime']
      const v = worktimes.find(x => x.value === val)
      return v ? v.label : 'N/A'
    },
    setView (data) {
      this.rsView = data
    }
  }
}
</script>
