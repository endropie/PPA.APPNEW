<template>
<q-page padding class="form-page row justify-center">
  <q-card inline class=" self-start" v-if="FORM.show" >
    <q-card-section class="q-pa-sm">
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
        <q-chip slot="optional" square outline icon="bookmark" color="warning" label="SAMPLE" v-if="rsForm.sample" />
        <template slot="menu-item">
          <list-item :label="$tc('form.remove')" icon="delete" clickable @click="FORM.delete" v-close-popup v-if="ROUTE.params.id"/>
        </template>
      </form-header>
    </q-card-section>
    <q-separator />
    <!-- ROW::1st Part Identity -->
    <q-card-section class="row q-col-gutter-sm">
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <ux-select class="col-12"
            name="customer_id"
            :label="$tc('general.customer')"
            :data-vv-as="$tc('general.customer')"
            v-model="rsForm.customer_id" :readonly="Boolean(rsForm.id)"
            options-cover clearable
            :options="CustomerOptions"
            filter map-options emit-value
            v-validate="'required'"
            :error="errors.has('customer_id')"
            :error-message="errors.first('customer_id')"/>

          <ux-select
            name="brand_id"
            :label="$tc('general.brand')"
            class="col-12 col-sm-6"
            v-model="rsForm.brand_id"
            v-validate="isNotSample(`required`)"
            :options="BrandOptions"
            :input-debounce="0"
            filter map-options emit-value
            :error="errors.has('brand_id')"
            :error-message="errors.first('brand_id')"
          />

          <ux-select-filter
            name="specification_id"
            v-model="rsForm.specification_id"
            :label="$tc('items.specification')"
            class="col-12 col-sm-6"
            v-validate="isNotSample(`required`)"
            :options="SpecificationOptions"
            :error="errors.has('specification_id')"
            :error-message="errors.first('specification_id')" />

          <ux-select-filter
            name="category_item_id"
            v-model="rsForm.category_item_id"
            label="Category"
            v-validate="isNotSample(`required`)"
            class="col-6"
            icon="table_chart"
            :options="CategoryOptions"
            :error="errors.has('category_item_id')"
            :error-message="errors.first('category_item_id')" />
          <ux-select-filter
            name="type_item_id"
            label="Type"
            class="col-6"
            icon="dehaze"
            v-model="rsForm.type_item_id"
            v-validate="isNotSample(`required`)"
            :options="TypeOptions"
            :error="errors.has('type_item_id')"
            :error-message="errors.first('type_item_id')" />
          <ux-select-filter
            name="unit_id"
            v-model="rsForm.unit_id"
            :label="$tc('label.unit')"
            class="col-6"
            icon="web_asset"
            v-validate="'required'"
            :options="UnitOptions"
            :error="errors.has('unit_id')"
            :error-message="errors.first('unit_id')" />
          <ux-select-filter
            name="size_id"
            v-model="rsForm.size_id"
            label="Size"
            v-validate="isNotSample(`required`)"
            :options="SizeOptions"
            class="col-6"
            icon="format_size"
            :error="errors.has('size_id')"
            :error-message="errors.first('size_id')" />
        </div>
      </div>
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <q-input class="col-12"
            name="code"
            :placeholder="FORM.ifCreate('[Auto Generate]','')"
            :label="$tc('label.code_intern')"
            v-model="rsForm.code"
            v-validate="FORM.ifCreate('','required')"
            :error="errors.has('code')"
            :error-message="errors.first('code')" >
            <q-toggle slot="after" class="text-body2 bordered rounded-borders q-pa-xs no-margin"
              :label="rsForm.enable ? 'Enable':'Disable'" left-label
              v-model="rsForm.enable"
              :color="rsForm.enable ? 'primary':'red'"
              :true-value="1"
              :false-value="0"
            />
          </q-input>
          <q-input
            name="part_number"
            label="Part Number"
            class="col-12"
            icon="layers"
            v-model="rsForm.part_number"
            v-validate="'required'"
            :error="errors.has('part_number')"
            :error-message="errors.first('part_number')"
          />
          <q-input
              name="part_name"
              label="Part name"
              v-model="rsForm.part_name"
              v-validate="'required'"
              class="col-12"
              icon="label"
              :error="errors.has('part_name')"
              :error-message="errors.first('part_name')"
          />
          <q-input class="col-12"
            name="part_alias"
            label="Part alias Finished"
            v-model="rsForm.part_alias"
            v-validate="''"
            icon="beenhere"
            :error="errors.has('part_alias')"
            :error-message="errors.first('part_alias')"
          />
        </div>
      </div>
    </q-card-section>
    <!-- ROW::2th Estimate, unit corvertion & Enginering  -->
    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- ITEM - PRELINE -->
        <div class="col-12 col-md-6">
          <q-card class="fit">
            <q-card-section horizontal class="bg-secondary text-white q-px-sm q-py-xs">
              <div class="text-subtitle2 q-py-xs">Enginering information</div>
              <q-space />
              <q-btn flat dense outline icon="edit"
                @click="rsForm.sample_enginered_at = true"
                v-if="FORM.data.sample"
                v-show="rsForm.sample_enginered_at !== true"
              />
              <q-btn flat dense outline icon="clear"
                @click="[rsForm.sample_enginered_at = null, rsForm.price = FORM.data.price]"
                v-if="FORM.data.sample"
                v-show="rsForm.sample_enginered_at === true"
              />
            </q-card-section>
            <q-separator />
              <q-card-section class="q-pa-sm" v-if="!rsForm.sample && !$app.can(['items-sample', 'items-engineer'])">
                <div class="text-center q-pa-lg text-italic">No Permission</div>
              </q-card-section>
              <q-card-section class="q-pa-sm" v-else>
              <q-tooltip v-if="FORM.data.sample && rsForm.sample_enginered_at !== true" >
                For modify, click edit first!
              </q-tooltip>
              <div class="row q-col-gutter-x-sm" :class="{'light-dimmed': FORM.data.sample && rsForm.sample_enginered_at !== true} ">
                <q-input class="col-12 col-sm-6" input-style="text-align:left"
                  name="sa_dm"
                  label="S.A (dm)"
                  v-model="rsForm.sa_dm"
                  type="number"
                  v-validate="isEnginered(`required`)"
                  no-error-icon
                  :error="errors.has('sa_dm')"
                  :error-message="errors.first('sa_dm')"
                />
                <q-input class="col-12 col-sm-6" input-style="text-align:left"
                  name="weight"
                  label="Weight"
                  v-model="rsForm.weight"
                  type="number"
                  v-validate="isEnginered(`required`)"
                  no-error-icon
                  :error="errors.has('weight')"
                  :error-message="errors.first('weight')"
                />

                <div class="col-12 col-sm-6 row q-col-gutter-sm">
                  <q-select class="col-12 col-sm-6"
                    name="load_type"
                    :label="$tc('label.mode', 1, {v:'Hanger/Barrel'})"
                    v-model="rsForm.load_type"
                    :options="['HANGER', 'BAREL']"
                    v-validate="isEnginered(`required`)"
                    :error="errors.has('load_type')"
                    :error-message="errors.first('load_type')"
                  />
                  <q-input class="col-12 col-sm-6"
                    name="load_capacity"
                    :label="$tc('label.capacity', 1)"
                    type="number"
                    v-model="rsForm.load_capacity"
                    v-validate="isEnginered(`required`)"
                    no-error-icon
                    :error="errors.has('load_capacity')"
                  />
                </div>

                <div class="col-12 col-sm-6 row q-col-gutter-sm">

                  <q-select class="col-12 col-sm-6"
                    name="packarea_id"
                    :label="$tc('general.packarea')"
                    v-model="rsForm.packarea_id"
                    :options="PackareaOptions"
                    map-options emit-value
                    :option-label="(opt) => opt.name"
                    v-validate="isEnginered(`required`)"
                    :error="errors.has('packarea')"
                    :error-message="errors.first('packarea')"
                  />
                  <q-input class="col-12 col-sm-6"
                    name="packing_duration"
                    label="Packing duration"
                    type="number"
                    icon="timer"
                    v-model="rsForm.packing_duration"
                    v-validate="isEnginered(`required`)"
                    no-error-icon
                    :error="errors.has('packing_duration')"
                  />
                </div>

                <q-list dense class="col-12 ">
                  <q-item class="no-padding q-mt-md">
                    <q-item-section>
                      <q-item-label header class="text-subtitle2 no-padding" >Preline Production</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn dense color="primary" label="ADD SUBLINE" @click="addNewProduction()" />
                    </q-item-section>
                  </q-item>
                  <q-list dense class="column reverse">
                    <q-item v-for="(item, index) in rsForm.item_prelines" :key="index" class="no-padding">
                      <q-item-section>
                        <div class="row q-gutter-sm">
                          <div class="col">
                            <ux-select
                              :ref="`pre-line`"
                              :name="`prelines.${index}.line_id`"
                              :error="errors.has(`prelines.${index}.line_id`)"
                              :error-message="errors.first(`prelines.${index}.line_id`)"
                              v-model="rsForm.item_prelines[index].line_id"
                              inverted dense
                              color="primary"
                              :prefix="`${rsForm.item_prelines.length - index}. `"
                              :options="LineOptions"
                              filter map-options emit-value
                              :inject-filter="(line) => { if(index === 0 && !line.ismain) return false}"
                              v-validate="isEnginered(`required`) + (index  === 0 ? `|included: ${LineOptions.filter(x=> x.ismain === 1).map(x => x.id)}` : '')"
                            >
                              <q-badge slot="append" color="teal" label="main" v-if="index === 0"/>
                            </ux-select>
                          </div>
                          <div class="col" style="max-width:170px">
                            <q-input
                              type="number" min="0"
                              :name="`prelines.${index}.line_id`"
                              :error="errors.has(`prelines.${index}.load_amount`)"
                              :error-message="errors.first(`prelines.${index}.load_amount`)"
                              inverted dense
                              v-model="rsForm.item_prelines[index].load_amount"
                            >
                              <div slot="append" class="text-caption">
                                {{ rsForm.load_type || 'Hanger/Barel'}}
                              </div>
                            </q-input>
                          </div>
                        </div>
                      </q-item-section>
                      <q-item-section side class="no-padding">
                        <q-btn :class="{'invisible':!index}" class="q-mb-md" dense flat round icon="clear" color="red-5" @click="removeProduction(index)"/>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-list>

              </div>
            </q-card-section>
          </q-card>
        </div>
        <!-- ITEM - CONVERTION -->
        <div class="col-12 col-sm-grow" :class="{'col-sm-6 col-md-3': $app.can('items-sample')}">
          <q-card class="fit">
            <q-card-section class="bg-secondary text-white q-pa-sm">
              <div class="text-subtitle2">Unit Convertion</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <q-list dense>
                <!-- <q-item-label header class="text-caption no-padding">Unit Convertion</q-item-label> -->
                <q-item v-for="(item, index) in rsForm.item_units" :key="index" class="no-padding">
                  <q-item-section>
                    <q-input
                      :name="`unit-${index}`"
                      type="number"
                      v-model="rsForm.item_units[index].rate"
                      v-validate="isNotSample(`required|gt_value:0`)"
                      dense no-error-icon
                      :error="errors.has(`unit-${index}`)"
                      :error-message="errors.first(`unit-${index}`)">
                      <template slot="prepend">
                        <q-select class="no-padding text-white"
                          :name="`unit-${index}`"
                          :placeholder="$tc('form.select')"
                          prefix="1 -"
                          v-model="rsForm.item_units[index].unit_id"
                          v-validate="isNotSample(`required`)"
                          dense borderless style="width:110px"
                          map-options emit-value
                          :options="UnitOptions.filter(x => x.value !== rsForm.unit_id)"
                          :error="errors.has(`unit-${index}`)"
                          :error-message="errors.first(`unit-${index}`)"
                      />
                      <span class="text-caption">rate</span>
                      <q-icon size="24px" name="arrow_right_alt"></q-icon>
                      </template>
                    </q-input>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn dense round flat icon="clear" color="red-4" @click="removeUnit(index)"/>
                  </q-item-section>
                </q-item>
                <q-item  class="">
                  <q-item-section>
                    <q-btn dense outline color="primary" :label="$tc('form.add', 2)" @click="addNewUnit()" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
        <!-- ITEM - ESTIMATE -->
        <div class="col-12 col-sm-6 col-md-3"  v-if="$app.can('items-sample')">
          <q-card class="fit">
            <q-card-section class="bg-secondary text-white q-pa-sm">
              <div class="text-subtitle2">Estimation</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
                <ux-numeric readonly input-style="text-align:left"
                  type="number" color="secondary"
                  name="estimate_price"
                  label="Estimate Price"
                  v-model="rsForm.estimate_price"
                  v-validate="isFromSample(`required`)"
                  :error="errors.has('estimate_price')"
                  :error-message="errors.first('estimate_price')"
                />
                <q-input readonly input-style=""
                  type="number" color="secondary"
                  name="estimate_sadm"
                  label="Estimate S.A (dm)"
                  v-model="rsForm.estimate_sadm"
                  v-validate="isFromSample(`required`)"
                  :error="errors.has('estimate_sadm')"
                  :error-message="errors.first('estimate_sadm')"
                />
                <q-input readonly input-style=""
                  type="number"  color="secondary" suffix=" / Montly"
                  name="estimate_monthly_amount"
                  :label="$tc('label.total', 1, {v: 'Estimasi'})"
                  v-model="rsForm.estimate_monthly_amount"
                  v-validate="isFromSample(`required`)"
                  :error="errors.has('estimate_monthly_amount')"
                  :error-message="errors.first('estimate_monthly_amount')"
                />
            </q-card-section>
          </q-card>
        </div>
      </div>

    </q-card-section>
    <!-- ROW::4th Price & Description -->
    <q-card-section class="q-gutter-y-md">
      <div class="row q-col-gutter-sm" v-if="$app.can('items-price')">
        <ux-select filled class="col-12 col-sm-6"
          name="vehicle_id"
          :label="$tc('general.category_item_price')"
          v-model="rsForm.category_item_price"
          :disable="!rsForm.customer_id"
          filter clearable
          :source="`/api/v1/common/category-item-prices?mode=all&customer_id=${rsForm.customer_id}`"
          option-label="name"
          option-value="id"
          :option-stamp="rs => $app.number_format(rs.price)"
          @input="(v) => {
            rsForm.category_item_price_id = v ? v.id : null
          }"
        />
        <q-input filled class="col-12 col-sm-6"
          label="Kategori Price" readonly
          :value="rsForm.category_item_price ? $app.number_format(rsForm.category_item_price.price) : null"
        />
      </div>
      <div class="row q-col-gutter-sm" v-if="$app.can('items-price')">
        <ux-numeric hide-bottom-space class="col-12 col-sm-4"
          name="price"
          label="Normal Price"
          type="number"
          v-model="rsForm.price"
          v-validate="isNotSample(`required`)"
          standout filled dark
          color="white"
          bg-color="primary"
          align="center"
          :error="errors.has('price')"
          :error-message="errors.first('price')"
        />
        <ux-numeric hide-bottom-space class="col-12 col-sm-4"
          name="price_area" type="number" readonly
          label="Price in DM"
          :value="price_area"
          standout filled dark
          color="white"
          bg-color="primary"
          align="center"
          :error="errors.has('price_area')"
          :error-message="errors.first('price_area')"
        />
        <ux-numeric hide-bottom-space class="col-12 col-sm-4"
          name="price_loaded"
          label="Price in BRL"
          type="number" readonly
          :value="price_loaded"
          standout filled dark
          color="white"
          bg-color="primary"
          align="center"
          :error="errors.has('price_loaded')"
          :error-message="errors.first('price_loaded')"
        />
      </div>
      <q-input type="textarea" autogrow rows="3"
        :label="$tc('label.description')" stack-label
        v-model="rsForm.description"
        filled
      />
    </q-card-section>
    <q-separator spaced />
    <q-card-actions class="group float-right">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()" />
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)" />
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" />
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
        colors: { data: [], api: '/api/v1/references/colors?mode=all' },
        type_items: { data: [], api: '/api/v1/references/type-items?mode=all' },
        category_items: { data: [], api: '/api/v1/references/category-items?mode=all' },
        sizes: { data: [], api: '/api/v1/references/sizes?mode=all' },
        units: { data: [], api: '/api/v1/references/units?mode=all' },
        brands: { data: [], api: '/api/v1/references/brands?mode=all' },
        specifications: { data: [], api: '/api/v1/references/specifications?mode=all' },
        customers: { data: [], api: '/api/v1/incomes/customers?mode=all' },
        packareas: { data: [], api: '/api/v1/references/packareas?mode=all' },
        lines: { data: [], api: '/api/v1/references/lines?mode=all' }

      },
      FORM: {
        resource: {
          uri: '/admin/common/items',
          api: '/api/v1/common/items'
        }
      },
      rsForm: {},
      setDefault: () => {
        return {
          code: null,
          customer_id: null,
          brand_id: null,
          specification_id: null,

          part_name: null,
          part_alias: null,
          part_number: null,

          load_type: null,
          load_capacity: null,
          packarea_id: null,
          packarea: null,
          packing_duration: null,
          sa_dm: null,
          weight: null,

          category_item_price_id: null,
          category_item_price: null,
          type_item_id: null,
          size_id: null,
          unit_id: null,

          price: 0,
          item_prelines: [{ id: null, line_id: null, note: null }],
          item_units: [],
          estimate_price: null,
          estimate_sadm: null,
          estimate_monthly_amount: null,
          estimate_begin_date: null,
          enable: 1,
          sample: 0,
          description: null,

          sample_priced_at: null,
          sample_enginered_at: null,
          sample_validated_at: null
        }
      }
    }
  },
  created () {
    // Component Page Mounted!
    this.init()
  },
  computed: {
    PackareaOptions () {
      return (this.SHEET.packareas.data.map(item => ({ ...item, label: item.name, value: item.id })) || [])
    },
    LineOptions () {
      return (this.SHEET.lines.data.map(item => ({ ...item, label: item.name, value: item.id })) || [])
    },
    CategoryOptions () {
      return (this.SHEET.category_items.data.map(item => ({ label: item.name, value: item.id })) || [])
    },
    TypeOptions () {
      return (this.SHEET.type_items.data.map(item => ({ label: item.name, value: item.id })) || [])
    },
    CustomerOptions () {
      return (this.SHEET.customers.data.map(item => ({
        label: [item.code, item.name].join(' - '),
        value: item.id
      })) || [])
    },
    BrandOptions () {
      return (this.SHEET.brands.data.map(item => ({
        label: [item.code, item.name].join(' - '),
        value: item.id
      })) || [])
    },
    SpecificationOptions () {
      return (this.SHEET.specifications.data.map(item => ({
        label: [item.code, item.name].join(' - '),
        sublabel: item.hasOwnProperty('color') ? `Color: ${item.color.name}` : undefined,
        value: item.id
      })) || [])
    },
    SizeOptions () {
      return (this.SHEET.sizes.data.map(item => ({
        label: item.name,
        value: item.id
      })) || [])
    },
    UnitOptions () {
      return (this.SHEET.units.data.map(item => ({
        label: String(item.code).toUpperCase(),
        value: item.id
      })) || [])
    },
    price_area () {
      if (!Number(this.rsForm.price) || !Number(this.rsForm.sa_dm)) return 0
      return Number(this.rsForm.price) / Number(this.rsForm.sa_dm)
    },
    price_loaded () {
      return Number(this.rsForm.load_capacity || 0) * Number(this.rsForm.price || 0)
    },
    MAPINGKEY () {
      let variables = {
        'brands': {},
        'customers': {},
        'specifications': {}
      }
      this.SHEET['brands'].data.map(item => { variables['brands'][item.id] = item })
      this.SHEET['customers'].data.map(item => { variables['customers'][item.id] = item })
      this.SHEET['specifications'].data.map(item => { variables['specifications'][item.id] = item })

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
        this.$nextTick(() => {
          if (!data.item_prelines.length) this.addNewProduction()
        })
      })
    },
    setForm (data) {
      this.rsForm = JSON.parse(JSON.stringify(data))
    },

    setCode () {
      if (!this.rsForm.brand_id || !this.rsForm.customer_id || !this.rsForm.specification_id) {
        this.rsForm['code'] = this.rsForm['id'] || null
        return
      }

      let BRAND = this.MAPINGKEY['brands'][this.rsForm.brand_id] || {}
      let CUST = this.MAPINGKEY['customers'][this.rsForm.customer_id] || {}
      let SPEC = this.MAPINGKEY['specifications'][this.rsForm.specification_id] || {}

      // Set unique code
      this.rsForm['code'] = [CUST.code, BRAND.code, SPEC.code].join('-')
    },

    isEnginered (v) {
      return !(this.rsForm.sample && this.rsForm.sample_enginered_at) ? '' : v
    },

    isNotSample (v) {
      return this.rsForm.sample ? '' : v
    },
    isFromSample (v) {
      return !(!this.rsForm.sample && this.FORM.data.sample) ? '' : v
    },

    addNewProduction (autofocus = true) {
      var newEntri = this.setDefault().item_prelines[0]

      this.rsForm.item_prelines.push(newEntri)
    },

    removeProduction (index) {
      this.rsForm.item_prelines.splice(index, 1)
      if (this.rsForm.item_prelines.length < 1) this.addNewProduction()
    },

    addNewUnit (autofocus = true) {
      const newEntri = Object.assign({ id: null, unit_id: null, rate: null })
      this.rsForm.item_units.push(newEntri)
    },

    removeUnit (index) {
      this.rsForm.item_units.splice(index, 1)
    },

    onSave () {
      const submit = () => {
        this.$q.loading.show()
        let { method, apiUrl } = this.FORM.meta()
        this.$axios.set(method, apiUrl, this.rsForm)
          .then((response) => {
            let message = response.data.code + ' - #' + response.data.id
            this.FORM.response.success({ message: message })
            this.$router.go(-1)
          })
          .catch((error) => {
            console.error(error)
            this.FORM.response.fields(error.response)
            this.FORM.response.error(error.response || error, 'ITEM UPDATE')
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

        this.$q.dialog({ message: 'Are sure to submit?', title: 'CONFIRM' })
          .onOk(() => {
            if (this.rsForm.price === this.FORM.data.price) return submit()
            this.$q.dialog({
              title: 'PASSWORD CONFIRM',
              message: 'Price has changed. Enter password is required!',
              prompt: { type: 'password', model: '' }
            })
              .onOk(model => {
                this.$axios.post('/api/v1/auth/confirm-password', { password: model }).then((response) => {
                  if (response.data.status) submit()
                })
                  .catch((error) => {
                    this.$app.response.error(error.response || error)
                  })
              })
          })
      })
    }
  }
}
</script>
<!-- style lang="stylus">
@import '~variables'
.frame-box
  .frame-main
    padding 5px 15px 15px
    box-shadow $shadow-up-1
    border-top solid 1px #848484
    border-radius-g 2px
</style -->
