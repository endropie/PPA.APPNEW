<template>
<q-page padding class="form-page">
  <q-card inline class="main-box q-ma-sm" v-if="FORM.show" :dark="LAYOUT.isDark">
    <q-card-section>
      <form-header :title="`${$tc('form.revision')} - ${$tc('general.work_order')}`.toUpperCase()" >
      </form-header>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark" />
    <q-card-section class="row q-col-gutter-x-sm">
      <!-- COLUMN::1st customer Identitity -->

      <ux-select-filter class="col-12 col-sm-6"
        name="line_id"
        v-model="rsForm.line_id"
        :label="$tc('items.preline')"
        :disable="IssetWorkOrderItems"
        :dark="LAYOUT.isDark"
        :options="LineOptions.filter(x => x.row.ismain)" clearable
        v-validate="'required'"
        :error="errors.has('line_id')"
        :error-message="errors.first('line_id')"
        @input="(val) => val ? loadItemOptions() : false">
        <q-tooltip v-if="Boolean(IssetWorkOrderItems)" :offset="[0, 10]">To change, Please delete Work-Order items first!</q-tooltip>
      </ux-select-filter>

      <div class="col-12 col-sm-6">
        <div class="row q-col-gutter-sm">
          <ux-date name="date" type="date" class="col-12 col-sm-6"
            :label="$tc('label.date')" stack-label
            v-model="rsForm.date"
            v-validate="`required|date_format:yyyy-MM-dd` + FORM.ifCreate(`|after:${$app.moment().add(-1,'days').format('YYYY-MM-DD')}`,'')"
            :date-options="(date) => FORM.ifCreate(date >= $app.moment().format('YYYY/MM/DD'), true)"
            :dark="LAYOUT.isDark"
            :error="errors.has('date')"
            :error-message="errors.first('date')">
          </ux-date>

          <q-select class="col-12 col-sm-6"
            name="shift_id"
            :label="$tc('label.shift')" stack-label
            v-model="rsForm.shift_id"
            :dark="LAYOUT.isDark"
            :options="ShiftOptions" filter
            map-options emit-value
            v-validate="'required'"
            :error="errors.has('shift_id')"
          />

        </div>
      </div>

      <!-- COLUMN::2th Detail Items & Lines -->
      <q-field class="col-12" prefix="Material production" borderless dense
        :disable="IssetWorkOrderItems"
        :dark="LAYOUT.isDark"
        :error="errors.has(`stockist_from`)"
        :error-message="errors.first('stockist_from')">
        <q-option-group :name="`stockist_from`" type="radio"
          v-model="rsForm.stockist_from" inline
          v-validate="'required'"
          :dark="LAYOUT.isDark"
          :disable="IssetWorkOrderItems"
          :options="CONFIG.items['stockists'].filter(stockist => ['FM','NC','NCR'].indexOf(stockist.value) > -1 )" />
      </q-field>
      <div class="col-12">
        <q-markup-table class="main-box bordered no-shadow no-highlight th-uppercase"
          dense separator="horizontal"
          :dark="LAYOUT.isDark">
          <q-tr>
            <q-th key="prefix"></q-th>
            <q-th key="item_id">{{$tc('items.part_name')}}</q-th>
            <q-th key="part_subname">{{$app.setting('item.subname_label')}}</q-th>
            <q-th key="unit_id">{{$tc('label.unit')}}</q-th>
            <q-th key="target">{{$tc('label.quantity')}}</q-th>
            <q-th key="ngratio">%NG</q-th>
            <q-th key="quantity">{{$tc('label.total')}}</q-th>
          </q-tr>
          <q-tr v-for="(row, index) in rsForm.work_order_items" :key="index">
              <q-td key="prefix" style="width:50px">
                <q-btn dense flat round icon="clear" size="md" color="negative" tabindex="100" @click="removeItem(index)"/>
              </q-td>
              <q-td key="item_id" width="35%" >
                <ux-select-filter autofocus
                  :name="`work_order_items.${index}.item_id`"
                  :dark="LAYOUT.isDark"
                  v-model="row.item_id"
                  v-validate="'required'"
                  outlined dense hide-bottom-space color="blue-grey-4"
                  :disable="!rsForm.line_id"
                  :options="ItemOptions" clearable
                  @input="(val) => setItemReference(index, val)"
                  :error="errors.has(`work_order_items.${index}.item_id`)"
                  :loading="SHEET.items.loading"
                >
                  <q-tooltip v-if="!rsForm.line_id" :offset="[0, 10]">Select a Pre-Line , first! </q-tooltip>
                </ux-select-filter>

              </q-td>
              <q-td key="part_subname" width="35%" style="min-width:150px">
                <q-input readonly
                  :value="row.item ? row.item.part_subname : null"
                  outlined dense hide-bottom-space color="blue-grey-5"
                  :dark="LAYOUT.isDark" />
              </q-td>
              <q-td key="unit_id"  width="15%">
                <q-select
                  :name="`work_order_items.${index}.unit_id`"
                  :dark="LAYOUT.isDark"
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
                  :dark="LAYOUT.isDark" color="blue-grey-4"
                  outlined dense hide-bottom-space no-error-icon
                  v-validate="`required|gt_value:0|max_value:${MaxStock[index]}`"
                  :error="errors.has(`work_order_items.${index}.target`)"
                  @input="() => { row.quantity = setTotalQuantity(row)}"
                />
              </q-td>
              <q-td key="ngratio"  width="15%">
                <q-input  style="min-width:80px"
                  v-model="row.ngratio" type="number" min="0"
                  outlined dense hide-bottom-space no-error-icon align="right" suffix="%"
                  :dark="LAYOUT.isDark" color="blue-grey-4"
                  v-validate="'required'"
                  :name="`work_order_items.${index}.ngratio`" data-vv-as="ngratio"
                  :error="errors.has(`work_order_items.${index}.ngratio`)"
                  :error-message="errors.first(`work_order_items.${index}.ngratio`)"
                  :disable="!rsForm.line_id || !rsForm.work_order_items[index].item_id"
                  @input="() => { row.quantity = setTotalQuantity(row) }"
                  />
              </q-td>
              <q-td key="quantity"  width="15%">
                <q-input style="min-width:120px"
                  :name="`work_order_items.${index}.quantity`" type="number"
                  :dark="LAYOUT.isDark" color="blue-grey-6"
                  v-model="row.quantity" disable
                  outlined dense hide-bottom-space no-error-icon align="right"
                  v-validate="`required|gt_value:0|max_value:${MaxStock[index]}`"
                  :error="errors.has(`work_order_items.${index}.quantity`)"
                  :suffix="' / '+ convertStock(row, MaxStock[index])"
                />
              </q-td>
            </q-tr>
          <q-tr>
            <q-td></q-td>
            <q-td>
              <q-btn outline dense color="blue-grey" :label="$tc('form.add')" class="full-width" icon="add_circle_outline" @click="addNewItem()" />
            </q-td>
            <q-td colspan="100%"></q-td>
          </q-tr>
        </q-markup-table>
      </div>
      <!-- COLUMN::4th Description -->
      <div class="col-12 cloumn q-mt-md">
        <q-input name="description" type="textarea" rows="3"
          stack-label :label="$tc('label.description')"
          filled
          :dark="LAYOUT.isDark"
          v-model="rsForm.description"/>

      </div>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark" />
    <q-card-actions >
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.revision')" icon="save" color="red-10" @click="onSave()"
        :disabled="FORM.has_relationship.length > 0">
      </q-btn>
    </q-card-actions>
  </q-card>
    <q-inner-loading :showing="FORM.loading" :dark="LAYOUT.isDark"><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'
import { match } from 'minimatch'

export default {
  mixins: [MixForm],
  data () {

    return {
      SHEET:{
        units: {api:'/api/v1/references/units?mode=all'},
        lines: {api:'/api/v1/references/lines?mode=all'},
        shifts: {api:'/api/v1/references/shifts?mode=all'},
        items: {api:'/api/v1/common/items?mode=all', autoload:false},
      },
      FORM: {
        resource:{
          uri: '/admin/factories/work-orders',
          api: '/api/v1/factories/work-orders',
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
          work_order_items: [
            {
              id:null,
              item_id: null,
              quantity: null,
              target:null,
              unit_id: null,
              unit_rate: 1,
              ngratio: 0,
              item: {}, unit: {},
              work_order_item_lines: [{
                  line_id: null,
                  shift_id: null,
                  begin_date: this.$app.moment().format('YYYY-MM-DD'),
                  until_date: this.$app.moment().format('YYYY-MM-DD'),
              }]
            }
          ]
        }
      }
    }
  },
  created(){
    // Component Page Mounted!
    this.init()

  },
  computed: {
    IssetWorkOrderItems() {
      if (this.rsForm.work_order_items) {
        return this.rsForm.work_order_items.some((item) => item.item_id)
      }
      return false
    },
    LineOptions() {
      let data = this.SHEET.lines.data || []
      return data.map(line => ({label: line.name, value: line.id, row:line}))
    },
    ShiftOptions() {
      return (this.SHEET.shifts.data.map(line => ({label: line.name, value: line.id})) || [])
    },
    UnitOptions() {
      return (this.SHEET.units.data.map(item => ({label: item.code, value: item.id})) || [])
    },
    ItemOptions() {
      if (this.SHEET.items.data.length <= 0) return []

      const stockist = this.rsForm.stockist_from || 'FM'
      let OrKeys = this.FORM.data.work_order_items.map(x => x.item_id, [])

      let ITEM = this.SHEET.items.data.filter((item) => {
        if (!item.item_prelines || !item.item_prelines.length) return false
        if (item.item_prelines[0].line_id !== this.rsForm.line_id) return false
        if(item.totals[stockist] <= 0 && !OrKeys.find(x=> x === item.id)) return false
        else return true
      })
      return (ITEM.map(item => ({
        label: item.part_name,
        sublabel: `[${item.customer_code}] ${item.part_subname || '--'}`,
        value: item.id,
        disable: !item.enable,
        row: item
      })) || [])
    },
    ItemUnitOptions() {
      let vars = []

      for (const i in this.rsForm.work_order_items) {
        if (this.rsForm.work_order_items.hasOwnProperty(i)) {
          let rsItem = this.rsForm.work_order_items[i]
          vars[i] = ( this.UnitOptions || [])
          vars[i] = vars[i].filter((unit)=> {
            if(!rsItem.item_id) return false
            if(rsItem.item) {

              if(rsItem.item.unit_id === unit.value) return true
              if(rsItem.item.item_units) {
                let filtered = rsItem.item.item_units.filter((fill)=> fill.unit_id === unit.value)
                if(filtered.length > 0) return true
              }
            }
            return false;
          })
        }
      }
      return vars
    },
    MinStock() {
      if (!this.FORM.data.work_order_items) return []
      return this.FORM.data.work_order_items.map(detail => {
        let result = 0
        if (detail.work_order_item_lines) {
          detail.work_order_item_lines.map((line) => {
            const total = line.work_production_items.reduce((calc, production) => {
              return calc += production.unit_amount
            }, 0)

            if (total > result) result = total
          })

        }
        if (detail.packing_items) {
          let total_packing = 0
          detail.packing_items.map((packing) => {
            total_packing += packing.unit_amount
            console.warn(packing, total_packing)
          }, 0)

          if(total_packing > result) result = 1000
        }

        return result
      })
    },
    MaxStock() {
      const stockist = this.rsForm.stockist_from

      let stockItem =  JSON.parse(JSON.stringify(this.MAPINGKEY['items']))
      let moveItem = {
        set: function (id, val) {
          if (!this.hasOwnProperty(id)) this[id] = 0
            this[id] += Number(val)
        },
        get: function (id) {
          return this.hasOwnProperty(id) ? this[id] : 0
        }
      }

      this.FORM.data.work_order_items.forEach(item => {
        if (stockItem.hasOwnProperty(item.item_id)) {
          stockItem[item.item_id].totals[this.FORM.data.stockist_from] += Number(item.unit_amount)
        }
      })

      let data = {}
      this.rsForm.work_order_items.map((detail, index) => {
        if (stockItem[detail.item_id] && detail.item_id) {
          data[index] = Number(stockItem[detail.item_id].totals[stockist] || 0) - Number(moveItem.get(detail.item_id) || 0)
          moveItem.set(detail.item_id, detail.quantity * detail.unit_rate)
        }
      })

      return data
    },
    MAPINGKEY() {
      let variables = {
        'lines': {},
        'units': {},
        'items': {},
      }
      this.SHEET['lines'].data.map(value => { variables['lines'][value.id] = value })
      this.SHEET['units'].data.map(value => { variables['units'][value.id] = value })
      this.SHEET['items'].data.map(value => { variables['items'][value.id] = value })

      return variables;
    }
  },
  watch:{
      '$route' : 'init'
  },
  methods: {
    init() {
      this.FORM.load((data) => {
        this.setForm(data || this.setDefault())
      })
    },
    setForm(data) {
      this.rsForm =  JSON.parse(JSON.stringify(data))
      if(data.id) this.loadItemOptions(data)
      if(data.hasOwnProperty('has_relationship') && data['has_relationship'].length > 0) {
        this.FORM.has_relationship = data.has_relationship

        let message = data['has_relationship'].join("-")
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
    persenLine (itemLine, detail) {
      const total = itemLine.work_production_items.reduce((total, item) => total += item.unit_amount, 0)
      return Math.round(total / (detail.quantity || 0 * detail.unit_rate || 1) * 100)
    },
    validLine (itemLine, detail) {
      const total = itemLine.work_production_items.reduce((total, item) => total += item.unit_amount, 0)
      const amount = (detail.quantity || 0 * detail.unit_rate || 1)
      return 0 <= Math.round(total) && Math.round(total) <= Math.round(amount)
    },
    persenPacking (detail) {
      const total = detail.packing_items.reduce((total, item) => total += item.unit_total, 0)
      return Math.round(total / (detail.quantity || 0 * detail.unit_rate || 1) * 100)
    },
    validPacking (detail) {
      return 0 > (this.persenPacking(detail)) || (this.persenPacking(detail)) > 100
    },
    convertStock(row, val = 0) {
      if(val < 0) return '(-)'
      return this.$app.number_format(Number(val || 0) / Number(row.unit_rate || 1))
    },
    loadItemOptions(data = this.FORM.data) {
      let params = ['has_stocks=FM,NC,NCR']

      if (data.line_id) params.push(`main_line=${data.line_id}`)

      if (data.work_order_items && data.work_order_items.length > 0) {
        let ids = data.work_order_items.map(x => x.item_id)
        params.push(`or_ids=${ids.join(',')}`)
      }

      this.SHEET.load('items', params.join('&'))
    },
    setItemReference(index, val) {
      this.rsForm.work_order_items[index].unit_id = null
      this.rsForm.work_order_items[index].unit = {}
      this.rsForm.work_order_items[index].item = {}
      this.rsForm.work_order_items[index].work_order_item_lines = []

      if (!this.rsForm.work_order_items[index].packing_items) {
        this.rsForm.work_order_items[index].packing_items = []
      }

      const old_item_lines = this.FORM.data.work_order_items[index]
        ? this.FORM.data.work_order_items[index].work_order_item_lines || []
        : []

      if (val) {
        this.rsForm.work_order_items[index].item = this.MAPINGKEY['items'][val]
        if (this.rsForm.work_order_items[index].item.item_prelines.length > 0) {
          const prelines = this.rsForm.work_order_items[index].item.item_prelines
          this.rsForm.work_order_items[index].work_order_item_lines = []

          for (let i = 0; i < prelines.length; i++) {
            let newLine = this.setDefault().work_order_items[0].work_order_item_lines[0]
            newLine.line_id = prelines[i].line_id
            newLine.work_production_items = []
            if (find = old_item_lines.find(x => x.line_id == prelines[i].line_id)) {
              newLine = find
            }
            this.rsForm.work_order_items[index].work_order_item_lines.push(newLine)
          }
        }
        let baseUnitID = this.MAPINGKEY['items'][val].unit_id
        this.rsForm.work_order_items[index].unit_id = baseUnitID
        this.rsForm.work_order_items[index].unit_rate = 1
        this.rsForm.work_order_items[index].unit = this.MAPINGKEY['units'][baseUnitID]
      }
    },
    setUnitReference(index, val) {

      if(!val) return;
      else if (this.rsForm.work_order_items[index].item.unit_id === val) {
        this.rsForm.work_order_items[index].unit_rate = 1
      }
      else {
        if(this.rsForm.work_order_items[index].item.item_units) {
          this.rsForm.work_order_items[index].item.item_units.find((unitItem)=> {
            if (unitItem.unit_id == val) {
              this.rsForm.work_order_items[index].unit_rate = unitItem.rate
              return true
            }
          })
        }
      }
    },
    setTotalQuantity(row) {
      // console.log(this.FORM)
      return Math.ceil(Number(row.target) + (Number(row.target) * Number(row.ngratio) / 100))
    },
    addNewItem() {
      let newEntri = this.setDefault().work_order_items[0];
      newEntri.work_order_item_lines = []

      this.rsForm.work_order_items.push(newEntri)
    },
    removeItem(itemIndex) {
      const remove = () => {
        this.rsForm.work_order_items.splice(itemIndex, 1)
        if(this.rsForm.work_order_items.length < 1) this.addNewItem()
      }

      if(!this.rsForm.work_order_items[itemIndex].id) return remove()

      this.$q.dialog({
        title: this.$tc('form.confirm'),
        message: this.$tc('messages.to_sure', 1, {v: this.$tc('form.delete')}),
        cancel: true,
        persistent: true
      }).onOk(() => {
        remove()
      })
    },
    onSave() {
      const submit = () => {
        this.FORM.loading = true
        let {method, mode, apiUrl} = this.FORM.meta()
        apiUrl += `?mode=revision`
        this.$axios.set(method, apiUrl, this.rsForm)
        .then((response) => {
          let message = response.data.number + ' - #' + response.data.id
          this.FORM.response.success({message:message})
          this.FORM.toView(response.data.id)
        })
        .catch((error) => {
          this.FORM.response.fields(error.response)
          this.FORM.response.error(error.response || error, this.$tc('messages.fail', 1, {v:this.$tc('form.save')}).toUpperCase())
        })
        .finally(()=>{
          this.FORM.loading = false
        });
      }
      this.$validator.validate().then(result => {
        if (!result) {
          return this.$q.notify({
            color:'red', icon:'error', position:'top-right', timeout: 3000,
            message:this.$tc('messages.to_complete_form')
          })
        }


        this.$q.dialog({
          title: this.$tc('form.confirm'),
          message: this.$tc('messages.to_sure', 1, {v: this.$tc('form.revision')}),
          cancel: true,
          persistent: true
        }).onOk(() => {
          submit()
        })
      })
    },
  },
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

</style>

