<template>
<q-page padding class="form-page row justify-center">
  <q-card inline class="main-box self-start" v-if="FORM.show" :dark="LAYOUT.isDark" :class="{ 'bg-grey-9': LAYOUT.isDark}">
    <q-card-section class="q-pa-sm">
      <form-header :title="(`SAMPLE ${$tc('general.item')}`).toUpperCase()" :subtitle="FORM.subtitle()" >
        <template slot="menu-item">
          <list-item :label="$tc('form.remove')" icon="delete" clickable @click="FORM.delete" v-close-popup v-if="ROUTE.params.id"/>
        </template>
      </form-header>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark"/>
    <!-- ROW::1st Part Identity -->
    <q-card-section class="row q-col-gutter-sm">
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <ux-select-filter
            name="customer_id"
            :label="$tc('general.customer')"
            class="col-12"
            :data-vv-as="$tc('general.customer')"
            v-model="rsForm.customer_id" options-cover clearable
            :dark="LAYOUT.isDark" :options-dark="LAYOUT.isDark"
            :options="CustomerOptions"
            v-validate="'required'"
            :error="errors.has('customer_id')"
            :error-message="errors.first('customer_id')"/>

          <q-input
            name="part_number"
            label="Part Number"
            class="col-12"
            icon="layers"
            v-model="rsForm.part_number"
            v-validate="'required'"
            :error="errors.has('part_number')"
            :error-message="errors.first('part_number')"
            :dark="LAYOUT.isDark"
          />
          <q-input
              name="part_name"
              label="Part name"
              v-model="rsForm.part_name"
              v-validate="'required'"
              :dark="LAYOUT.isDark"
              class="col-12"
              icon="label"
              :error="errors.has('part_name')"
              :error-message="errors.first('part_name')"
          />
          <q-input
            name="part_alias"
            label="Part alias Finished"
            v-model="rsForm.part_alias"
            v-validate="''"
            :dark="LAYOUT.isDark"
              class="col-12" icon="beenhere" :error="errors.has('part_alias')" :error-message="errors.first('part_alias')"
          />
        </div>
      </div>
      <div class="col-12 col-sm-6" >
        <div class="row q-col-gutter-x-sm">
          <q-select  class="col-auto"
            :disable="Boolean(rsForm.id)"
            data-vv-as="Jenis Project"
            label="Jenis Project"
            :options="ProjectSampleOptions" map-options emit-value
            v-model="rsForm.project"
            v-validate="FORM.ifCreate('required', '')"
            name="project"
            :error="errors.has('project')"
            :error-message="errors.first('project')"
          />
          <q-input class="col" style="min-width:150px"
            label="Project code"
            v-model="rsForm.project_number"
            v-validate="FORM.ifCreate('required', '')"
            name="project_number"
            :error="errors.has('project_number')"
            :error-message="errors.first('project_number')"
          />

          <q-input class="col" style="min-width:150px"
            name="code"
            :placeholder="FORM.ifCreate('[Auto Generate]','')"
            :label="$tc('label.code_intern')"
            v-model="rsForm.code"
            v-validate="FORM.ifCreate('','required')"
            :error="errors.has('code')"
            :error-message="errors.first('code')"
          />
          <q-toggle
            v-if="rsForm.id"
            class="col-auto text-body2 bordered rounded-borders q-pa-xs no-margin"
            :label="rsForm.enable ? 'Enable':'Disable'" left-label
            v-model="rsForm.enable"
            :color="rsForm.enable ? 'primary':'red'"
            :true-value="1"
            :false-value="0" />
        </div>
        <div class="row q-col-gutter-x-sm">
          <ux-select-filter
            name="brand_id"
            :label="$tc('general.brand')"
            class="col-12 col-sm-6"
            v-model="rsForm.brand_id"
            v-validate="isNotSample(`required`)"
            :dark="LAYOUT.isDark"
            :options="BrandOptions"
            input-debounce="0"
            :error="errors.has('brand_id')"
            :error-message="errors.first('brand_id')" />

          <ux-select-filter
            name="specification_id"
            v-model="rsForm.specification_id"
            :label="$tc('items.specification')"
            class="col-12 col-sm-6"
            v-validate="isNotSample(`required`)"
            :dark="LAYOUT.isDark"
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
            :dark="LAYOUT.isDark"
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
            :dark="LAYOUT.isDark"
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
            :dark="LAYOUT.isDark"
            :options="UnitOptions"
            :error="errors.has('unit_id')"
            :error-message="errors.first('unit_id')" />
          <ux-select-filter
            name="size_id"
            v-model="rsForm.size_id"
            label="Size"
            v-validate="isNotSample(`required`)"
            :dark="LAYOUT.isDark"
            :options="SizeOptions"
            class="col-6"
            icon="format_size"
            :error="errors.has('size_id')"
            :error-message="errors.first('size_id')" />

        </div>
      </div>
    </q-card-section>
    <!-- ROW::2th Estimate, unit corvertion & Enginering  -->
    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- ITEM - DRAWING -->
        <div class="col-12 col-md-4">
          <q-uploader class="fit"
            color="secondary"
            ref="depictUploader"
            label="Auto Uploader"
            multiple auto-upload
            :factory="factoryFn"
            @factory-failed="fileFactoryFailed"
          >
            <template v-slot:header="scope">
              <div class="row no-wrap items-center q-px-sm q-py-xs q-gutter-xs">
                <!-- <q-btn v-if="scope.queuedFiles.length > 0" icon="clear_all" @click="scope.removeQueuedFiles" round dense flat >
                  <q-tooltip>Clear All</q-tooltip>
                </q-btn> -->
                <!-- <q-btn v-if="scope.uploadedFiles.length > 0" icon="done_all" @click="scope.removeUploadedFiles" round dense flat >
                  <q-tooltip>Remove Uploaded Files</q-tooltip>
                </q-btn> -->
                <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
                <div class="col">
                  <div class="q-uploader__title">Drawing files</div>
                  <!-- <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}</div> -->
                </div>
                <q-btn v-if="scope.canAddFiles && rsForm.sample_depicted_at === true" type="a" icon="add_box" round dense flat>
                  <q-uploader-add-trigger />
                  <q-tooltip>Pick Files</q-tooltip>
                </q-btn>
                <q-btn v-if="scope.canUpload" icon="cloud_upload" @click="scope.upload" round dense flat >
                  <!-- <q-tooltip>Upload Files</q-tooltip> -->
                </q-btn>

                <q-btn v-if="scope.isUploading" icon="clear" @click="scope.abort" round dense flat >
                  <!-- <q-tooltip>Abort Upload</q-tooltip> -->
                </q-btn>

                <q-btn flat dense outline icon="edit"
                  @click="rsForm.sample_depicted_at = true"
                  v-if="FORM.data.sample"
                  v-show="rsForm.sample_depicted_at !== true"
                />
                <q-btn flat dense outline icon="clear"
                  @click="[rsForm.sample_depicted_at = null]"
                  v-if="FORM.data.sample"
                  v-show="rsForm.sample_depicted_at === true"
                />
              </div>
            </template>
            <template v-slot:list="scope">
              <q-tooltip v-if="rsForm.sample_depicted_at !== true" >
                For modify, click edit first!
              </q-tooltip>
              <q-list separator :class="{'light-dimmed': rsForm.sample_depicted_at !== true}">
                <q-item v-for="(file, indexFile) in (rsForm.depicts || [])" :key="indexFile">
                  <q-item-section thumbnail class="gt-xs">
                    <q-avatar square v-if="file.__img" size="5rem" >
                      <img :src="$axios.serverURL(file.url)" v-if="file.__img" style="max-width:5rem">
                    </q-avatar>
                    <q-avatar v-else size="5rem" icon="mdi-file" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="full-width ellipsis">
                      {{ file.name }}
                    </q-item-label>

                    <q-item-label caption>
                      Status: {{ file.__status }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ file.__sizeLabel }} / {{ file.__progressLabel }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section top side>
                    <q-btn class="gt-xs" size="12px" flat dense round icon="clear" @click="removeDepict(indexFile)" />
                  </q-item-section>
                </q-item>
                <q-item v-for="file in scope.files" :key="file.name">
                  <q-item-section thumbnail class="gt-xs">
                    <q-avatar square v-if="file.__img" size="5rem" >
                      <img :src="file.__img.src" v-if="file.__img" style="max-width:5rem">
                    </q-avatar>
                    <q-avatar v-else size="5rem" icon="mdi-file" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="full-width ellipsis">
                      {{ file.name }}
                    </q-item-label>

                    <q-item-label caption>
                      Status: {{ file.__status }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ file.__sizeLabel }} / {{ file.__progressLabel }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section top side>
                    <q-btn
                      class="gt-xs"
                      size="12px"
                      flat
                      dense
                      round
                      icon="clear"
                      @click="scope.removeFile(file)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
          </q-uploader>
        </div>

        <!-- ITEM - ESTIMATE -->
        <div class="col-12 col-sm-6 col-md-4"  v-if="$app.can('items-sample')">
          <q-card class="fit">
            <q-card-section class="bg-secondary text-white q-pa-sm">
              <div class="text-subtitle2 text-uppercase">Estimation</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <ux-date
                type="date" color="secondary"
                name="estimate_begin_date"
                label="Estimate starting project" stack-label
                v-model="rsForm.estimate_begin_date"
                v-validate="'required'" no-error-icon
                :error="errors.has('estimate_begin_date')"
                :error-message="errors.first('estimate_begin_date')"
              />
              <div class="row q-col-gutter-x-sm">

                <ux-numeric  class="col-12 col-sm-6" input-style="text-align:left"
                  type="number" color="secondary"
                  name="estimate_price"
                  label="Estimate Price"
                  v-model="rsForm.estimate_price"
                  v-validate="'required'" no-error-icon
                  :error="errors.has('estimate_price')"
                  :error-message="errors.first('estimate_price')"
                />
                <ux-numeric class="col-12 col-sm-6"
                  type="number"  color="secondary"
                  name="estimate_monthly_amount"
                  :label="`${$tc('label.total', 1, {v: 'Estimasi'})} / Montly`"
                  v-model="rsForm.estimate_monthly_amount"
                  v-validate="" no-error-icon
                  :dark="LAYOUT.isDark"
                  :error="errors.has('estimate_monthly_amount')"
                  :error-message="errors.first('estimate_monthly_amount')"
                />

                <ux-numeric class="col-12 col-sm-6"
                  type="number" color="secondary"
                  name="estimate_sadm"
                  label="Estimate S.A (dm)"
                  v-model="rsForm.estimate_sadm"
                  v-validate="'required'" no-error-icon
                  :dark="LAYOUT.isDark"
                  :error="errors.has('estimate_sadm')"
                  :error-message="errors.first('estimate_sadm')"
                />

                <ux-numeric class="col-12 col-sm-6"
                  type="number" color="secondary"
                  name="estimate_load_capacity"
                  label="Estimate HANGER/BAREL"
                  v-model="rsForm.estimate_load_capacity"
                  v-validate="''" no-error-icon
                  :dark="LAYOUT.isDark"
                  :error="errors.has('estimate_load_capacity')"
                  :error-message="errors.first('estimate_load_capacity')"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
        <!-- ITEM - PRICE -->
        <div class="col-12 col-sm-6 col-md-4 column">
          <q-card class="fit">
            <q-card-section horizontal class="bg-secondary text-white q-px-sm q-py-xs items-center">
              <div class="text-subtitle2 text-uppercase q-py-xs">{{$tc('items.price')}}</div>
              <q-space />
              <q-btn flat dense outline icon="edit"
                @click="rsForm.sample_priced_at = true"
                v-if="FORM.data.sample"
                v-show="rsForm.sample_priced_at !== true"
              />
              <q-btn flat dense outline icon="clear"
                @click="[rsForm.sample_priced_at = null, rsForm.price = FORM.data.price]"
                v-if="FORM.data.sample"
                v-show="rsForm.sample_priced_at === true"
              />
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm" v-if="$app.can('items-price')">
              <q-tooltip v-if="rsForm.sample_priced_at !== true" >
                For modify, click edit first!
              </q-tooltip>
              <div class="column" :class="{'light-dimmed': rsForm.sample_priced_at !== true}">
                <ux-numeric
                  name="price"
                  :label="$tc('label.price', 1, { v: 'Normal' })"
                  type="number"
                  v-model="rsForm.price"
                  v-validate="isPriced(`required`)"
                  outlined align="center"
                  :error="errors.has('price')"
                  :error-message="errors.first('price')"
                />
                <ux-numeric
                  name="price_area"
                  type="number" readonly
                  label="Price in DM"
                  :value="price_area"
                  outlined align="center" hint=""
                />
                <ux-numeric
                  name="price_packaged"
                  type="number" readonly
                  label="Price in BRL"
                  :value="price_packaged"
                  outlined align="center" hint=""
                />

              </div>
            </q-card-section>
            <q-card-section v-else class="text-grey">
              <q-avatar icon="info" /> NOT PERMISSION
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
    <!-- ROW::3th Price & Description -->
    <q-card-section>
      <q-input type="textarea" autogrow rows="3"
        :label="$tc('label.description')" stack-label
        v-model="rsForm.description"
        filled
        :dark="LAYOUT.isDark"
      />
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark" spaced />
    <q-card-actions class="group float-right">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()" />
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)" />
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" />
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" :dark="LAYOUT.isDark"><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
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
        lines: { data: [], api: '/api/v1/references/lines?mode=all' }

      },
      FORM: {
        resource: {
          uri: '/admin/common/items',
          api: '/api/v1/common/items'
        }
      },
      rsForm: {},
      ProjectSampleOptions: [{ value: 'NEW', label: 'Project Baru' }, { value: 'MIGRATE', label: 'Alih Loading' }],
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
          packing_duration: null,
          sa_dm: null,
          weight: null,

          category_item_id: null,
          type_item_id: null,
          size_id: null,
          unit_id: null,

          price: null,
          item_prelines: [{ id: null, line_id: null, note: null }],
          item_units: [],
          estimate_price: null,
          estimate_sadm: null,
          estimate_load_capacity: null,
          estimate_monthly_amount: null,
          estimate_begin_date: null,
          enable: 1,
          sample: 1,
          project: 'NEW',
          project_number: null,
          description: null,
          depicts: [],
          sample_depicted_at: null,
          sample_enginered_at: null,
          sample_priced_at: null,
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
      if (!Number(this.rsForm.price) || !Number(this.rsForm.estimate_sadm)) return 0
      return Number(this.rsForm.price) / Number(this.rsForm.estimate_sadm)
    },
    price_packaged () {
      return Number(this.rsForm.estimate_load_capacity || 0) * Number(this.rsForm.price || 0)
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
    fileFactoryFailed (error, files) {
      if (error) console.error('[PLAY] - factory failed', error)
      files.map(e => this.$refs.depictUploader.removeFile(e))
    },
    urlDepict (file) {
      return (file.url) ? (this.$axios.defaults.baseURL + file.url) : null
    },
    addNewDepicts (file) {
      if (!this.rsForm.depicts) this.rsForm.depicts = []
      this.$refs.depictUploader.removeUploadedFiles()
      this.rsForm.depicts.push(file)
    },
    removeDepict (index) {
      if (!this.rsForm.depicts[index]) return

      const path = this.rsForm.depicts[index].url || null
      this.rsForm.depicts.splice(index, 1)

      this.$axios
        .delete(`/api/v1/uploads/file?path=${path}`)
        .then(response => {
          // file deleted!
        })
        .catch(error => {
          this.$app.response.error(error.response || error)
          console.error(error.response || error)
        })
        .finally(() => {

        })
    },
    factoryFn (files) {
      // returning a Promise
      var data = new FormData()
      files.map(file => data.append('file', file))
      return new Promise((resolve, reject) => {
        const urlFile = `/api/v1/uploads/file`
        // const urlExist = `/api/v1/uploads/exist`
        // const token = this.$axios.defaults.headers.common.Authorization
        // const resolver = {
        //   url: this.$axios.defaults.baseURL + urlExist,
        //   headers: [
        //     // {name: 'Content-Type', value: 'multipart/form-data'},
        //     { name: 'Accept', value: 'application/json' },
        //     { name: 'Content-Type', value: 'application/json-patch+json' },
        //     { name: 'Authorization', value: token }
        //   ]
        // }
        this.$axios.post(urlFile, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
          .then(response => {
            reject()
            files.map(e => this.addNewDepicts({
              ...e, name: e.name, type: e.type, size: e.size, lastModified: e.lastModified, url: response.data, __status: 'uploaded', __img: Boolean(e.__img)
            }))
          })
          .catch(error => {
            console.error('error', error.response || error)
            reject(error)
          })
      })
    },
    init () {
      this.FORM.load((data) => {
        this.setForm(data || this.setDefault())
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

    isNotSample (v) {
      return this.rsForm.sample ? '' : v
    },
    isPriced (v) {
      return !(this.rsForm.sample_priced_at && this.FORM.data.sample) ? '' : v
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
        let { method, apiUrl } = this.FORM.meta()
        const data = this.rsForm
        this.$q.loading.show()
        this.$axios.set(method, apiUrl, data)
          .then((response) => {
            let message = response.data.code + ' - #' + response.data.id
            this.FORM.response.success({ message: message })
            this.$router.go(-1)
          })
          .catch((error) => {
            console.warn(error)
            this.FORM.response.fields(error.response)
            this.FORM.response.error(error.response || error, 'FORM ITEM PART')
          })
          .finally(() => {
            this.$q.loading.hide()
          })
      }

      this.$validator.validate()
      setTimeout(() => {
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
              submit()
            })
        }, 1000)
      })
    },

    confirmByPass (callback = false) {
      this.$q.dialog({
        title: 'PASSWORD CONFIRM',
        message: 'Price has changed. Enter password is required!',
        prompt: { type: 'password', model: '' }
      }).onOk(model => {
        this.$axios.post('/api/v1/auth/confirm-password', { password: model })
          .then((response) => {
            if (response.data.status && callback !== false) callback()
          })
          .catch((error) => {
            this.$app.response.error(error.response || error)
          })
      })
    }
  }
}
</script>
