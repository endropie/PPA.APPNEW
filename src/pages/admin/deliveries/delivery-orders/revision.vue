<template>
<q-page padding class="form-page justify-center">
  <q-card inline class="main-box" v-if="FORM.show">
    <q-card-section>
      <form-header :title="FORM.title('REVISION')" :subtitle="`# ` + rsForm.fullnumber || rsForm.number || FORM.subtitle()" hide-menu>
        <template  slot="menu-append">

          <q-chip class="text-uppercase" square outline
            :label="$tc('form.temporary')"
            color="orange-10"
            v-if="rsForm.is_internal" />

          <ux-chip-status square outline :row="rsForm" />
        </template>
      </form-header>
    </q-card-section>
    <q-separator inset />
    <q-card-section class="row q-col-gutter-x-md q-pb-none">
      <!-- COLUMN::1st delivery detail -->
      <div class="col-12 col-md-6" >
        <q-input disable hint=""
          :label="$tc('general.customer')"
          :value="rsForm.customer ? `${rsForm.customer.code} - ${rsForm.customer.name}` : null"
        />
        <div class="row q-col-gutter-x-sm">
          <ux-date class="col-12 col-sm-12"
            name="date" type="date"
            stack-label label="Date"
            v-model="rsForm.date"
            v-validate="'required'"
            :error="errors.has('date')"
            :error-message="errors.first('date')"/>
        </div>
      </div>
      <!-- COLUMN::2nd Customer Identity -->
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
    </q-card-section>
    <q-separator inset />
    <!-- SINGLE-REVISION -->
    <q-card-section v-if="!isPartition">
      <div class="row items-center q-pb-sm">
        <div class="">
          <span class="text-h6 text-grey" >REVISE</span>
        </div>
        <q-space/>
        <q-select dense filled hide-bottom-space
          name="transaction"
          class="q-mr-sm"
          v-model="rsForm.transaction"
          :options="['RETURN', 'REGULER']"
          v-validate="`required|is:${rsForm.request_order ? rsForm.request_order.transaction : ''}`"
          :error="errors.has(`transaction`)"
          :error-message="errors.first(`transaction`)"
        />
        <ux-select filled dense hide-bottom-space
          class="" style="min-width:200px"
          name="request_order"
          stack-label :label="$tc('general.request_order')"
          :data-vv-as="$tc('general.request_order')"
          v-model="rsForm.request_order"
          :disable="rsForm.delivery_order_items && Boolean(rsForm.delivery_order_items.length)"
          filter clearable
          :source="`/api/v1/incomes/request-orders?mode=all&customer_id=${rsForm.customer_id}`"
          :option-label="(item) => item.number"
          :option-sublabel="(item) => 'REF: ' + (item.reference_number || '-')"
          :option-value="(item) => item"
          v-validate="'required'"
          :error="errors.has(`request_order`)"
          :error-message="errors.first(`request_order`)"
          @input="setRequestOrder"
        >
          <q-btn slot="after" dense flat icon="open_in_new" color="blue-grey"
            v-if="Boolean(rsForm.request_order)"
            v-show="!Boolean(rsForm.request_order && rsForm.request_order.order_mode == 'ACCUMULATE')"
            @click="setDialogRequestOrder(rsForm.request_order)"
          />
        </ux-select>
      </div>
      <!-- COLUMN:: Part items lists -->
      <q-markup-table bordered class="main-box no-shadow no-highlight"
        dense separator="horizontal"
      >
        <thead>
          <q-tr class="text-uppercase" style="line-height:30px">
            <q-th key="prefix" width="50px"></q-th>
            <q-th key="part" width="50%">{{$tc('items.part_name')}}</q-th>
            <q-th key="quantity" width="30%">{{$tc('label.quantity')}}</q-th>
            <q-th key="unit_id" width="20%">{{$tc('label.unit')}}</q-th>
          </q-tr>
        </thead>
        <tbody>
          <q-tr v-if="!rsForm.delivery_order_items.length">
            <q-td colspan="100%" class="justify-center">
              <q-input  class="hidden"
                :name="`delivery_order_items.length`"
                :value="rsForm.delivery_order_items.length"
                v-validate="`gt_value:0`"
              />
              <div class="q-pa-sm text-center text-subtitle1 text-negative"
               v-if="errors.has(`delivery_order_items.length`)">
                <q-icon name="error" size="sm" color="negative" />
                {{$tc('messages.no_details')}}
              </div>
            </q-td>
          </q-tr>
          <q-tr v-for="(row, index) in rsForm.delivery_order_items" :key="index">
            <q-td key="prefix" style="width:50px">
              <q-btn dense flat round icon="clear" color="red" @click="removeDetail(index)"/>
            </q-td>
            <q-td key="part" width="30%">
              <ux-select v-if="rsForm.request_order && rsForm.request_order.order_mode == 'ACCUMULATE'"
                class="native-top"
                :name="`delivery_order_items.${index}.item_id`"
                dense outlined hide-bottom-space
                color="blue-grey"
                v-model="row.item_id"
                filter map-options emit-value
                :options="ItemOptions"
                :loading="SHEET['items'].loading"
                v-validate="`required`"
                :error="errors.has(`delivery_order_items.${index}.item_id`)"
                @input="(val) => setItemReference(index, val)"
              >
                <small v-if="row.item_id && row.item && row.item.part_subname" class="absolute-bottom">
                  [{{row.item.customer_code}}] {{row.item.part_subname}}
                </small>
              </ux-select>
              <q-field v-else filled dense color="blue-grey">
                <div class="column" v-if="row.item">
                  <span class="text-subtitle2"> {{row.item.part_name}} </span>
                  <span class="text-caption"> No. {{row.item.part_subname}} ({{row.request_order_item_id}})</span>
                </div>
              </q-field>
            </q-td>
            <q-td key="quantity" width="25%">
              <q-input
                v-if="rsForm.revise_nc"
                type="number" style="min-width:120px"
                :name="`delivery_order_items.${index}.quantity`"
                v-model="row.quantity"
                @input="(v) => row.quantity_nc = getDividenItem(index)"
                outlined dense color="blue-grey-5"
                hide-bottom-space no-error-icon
                v-validate="`required|gt_value:0|max_value:${Number(MaxNCMount[index]) / Number(row.unit_rate || 1)}`"
                :error="errors.has(`delivery_order_items.${index}.quantity`)"
                :error-message="errors.first(`delivery_order_items.${index}.quantity`)"
              >
                <span slot="append" class="text-body2">
                / <q-badge :label="`NCR: ${row.quantity_nc}`" />
                </span>
              </q-input>
              <q-input
                v-else-if="rsForm.request_order && rsForm.request_order.order_mode == 'ACCUMULATE'"
                type="number" style="min-width:120px"
                :name="`delivery_order_items.${index}.quantity`"
                v-model="row.quantity"
                outlined dense color="blue-grey-5"
                hide-bottom-space no-error-icon
                v-validate="`required|gt_value:0`"
                :error="errors.has(`delivery_order_items.${index}.quantity`)"
                :error-message="errors.first(`delivery_order_items.${index}.quantity`)"
              />
              <q-input v-else
                type="number" style="min-width:120px"
                :name="`delivery_order_items.${index}.quantity`"
                v-model="row.quantity"
                outlined dense color="blue-grey-5"
                hide-bottom-space no-error-icon
                v-validate="`required|max_value:${Number(MaxMount[index]) / Number(row.unit_rate || 1)}`"
                :error="errors.has(`delivery_order_items.${index}.quantity`)"
                :error-message="errors.first(`delivery_order_items.${index}.quantity`)"
              >
                <span slot="append" class="text-body2">
                / <q-badge :label="Number(MaxMount[index]) / Number(row.unit_rate || 1)" />
                </span>
              </q-input>
            </q-td>
            <q-td key="unit_id" width="20%" >
              <q-select style="min-width:100px"
                :name="`delivery_order_items.${index}.unit_id`"
                v-model="row.unit_id"
                outlined dense color="blue-grey-5"
                hide-bottom-space no-error-icon
                map-options emit-value
                :options="ItemUnitOptions[index]"
                v-validate="row.item_id ? 'required' : ''"
                :error="errors.has(`delivery_order_items.${index}.unit_id`)"
                @input="(val)=>{ setUnitReference(index, val) }"
              />
            </q-td>
          </q-tr>
          <q-tr v-if="rsForm.request_order && rsForm.request_order.order_mode == 'ACCUMULATE'">
            <td colspan="100%">
              <q-btn color="primary" icon="add_circle" :label="$tc('form.add')"  @click="addNewDetail()" />
            </td>
          </q-tr>
          <q-tr>
            <q-td colspan="100%">
              <q-input type="textarea" autogrow class="q-mt-sm"
                name="description"
                :data-vv-as="$tc('label.description')"
                :label="$tc('label.description')" stack-label
                filled
                v-model="rsForm.description"/>
            </q-td>
          </q-tr>
        </tbody>
      </q-markup-table>
    </q-card-section>
    <!-- MULTI-REVISION -->
    <template v-else>
      <q-card-section v-for="(partition, partitionIndex) in rsPartitions" :key="partitionIndex">
        <div class="row  items-center q-pb-sm">
          <span class="text-h6 text-grey text-no-wrap" >
            <q-btn flat dense color="blue-grey" icon="delete" @click="removePartition(partitionIndex)" />
            MULTI-REVISION
            <font v-show="Boolean(rsPartitions.length > 1)">{{partitionIndex+1}}</font>
          </span>
          <q-space/>

          <q-select dense filled hide-bottom-space no-error-icon
            :name="`partitions.${partitionIndex}.transaction`"
            data-vv-as="Transaction"
            class="q-mr-sm"
            v-model="partition.transaction"
            :options="['RETURN', 'REGULER']"
            v-validate="`required|is:${partition.request_order ? partition.request_order.transaction : ''}`"
            :error="errors.has(`partitions.${partitionIndex}.transaction`)"
            :error-message="errors.first(`partitions.${partitionIndex}.transaction`)"
          />
          <ux-select filled dense hide-bottom-space
            class="col-auto" style="min-width:200px"
            stack-label :label="$tc('general.request_order')"
            v-model="partition.request_order"
            :disable="partition.delivery_order_items && Boolean(partition.delivery_order_items.length)"
            filter clearable
            :source="`/api/v1/incomes/request-orders?mode=all&status=OPEN&customer_id=${rsForm.customer_id}`"
            :option-label="(item) => item.fullnumber || item.number"
            :option-sublabel="(item) => item.reference_number ? `REF: ${item.reference_number}` : undefined"
            :option-value="(item) => item"
            :error="errors.has(`partitions.${partitionIndex}.request_order_id`)"
            :error-message="errors.first(`partitions.${partitionIndex}.request_order_id`)"
            @input="(v) => setRequestOrder(v, partitionIndex)"
          >
            <q-btn slot="after" dense flat icon="open_in_new" color="blue-grey"
              v-if="Boolean(partition.request_order)"
              v-show="!Boolean(partition.request_order && partition.request_order.order_mode == 'ACCUMULATE')"
              @click="setDialogRequestOrder(partition.request_order, partitionIndex)"
            />
          </ux-select>
          <q-input
            class="hidden"
            label="request_order_id"
            :name="`partitions.${partitionIndex}.request_order_id`"
            :data-vv-as="$tc('general.request_order')"
            v-model="partition.request_order_id"
            v-validate="`required|excluded:${rsPartitions.filter((x,i) => (i!==partitionIndex)).map(x => x.request_order_id)}`"
          />
        </div>
        <!-- COLUMN:: Part items lists -->
        <q-markup-table bordered class="main-box no-shadow no-highlight"
          dense separator="horizontal"
        >
          <thead>
            <q-tr class="text-uppercase" style="line-height:30px">
              <q-th key="prefix" width="50px"></q-th>
              <q-th key="part" width="50%">{{$tc('items.part_name')}}</q-th>
              <q-th key="quantity" width="30%">{{$tc('label.quantity')}}</q-th>
              <q-th key="unit_id" width="20%">{{$tc('label.unit')}}</q-th>
            </q-tr>
          </thead>
          <tbody>
            <q-tr v-if="!partition.delivery_order_items.length">
              <q-td colspan="100%" class="justify-center">
                <q-input  class="hidden"
                  :name="`partitions.${partitionIndex}.delivery_order_items.length`"
                  :value="partition.delivery_order_items.length"
                  v-validate="`gt_value:0`"
                />
                <div class="q-pa-sm text-center text-subtitle1 text-negative"
                 v-if="errors.has(`partitions.${partitionIndex}.delivery_order_items.length`)">
                  <q-icon name="error" size="sm" color="negative" />
                  {{$tc('messages.no_details')}}
                </div>
              </q-td>
            </q-tr>
            <q-tr v-for="(row, index) in partition.delivery_order_items" :key="index">
              <q-td key="prefix" style="width:50px">
                <q-btn dense flat round icon="clear" color="red" tabindex="100" @click="removeDetail(index, partitionIndex)"/>
              </q-td>
              <q-td key="part" width="30%">
                <ux-select v-if="partition.request_order && partition.request_order.order_mode == 'ACCUMULATE'"
                  class="native-top"
                  :name="`partitions.${partitionIndex}.delivery_order_items.${index}.item_id`"
                  dense outlined hide-bottom-space
                  color="blue-grey"
                  v-model="row.item_id"
                  filter map-options emit-value
                  :options="ItemOptions"
                  :loading="SHEET['items'].loading"
                  v-validate="`required`"
                  :error="errors.has(`partitions.${partitionIndex}.delivery_order_items.${index}.item_id`)"
                  @input="(val) => setItemReference(index, val, partitionIndex)"
                >
                  <small v-if="row.item_id && row.item && row.item.part_subname" class="absolute-bottom">
                    [{{row.item.customer_code}}] {{row.item.part_subname}}
                  </small>
                </ux-select>
                <q-field v-else filled dense color="blue-grey">
                  <div class="column" v-if="row.item">
                    <span class="text-subtitle2"> {{row.item.part_name}} </span>
                    <span class="text-caption"> No. {{row.item.part_subname}} ({{row.request_order_item_id}})</span>
                  </div>
                </q-field>
              </q-td>
              <q-td key="quantity" width="25%">
                <q-input v-if="rsForm.request_order && rsForm.request_order.order_mode == 'ACCUMULATE'"
                  type="number" style="min-width:120px"
                  :name="`partitions.${partitionIndex}.delivery_order_items.${index}.quantity`"
                  v-model="row.quantity"
                  outlined dense color="blue-grey-5"
                  hide-bottom-space no-error-icon
                  v-validate="`required|gt_value:0`"
                  :error="errors.has(`partitions.${partitionIndex}.delivery_order_items.${index}.quantity`)"
                  :error-message="errors.first(`partitions.${partitionIndex}.delivery_order_items.${index}.quantity`)"
                />
                <q-input v-else
                  type="number" style="min-width:120px"
                  :name="`partitions.${partitionIndex}.delivery_order_items.${index}.quantity`"
                  v-model="row.quantity"
                  outlined dense color="blue-grey-5"
                  hide-bottom-space no-error-icon
                  v-validate="`required|gt_value:0|max_value:${Number(MaxMultiMount[partitionIndex][index]) / Number(row.unit_rate || 1)}`"
                  :error="errors.has(`partitions.${partitionIndex}.delivery_order_items.${index}.quantity`)"
                  :error-message="errors.first(`partitions.${partitionIndex}.delivery_order_items.${index}.quantity`)"
                >
                  <span slot="append" class="text-body2">
                  / <q-badge :label="$app.number_format(Number(MaxMultiMount[partitionIndex][index]) / Number(row.unit_rate || 1), row.unit.decimal_in)" />
                  </span>
                </q-input>
              </q-td>
              <q-td key="unit_id" width="20%" >
                <q-select style="min-width:100px"
                  :name="`partitions.${partitionIndex}.delivery_order_items.${index}.unit_id`"
                  v-model="row.unit_id"
                  outlined dense color="blue-grey-5"
                  hide-bottom-space no-error-icon
                  map-options emit-value
                  :options="ItemUnitMultiOptions[partitionIndex][index]"
                  v-validate="'required'"
                  :error="errors.has(`partitions.${partitionIndex}.delivery_order_items.${index}.unit_id`)"
                  @input="(val)=>{ setUnitReference(index, val, partitionIndex) }"
                />
              </q-td>
            </q-tr>
            <q-tr v-if="partition.request_order && partition.request_order.order_mode == 'ACCUMULATE'">
              <td colspan="100%">
                <q-btn color="primary" icon="add_circle" :label="$tc('form.add')"  @click="addNewDetail(undefined, partitionIndex)" />
              </td>
            </q-tr>
            <q-tr>
              <q-td colspan="100%">
                <q-input type="textarea" autogrow class="q-mt-sm"
                  :name="`partitions.${partitionIndex}.description`"
                  :data-vv-as="$tc('label.description')"
                  :label="$tc('label.description')" stack-label
                  v-model="partition.description"/>
              </q-td>
            </q-tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-separator />
    </template>
    <q-card-actions class="q-mx-lg">
      <q-checkbox
        class="on-left"
        :disable="isPartition"
        v-model="rsForm.revise_nc"
        label="NC-REVISION"
        color="positive"
        @input="setPartition"
      />
      <q-checkbox
        :disable="rsForm.revise_nc"
        v-model="isPartition"
        label="MULTI-REVISION"
        color="positive"
        @input="setPartition"
      />

      <q-btn outline color="positive" icon="add_circle" :label="$tc('form.add')" @click="addPartition" v-if="isPartition" />
      <q-space/>
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" v-if="IS_REVISE"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading">
    <q-spinner-dots size="70px" color="primary" />
  </q-inner-loading>
  <q-dialog ref="dialog-request-order">
    <q-card  style="min-width:80vw" v-if="Boolean(dialog_request_order)">
      <q-card-section>
        <div class="row no-wrap items-center">
          <div class="col ellipsis">
            <span class="text-h6">{{$tc('general.request_order')}}</span>
            <br/><span># {{dialog_request_order.fullnumber || dialog_request_order.number }}</span>
          </div>
          <div class="col-auto row no-wrap items-center">
            <ux-chip-status :row="dialog_request_order" />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="no-padding">
        <q-markup-table dense class="no-shadow">
          <thead>
            <tr class="text-uppercase" style="line-height:30px">
              <th class="text-left">Part</th>
              <th class="text-center">unit</th>
              <th class="text-right">quantity</th>
              <th class="text-right">Delivery</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in dialog_request_order.request_order_items" :key="index">
              <td>
                <span>{{row.item.part_name}}</span><br/>
                <span class="text-small">No. {{row.item.part_subname}}</span>
              </td>
              <td class="text-center">{{row.item.unit.code}}</td>
              <td class="text-right">{{$app.number_format(row.quantity, row.unit.decimal_in)}}</td>
              <td class="text-right">{{$app.number_format(row.amount_delivery, row.unit.decimal_in)}}</td>
              <td class="text-center">
                <q-btn dense flat icon="add_circle" @click="addNewDetail(row, dialog_request_order.partitionIndex )"/>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn v-close-popup flat color="blue-grey" :label="$tc('form.close')" />
      </q-card-actions>
    </q-card>
    <q-banner v-else dense class="bg-grey-3">
      <template v-slot:avatar>
        <q-icon name="block" color="negative" />
      </template>
      {{`Please select ${$tc('general.request_order')}`}}
      <template v-slot:action>
        <q-btn flat color="negative" :label="$tc('form.close')"  v-close-popup />
      </template>
    </q-banner>
  </q-dialog>
  <q-dialog ref="dialog-submit" persistent>
    <q-card style="min-width:200px; width:50vw">
      <q-bar class="text-grey-14">
        <q-icon name="insert_comment" class="on-left"/>
        <div class="text-ellipsis">
          REVISE REASON
        </div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section class="q-gutter-sm">
        <q-select
          :label="$tc('label.reason')" stack-label
          v-model="dialog_reason.reason_id"
          :options="ReasonOptions" clearable
          emit-value map-options
        />
        <q-input type="textarea" filled autogrow
          input-style="min-height:50px"
          :label="$tc('label.description')" stack-label
          v-model="dialog_reason.reason_description"
        />
      </q-card-section>
      <q-card-actions class="q-pt-none" align="right">
        <q-btn color="grey" label="Cancel" v-close-popup />
        <q-btn color="primary" label="OK" @click="onSubmit(dialog_reason)"
          :disable="(dialog_reason.reason_id == null && !dialog_reason.reason_description)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      SHEET: {
        request_orders: { autoload: false, api: '/api/v1/incomes/request-orders?mode=all' },
        request_order_items: { autoload: false, api: '' },
        items: { autoload: false, api: '/api/v1/common/items?mode=all' },
        customers: { api: '/api/v1/incomes/customers?mode=all' },
        employees: { api: '/api/v1/common/employees?mode=all' },
        vehicles: { api: '/api/v1/references/vehicles?mode=all' },
        units: { api: '/api/v1/references/units?mode=all' },
        reasons: { api: '/api/v1/references/reasons?mode=all&type=DELIVERY_ORDER_REVISE' }
      },
      FORM: {
        resource: {
          api: '/api/v1/incomes/delivery-orders',
          uri: '/admin/deliveries/delivery-orders'
        }
      },
      rsForm: null,
      rsPartitions: [],
      isPartition: false,
      dialog_request_order: { show: false, data: null },
      dialog_reason: { reason: null, reason_description: null },
      setDefault: () => {
        return {
          number: null,
          transaction: null,
          date: this.$app.moment().format('YYYY-MM-DD'),

          customer_id: null,
          customer_name: null,
          customer_phone: null,
          customer_address: null,

          revise_id: 0,
          revise_number: 0,
          description: null,
          delivery_order_items: [{
            id: null,
            item_id: null,
            item: {},
            quantity: null,

            unit_id: null,
            unit_rate: 1
          }]
        }
      }
    }
  },
  created () {
    // Component Page Created!
    this.init()
  },
  computed: {
    IS_REVISE () {
      if (this.rsForm.deleted_at) return false
      if (this.rsForm.is_internal) return false
      if (this.rsForm.reconcile_id && this.rsForm.status !== 'OPEN') return false
      return true
    },
    ReasonOptions () {
      return (this.SHEET.reasons.data
        .filter(item => item.enable)
        .map(item => ({ label: item.name, value: item.id })) || [])
        .concat([{ label: 'Others', value: null }])
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({ label: item.code, value: item.id })) || [])
    },
    ItemOptions () {
      let ITEM = this.SHEET.items.data.filter((item) => item.customer_id === this.rsForm.customer_id)
      return (ITEM.map(item => ({ label: `${item.part_name}`, sublabel: `[${item.customer_code}] ${item.part_subname || '-'}`, value: item.id })) || [])
    },
    ItemUnitOptions () {
      let vars = []
      for (const i in this.rsForm.delivery_order_items) {
        if (this.rsForm.delivery_order_items.hasOwnProperty(i)) {
          let rsItem = this.rsForm.delivery_order_items[i]
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

    ItemUnitMultiOptions () {
      return this.rsPartitions.map(partition => {
        let vars = []
        for (const i in partition.delivery_order_items) {
          if (partition.delivery_order_items.hasOwnProperty(i)) {
            let rsItem = partition.delivery_order_items[i]
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
      })
    },
    MaxMount () {
      return this.rsForm.delivery_order_items.map((detail, index) => {
        if (!detail.request_order_item) return 0
        const oldRow = (detail.request_order_item.request_order_id !== this.FORM.data.request_order_id)
          ? null : this.FORM.data.delivery_order_items.find(x => x.request_order_item_id === detail.request_order_item.id)
        const oldAmount = Number(oldRow ? oldRow.unit_amount : 0)

        return Number(detail.request_order_item.unit_amount) - Number(detail.request_order_item.amount_delivery) + Number(oldAmount)
      })
    },
    MaxNCMount () {
      return this.rsForm.delivery_order_items.map((detail, index) => {
        console.log("OKOK", this.FORM.data)
        const oldRow = this.FORM.data?.delivery_order_items[index] || null;
        return Number(oldRow?.unit_amount || 0) + Number(oldRow?.quantity_nc * oldRow.unit_rate)
      })
    },
    MaxMultiMount () {
      return this.rsPartitions.map(rs => {
        return (rs.delivery_order_items.map(detail => {
          if (!detail.request_order_item) return 0
          const oldRow = (detail.request_order_item.request_order_id !== this.FORM.data.request_order_id)
            ? null : this.FORM.data.delivery_order_items.find(x => x.request_order_item_id === detail.request_order_item.id)
          const oldAmount = Number(oldRow ? oldRow.unit_amount : 0)

          return Number(detail.request_order_item.unit_amount) - Number(detail.request_order_item.amount_delivery) + Number(oldAmount)
        }) || [])
      })
    },
    MAPINGKEY () {
      let variables = {
        'request_order_items': {},
        'units': {},
        'items': {}
      }
      this.SHEET['units'].data.map(value => { variables['units'][value.id] = value })
      this.SHEET['items'].data.map(value => { variables['items'][value.id] = value })
      this.SHEET['request_order_items'].data.map(value => { variables['request_order_items'][value.id] = value })

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
    getDividenItem(index) {
      return Number(this.FORM.data.delivery_order_items[index]?.quantity || 0)
          + Number(this.FORM.data.delivery_order_items[index]?.quantity_nc || 0)
          - Number(this.rsForm.delivery_order_items[index]?.quantity || 0)

    },
    setDialogRequestOrder (val, partitionIndex) {
      this.$q.loading.show()
      this.$axios.get(`/api/v1/incomes/request-orders/${val.id}?mode=view`)
        .then(response => {
          this.dialog_request_order = Object.assign({
            ...val,
            request_order_items: response.data.request_order_items || []
          })
          if (typeof partitionIndex !== 'undefined') this.dialog_request_order.partitionIndex = partitionIndex
          this.$refs['dialog-request-order'].show()
        })
        .catch(error => {
          this.$app.error(error.response || error)
        })
        .finally(() => {
          this.$q.loading.hide()
        })
    },
    setRequestOrder (val, partitionIndex) {
      if (typeof partitionIndex !== 'undefined') {
        this.rsPartitions[partitionIndex].request_order_id = val ? val.id : null
      } else {
        this.rsForm.request_order_id = val ? val.id : null
      }
    },
    setItemReference (index, val, partitionIndex) {
      if (typeof partitionIndex !== 'undefined') {
        if (!val) {
          this.rsPartitions[partitionIndex].delivery_order_items[index].unit_id = null
          this.rsPartitions[partitionIndex].delivery_order_items[index].unit = {}
          this.rsPartitions[partitionIndex].delivery_order_items[index].item = {}
        } else {
          this.rsPartitions[partitionIndex].delivery_order_items[index].item = this.MAPINGKEY['items'][val]
          let baseUnitID = this.MAPINGKEY['items'][val].unit_id
          this.rsPartitions[partitionIndex].delivery_order_items[index].unit_id = baseUnitID
          this.rsPartitions[partitionIndex].delivery_order_items[index].unit_rate = 1
          this.rsPartitions[partitionIndex].delivery_order_items[index].unit = this.MAPINGKEY['units'][baseUnitID]
        }
      } else {
        if (!val) {
          this.rsForm.delivery_order_items[index].unit_id = null
          this.rsForm.delivery_order_items[index].unit = {}
          this.rsForm.delivery_order_items[index].item = {}
        } else {
          this.rsForm.delivery_order_items[index].item = this.MAPINGKEY['items'][val]
          let baseUnitID = this.MAPINGKEY['items'][val].unit_id
          this.rsForm.delivery_order_items[index].unit_id = baseUnitID
          this.rsForm.delivery_order_items[index].unit_rate = 1
          this.rsForm.delivery_order_items[index].unit = this.MAPINGKEY['units'][baseUnitID]
        }
      }
    },
    setUnitReference (index, val, partitionIndex) {
      if (!val) return
      if (typeof partitionIndex !== 'undefined') {
        if (this.rsPartitions[partitionIndex].delivery_order_items[index].item.unit_id === val) {
          this.rsPartitions[partitionIndex].delivery_order_items[index].unit_rate = 1
        } else {
          if (this.rsPartitions[partitionIndex].delivery_order_items[index].item.item_units) {
            this.rsPartitions[partitionIndex].delivery_order_items[index].item.item_units.map((itemUnit) => {
              if (itemUnit.unit_id === val) this.rsPartitions[partitionIndex].delivery_order_items[index].unit_rate = itemUnit.rate
            })
          }
        }
      } else {
        if (this.rsForm.delivery_order_items[index].item.unit_id === val) {
          this.rsForm.delivery_order_items[index].unit_rate = 1
        } else {
          if (this.rsForm.delivery_order_items[index].item.item_units) {
            this.rsForm.delivery_order_items[index].item.item_units.map((itemUnit) => {
              if (itemUnit.unit_id === val) this.rsForm.delivery_order_items[index].unit_rate = itemUnit.rate
            })
          }
        }
      }
    },
    setForm (data) {
      this.rsForm = Object.assign({}, this.setDefault(), data)
      this.SHEET.load('items', `customer_id=${this.rsForm.customer_id}`)
    },
    setPartition (v) {
      if (v) {
        if (!this.rsPartitions.length) {
          this.addPartition({
            transaction: this.FORM.data.transaction,
            request_order: this.FORM.data.request_order,
            request_order_id: this.FORM.data.request_order_id,
            delivery_order_items: [] // this.FORM.data.delivery_order_items,
          })
        }
      }
    },

    addPartition (val) {
      const entri = { transaction: null, request_order_id: null, request_order: null, delivery_order_items: [], description: null, ...val }
      this.rsPartitions.push(entri)
    },
    removePartition (partitionIndex) {
      this.rsPartitions.splice(partitionIndex, 1)
    },

    addNewDetail (entri, partitionIndex) {
      entri = typeof entri === 'undefined'
        ? {
          id: null,
          quantity: null,
          item_id: null,
          item: null,
          unit_id: null,
          unit: null,
          unit_rate: 1,
          request_order_item_id: null,
          request_order_item: null
        }
        : {
          id: null,
          quantity: null,
          item_id: entri.item_id,
          item: entri.item,
          unit_id: entri.unit_id,
          unit: entri.unit,
          unit_rate: entri.unit_rate,
          request_order_item_id: entri.id,
          request_order_item: entri
        }

      if (typeof partitionIndex !== 'undefined') {
        const some = this.rsPartitions[partitionIndex].delivery_order_items.find(x => x.request_order_item_id === entri.id)
        if (entri.request_order_item_id && some) {
          return this.$q.notify('PART HAS READY')
        }
        this.rsPartitions[partitionIndex].delivery_order_items.push(entri)
      } else {
        const some = this.rsForm.delivery_order_items.find(x => x.request_order_item_id === entri.id)
        if (entri.request_order_item_id && some) {
          return this.$q.notify('PART HAS READY')
        }
        this.rsForm.delivery_order_items.push(entri)
      }
    },
    removeDetail (index, partitionIndex) {
      if (typeof partitionIndex !== 'undefined') {
        this.rsPartitions[partitionIndex].delivery_order_items.splice(index, 1)
      } else {
        this.rsForm.delivery_order_items.splice(index, 1)
      }
    },
    onSubmit () {
      const submit = () => {
        this.$q.loading.show()
        const method = 'PUT'
        const mode = this.isPartition ? 'multi-revision' : 'revision'
        let data = this.isPartition
          ? { ...this.rsForm, partitions: this.rsPartitions } : this.rsForm
        data = { ...data, ...this.dialog_reason }
        const url = `${this.FORM.resource.api}/${this.ROUTE.params.id}/${mode}`

        this.$axios.set(method, url, data)
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
            this.$q.loading.hide()
          })
      }

      this.$q.dialog({
        title: this.$tc('form.confirm'),
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.save') }),
        cancel: true,
        focus: 'cancel'
      }).onOk(() => submit())
    },
    onSave () {
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

        this.$refs['dialog-submit'].show()
      })
    }
  }
}
</script>
