<template>
  <q-page padding class="page-index" >
    <q-table ref="table" inline class="table-index table-striped th-uppercase" color="primary"
      :data="TABLE.rowData"
      :columns="TABLE.columns"
      row-key="union_key"
      hide-pagination
      :rows-per-page-options="[0]"
    >

      <!-- Table Header -->
      <template v-slot:top>
        <table-header hide-search
          :TABLE.sync="TABLE"
          :menus="[]">

          <div class="column" >
            <div class="row q-mb-sm" v-if="FILTER.item">
              <span class="text-h6">
                {{!$q.screen.lt.sm ? 'STOCKCARD' : ''}} #{{ FILTER.item.code }}
              </span>
              <q-space />
              <span  style="line-height: normal">
                {{FILTER.item.part_name}} <br/>
                <small class="text-grey">[{{FILTER.item.customer_code}}] {{FILTER.item.part_subname}}</small>
              </span>
            </div>
            <div class="row q-mb-sm" v-else>
              <span class="text-h6">
                STOCKCARD
              </span>
            </div>
            <div :class="$q.screen.lt.md ? 'column q-gutter-xs' : 'row q-col-gutter-xs'" class="q-pb-xs">
              <ux-date class="col" style="min-width:150px"
                stack-label :label="$tc('label.date')"
                v-model="FILTER.begin_date" type="date"  clearable
                dense hide-bottom-space
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
              />
              <ux-date class="col" style="min-width:150px"
                stack-label :label="$tc('label.date')"
                v-model="FILTER.until_date" type="date"  clearable
                dense hide-bottom-space
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
              />

              <ux-select class="col"
                v-model="FILTER.item" clearable
                :label="$tc('general.item')" stack-label
                :placeholder="$tc('form.select', 1, {v:$tc('general.item')})"
                dense hide-bottom-space hide-dropdown-icon
                standout="bg-blue-grey-5 text-white"
                :bg-color="$q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1'"
                filter
                source="/api/v1/common/items?mode=all&--limit=20"
                option-value="id"
                option-label="part_name"
                :option-sublabel="(item) => `[${item.customer_code}] ${item.part_subname}`"
                @input="reset"
              />

              <div class="col-auto" :class="{'col text-right' : $q.screen.lt.md }" >
                <q-btn class="q-pa-xs" dense icon="search" color="blue-grey-14"
                  :label="$q.screen.lt.md ? 'Filter' : undefined"
                  :disable="!(FILTER.item && FILTER.begin_date && FILTER.until_date)"
                  @click="FILTER.submit"
                />
              </div>
            </div>

          </div>
        </table-header>
      </template>

      <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">
        <!-- {{rs}} -->
      </q-td>

      <q-td slot="body-cell-item" slot-scope="rs" :props="rs" style="width:35px">
        <div class="column" v-if="rs.row.item">
          <span>{{rs.row.item.part_name}}</span>
          <span class="text-weight-light">[{{rs.row.item.customer_code}}] <font>{{rs.row.item.part_subname}}</font></span>
        </div>
      </q-td>

      <q-td slot="body-cell-saldo" slot-scope="rs" :props="rs">
        <!-- {{rs.rowIndex}} -->
        <span v-if="FILTER.item">
          {{ getRowSaldo(rs.rowIndex) }}
        </span>
      </q-td>

      <template v-slot:top-row v-if="FILTER.item && FILTER.item.hasOwnProperty('begining')">
        <q-tr class="bg-blue-grey-2 text-weight-medium">
          <q-td key="prefix"></q-td>
          <q-td colspan="3" class="text-uppercase text-weight-medium">
            {{$tc('items.stock_previous')}}
          </q-td>
          <q-td key="quantity_in" align="right"></q-td>
          <q-td key="quantity_out" align="right"></q-td>
          <q-td key="saldo" align="right">
            {{ FILTER.item.begining }}
          </q-td>
        </q-tr>
      </template>

      <template v-slot:bottom-row>
        <q-tr class="" v-if="TABLE.rowData.length && !FILTER.unmore">
          <td key="prefix"></td>
          <td colspan="100%" align="center">
            <q-btn dense flat no-caps label="LOAD MORE ..." @click="fetch(TABLE.rowData.length)" />
          </td>
        </q-tr>
        <q-tr class="bg-blue-grey-2 text-weight-medium" v-if="TABLE.rowData.length && FILTER.item">
          <q-td key="prefix" colspan="3"></q-td>
          <q-td key="part_name" class="text-right">{{ $tc('label.grandtotal') }}</q-td>
          <q-td key="quantity_in" align="right">
            <span v-if="FILTER.item.summary_incoming !== undefined">
              {{ FILTER.item.summary_incoming }}
            </span>
          </q-td>
          <q-td key="quantity_out" align="right">
            <span  v-if="FILTER.item.summary_outgoing !== undefined">
              {{ FILTER.item.summary_outgoing }}
            </span>
          </q-td>
          <q-td key="saldo"></q-td>
        </q-tr>
      </template>
    </q-table>

  </q-page>
</template>

<script>
import MixIndex from 'src/mixins/mix-index.vue'

export default {
  mixins: [MixIndex],
  data () {
    return {
      FILTER: {
        begin_date: this.$app.moment().startOf('month').format('YYYY-MM-DD'),
        until_date: this.$app.moment().endOf('month').format('YYYY-MM-DD'),
        item: null,
        unmore: false,
        take: 20,
        submit: () => {
          this.fetch()
        }
      },
      TABLE: {
        mode: 'index',
        resource: {
          api: '/api/v1/common/items/delivery-cards',
          uri: '/admin/deliveries/reports/delivery-stockcard'
        },
        columns: [
          { name: 'prefix', label: '', align: 'left' },
          { name: 'date', label: this.$tc('label.date'), field: 'date', format: (v) => this.$app.moment(v).format('DD/MM/YYYY'), align: 'left' },
          { name: 'number', label: this.$tc('label.number'), field: (rs) => rs.fullnumber || rs.number, align: 'left', sortable: false },
          { name: 'spacer', label: '' },
          {
            name: 'quantity_in',
            label: this.$tc('label.incoming'),
            style: 'width:15%',
            field: (rs) => rs.quantity_in,
            format: (v) => v === 0 ? '' : this.$app.number_format(v),
            sortable: false
          },
          {
            name: 'quantity_out',
            label: this.$tc('label.outgoing'),
            style: 'width:15%',
            field: (rs) => rs.quantity_out,
            format: (v) => v === 0 ? '' : this.$app.number_format(v),
            sortable: false
          },
          { name: 'saldo', label: this.$tc('label.saldo'), style: 'width:15%', sortable: false }
        ]
      }
    }
  },
  created () {
    // this.INDEX.load()
    // this.load()
  },
  methods: {
    more (response) {
      response.data.data.map(item => {
        if (!this.TABLE.rowData.find(x => x.id === item.id && x.number === item.number)) {
          this.TABLE.rowData.push(item)
        }
      })
    },
    reset () {
      this.FILTER.unmore = false
      this.TABLE.rowData = []
    },
    fetch (skip = 0) {
      if (!skip) this.FILTER.unmore = false

      const date = [this.FILTER.begin_date, this.FILTER.until_date].join(',')
      const itemid = this.FILTER.item ? this.FILTER.item.id : ''
      const url = `${this.TABLE.resource.api}?date=${date}&item_id=${itemid}&skip=${skip}&take=${this.FILTER.take}`

      this.$q.loading.show()
      this.$axios.get(url)
        .then((response) => {
          if (skip) this.more(response)
          else this.TABLE.rowData = response.data.data

          if (this.FILTER.item) {
            this.FILTER.item.begining = response.data.begining
            this.FILTER.item.summary_incoming = response.data.summary_incoming
            this.FILTER.item.summary_outgoing = response.data.summary_outgoing
          }

          if (!response.data.data.length || response.data.data.length < this.FILTER.take) {
            this.FILTER.unmore = true
          }
        })
        .catch((error) => {
          this.$app.response.error(error.response || error)
        })
        .finally(() => {
          this.$q.loading.hide()
        })
    },
    getRowSaldo (rowIndex) {
      return this.TABLE.rowData.reduce((total, item, key) => {
        return total += (key <= rowIndex ? (item.quantity_in - item.quantity_out) : 0)
      }, 0) + this.FILTER.item.begining
    }
  }
}
</script>

<style lang="stylus">
.status-chip, .status-chip-badge
  height: 20px
.status-chip
  margin :2px
.status-chip-badge
  position: relative;
  right: -6px;
  border-bottom-left-radius: 0
  border-top-left-radius: 0
