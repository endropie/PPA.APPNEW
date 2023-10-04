<template>
  <q-page class="row justify-center" :dark="LAYOUT.isDark" style="min-width:210mm;">
    <div style="max-width:210mm;">
      <div class="print-hide q-my-md full-width">
        <!-- {{printer}} -->
        <q-select class="fit"
          :hint="`${$tc('general.line')}`"
          v-model="printer"
          dense outlined multiple use-chips
          :options="rsView.MAPLINES.map(x => ({label: x.name, value:x.id}))"
          map-options emit-value
          :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
          v-if="rsView.MAPLINES">
          <q-btn slot="after" icon="print" color="grey" @click.native="print()" />
        </q-select>
      </div>
      <template v-for="(group , index) in rsView.MAPLINES">
      <page-print class=" shadow-2 q-mb-md" :class="{'multi-page':rsView.MAPLINES.length > 1}" :key="index" v-show="printer.indexOf(group.id) > -1">
        <div slot="header-tags" class="print-hide">
          <ux-chip-status :row="rsView" tag outline small square icon='bookmark' />
        </div>
        <span slot="header-subtitle" style="font-size:16px">Planing & Production Control Division</span>
        <div slot="footer" class="text-center fixed-bottom print-only">== PPC ==</div>

        <div class="row q-col-gutter-xs" >
          <div class="col-12">
            <div class="row justify-between q-col-gutter-sm" >
              <div class="col-auto self-end">
                <span class="text-h6 text-center q-pt-lg q-pl-sm">WORK ORDER</span>

                <q-markup-table dense class="super-dense no-shadow transparent" separator="none" :dark="LAYOUT.isDark">
                  <tbody>
                    <tr>
                      <td class="text-uppercase">{{$tc('general.line')}}</td><td>{{ group.name }}</td>
                    </tr>
                    <tr>
                      <td class="text-uppercase">Material of</td><td>{{ getStockistFrom(rsView.stockist_from) }}</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
              <div class="col-auto">
                <q-markup-table bordered dense square class="super-dense no-shadow transparent" separator="cell" :dark="LAYOUT.isDark">
                  <tbody>
                    <tr>
                      <td>{{$tc('label.number')}}</td>
                      <td>
                        {{rsView.fullnumber || rsView.number}}
                      </td>
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
            <q-markup-table bordered dense class="no-shadow table-print" separator="cell" >
              <thead>
                <tr>
                  <th>{{$tc('general.cust')}}</th>
                  <th class="text-left">{{$tc('label.name', 1, {v:$tc('label.part')})}}</th>
                  <th class="text-left">{{$app.setting('item.subname_label')}}</th>
                  <th class="text-right">{{$tc('label.quantity')}}</th>
                  <th>{{$tc('label.unit')}}</th>
                  <th>%NG</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody v-for="(row, index) in group.work_order_items" :key="index">
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
                  <q-td key="target" class="text-right">
                    {{row.target}}
                  </q-td>
                  <q-td key="unit_id" class="text-left">
                    {{row.unit.code}}
                  </q-td>
                  <q-td key="ngratio" class="text-right">
                    {{row.ngratio}}
                  </q-td>
                  <q-td key="quantity" class="text-right">
                    {{row.quantity}}
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
      </page-print>
      </template>

    </div>
    <q-inner-loading :showing="VIEW.loading">
        <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script>

import MixView from 'src/mixins/mix-view.vue'
import PagePrint from 'components/page-print'
import PagePrintBreak from 'components/page-print-break'

export default {
  mixins: [MixView],
  components: { PagePrint },
  data () {
    return {
      VIEW: {
        resource:{
          api: '/api/v1/factories/work-orders',
          uri: '/admin/factories/work-orders',
          params: '?mode=prelines'
        }
      },
      rsView: {},
      printer: [],
    }
  },
  created() {
    this.init()
  },
  computed: {
    IS_VOID() {
      if (this.IS_EDITABLE) return false
      if (this.rsView.deleted_at) return false
      if (['VOID'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_EDITABLE() {
      if (this.rsView.deleted_at) return false
      if (this.rsView.status !== 'OPEN') return false
      if (this.rsView.hasOwnProperty('has_relationship') && this.rsView.has_relationship.length > 0) return false

      return true
    },
  },
  methods: {
    init() {
      this.VIEW.load((data) => {
        this.setView(data || {})
      })
    },
    print() {
      window.print()
    },
    getStockistFrom(val) {
      const stockist = [
        {value: 'FM', label: 'FRESH'},
        {value: 'NC', label: 'NC-REPAIR',  color: 'warning' },
        {value: 'NCR', label: 'NCR-REPAIR',  color: 'orange-8' },
      ]
      const v = stockist.find(x => x.value === val)
      return v ? v.label : 'N/A'

    },
    setValidation() {
      this.$router.push(`/admin/factories/work-process/${this.ROUTE.params.id}/edit`)
    },
    setView(data) {

      const setDetail = (id) => {
      return data.work_order_items.find((x) => x.id === id) || {}
      }
      let GROUP = Object.assign({})
      data.work_order_item_lines.map((rs) => {
        if(!GROUP[rs.line_id]) GROUP[rs.line_id] = {...rs.line, work_order_items:[] }

        GROUP[rs.line_id].work_order_items.push(setDetail(rs.work_order_item_id))
        // for (let z = 0; z < 40; z++) {
        //   GROUP[rs.line_id].work_order_items.push({...setDetail(rs.work_order_item_id), id:String(rs.work_order_item_id).concat(z)})
        // }
      })
      this.rsView =  {...data, MAPLINES: Object.values(GROUP)}
      this.printer = [...Object.values(GROUP)].map(x => x.id)
    }
  }
}
</script>
