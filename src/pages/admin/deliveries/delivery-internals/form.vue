<template>
<q-page padding class="form-page justify-center">
  <q-card inline class="main-box" v-if="FORM.show">
    <q-card-section class="q-py-xs">
      <form-header :title="FORM.title()" :subtitle="`# ` + (rsForm.fullnumber || rsForm.number || FORM.subtitle())" hide-menu>
        <template  slot="menu-append">
          <ux-chip-status square outline :row="rsForm" v-if="rsForm.status" />
        </template>
      </form-header>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-md-6">
          <ux-select
            name="customer_id"
            :label="$tc('general.customer')"  stack-label
            v-model="rsForm.customer"
            :disable="Boolean(rsForm.delivery_internal_items.find(detail => detail.item_id))"
            filter clearable
            source="api/v1/incomes/customers?mode=all"
            :option-label="(item) => `[${item.code}] ${item.name}`"
            option-value="id"
            new-value-mode="add"
            v-validate="'required'"
            :error="errors.has('customer_id')"
            :error-message="errors.first('customer_id')"
            @input="(v) => {
              rsForm.customer = v ? v : null
              rsForm.customer_id = v ? v.id : null
              rsForm.customer_name = v ? v.name : null
              rsForm.customer_phone = v ? v.phone : null
              rsForm.customer_address = v ? v.address : null
            }"
          />
          <ux-date
            name="date" type="date"
            :label="$tc('label.date')"
            v-model="rsForm.date"
            v-validate="'required'"
            :error="errors.has('date')"
            :error-message="errors.first('date')"
          />
        </div>
        <div class="col-12 col-md-6" >
          <div class="row q-col-gutter-x-sm">
            <q-input class="col" name="customer_name"
              :label="$tc('label.name')"  stack-label
              v-model="rsForm.customer_name"
              v-validate="'required'"
              :error="errors.has('customer_name')" />

            <q-input class="col-12 col-sm-auto" name="customer_phone"
              :label="$tc('label.phone')"  stack-label
              v-model="rsForm.customer_phone"
              v-validate="''"
              :error="errors.has('customer_phone')"/>
          </div>
          <q-input type="textarea" autogrow rows="3"
            name="customer_address"
            :label="$tc('label.address')"  stack-label
            v-model="rsForm.customer_address"
          />
        </div>
      </div>
    </q-card-section>
    <q-separator inset />
    <!-- SINGLE-REVISION -->
    <q-card-section :class="$app.classDimmed(!rsForm.customer_id) ">
      <!-- COLUMN:: Part items lists -->
      <q-markup-table bordered class="main-box no-shadow no-highlight q-mb-sm"
        dense separator="horizontal"
        >
        <thead>
          <q-tr class="text-uppercase" style="line-height:30px">
            <q-th key="prefix" width="50px"></q-th>
            <q-th key="name" width="30%">{{$tc('items.part_name')}}</q-th>
            <q-th key="subname" width="30%">{{$app.setting('item.subname_label')}}</q-th>
            <q-th key="quantity" width="10%">{{$tc('label.quantity')}}</q-th>
            <q-th key="unit" width="10%">{{$tc('label.unit')}}</q-th>
            <q-th key="note" width="40%">{{$tc('label.note')}}</q-th>
          </q-tr>
        </thead>
        <tbody>
          <q-tr v-for="(row, rowIndex) in rsForm.delivery_internal_items" :key="rowIndex">
            <q-td name="prefix">
              <q-btn dense flat outline tabindex="1000" color="negative" icon="clear" @click="removeDetail(rowIndex)" />
            </q-td>
            <q-td name="name">
              <ux-select v-if="Boolean(row._registered === true)" dense outlined hide-bottom-space
                style="min-width:250px"
                v-model="row.item" emit-value
                filter clearable
                :source="`/api/v1/common/items?mode=all&--limit=50&enable=1${rsForm.customer_id ? '&customer_id='+rsForm.customer_id : ''}`"
                :source-key="['part_name', 'part_number', 'code']"
                option-label="part_name"
                :option-sublabel="(opt) => `[${opt.customer_code}] ${opt.part_number}`"
                v-validate="'required'"
                :name="`delivery_internal_items.${rowIndex}.item_id`"
                :error="errors.has(`delivery_internal_items.${rowIndex}.item_id`)"
                @input="(v) => {
                  row.item = v ? v : null
                  row.unit = v ? v.unit : null
                  row.item_id = v ? v.id : null
                  row.unit_id = v ? v.unit_id : null
                  row.name = v ? v.part_name : null
                  row.subname = v ? v.part_number : null
                }"
              >
                <q-btn slot="after" dense icon="add" color="blue-grey"
                  @click="unsetRowItem(rowIndex)"
                />
              </ux-select>
              <q-input v-else type="text" dense outlined hide-bottom-space
                style="min-width:250px"
                v-model="row.name" :readonly="Boolean(row.item)"
                v-validate="'required'"
                :name="`delivery_internal_items.${rowIndex}.name`"
                :error="errors.has(`delivery_internal_items.${rowIndex}.name`)"
                :autofocus="rowIndex !== 0"
              >

                <q-btn slot="append" flat dense icon="clear" color="blue-grey" tabindex="100"
                  @click="setRowItem(rowIndex)"
                />
              </q-input>

            </q-td>
            <q-td name="subname">
              <q-input type="text" dense outlined hide-bottom-space
                input-style="min-width:150px"
                v-model="row.subname" :readonly="Boolean(row.item)"
                v-validate="'required'"
                :name="`delivery_internal_items.${rowIndex}.subname`"
                :error="errors.has(`delivery_internal_items.${rowIndex}.subname`)"
              />
            </q-td>
            <q-td name="quantity">
              <q-input type="number" dense outlined hide-bottom-space no-error-icon
                input-style="min-width:75px"
                v-model="row.quantity"
                v-validate="'required'"
                :name="`delivery_internal_items.${rowIndex}.quantity`"
                :error="errors.has(`delivery_internal_items.${rowIndex}.quantity`)"
              />
            </q-td>
            <q-td name="unit">
              <ux-select dense outlined hide-bottom-space hide-dropdown-icon
                input-style="min-width:75px"
                v-model="row.unit"
                clearable
                :source="`/api/v1/references/units?mode=all&--limit=50`"
                :source-key="['name', 'code']"
                option-label="code"
                v-validate="'required'"
                :name="`delivery_internal_items.${rowIndex}.unit_id`"
                :error="errors.has(`delivery_internal_items.${rowIndex}.unit_id`)"
                @input="(v) => {
                  row.unit = v ? v : null
                  row.unit_id = v ? v.id : null
                }"
              />
            </q-td>
            <q-td name="note">
              <q-input type="text" dense outlined hide-bottom-space no-error-icon
                input-style="min-width:150px"
                v-model="row.note"
                :name="`delivery_internal_items.${rowIndex}.note`"
                :error="errors.has(`delivery_internal_items.${rowIndex}.note`)"
              />
            </q-td>
          </q-tr>
          <q-tr>
            <q-td>
              <q-btn dense color="positive" icon="add" @click="addNewDetail" />
            </q-td>
            <q-td rowspan="100%"></q-td>
          </q-tr>
        </tbody>
      </q-markup-table>
      <div class="row q-col-gutter-sm">
        <div class="col-12 col-md-6">
          <q-input type="textarea" autogrow
            filled class="q-mb-sm self-start" input-style="min-height:95px"
            v-model="rsForm.description"
            :label="$tc('label.description')" stack-label
          />
        </div>
        <div class="col-12 col-md-6">
          <q-select type="text" autogrow
            filled class="q-mb-sm"
            emit-value map-options
            v-model="rsForm.reason_id"
            :options="ReasonOptions"
            :label="$tc('label.reason')"
          />
          <q-input type="text" autogrow
            name="reason_description"
            filled class="q-mb-sm"
            v-model="rsForm.reason_description"
            :label="$tc('label.reason') + ' Internal'"
            v-validate="Boolean(rsForm.reason_id) ? '' : 'required'"
            :error="errors.has('reason_description')"
          />
        </div>
      </div>
    </q-card-section>
    <q-separator  />
    <q-card-actions class="q-mx-lg">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" >
    <q-spinner-dots size="70px" color="primary" />
  </q-inner-loading>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      SHEET: {
        reasons: { api: '/api/v1/references/reasons?mode=all&type=DELIVERY_INTERNAL' }
      },
      FORM: {
        resource: {
          api: '/api/v1/incomes/delivery-internals',
          uri: '/admin/deliveries/delivery-internals'
        }
      },
      rsForm: null,
      setDefault: () => {
        return {
          number: null,
          date: this.$app.moment().format('YYYY-MM-DD'),
          customer: null,
          customer_id: null,
          customer_name: null,
          customer_phone: null,
          customer_address: null,
          description: null,
          reason_id: null,
          reason_description: null,
          delivery_internal_items: [
            {
              _registered: true,
              name: null,
              subname: null,
              quantity: null,
              item_id: null,
              unit_id: null,
              item: null,
              unit: null,
              note: null
            }
          ]
        }
      }
    }
  },
  created () {
    // Component Page Created!
    this.init()
  },
  computed: {
    ReasonOptions () {
      return (this.SHEET.reasons.data
        .filter(item => item.enable)
        .map(item => ({ label: item.name, value: item.id })) || [])
        .concat([{ label: this.$tc('label.others'), value: 0 }])
    }
  },
  watch: {
    '$route': 'init'
  },
  methods: {
    init () {
      this.FORM.load((data) => {
        data.delivery_internal_items = data.delivery_internal_items.map(rd => ({ ...rd, _registered: Boolean(rd.item || rd._registered) }))
        this.setForm(data || this.setDefault())
      })
    },
    setForm (data) {
      this.rsForm = Object.assign(this.setDefault(), data)
    },

    addNewDetail () {
      const newitem = Object.assign(this.setDefault().delivery_internal_items[0])
      this.rsForm.delivery_internal_items.push(newitem)
    },
    setRowItem (index) {
      this.rsForm.delivery_internal_items[index]._registered = true
    },
    unsetRowItem (index) {
      this.rsForm.delivery_internal_items[index]._registered = false
      this.rsForm.delivery_internal_items[index].item = null
      this.rsForm.delivery_internal_items[index].item_id = null
      this.rsForm.delivery_internal_items[index].unit = null
      this.rsForm.delivery_internal_items[index].unit_id = null
      this.rsForm.delivery_internal_items[index].name = null
      this.rsForm.delivery_internal_items[index].subname = null
    },
    removeDetail (index) {
      this.rsForm.delivery_internal_items.splice(index, 1)
      if (!this.rsForm.delivery_internal_items.length) this.addNewDetail()
    },
    onSave () {
      const submit = () => {
        this.FORM.loading = true
        const { apiUrl, method } = this.FORM.meta()
        this.$axios.set(method, apiUrl, this.rsForm)
          .then((response) => {
            let message = response.data.number + ' - #' + response.data.id
            this.FORM.response.success({ message: message })
            this.FORM.toView(response.data.id)
          })
          .catch((error) => {
            this.FORM.response.fields(error.response)
            this.FORM.response.error(error.response || error, 'REVISION FAILED')
          })
          .finally(() => {
            this.FORM.loading = false
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
