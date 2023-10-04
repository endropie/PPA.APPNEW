<template>
  <q-page padding class="row justify-center" >
    <page-print v-if="VIEW.show" class="q-pa-md q-pr-lg shadow-2">
      <div class="row justify-between q-gutter-y-sm" >
        <div class="self-end">
          <div class="q-pa-lg text-h6 text-uppercase">Forecast Loading</div>
        </div>
        <div class="text-subtitle2">
          <q-markup-table dense flat bordered separator="none" class="no-highlight" style="width:300px">
            <tbody>
              <tr>
                <td width="30%" class="text-uppercase" >{{ $tc('label.no', 1, {v: 'Remaks'}) }}</td>
                <td width="70%" class=""> {{ rsView.number }} </td>
              </tr>
              <tr>
                <td width="30%" class="text-uppercase">{{ $tc('label.period') }}</td>
                <td width="70%" class="">{{ rsView.period ? $app.moment(rsView.period.period).format('MMMM YYYY') : '-' }}</td>
              </tr>
              <tr>
                <td width="30%" class="text-uppercase">{{ $tc('label.estimate') }}</td>
                <td width="70%" class="">{{ rsView.period ? `${rsView.period.days} ${$tc('label.day')}`  : '-' }} </td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
        <div class="col-12">
          <q-markup-table dense flat bordered separator="none" class="no-highlight">
            <thead class="bg-grey-4">
              <tr class="text-uppercase" style="line-height:1.8rem">
                <th width="50%" name="code" class="text-left"> Line </th>
                <th width="10%" name="capacity" class="text-right">{{ $tc('label.capacity') }}</th>
                <th width="10%" name="amount" class="text-right">{{ $tc('label.amount') }}</th>
                <th width="10%" name="1-shift" class="text-center"> 1-shift </th>
                <th width="10%" name="2-shift" class="text-center"> 2-shift </th>
                <th width="10%" name="3-shift" class="text-center"> 3-shift </th>
                <th class="no-padding"></th>
              </tr>
            </thead>
            <tbody v-for="(line, lineKey) in LINE_ROWS" :key="lineKey" style="line-height:1.5rem">
              <tr class="row-line text-subtitle2" style="line-height:1.8rem">
                <td class="text-left">{{ line.line_name }}</td>
                <td class="text-right">{{ $app.number_format(line.capacity, 0) }}</td>
                <td class="text-right">{{ $app.number_format(LINE_AMOUNTS[lineKey], 0) }}</td>
                <td class="text-center">{{ line.capacity ? `${$app.number_format(LINE_AMOUNTS[lineKey] / line.capacity / 1 * 100, 0)}%` : '-' }}</td>
                <td class="text-center">{{ line.capacity ? `${$app.number_format(LINE_AMOUNTS[lineKey] / line.capacity / 2 * 100, 0)}%` : '-' }}</td>
                <td class="text-center">{{ line.capacity ? `${$app.number_format(LINE_AMOUNTS[lineKey] / line.capacity / 3 * 100, 0)}%` : '-' }}</td>
                <td class="no-padding">
                  <!-- [{{ mores }}] -->
                  <div class="print-hide">
                    <q-btn dense flat color="blue-grey" icon="add" @click="mores.push(lineKey)" v-if="mores.indexOf(lineKey) < 0" />
                    <q-btn dense flat color="blue-grey" icon="remove" @click="mores = mores.filter(x => x !== lineKey)" v-else />
                  </div>
                </td>
              </tr>
              <tr v-if="line.rows.length && mores.indexOf(lineKey) > -1">
                <td colspan="100%" class="no-padding" style="border-bottom-width: 1px">
                  <q-markup-table dense flat square separator="horizontal" class=" no-highlight">
                    <thead class="bg-grey-2">
                      <tr class="text-uppercase text-grey" style="line-height:1rem">
                        <th width="10%" class="text-left">code</th>
                        <th width="35%" class="text-left">Part name</th>
                        <th width="35%" class="text-left">Part subname</th>
                        <th width="20%" class="text-right">{{ $tc('label.amount') }}</th>
                        <th width="10%" class="text-left">Unit</th>
                        <th width="30%" colspan="2" class="text-center">Load</th>
                        <th width="10%" class="text-left">Unit</th>
                      </tr>
                    </thead>
                    <tbody class="bg-grey-1">
                      <tr v-for="(item, itemKey) in line.rows" :key="itemKey" style="line-height:1rem">
                        <td class="text-left">{{ item.item_code }}</td>
                        <td class="text-left">{{ item.item_part_name }}</td>
                        <td class="text-left">{{ item.item_part_subname }}</td>
                        <td class="text-right">{{ $app.number_format(item.amount, 0) }}</td>
                        <td class="text-left">{{ item.unit_code }}</td>
                        <td class="text-right">
                            {{ $app.number_format(item.amount_load, 0) }}
                            <span class="text-small text-light">/{{ $tc('label.month') }}</span>
                        </td>
                        <td class="text-right">
                          {{ $app.number_format(item.amount_load/(rsView.period.days || 1), 0) }}
                          <span class="text-small text-light">/{{ $tc('label.day') }}</span>
                        </td>
                        <td class="text-left">{{ item.item_load_type }}</td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
      <q-space />
      <div class="relative q-gutter-xs print-hide" style="padding-top:50px; bottom:0">
        <q-btn :label="$tc('form.back')" :icon-right="btnIcon('cancel')"  color="dark" :to="`${VIEW.resource.uri}?return`" />
        <q-btn :label="$tc('form.print')" :icon-right="btnIcon('print')" color="grey" @click.native="print()" />
        <q-btn :label="$tc('form.delete')" :icon-right="btnIcon('delete')" color="negative" @click="VIEW.delete" outline
          :class="{'float-right':$q.screen.gt.md}" />
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
      mores: [],
      VIEW: {
        data: {},
        resource: {
          api: '/api/v1/incomes/forecast-loads',
          uri: '/admin/incomes/forecast-loads'
        }
      },
      rsView: {},
      count: 0
    }
  },
  created () {
    this.init()
  },
  watch: {
    '$route': 'init'
  },
  computed: {
    LINE_ROWS () {
      if (!this.rsView) return []
      return Object.values(this.rsView.forecast_load_items.reduce(function (group, item) {
        group[item.line_id] = group[item.line_id] || { line_id: item.line_id, line_name: item.line_name, capacity: item.capacity, rows: [] }
        group[item.line_id].rows.push(item)
        return group
      }, {}))
    },
    LINE_AMOUNTS () {
      return this.LINE_ROWS.map(x => {
        return x.rows.reduce((sum, item) => sum + item.amount_load, 0)
      })
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
    setView (data) {
      this.rsView = data
    }
  }
}
</script>
<style lang="stylus">
.row-line td
  border-bottom-width 1px
</style>
