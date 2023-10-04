<template>
<q-page padding class="form-page">
  <q-card inline class="main-box q-ma-sm" v-if="FORM.show">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
      </form-header>
    </q-card-section>
    <q-separator></q-separator>
    <!-- ROW::1st Customer Identitity -->
    <q-card-section class="row q-col-gutter-x-md">
      <div class="col-12 col-sm-6" >
        <q-list bordered class="full-height">
          <q-item-label header>Details</q-item-label>
          <q-separator></q-separator>
          <q-item>
            <q-item-section >
              <div class="row q-col-gutter-x-md">
                <q-input name="code" class="col-4"
                  :label="$tc('label.code')"
                  v-model="rsForm.code"
                  v-validate="'required'"
                  :error="errors.has('code')"
                  :error-message="errors.first('code')"/>

                <q-input name="name" class="col-8"
                  label="Nama"
                  v-model="rsForm.name"
                  v-validate="'required'"
                  :error="errors.has('name')"
                  :error-message="errors.first('name')"/>

                <q-input name="phone" class="col-12 col-sm-6"
                  label="Phone"
                  v-model="rsForm.phone"
                  v-validate="''"
                  :error="errors.has('phone')"
                  :error-message="errors.first('phone')"/>

                <q-input name="fax" class="col-12 col-sm-6"
                  label="Fax" v-model="rsForm.fax"
                  :error="errors.has('fax')"
                  :error-message="errors.first('fax')"/>

                <q-input name="email" class="col-12"
                  label="Email"
                  v-model="rsForm.email" type="email"
                  v-validate="'email'"
                  :error="errors.has('email')" :error-message="errors.first('email')"/>

                <q-input name="address" class="col-12"
                  type="textarea" rows="2"
                  label="Address" stack-label
                  v-model="rsForm.address"
                />

                <q-input name="subdistrict" class="col-12 col-sm-6"
                  label="Sub-district" v-model="rsForm.subdistrict"
                  :error="errors.has('subdistrict')" :error-message="errors.first('subdistrict')"/>

                <q-input name="district" class="col-12 col-sm-6"
                  label="District"
                  v-model="rsForm.district"
                  :error="errors.has('district')" :error-message="errors.first('district')"/>

                <ux-select-filter name="province_id" class="col-12 col-sm-8"
                  label="Province"
                  v-model="rsForm.province_id"
                  :options="ProvinceOptions" filter
                  :error="errors.has('province_id')" :error-message="errors.first('province_id')" />

                <q-input name="zipcode" class="col-12 col-sm-4"
                  label="Zip Code"
                  v-model="rsForm.zipcode"
                  :error="errors.has('zipcode')" :error-message="errors.first('zipcode')"
                />
              </div>
            </q-item-section>
          </q-item>
         </q-list>
      </div>
      <!-- COLUMN::2nd Customer Coporation details -->
      <div class="col-12 col-sm-6" >
        <div class="column q-gutter-sm">
          <q-list bordered class="full-height">
            <q-item-label header>Reference Account</q-item-label>
            <q-separator />
             <q-item>
              <q-item-section >
                <div class="column">
                  <q-input name="pkp"
                    label="No. PKP"
                    v-model="rsForm.pkp"
                    v-validate="''"
                    :error="errors.has('pkp')"
                    :error-message="errors.first('pkp')" />

                  <q-input name="npwp"
                    label="NPWP"
                    v-model="rsForm.npwp"
                    v-validate="''"
                    :error="errors.has('npwp')"
                    :error-message="errors.first('npwp')"/>

                  <q-input name="bank_account"
                      label="Bank Account"
                      v-model="rsForm.bank_account"
                      v-validate="''"
                      :error="errors.has('bank_account')"
                      :error-message="errors.first('bank_account')" />
                </div>
              </q-item-section>
             </q-item>
          </q-list>

          <q-list bordered class="full-height">
            <q-item-label header>Taxes</q-item-label>
            <q-separator />
            <q-item>
              <q-item-section >
                <div class="row q-col-gutter-sm">
                  <q-field dense class="col-12" borderless >
                    <q-toggle name="with_ppn"
                      label="PPN" left-label
                      v-model="rsForm.with_ppn"
                      :false-value="0"
                      :true-value="1"
                    />
                    <q-input type="number"
                      class="q-pl-md full-width"
                      name="ppn" suffix="% PPN"
                      v-model="rsForm.ppn"
                      :disable="!Boolean(rsForm.with_ppn)"
                      v-validate="`${(rsForm.with_ppn ? 'required|gt_value:0|max_value:100' :'')}`"
                      :error="errors.has('ppn')"
                      :error-message="errors.first('ppn')"
                    />
                  </q-field>
                  <q-field dense class="col-12" borderless>
                    <q-toggle name="with_pph"
                      label="PPH" left-label
                      v-model="rsForm.with_pph"
                      :false-value="0"
                      :true-value="1"
                    />

                    <q-input dense type="number"
                      class="q-pl-md full-width"
                      suffix="% PPH"
                      value="2"
                      :disable="!Boolean(rsForm.with_pph)" readonly
                    />
                  </q-field>

                  <q-input type="number" class="col-6"
                    filled label="% Service"
                    name="sen_service"
                    v-model="rsForm.sen_service"
                    :disable="!Boolean(rsForm.with_pph)"
                    v-validate="(rsForm.with_pph ? 'required|gt_value:0|max_value:100' :'')"
                    :error="errors.has('sen_service')"
                    :error-message="errors.first('sen_service')"
                  />

                  <q-field dense borderless class="col-auto">
                    <div slot="control">
                      <q-checkbox class="col-12 col-sm-auto"
                        :label="$tc('customers.service.exclude')"
                        v-model="rsForm.exclude_service"
                        :disable="!Boolean(rsForm.with_pph)"
                        :true-value="1" :false-value="0"
                      />

                      <q-checkbox class="col-12 col-sm-auto"
                        :label="$tc('customers.service.bounded')"
                        v-model="rsForm.bounded_service"
                        :disable="!Boolean(rsForm.with_pph && rsForm.with_ppn)"
                        :true-value="1" :false-value="0"
                      >
                      <q-tooltip>{{$tc('customers.tooltip.service_bounded')}}</q-tooltip>
                    </q-checkbox>
                    </div>
                  </q-field>
                </div>

              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="row q-col-gutter-sm q-col-gutter-x-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-list dense class="main-box" color="secondary" separator bordered>
          <q-item-label header >Delivery trip List</q-item-label>
          <q-separator />
          <template v-for="(dayTrips, iDayTrip) in weekTrips">
            <q-item :key="iDayTrip" v-if="dayTrips.length">
              <q-item-section side>{{$app.moment().day(iDayTrip).format('dddd')}}</q-item-section>
              <q-item-section>
                <div class="row">
                  <q-chip v-for="(trip, iTrip) in dayTrips.sort((a, b) => parseInt(a.time) - parseInt(b.time))" :key="iTrip"
                    :label="String(trip.time).substring(0,5)"
                    removable @remove="removeTrip(trip.__index)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </template>
          <q-separator spaced inset />
          <q-item>
            <q-item-section align="q-pb-sm">
              <q-btn align="center" dense icon="add" color="positive" label="New Trip" @click="openNewTrip()" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <!-- COLUMN::3th Contact lists -->
      <div class="col-12 col-md-6">
        <q-list dense class="main-box" color="secondary" separator bordered>
          <q-item-label header >Contact List</q-item-label>
          <q-separator />
          <q-item v-for="(item, index) in rsForm.customer_contacts" :key="index">
            <q-item-section class="">
              <div class="row q-col-gutter-xs">

                <q-input :name="`customer_contacts.${index}.name`" class="col-12 col-sm-5"
                  label="Name"  stack-label
                  placeholder="Enter fullname ..."

                  dense filled hide-bottom-space
                  v-model="rsForm.customer_contacts[index].name"
                  v-validate="rsForm.customer_contacts[index].phone ? 'required' : ''"
                  :error="errors.has(`customer_contacts.${index}.name`)"
                  :error-message="errors.first(`customer_contacts.${index}.name`)"/>

                <q-input :name="`customer_contacts.${index}.label`"  class="col-12 col-sm-3"
                  v-model="rsForm.customer_contacts[index].label"
                  stack-label label="Position"
                  placeholder="Enter Position ..."
                  dense filled  hide-bottom-space
                  :error="errors.has(`customer_contacts.${index}.label`)"
                  :error-message="errors.first(`customer_contacts.${index}.label`)"/>

                <q-input :name="`customer_contacts.${index}.phone`" class="col-12 col-sm-4"
                  v-model="rsForm.customer_contacts[index].phone"
                  label="Phone" stack-label
                  placeholder="xxx-xxxx-xxxx"
                  dense filled hide-bottom-space
                  v-validate="rsForm.customer_contacts[index].name ? 'required' : ''"
                  :error="errors.has(`customer_contacts.${index}.phone`)"
                  :error-message="errors.first(`customer_contacts.${index}.phone`)" />
              </div>
            </q-item-section>
            <q-item-section side>
              <q-btn dense flat icon="clear" color="red" @click="removeContact(index)" />
            </q-item-section>
          </q-item>
          <q-separator spaced inset />
          <q-item>
            <q-item-section align="q-pb-sm">
              <q-btn align="center" dense icon="add" color="positive" label="New contact" @click="addNewContact()" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <!-- COLUMN::4th Reference Mode Picker -->
      <div class="col-12">
        <div class="row items-start q-col-gutter-md q-mb-lg">
          <q-field class="col-12 col-md-4"
            :error="errors.has('invoice_mode')"
            :error-message="errors.first('invoice_mode')"
            filled
            hint="Pick the mode Invoice Type">

            <q-option-group slot="control" class="q-pa-md q-gutter-sm no-padding"
              dense name="invoice_mode" type="radio"
              v-model="rsForm.invoice_mode"
              v-validate="'required'"
              :options="CONFIG.options.invoice_mode.map(x => ({...x, label: x.detail}))" />

          </q-field>
          <q-field filled class="col-12 col-md-4"
            hint="Pick the mode Delivery Type"
            :error="errors.has('delivery_mode')"
            :error-message="errors.first('delivery_mode')">

            <q-option-group slot="control"
              dense class="q-pa-md q-gutter-sm no-padding"
              name="delivery_mode" type="radio"
              v-model="rsForm.delivery_mode"
              v-validate="'required'"
              :options="CONFIG.options.delivery_mode.map(x => ({...x, label: x.detail}))" />
          </q-field>
          <q-field class="col-12 col-md-4"
            hint="Pick the mode PO Type"
            filled
            :error="errors.has('order_mode')"
            :error-message="errors.first('order_mode')">

            <q-option-group slot="control" class="q-pa-md q-gutter-sm"
              dense name="order_mode" type="radio"
              v-model="rsForm.order_mode"
              v-validate="'required'"
              :options="CONFIG.options.order_mode" />
          </q-field>
        </div>

        <div class="q-pa-md text-subtitle2 font-underline">
          {{ $tc('label.others_configuration') }}
          <q-separator />
        </div>
        <div class="row">
          <div class="col-12 col-md-4 column">
            <q-checkbox name="order_lots" class="text-faded" v-model="rsForm.order_lots" :false-value="0" :true-value="1"
              v-show="rsForm.order_mode === 'NONE'"
            >
              <div class="column text-caption text-faded" style="line-height:normal">
                <div class="text-weight-bold">{{ $tc('customers.order_lots') }}</div>
                <div class="text-small text-grey">{{ $tc('customers.detail.order_lots') }}</div>
              </div>
            </q-checkbox>
            <q-checkbox name="delivery_manual_allowed" v-model="rsForm.delivery_manual_allowed" :false-value="0" :true-value="1"
              v-show="rsForm.order_mode !== 'ACCUMULATE'"
            >
              <div class="column text-caption text-faded" style="line-height:normal">
                <div class="text-weight-bold">{{ $tc('customers.delivery_manual_allowed') }}</div>
                <div class="text-small text-grey">{{ $tc('customers.detail.delivery_manual_allowed') }}</div>
              </div>
            </q-checkbox>
            <q-checkbox name="partialidate_allowed" v-model="rsForm.partialidate_allowed" :false-value="0" :true-value="1">
              <div class="column text-caption text-faded" style="line-height:normal">
                <div class="text-weight-bold">{{ $tc('customers.partialidate_allowed') }}</div>
                <div class="text-small text-grey">{{ $tc('customers.detail.partialidate_allowed') }}</div>
              </div>
            </q-checkbox>
            <q-checkbox name="delivery_over_allowed" v-model="rsForm.delivery_over_allowed" :false-value="0" :true-value="1"
              v-show="rsForm.order_mode !== 'ACCUMULATE'"
            >
              <div class="column text-caption text-faded" style="line-height:normal">
                <div class="text-weight-bold">{{ $tc('customers.delivery_over_allowed') }}</div>
                <div class="text-small text-grey">{{ $tc('customers.detail.delivery_over_allowed') }}</div>
              </div>
            </q-checkbox>
          </div>
          <div class="col-12 col-md-4 column">
            <q-checkbox name="invoice_request_required" v-model="rsForm.invoice_request_required" :false-value="0" :true-value="1" v-show="rsForm.order_mode === 'NONE'" >
              <div class="column text-caption text-faded" style="line-height:normal">
                <div class="text-weight-bold">{{ $tc('customers.invoice_request_required') }}</div>
                <div class="text-small text-grey">{{ $tc('customers.detail.invoice_request_required') }}</div>
              </div>
            </q-checkbox>
            <q-checkbox name="invoice_category_price" v-model="rsForm.invoice_category_price" :false-value="0" :true-value="1">
              <div class="column text-caption text-faded" style="line-height:normal">
                <div class="text-weight-bold">{{ $tc('customers.invoice_category_price') }}</div>
                <div class="text-small text-grey">{{ $tc('customers.detail.invoice_category_price') }}</div>
              </div>
            </q-checkbox>
          </div>
          <div class="col-12 col-md-4 column">
            <q-checkbox name="order_manual_allowed" v-model="rsForm.order_manual_allowed" :false-value="0" :true-value="1">
              <div class="column text-caption text-faded" style="line-height:normal">
                <div class="text-weight-bold">{{ $tc('customers.order_manual_allowed') }}</div>
                <div class="text-small text-grey">{{ $tc('customers.detail.order_manual_allowed') }}</div>
              </div>
            </q-checkbox>
            <q-checkbox name="order_monthly_actived" v-model="rsForm.order_monthly_actived" :false-value="0" :true-value="1">
              <div class="column text-caption text-faded" style="line-height:normal">
                <div class="text-weight-bold">{{ $tc('customers.order_monthly_actived') }}</div>
                <div class="text-small text-grey">{{ $tc('customers.detail.order_monthly_actived') }}</div>
              </div>
            </q-checkbox>
          </div>
        </div>
        <div>
        </div>
      </div>

    </q-card-section>
    <q-separator />
    <q-card-actions class="q-mx-lg">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="init()"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" :loading="FORM.loading" />
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading"><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
  <q-dialog ref="newTripDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add New Trip</div>
          <!-- <code>{{[newTrip.intday, $app.moment().days(newTrip.intday).format('dddd')]}}</code> -->
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select dense autofocus
            v-model="newTrip.intday"
            :options="[1,2,3,4,5,6,7]"
            :option-label="(v) => v ? $app.moment().days(v).format('dddd') : null"
          />
          <q-input dense type="time" v-model="newTrip.time" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat :label="$tc('form.cancel')" v-close-popup />
          <q-btn flat :label="$tc('form.add', 2)" @click="saveAddTrip(newTrip)" :disable="!Boolean(newTrip.intday && newTrip.time)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'
import { mapGetters } from 'vuex'
export default {
  mixins: [MixForm],
  data () {
    return {
      SHEET: {
        provinces: { data: [], api: '/api/v1/references/provinces?mode=all' }
      },
      FORM: {
        resource: {
          uri: '/admin/common/customers',
          api: '/api/v1/incomes/customers'
        }
      },
      rsForm: {},
      newTrip: {
        intday: null,
        time: null
      },
      setDefault: () => {
        return {
          code: null,
          name: null,
          phone: null,
          fax: null,
          email: null,
          address: null,
          subdistrict: null,
          district: null,
          province_id: null,
          zipcode: null,

          pkp: null,
          npwp: null,
          bank_account: null,

          with_ppn: 1,
          with_pph: 1,
          ppn: 0,
          sen_service: null,
          exclude_service: 0,
          bounded_service: 0,

          invoice_mode: null,
          delivery_mode: null,
          order_mode: null,
          customer_contacts: [ { id: null } ],
          customer_trips: [],

          delivery_manual_allowed: 0,
          delivery_over_allowed: 0,
          order_manual_allowed: 0,
          order_monthly_actived: 0,
          order_lots: 0
        }
      }
    }
  },
  created () {
    // Component Page Mounted!
    this.init()
  },
  computed: {
    ...mapGetters('admin', ['CONFIG']),
    ProvinceOptions () {
      return (this.SHEET.provinces.data.map(item => ({ label: item.name, value: item.id })) || [])
    },
    weekTrips () {
      let weekTrips = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }

      this.rsForm.customer_trips.map((trip, i) => {
        if (weekTrips[trip.intday]) {
          weekTrips[trip.intday].push({ ...trip, __index: i })
        }
      })

      return weekTrips
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
    },

    openNewTrip () {
      this.newTrip = { intday: null, time: null }
      this.$refs.newTripDialog.show()
    },
    saveAddTrip (data) {
      this.rsForm.customer_trips.push(data)
      this.rsForm.customer_trips = this.rsForm.customer_trips.sort((a, b) => a.intday - b.intday).sort((a, b) => a.time - b.time)
      this.$refs.newTripDialog.hide()
    },
    removeTrip (index) {
      this.$q.dialog({
        title: this.$tc('form.confirm'),
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.delete') }),
        ok: this.$tc('messages.yes_to', 1, { v: this.$tc('form.delete') }),
        cancel: this.$tc('form.cancel')
      }).onOk(() => {
        this.rsForm.customer_trips.splice(index, 1)
      })
    },

    addNewContact (autofocus = true) {
      let newEntri = { id: null, label: null, name: null, phone: null }

      this.rsForm.customer_contacts.push(newEntri)
    },
    removeContact (index) {
      this.rsForm.customer_contacts.splice(index, 1)
      if (this.rsForm.customer_contacts.length < 1) this.addNewContact()
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
            let message = response.data.name + ' - #' + response.data.id
            this.FORM.response.success({ message: message })
            this.onSaved()
          })
          .catch((error) => {
            this.FORM.response.fields(error.response)
            this.FORM.response.error(error.response || error)
          })
          .finally(() => {
            setTimeout(() => {
              this.FORM.loading = false
            }, 2000)
          })
      })
    },

    onSaved () {
      if (!this.$app.can('customers-push')) return this.FORM.toIndex()
      this.$q.dialog({
        title: 'ACCURATE',
        message: 'are push to accurate?',
        cancel: true,
        focus: 'cancel'
      })
        .onOk(() => this.onPush())
        .onCancel(() => this.FORM.toIndex())
    },

    onPush () {
      let { apiUrl } = this.FORM.meta()
      let url = `${apiUrl}/accurate/push`
      this.$q.loading.show()
      this.$axios.post(url)
        .then((response) => {
          let msg = response.data.d[0] || ''
          if (response.data.s) { this.$app.notify.success('ACCURATE', msg) } else { this.$app.notify.warning('ACCURATE', msg) }
          this.FORM.toIndex()
        }).catch((error) => {
          this.$app.response.error(error.response || error)
        }).finally(() => {
          this.$q.loading.hide()
        })
    }
  }
}
</script>
