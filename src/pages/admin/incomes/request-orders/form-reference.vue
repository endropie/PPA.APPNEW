<template>
<q-page padding class="main-page justify-center">
  <q-card inline class="main-box"  v-if="FORM.show">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" hide-menu>
        <q-chip square outline slot="optional" icon="assignment" color="blue-grey" class="text-weight-normal"
          v-if="rsForm.order_mode">
          <span v-if="rsForm.transaction == 'RETURN'"> RETURN </span>
          <span v-else>
            {{CONFIG.options.order_mode.find(x => x.value === rsForm.order_mode)
              ? CONFIG.options.order_mode.find(x => x.value === rsForm.order_mode).label : rsForm.order_mode}}
          </span>
        </q-chip>
        <ux-chip-status square slot="optional" :row="rsForm" outline/>
      </form-header>
    </q-card-section>
    <!-- COLUMN::1st customer Identitity -->
    <q-card-section class="row q-col-gutter-sm">
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <ux-select-filter name="customer" class="col-12"
            v-model="rsForm.customer_id"
            :label="$tc('general.customer')"
            :disable="IssetItemDetails" v-validate="'required'"
            :options="CustomerOptions" filter clearable
            @input="(val)=>{ setCustomerReference(val) }"
            :error="errors.has('customer')"
            :error-message="errors.first('customer')"
            :loading="SHEET['customers'].loading">
            <q-tooltip v-if="IssetItemDetails" :offset="[0, 10]">To change: Please delete Part items first!</q-tooltip>
          </ux-select-filter>
          <ux-date class="col-12 col-sm-6" name="date"
            stack-label :label="$tc('label.date')"
            v-model="rsForm.date" disable
            v-validate="'required'"
            :error="errors.has('date')"
            :error-message="errors.first('date')" />
          <ux-date  class="col-12 col-sm-6" style="min-width:150px"
            name="actived_date"
            stack-label :label="$tc('label.expired',2) + ' PO'"
            v-model="rsForm.actived_date"
            v-validate="rsForm.order_mode == 'PO' ? 'required' : ''"
            :error="errors.has('actived_date')"
            :error-message="errors.first('actived_date')"
             v-if="rsForm.order_mode === 'PO'"
          />
        </div>
      </div>
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <q-field  class="col-12" borderless hint=""
            :class="{'hidden': Boolean(rsForm.id) && !rsForm.is_estimate}">
            <q-toggle slot="before" name="is_estimate"
              :label="$tc('label.estimate')" left-label
              v-model="rsForm.is_estimate"
              :true-value="1" :false-value="0"
              :disable="Boolean(rsForm.id)"/>
            <q-input name="estimate_number" class="no-padding fit"
                stack-label :label="$tc('label.no', 1, {v: 'PO '+$tc('label.estimate', 2)})"
                v-model="rsForm.estimate_number"
                v-validate="rsForm.is_estimate ? 'required' :''"
                :error="errors.has('estimate_number')"
                :error-message="errors.first('estimate_number')"
                :disable="Boolean(rsForm.id)"
                v-if="rsForm.is_estimate"/>

          </q-field>
          <div class="col-12 q-px-lg">
            <q-btn outline class="full-width"
              :label="$tc('messages.release_customer_order')"
              color="primary"
              @click="isFinished = true"
              v-if="rsForm.id && rsForm.is_estimate && !Boolean(isFinished)"/>
          </div>
          <q-input name="reference_number" class="col-12"
            stack-label label="PO / Qoutation / Memo"
            v-model="rsForm.reference_number"
            v-validate="rsForm.order_mode === 'PO' ? 'required' :''"
            :error="errors.has('reference_number')"
            :error-message="errors.first('reference_number')"
            v-if="!rsForm.is_estimate || isFinished">
            <q-btn slot="after" flat round icon="clear" v-if="isFinished" @click="setCancelFinished" />
          </q-input>
        </div>
      </div>
    </q-card-section>
    <!-- COLUMN::2th Incoming Items lists -->
    <q-card-section class="row q-col-gutter-sm q-col-gutter-x-md">
      <div class="col-12 q-my-md">
        <q-markup-table class="main-box no-shadow no-highlight th-uppercase"
          dense bordered separator="vertical"
          >
          <thead>
            <q-tr style="line-height:30px">
              <q-th key="item" class="text-left">{{$tc('items.part_name')}}</q-th>
              <q-th key="quantity" class="text-right">{{$tc('label.quantity')}}</q-th>
              <q-th key="unit_id" class="text-left">{{$tc('label.unit')}}</q-th>
              <q-th key="price" class="text-right">{{$tc('label.price')}}</q-th>
              <q-th key="total" class="text-right">{{$tc('label.total')}}</q-th>
            </q-tr>
          </thead>
          <tbody>
            <q-tr v-for="(row, index) in rsForm.request_order_items" :key="index">
              <q-td key="item" width="30%" style="min-width:150px">
                <div class="column">
                  <span>{{row.item.part_name}}</span>
                  <small class="text-light">[{{row.item.customer_code}}] {{row.item.part_subname}}</small>
                </div>
              </q-td>
              <q-td key="quantity" width="10%" class="text-right">
                {{$app.number_format(row.quantity, row.unit.decimal_in)}}
              </q-td>
              <q-td key="unit_id" width="10%">
                {{row.unit.code}}
              </q-td>
              <q-td key="price" width="20%" class="text-right" style="min-width:120px">
                {{$app.number_format(row.price)}}
              </q-td>
              <q-td key="total" width="20%" class="text-right" style="min-width:150px">
                {{$app.number_format(Number(row.quantity) * Number(row.price))}}
              </q-td>
            </q-tr>
          </tbody>
        </q-markup-table>
      </div>
      <!-- COLUMN::4th Description -->
      <div class="col-12">
        <q-input filled type="textarea" rows="3"
          name="description"
          stack-label :label="$tc('label.description')"
          v-model="rsForm.description"
          >

          <template slot="prepend">
            <q-icon name="rate_review"></q-icon>
          </template>
        </q-input>

      </div>

    </q-card-section>
    <q-separator  />
    <q-card-actions class="q-mx-lg">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" v-if="IS_EDITABLE"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" ><q-spinner-dots size="70px" /></q-inner-loading>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      isFinished: false,
      SHEET: {
        customers: {api:'/api/v1/incomes/customers?mode=all'},
        brands: {api:'/api/v1/references/brands?mode=all'},
        units: {api:'/api/v1/references/units?mode=all'},
        vehicles: {api:'/api/v1/references/vehicles?mode=all'},
        items: {autoload:false, api:'/api/v1/common/items?mode=all'}
      },
      FORM: {
        resource: {
          uri: '/admin/incomes/request-orders',
          api: '/api/v1/incomes/request-orders',
        }
      },
      rsForm: {},
      setDefault:()=>{
        return {
          number: null,
          customer_id: null,
          date: null,
          actived_date: null,
          reference_number: null,
          transaction: 'REGULER',
          order_mode: null,
          description: null,
          is_estimate: 0,
          estimate_number: null,

          request_order_items:[
            {
              id:null,
              item_id: null, item: {},
              quantity: null,
              price: 0,
              unit_id: null,
              unit_rate: 1
            }
          ]

        }
      }
    }
  },
  created(){
    // Component Page Created!
    this.init()
  },
  computed: {
    IS_EDITABLE() {
      if (this.rsForm.deleted_at) return false
      if (this.rsForm.status === 'CLOSE') return false
      return true
    },
    IssetItemDetails() {
        let items = this.rsForm.request_order_items
        for (const i in items) {
          if (items.hasOwnProperty(i)) {
            if(items[i].item_id) return true
          }
        }

        return false
    },
    CustomerOptions() {

      let data = this.SHEET.customers.data
      if(this.ROUTE.meta.mode !== 'edit'){
        data = data.filter(item => item.order_mode === 'PO')
      }

      return (data.map(item => ({label: [item.code, item.name].join(' - '), value: item.id})) || [])
    },
    MAPINGKEY() {
      let variables = {
        'customers' : {},
        'units': {},
        'items': {}
      }

      this.SHEET['customers'].data.map(value => { variables['customers'][value.id] = value })
      this.SHEET['units'].data.map(value => { variables['units'][value.id] = value })
      this.SHEET['items'].data.map(value => { variables['items'][value.id] = value })

      return variables;
    }
  },
  watch:{
      '$route' : 'init',
  },
  methods: {
    init() {
      this.FORM.load((data) => {
        this.setForm(data || this.setDefault())
      })
    },
    setForm(data) {
      this.rsData = JSON.parse(JSON.stringify(data))
      this.rsForm = JSON.parse(JSON.stringify(data))

      if (data.customer_id) {
        this.SHEET.load('items', `customer_id=${data.customer_id}`)
      }
    },
    setCustomerReference(val) {
      if(!val) {
        this.rsForm.customer = {};
        this.rsForm.order_mode = null;
      }
      else {
        this.rsForm.customer = this.MAPINGKEY['customers'][val];
        this.rsForm.order_mode = this.MAPINGKEY['customers'][val].order_mode;

        this.SHEET.load('items', `customer_id=${val}`)

        if(this.rsForm.order_mode == 'PO') {
          this.rsForm.begin_date == null
          this.rsForm.until_date == null
        }
      }
    },
    routing() {
      if(this.ROUTE.meta.mode === 'edit') {

        this.FORM.loading = true
        let url = this.FORM.resource.api +'/'+ this.ROUTE.params.id
        this.$axios.get(url)
          .then((response) => {
            const data = response.data
            this.setRsForm(data)
            this.setRsData(data)
            this.setForm(data)
          })
          .catch(error => {
            this.$app.response.error(error.response, 'Load Form')
          })
          .finally(()=>{
            this.FORM.show = true
            this.FORM.loading = false
          });

      }
      else{
        this.rsForm = this.setDefault()
        this.FORM.show = true;
      }
    },
    setCancelFinished() {
      this.rsForm.reference_number = null
      this.$nextTick(()=> {
        this.isFinished = false
      })
    },
    onSave() {
      this.$validator.validate().then(result => {
        if (!result) {
          this.$q.notify({
            color:'negative', icon:'error', position:'top-right', timeout: 3000,
            message:this.$tc('messages.to_complete_form')
          });

          return;
        }
        this.FORM.loading = true
        let {method, mode, apiUrl} = this.FORM.meta()
        apiUrl =  `${apiUrl}?mode=referenced`

        this.$axios.set(method, apiUrl, this.rsForm)
        .then((response) => {
          let message = response.data.number + ' - #' + response.data.id
          this.FORM.response.success({message:message})
          this.FORM.toView(response.data.id)
        })
        .catch((error) => {
          this.FORM.response.error(error.response || error)
          this.FORM.response.fields(error.response)
        })
        .finally(()=>{
          this.FORM.loading = false
        });

      });
    },
  },
}
</script>
