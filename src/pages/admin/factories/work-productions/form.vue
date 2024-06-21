<template>
  <q-page padding class="form-page">
    <q-card inline class="main-box q-ma-sm" v-if="FORM.show">
      <q-card-section>
        <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
        </form-header>
      </q-card-section>
      <q-separator />
      <q-card-section class="row q-col-gutter-x-lg">
        <!-- COLUMN::1st customer Identitity -->
        <div class="col-12 col-sm-6">
          <div class="row q-col-gutter-x-sm">
            <ux-select-filter class="col-12"
              name="line_id"
              :label="$tc('items.preline')"
              v-model="rsForm.line_id"
              v-validate="'required'"
              :disable="IssetDetails"
              :options="LineOptions" clearable
              :error="errors.has('line_id')"
              :error-message="errors.first('line_id')"
              @input="(val) => val ? loadItemOptions() : false"
            />

          </div>
        </div>
        <div class="col-12 col-sm-6">
          <div class="row q-col-gutter-x-sm">
            <ux-date name="date" type="date" class="col-12" style="min-width:200px"
              :label="$tc('label.date')" stack-label
              v-model="rsForm.date"
              v-validate="`required|date_format:yyyy-MM-dd` + FORM.ifCreate(`|before:${$app.moment().add(2,'days').format('YYYY-MM-DD')}|after:${$app.moment().add(-2,'days').format('YYYY-MM-DD')}`,'')"
              :date-options="(date) => FORM.ifCreate(date < $app.moment().add(2, 'days').format('YYYY/MM/DD') && date > $app.moment().add(-2, 'days').format('YYYY/MM/DD'), true)"
              :error="errors.has('date')"
              :error-message="errors.first('date')"
              :disable="IssetDetails"
              debounce="1000"
              @input="(val) => val ? loadItemOptions() : false" >

              <q-select slot="after" class="no-padding" style="min-width:80px"
                name="shift_id"
                :label="$tc('label.shift')" stack-label
                v-model="rsForm.shift_id"
                v-validate="'required'"
                :disable="IssetDetails"
                :options="ShiftOptions" map-options emit-value
                :error="errors.has('shift_id')"
                @input="(val) => val ? loadItemOptions() : false"
              />
            </ux-date>
          </div>
        </div>
        <div class="col-12">
          <div class="main-box">
            <div v-for="(row, index) in rsForm.work_production_items" class="q-pa-xs col-12 col-sm-12" :key="index">
              <q-card class="main-box">
                <q-card-section class="items-center row no-wrap q-py-xs">
                    <div class="col">
                      <div class="text-subtitle2">{{$tc('general.item')}}
                        <q-badge :label="index+1" color="blue-grey" v-if="index>0" />
                      </div>
                    </div>
                    <div class="col-auto">
                      <q-btn dense flat round color="negative" icon="clear" tabindex="100" @click="removeItem(index)"/>
                    </div>
                </q-card-section>
                <q-card-section class="row q-col-gutter-sm">

                  <ux-select filter dense class="col-12 col-md-6" autofocus
                    :name="`work_production_items.${index}.item_id`"
                    :label="$tc('items.part_name')" stack-label
                    outlined color="blue-grey-4"
                    hide-bottom-space hide-dropdown-icon
                    v-model="row.item"
                    v-validate="'required'"
                    :disable="!DetailRequired || Boolean(row.stockist)"
                    :options="ItemOptions" clearable
                    option-value="id"
                    option-label="part_name"
                    :option-sublabel="item => `[${item.customer_code}] ${item.part_subname}`"
                    :option-disable="item => !Boolean(item.enable)"
                    popup-content-class="options-striped"
                    :error="errors.has(`work_production_items.${index}.item_id`)"
                    :loading="SHEET['work_order_items'].loading || SHEET['work_order_items'].loading"
                    @input="(val) => setItemReference(index, val)"
                  />

                  <ux-select-filter dense class="col-12 col-md-6"
                    :name="`work_production_items.${index}.work_order_item_id`"
                    :label="$tc('general.work_production')" stack-label
                    v-model="row.work_order_item_id"
                    v-validate="'required'"
                    outlined color="blue-grey-4"
                    no-error-icon hide-bottom-space hide-dropdown-icon
                    :disable="!DetailRequired"
                    :options="WorkOrderItemOptions.filter(x => x.item_id === row.item_id && x.stockist === row.stockist)" clearable
                    :error="errors.has(`work_production_items.${index}.work_order_item_id`)"
                    :loading="SHEET['work_order_items'].loading">
                      <q-select slot="before" class="no-padding" style="min-width:120px"
                        :name="`work_production_items.${index}.stockist`"
                        :label="$tc('items.stockist').toUpperCase()" hide-dropdown-icon
                        use-chips outlined no-error-icon
                        v-model="row.stockist" emit-value map-options
                        v-validate="'required'"
                        :options="StockistOptions"
                        :error="errors.has(`work_production_items.${index}.stockist`)"
                        @input="row.work_order_item_id = null"/>
                  </ux-select-filter>

                  <q-input dense readonly tabindex="100" class="col-12 col-md-6"
                    :label="$app.setting('item.subname_label')" stack-label
                    :value="row.item ? row.item.part_subname : null"
                    outlined hide-bottom-space color="blue-grey-5"
                  />

                  <ux-numeric dense class="col-12 col-sm-8 col-md-4" style="min-width:120px"
                    :options="{ decimalPlaces: row.unit ? row.unit.decimal_in : 0 }"
                    :name="`work_production_items.${index}.quantity`"
                    :label="$tc('label.quantity')" stack-label
                    color="blue-grey-6"
                    v-model="row.quantity" min="0"
                    outlined hide-bottom-space no-error-icon align="right"
                    v-validate="`required|gt_value:0|max_value:${$app.number_format(1000* MaxStock[index] / (row.unit_rate||1), ($app.get(row, 'unit.decimal_in') || 0), '.', '')}`"
                    :error="errors.has(`work_production_items.${index}.quantity`)"
                    :suffix=" ` / ${$app.number_format(MaxStock[index] / (row.unit_rate||1), ($app.get(row, 'unit.decimal_in') || 0))}`"
                  />

                  <q-select dense class="col-12 col-sm-4 col-md-2"
                    :name="`work_production_items.${index}.unit_id`"
                    :label="$tc('label.unit')" stack-label
                    v-model="row.unit"
                    v-validate="row.item_id ? 'required' : ''"
                    outlined hide-bottom-space color="blue-grey-4"
                    :options="ItemUnitOptions[index]"
                    option-value="id"
                    option-label="code"
                    :error="errors.has(`work_production_items.${index}.unit_id`)"
                    :disable="!DetailRequired || !row.item_id"
                    @input="(val) => setUnitReference(index, val)"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-btn outline dense color="blue-grey" :label="$tc('form.add')" icon="add_circle_outline" class="q-mt-md full-width" @click="addNewItem()" />
        </div>
        <!-- COLUMN::4th Description -->
        <div class="col-12 column q-gutter-md q-pt-md">
          <q-input name="description" type="textarea" rows="3"
            stack-label :label="$tc('label.description')"
            filled
            v-model="rsForm.description"
          />
          <q-field borderless dense v-if="ROUTE.meta.mode === 'create'"
            :error="errors.has('multiple')"
            :error-message="errors.first('multiple')">
            <q-checkbox slot="prepend" v-model="rsForm.isMultiple" />
            <span slot="prepend" class="text-subtitle2">Multiple Hanger / Barel</span>
            <template slot="prepend">
              <q-input type="number" dense outlined no-error-icon
                class="q-mx-md no-padding"
                input-style="width:60px;text-align:center"
                name="multiple"
                v-model="rsForm.multiple"
                v-validate="`required|gt_value:1|${ValidMultiple}`"
                v-if="rsForm.isMultiple"
                :error="errors.has('multiple')" />
            </template>
          </q-field>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions >
        <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" :disable="$q.loading.isActive" />
        <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)" />
        <q-space />
        <q-btn :label="$tc('form.list')" icon-right="list" color="dark" :to="`${FORM.resource.uri}?return`"/>
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
        customers: { api: '/api/v1/incomes/customers?mode=all' },
        units: { api: '/api/v1/references/units?mode=all' },
        lines: { api: '/api/v1/references/lines?mode=all' },
        shifts: { api: '/api/v1/references/shifts?mode=all' },
        work_order_items: { autoload: false, api: '/api/v1/factories/work-orders?mode=items&has_amount_production=true' }
      },
      FORM: {
        resource: {
          uri: '/admin/factories/work-productions',
          api: '/api/v1/factories/work-productions'
        }
      },
      rsForm: {},
      setDefault: () => {
        return {
          isMultiple: false,
          multiple: null,
          number: null,
          line_id: null,
          date: this.$app.moment().format('YYYY-MM-DD'),
          shift_id: null,
          description: null,
          work_production_items: [
            {
              id: null,
              stockist: null,
              item_id: null,
              quantity: null,
              target: null,
              unit_id: null,
              unit_rate: 1,
              ngratio: 0,
              item: null,
              unit: null,
              work_order_item_id: null
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
    DetailRequired () {
      return Boolean(this.rsForm.line_id && this.rsForm.date && this.rsForm.shift_id)
    },
    IssetDetails () {
      if (this.rsForm.work_production_items) {
        return this.rsForm.work_production_items.some((item) => item.item_id)
      }
      return false
    },
    WorkOrderItemOptions () {
      if (!this.rsForm.line_id) return []
      if (!this.SHEET['work_order_items'].data.length) return []

      const hasold = (id) => (this.FORM.data.work_production_items)
        ? this.FORM.data.work_production_items.find(x => x.work_order_item_id === id) : null

      let Item = []
      let data = this.SHEET['work_order_items'].data.filter(detail => {
        if (this.rsForm.line_id !== detail.work_order.line_id) return false

        if (hasold(detail.id)) {
          const old = hasold(detail.id)
          if (Number(detail.unit_amount) <= (Number(detail.amount_process) - Number(old.unit_amount))) return false
        }

        if (!Item.find(x => x === (detail.item_id || null))) Item.push(detail.item_id)
        return true
      })

      // if (Item.length) this.SHEET.load('items', `or_ids=${Item.join(',')}`)

      return data
        .map(detail => {
          const wo = detail.work_order || {}

          let total = Number(detail.unit_amount) - Number(detail.amount_process)
          const old = hasold(detail.id)
          if (old) total += Number(old.unit_amount)

          if (detail.unit_rate) total = total / detail.unit_rate
          return ({
            label: wo.fullnumber || wo.number,
            sublabel: `${this.$app.moment(wo.date).format('DD/MM/YYYY')} [SHIFT ${wo.shift_id}]`,
            value: detail.id,
            stamp: this.$app.number_format(total),
            item_id: (detail.item_id || null),
            stockist: (wo.stockist_from),
            rowdata: detail
          })
        })
    },
    StockistOptions () {
      return this.CONFIG.items['stockists'].filter(stockist => ['FM', 'NC', 'NCR'].indexOf(stockist.value) > -1)
    },
    LineOptions () {
      let data = this.SHEET.lines.data || []
      return data.map(line => ({ label: line.name, value: line.id, row: line }))
    },
    ShiftOptions () {
      return (this.SHEET.shifts.data.map(line => ({ label: line.name, value: line.id })) || [])
    },
    UnitOptions () {
      return (this.SHEET.units.data || [])
    },
    ItemOptions () {
      if (this.SHEET.work_order_items.length <= 0) return []

      return this.SHEET.work_order_items.data.map(detail => ({
        ...detail.item,
        label: detail.item.part_name,
        sublabel: `[${detail.item.customer_code}] ${detail.item.part_subname}`
      }))
    },
    ItemUnitOptions () {
      return this.rsForm.work_production_items.map(detail => {
        return this.UnitOptions
          .filter(unit => {
            if (!detail.item) return false
            if (unit.id === detail.item.unit_id) return true
            return detail.item.item_units.filter(x => x.unit_id === unit.id).length
          })
          .map(unit => {
            if (unit.id === detail.item.unit_id) return ({ ...unit, rate: 1 })
            const converter = detail.item.item_units.find(x => x.unit_id === unit.id)
            if (converter) {
              return ({ ...unit, rate: converter.rate })
            }
          })
      })
    },
    ValidMultiple () {
      if (!this.rsForm.multiple) return ''

      let failed = this.rsForm.work_production_items.some((x, i, a) => {
        return (x.quantity * x.unit_rate * this.rsForm.multiple) > this.MaxStock[i]
      })
      return failed ? `is_not:${this.rsForm.multiple}` : ``
    },
    MaxStock () {
      let stockItem = {}
      let moveItem = {
        set: function (id, val) {
          var fm = this
          if (!fm.hasOwnProperty(id)) fm[id] = 0
          fm[id] += Number(val)
        },
        get: function (id) {
          var fm = this
          return fm.hasOwnProperty(id) ? this[id] : 0
        }
      }

      this.WorkOrderItemOptions.map(detail => {
        stockItem[detail.rowdata.id] = Number(detail.rowdata.unit_amount) - Number(detail.rowdata.amount_process)
      })

      if (this.ROUTE.meta.mode !== 'create') {
        this.FORM.data.work_production_items.map(detail => {
          if (stockItem.hasOwnProperty(detail.work_order_item_id)) {
            stockItem[detail.work_order_item_id] += Number(detail.unit_amount)
          }
        })
      }

      return this.rsForm.work_production_items.map((detail, index) => {
        let max = 0
        if (detail.work_order_item_id) {
          max = Number(stockItem[detail.work_order_item_id] || 0) - Number(moveItem.get(detail.work_order_item_id) || 0)
          moveItem.set(detail.work_order_item_id, detail.quantity * detail.unit_rate)
        }
        return max
      })
    },
    MAPINGKEY () {
      let variables = {
        'customers': {},
        'units': {},
        'items': {}
      }

      this.SHEET['customers'].data.map(value => { variables['customers'][value.id] = value })
      this.SHEET['units'].data.map(value => { variables['units'][value.id] = value })

      return variables
    }
  },
  watch: {
    '$route': 'init'
  },
  methods: {
    init () {
      this.FORM.load((data) => {
        if (this.ROUTE.meta.mode === 'create' && this.ROUTE.query && this.ROUTE.query.clone) {
          this.FORM.show = false
          this.FORM.loading = true

          let apiUrl = `${this.FORM.resource.api}/${this.ROUTE.query.clone}`
          this.$axios.get(apiUrl)
            .then((response) => {
              data = Object.assign(response.data, { number: null })
              this.FORM.data = JSON.parse(JSON.stringify(data))
              this.setForm(data)
              setTimeout(() => { this.FORM.show = true }, 500)
            })
            .catch(error => {
              this.FORM.response.error(error.response || error, this.$tc('messages.fail', 1, { v: this.$tc('form.clone') }).toUpperCase())
              this.setForm(this.setDefault())
              setTimeout(() => { this.FORM.show = true }, 500)
            })
            .finally(() => {
              setTimeout(() => { this.FORM.loading = false }, 500)
            })
        } else this.setForm(data || this.setDefault())
      })
    },
    setForm (data) {
      this.rsForm = JSON.parse(JSON.stringify(data))
      if (data.id) this.loadItemOptions(data)
      if (data.is_relationship) {
        let message = 'RELATION FAILED'
        this.$q.dialog({
          title: 'Work Order has Related',
          message: message,
          preventClose: true,
          ok: 'Direct to Detail Page',
          cancel: 'Continue'
        }).then(() => {
          this.$router.replace(`${this.FORM.resource.uri}/${data.id}`)
        }).catch(() => {
          //
        })
      }
    },
    loadItemOptions (data = this.rsForm) {
      if (data.line_id && data.shift_id && data.date) {
        let params = [`ondate=${data.date}`, `online=${data.line_id}`]
        if (this.FORM.data.work_production_items) {
          let orKeys = this.FORM.data.work_production_items.map(x => x.work_order_item_id)
          params.push(`or_detail_ids=${orKeys.join(',')}`)
        }
        this.SHEET.load('work_order_items', params.join('&'))
      }
    },
    setItemReference (index, val) {
      this.rsForm.work_production_items[index].work_order_item_id = null

      if (!val) {
        this.rsForm.work_production_items[index].item_id = null
        this.rsForm.work_production_items[index].unit_id = null
        this.rsForm.work_production_items[index].unit = null
      } else {
        const unit = this.MAPINGKEY.units[val.unit_id]
        this.rsForm.work_production_items[index].item_id = val.id
        this.rsForm.work_production_items[index].unit_rate = 1
        this.rsForm.work_production_items[index].unit_id = val.unit_id
        if (unit) {
          this.rsForm.work_production_items[index].unit = ({ ...unit, label: unit.code, value: unit.id, rate: 1 })
        }
      }
    },
    setUnitReference (index, val) {
      this.rsForm.work_production_items[index].unit_id = val ? val.id : null
      this.rsForm.work_production_items[index].unit_rate = val ? val.rate : 1
    },
    addNewItem () {
      let newEntri = Object.assign(this.setDefault().work_production_items[0])
      this.rsForm.work_production_items.push(newEntri)
    },
    removeItem (index) {
      this.rsForm.work_production_items.splice(index, 1)
      if (this.rsForm.work_production_items.length < 1) this.addNewItem()
    },
    onSave () {
      const submit = () => {
        this.$q.loading.show()
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
            this.$q.loading.hide()
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
          title: this.$tc('form.confirm'),
          message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.save') }),
          cancel: true,
          persistent: true
        }).onOk(() => {
          submit()
        })
      })
    }
  }
}
</script>
