<template>
  <q-page padding class="form-page">
    <q-card inline class="main-box q-ma-sm" v-if="FORM.show">
      <q-card-section>
        <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
        </form-header>
      </q-card-section>
      <q-separator />
      <q-card-section class="row q-col-gutter-x-sm">
        <!-- COLUMN::1st customer Identitity -->

        <ux-select-filter class="col-12 col-sm-6"
          name="line_id"
          v-model="rsForm.line_id"
          :label="$tc('items.preline')"
          :disable="IssetWorkOrderItems"
          :options="LineOptions.filter(x => x.row.ismain)" clearable
          v-validate="'required'"
          :error="errors.has('line_id')"
          :error-message="errors.first('line_id')">
          <q-tooltip v-if="Boolean(IssetWorkOrderItems)" :offset="[0, 10]">To change, Please delete Work-Order items first!</q-tooltip>
        </ux-select-filter>

        <div class="col-12 col-sm-6">
          <div class="row q-col-gutter-sm">
            <ux-date name="date" type="date" class="col-12 col-sm-6"
              :label="$tc('label.date')" stack-label
              v-model="rsForm.date"
              v-validate="`required|date_format:yyyy-MM-dd` + FORM.ifCreate(`|after:${$app.moment().add(-1,'days').format('YYYY-MM-DD')}`,'')"
              :date-options="(date) => FORM.ifCreate(date >= $app.moment().format('YYYY/MM/DD'), true)"
              :error="errors.has('date')"
              :error-message="errors.first('date')">
            </ux-date>

            <q-select class="col-12 col-sm-6"
              name="shift_id"
              :label="$tc('label.shift')" stack-label
              v-model="rsForm.shift_id"
              :options="ShiftOptions" filter
              map-options emit-value
              v-validate="'required'"
              :error="errors.has('shift_id')"
            />

          </div>
        </div>
        <div class="col-12 row q-col-gutter-x-sm">
          <div class="col-12 col-sm-auto column q-pb-sm">
            <span class="text-small text-grey">Stockist Material</span>
            <q-btn-toggle spread class="no-shadow text-no-wrap" style="border:1px solid #027be3"
              v-model="rsForm.stockist_from"
              :disable="IssetWorkOrderItems"
              text-color="primary"
              :options="CONFIG.items['stockists'].map(x => ({...x, color:null})).filter(stockist => ['FM','NC','NCR'].indexOf(stockist.value) > -1 )"
            />
          </div>
          <div class="col-12 col-sm-auto column q-pb-sm">
            <span class="text-small text-grey">Line Filter</span>
            <q-btn-toggle spread class="no-shadow" style="border:1px solid #027be3"
              v-model="rsForm.mode_line"
              :disable="IssetWorkOrderItems"
              text-color="primary"
              :options="[
                {label: 'Single', value: 'SINGLE'},
                {label: 'Multiline', value: 'MULTI'},
                {label: 'All', value: 'ALL'}
              ]"
            />
          </div>
          <q-space />
          <div class="items-center col-12 col-sm-auto q-pb-sm column">
            <q-checkbox class="self-center"
              label="FG Direct"
              v-model="rsForm.stockist_direct"
              true-value="FG" :false-value="null"
              :disable="Boolean(rsForm.id)" />
          </div>
        </div>
        <div class="col-12">
          <q-markup-table dense bordered separator="horizontal"
            class="main-box no-shadow no-highlight"
          >
            <thead>
              <q-tr class="text-uppercase" style="line-height:30px">
                <q-th key="prefix"  style="width:50px"></q-th>
                <q-th key="item_id">{{$tc('items.part_name')}}</q-th>
                <q-th key="unit_id">{{$tc('label.unit')}}</q-th>
                <q-th key="target">{{$tc('label.quantity')}}</q-th>
                <q-th key="ngratio">%NG</q-th>
                <q-th key="hanger">Hanger</q-th>
                <q-th key="quantity">{{$tc('label.total')}}</q-th>
              </q-tr>
            </thead>
            <tbody>
              <q-tr v-for="(row, index) in rsForm.work_order_items" :key="index">
                <q-td key="prefix" class="q-py-none" style="width:50px">
                  <q-btn dense flat icon="clear" color="negative" tabindex="100" @click="removeItem(index)"/>
                </q-td>
                <q-td key="item_id" width="50%" >
                  <ux-select autofocus class="item-field"
                    :name="`work_order_items.${index}.item_id`"
                    :disable="!rsForm.line_id"
                    outlined dense hide-bottom-space color="blue-grey-4"
                    v-model="row.item"
                    v-validate="'required'"
                    filter map-options clearable
                    :source="`/api/v1/common/items?mode=all&--limit=10&has_stocks=${rsForm.stockist_from}&appends=&main_line=${rsForm.line_id}&mode_line=${rsForm.mode_line}`"
                    option-value="id"
                    option-label="part_name"
                    :option-sublabel="item => `[${item.customer_code}] ${item.part_subname}`"
                    popup-content-class="options-striped"
                    :error="errors.has(`work_order_items.${index}.item_id`)"
                    @input="(val) => setItemReference(index, val)">
                    <q-tooltip v-if="!rsForm.line_id" :offset="[0, 10]">Select a Pre-Line , first! </q-tooltip>
                    <small class="absolute-bottom text-weight-light" v-if="row.item">
                      [{{row.item.customer_code}}] {{row.item.part_subname || '--'}}
                    </small>
                  </ux-select>
                </q-td>
                <q-td key="unit_id"  width="15%">
                  <q-select
                    :name="`work_order_items.${index}.unit_id`"
                    v-model="row.unit_id"
                    outlined dense hide-bottom-space color="blue-grey-4"
                    :options="ItemUnitOptions[index]"
                    map-options  emit-value
                    v-validate="row.item_id ? 'required' : ''"
                    :error="errors.has(`work_order_items.${index}.unit_id`)"
                    :disable="!rsForm.line_id || !rsForm.work_order_items[index].item_id"
                    @input="(val) => setUnitReference(index, val)"
                  />
                </q-td>
                <q-td key="target"  width="15%">
                  <q-input style="min-width:70px"
                    :name="`work_order_items.${index}.target`"
                    type="number" :min="0" align="center"
                    v-model="row.target"
                    color="blue-grey-4"
                    outlined dense hide-bottom-space no-error-icon
                    v-validate="`required|gt_value:0`"
                    :error="errors.has(`work_order_items.${index}.target`)"
                    @input="() => { row.quantity = setQuantity(row)}"
                  />
                </q-td>
                <q-td key="ngratio"  width="15%">
                  <q-input  style="min-width:80px"
                    v-model="row.ngratio" type="number" min="0"
                    outlined dense hide-bottom-space no-error-icon align="right" suffix="%"
                    color="blue-grey-4"
                    v-validate="'required'"
                    :name="`work_order_items.${index}.ngratio`" data-vv-as="ngratio"
                    :error="errors.has(`work_order_items.${index}.ngratio`)"
                    :error-message="errors.first(`work_order_items.${index}.ngratio`)"
                    :disable="!rsForm.line_id || !rsForm.work_order_items[index].item_id"
                    @input="() => { row.quantity = setQuantity(row) }"
                    />
                </q-td>
                <q-td key="hanger"  width="15%">
                  <q-input style="min-width:80px"
                    outlined dense hide-bottom-space no-error-icon
                    color="blue-grey-4"
                    input-style="text-align:right"
                    :value="row.item && row.item.load_capacity ? Math.ceil(row.quantity / row.item.load_capacity) : '-'"
                    readonly
                  />
                </q-td>
                <q-td key="quantity"  width="25%">
                  <q-input style="min-width:150px"
                    :name="`work_order_items.${index}.quantity`" type="number"
                    color="blue-grey-6"
                    v-model="row.quantity" disable
                    outlined dense hide-bottom-space no-error-icon align="right"
                    v-validate="`required|gt_value:0|max_value:${unitValueMax(index, row)}`"
                    :error="errors.has(`work_order_items.${index}.quantity`)"
                    :suffix="' / '+ unitValueMax(index, row)"
                  >
                    <q-btn slot="after" dense flat icon="done_all"
                      v-if="!rsForm.id && unitValueMax(index, row) > 0"
                      v-show="unitValueMax(index, row) !== row.target"
                      @click="() => {
                        row.target = unitValueMax(index, row)
                        row.quantity = setQuantity(row)
                      }" />
                  </q-input>
                </q-td>
              </q-tr>
              <q-tr>
                <q-td></q-td>
                <q-td>
                  <q-btn dense outline :label="$tc('form.add')" icon="add_circle_outline" color="blue-grey" class="full-width" @click="addNewItem()" />
                </q-td>
                <q-td colspan="100%" align="right">
                  <span class="text-weight-medium" v-if="TotalHanger">
                    HANGER TOTAL {{ TotalHanger }}
                  </span>
                </q-td>
              </q-tr>
            </tbody>
          </q-markup-table>
        </div>
        <!-- COLUMN::4th Description -->
        <div class="col-12 cloumn q-mt-md">
          <q-input filled name="description" type="textarea" rows="3"
            stack-label :label="$tc('label.description')"
            v-model="rsForm.description"
          />

        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions >
        <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
        <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
        <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()"
          :disabled="FORM.data.is_relationship">
        </q-btn>
      </q-card-actions>
    </q-card>
      <q-inner-loading :showing="FORM.loading"><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
  </q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      SHEET: {
        // customers: { api: '/api/v1/incomes/customers?mode=all' },
        // items: { api: '/api/v1/common/items?mode=all', autoload: false },
        units: { api: '/api/v1/references/units?mode=all' },
        lines: { api: '/api/v1/references/lines?mode=all' },
        shifts: { api: '/api/v1/references/shifts?mode=all' }
      },
      FORM: {
        resource: {
          uri: '/admin/factories/work-orders',
          api: '/api/v1/factories/work-orders'
        }
      },
      rsForm: {},
      setDefault: () => {
        return {
          number: null,
          line_id: null,
          date: this.$app.moment().format('YYYY-MM-DD'),
          shift_id: null,
          stockist_from: 'FM',
          description: null,
          mode_line: 'ALL',
          stockist_direct: null,
          work_order_items: [
            {
              id: null,
              item_id: null,
              quantity: null,
              target: null,
              unit_id: null,
              unit_rate: 1,
              ngratio: 0,
              item: null,
              unit: null
            }
          ]
        }
      }
    }
  },
  created () {
    // Component Page Mounted!
    this.init()
  },
  computed: {
    IssetWorkOrderItems () {
      if (this.rsForm.work_order_items) {
        return this.rsForm.work_order_items.some((item) => item.item_id)
      }
      return false
    },
    LineOptions () {
      let data = this.SHEET.lines.data || []
      return data.map(line => ({ label: line.name, value: line.id, row: line }))
    },
    ShiftOptions () {
      return (this.SHEET.shifts.data.map(line => ({ label: line.name, value: line.id })) || [])
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemUnitOptions () {
      let vars = []

      for (const i in this.rsForm.work_order_items) {
        if (this.rsForm.work_order_items.hasOwnProperty(i)) {
          let rsItem = this.rsForm.work_order_items[i]
          vars[i] = (this.UnitOptions || [])
          vars[i] = vars[i].filter((unit) => {
            if (!rsItem.item_id) return false
            if (rsItem.item) {
              if (rsItem.item.unit_id === unit.value) return true
              if (rsItem.item.item_units) {
                let filtered = rsItem.item.item_units.filter((fill) => fill.unit_id === unit.value)
                if (filtered.length > 0) return true
              }
            }
            return false
          })
        }
      }
      return vars
    },
    MaxStock () {
      const stockist = this.rsForm.stockist_from

      let stockItem = []

      this.rsForm.work_order_items.map(detail => {
        if (detail.item && !stockItem[detail.item.id]) stockItem[detail.item.id] = detail.item
      })

      let moveItem = {
        set: function (id, val) {
          let vf = this
          if (!vf.hasOwnProperty(id)) vf[id] = 0
          vf[id] += Number(val)
        },
        get: function (id) {
          return this.hasOwnProperty(id) ? this[id] : 0
        }
      }

      this.FORM.data.work_order_items.map(item => {
        if (stockItem.hasOwnProperty(item.item_id)) {
          stockItem[item.item_id].totals[this.FORM.data.stockist_from] += Number(item.unit_amount)
        }
      })

      let data = {}
      this.rsForm.work_order_items.map((detail, index) => {
        if (stockItem[detail.item_id] && detail.item_id) {
          const summary = Number(stockItem[detail.item_id].totals[stockist] || 0) - Number(stockItem[detail.item_id].totals[`WO_${stockist}`] || 0)
          data[index] = summary - Number(moveItem.get(detail.item_id) || 0)
          moveItem.set(detail.item_id, detail.quantity * detail.unit_rate)
        }
      })

      return data
    },
    TotalHanger () {
      return this.rsForm.work_order_items.reduce((total, item) => {
        return total += (item.item && item.item.load_capacity ? Math.ceil(item.quantity / item.item.load_capacity) : 0)
      }, 0)
    },
    MAPINGKEY () {
      let variables = {
        'units': {}
      }

      // this.SHEET['customers'].data.map(value => { variables['customers'][value.id] = value })
      this.SHEET['units'].data.map(value => { variables['units'][value.id] = value })
      // this.SHEET['items'].data.map(value => { variables['items'][value.id] = value })

      return variables
    }
  },
  watch: {
    '$route': 'init'
  },
  methods: {
    init () {
      this.FORM.load((data) => {
        this.setForm(data || this.setDefault())
      })
    },
    setForm (data) {
      this.rsForm = JSON.parse(JSON.stringify(data))

      if (data.is_relationship) {
        let message = 'Data has been relationships.'
        this.$q.dialog({
          title: 'Work Order has Related',
          message: message,
          preventClose: true,
          ok: 'Direct to Detail Page',
          cancel: 'Continue'
        }).then(() => {
          this.$router.push(`${this.FORM.resource.uri}/${data.id}`)
        }).catch(() => {
          //
        })
      }
    },
    stockFormat (row, val = 0) {
      if (val < 0) return '(-)'
      val = Math.ceil(val)
      return this.$app.number_format(Number(val || 0) / Number(row.unit_rate || 1))
    },
    setQuantity (row) {
      const v = Number(row.target) + (Number(row.target) * Number(row.ngratio) / 100)
      return row.ngratio ? Math.ceil(v) : v
    },
    unitValueMax (index, row) {
      if (!row.unit_rate) return null
      const value = parseFloat((this.MaxStock[index] || 0) / (row.unit_rate || 1))
      if (row.unit && row.unit.decimal_in) {
        return value.toFixed(row.unit.decimal_in)
      }
      return value.toFixed(0)
    },
    loadItemOptions (data = this.rsForm) {
      let params = ['has_stocks=FM,NC,NCR']

      if (data.line_id) params.push(`main_line=${data.line_id}`)

      if (data.work_order_items && data.work_order_items.length > 0) {
        let ids = data.work_order_items.map(x => x.item_id)
        params.push(`or_ids=${ids.join(',')}`)
      }

      this.SHEET.load('items', params.join('&'))
    },
    setItemReference (index, val) {
      if (!val) {
        this.rsForm.work_order_items[index].unit_id = null
        this.rsForm.work_order_items[index].unit = null
        this.rsForm.work_order_items[index].item = null
      } else {
        this.rsForm.work_order_items[index].item_id = val.id
        let baseUnitID = val.unit_id
        this.rsForm.work_order_items[index].unit_id = baseUnitID
        this.rsForm.work_order_items[index].unit_rate = 1
        this.rsForm.work_order_items[index].unit = this.MAPINGKEY['units'][baseUnitID]
      }
    },
    setUnitReference (index, val) {
      if (!val) return
      this.rsForm.work_order_items[index].unit = this.MAPINGKEY['units'][val]

      if (this.rsForm.work_order_items[index].item.unit_id === val) {
        this.rsForm.work_order_items[index].unit_rate = 1
      } else {
        if (this.rsForm.work_order_items[index].item.item_units) {
          this.rsForm.work_order_items[index].item.item_units.find((unitItem) => {
            if (unitItem.unit_id === val) {
              this.rsForm.work_order_items[index].unit_rate = unitItem.rate
              return true
            }
          })
        }
      }
    },
    addNewItem () {
      let newEntri = this.setDefault().work_order_items[0]

      this.rsForm.work_order_items.push(newEntri)
    },
    removeItem (itemIndex) {
      this.rsForm.work_order_items.splice(itemIndex, 1)
      if (this.rsForm.work_order_items.length < 1) this.addNewItem()
    },
    onSave () {
      this.$validator.validate().then(result => {
        if (!result) {
          this.$q.notify({
            color: 'negative',
            icon: 'error',
            position: 'top-right',
            timeout: 3000,
            message: this.$tc('messages.to_complete_form')
          })
          return
        }

        this.FORM.loading = true
        let { method, apiUrl } = this.FORM.meta()
        this.$axios.set(method, apiUrl, this.rsForm)
          .then((response) => {
            let message = response.data.number + ' - #' + response.data.id
            this.FORM.response.success({ message: message })
            this.FORM.toView(response.data.id)
          })
          .catch((error) => {
            this.FORM.response.fields(error.response)
            this.FORM.response.error(error.response || error, this.$tc('messages.fail', 1, { v: this.$tc('form.save') }).toUpperCase())
          })
          .finally(() => {
            this.FORM.loading = false
          })
      })
    }
  }
}
</script>

<style lang="stylus">
.fit-input.q-field
  .q-field__control,
  .q-field__native
    min-height 24px !important

  .q-field__control, .q-field__marginal
    height 36px
    padding 0 6px
  .q-field__native, .q-field__prefix, .q-field__suffix
    line-height 24px

  .q-select__input
    line-height 24px

.item-field .q-field__control-container
  .q-field__native
    padding 3px 0
    align-items flex-start

  .absolute-bottom
    padding-bottom 2px
</style>
