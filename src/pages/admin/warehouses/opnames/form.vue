<template>
<q-page padding class="form-page">
  <q-card inline class="main-box" :dark="LAYOUT.isDark" v-if="FORM.show">
    <q-card-section>
      <form-header
        :title="FORM.title()"
        :subtitle="FORM.subtitle()">
      </form-header>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark"></q-separator>
    <q-card-section class="row q-col-gutter-sm">
      <div class="col-12 text-subtitle2 q-pa-md" v-show="rsForm.id">
        <span>NO. {{rsForm.number}}</span>
        <ux-badge-status class="on-right q-py-xs" :row="rsForm" />
      </div>
      <div class="col-12">
        <list-opname-voucher ref="list-voucher" modetab="opname" bordered
          class="no-shadow"
          :opname="rsForm.id ? rsForm : undefined" >
          <div slot="opname" slot-scope="row" :class="{'full-width text-center':$q.screen.lt.sm}">
            <q-btn dense glossy
              label="VALIDATED"
              color="secondary"
              @click="setValidate()"
              v-if="Number(row.counter) > 0 && IS_EDITABLE"/>
          </div>
          <div slot="validated" slot-scope="row" :class="{'full-width text-center':$q.screen.lt.sm}">
            <q-btn dense glossy
              :label="rsForm.id ? 'UPDATE' : 'CREATE'"
              color="secondary"
              @click="onSave()"
              v-if="Number(row.counter) > 0 && IS_EDITABLE" />
          </div>
        </list-opname-voucher>
      </div>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark" />
    <q-card-actions class="q-mx-lg" v-if="false">
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()" v-if="IS_EDITABLE"
        :loading="FORM.loading" />

      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="setForm(FORM.data)"></q-btn>
      <q-btn :label="$tc('form.list')" icon="list" color="dark" :to="`${FORM.resource.uri}?return`"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" :dark="LAYOUT.isDark"><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'
import ListOpnameVoucher from 'pages/admin/warehouses/opname-vouchers/list.vue'

export default {
  mixins: [MixForm],
  components: { ListOpnameVoucher },
  data () {
    return {
      SHEET:{
        units: {api:'/api/v1/references/units?mode=all'},
        vouchers: {autoload:false, api:'/api/v1/warehouses/opname-vouchers?mode=all'},
      },
      FORM:{
        resource:{
          uri: '/admin/warehouses/opnames',
          api: '/api/v1/warehouses/opnames',
        },
      },
      counter: null,
      modetab: 'opname',
      rsForm: {},
      setDefault:()=>{
        return {
          id: null,
        }
      }
    }
  },
  created(){
    // Component Page Mounted!
    this.init()

  },
  computed: {
    IS_EDITABLE() {
      if (Object.keys(this.FORM.data.has_relationship || {}).length > 0) return false
      return this.$app.can('opname-stocks-update')
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
      this.rsForm = JSON.parse(JSON.stringify(data))

      if(Object.keys(data['has_relationship'] || {}).length > 0) {
        this.FORM.response.relationship({
          title: 'Stock Opname has relations!',
          messages: data['has_relationship'],
          then: () => this.$router.push(`${this.FORM.resource.uri}/${data.id}`)
        })
      }
    },

    setValidate() {
      const submit = () => {
        this.FORM.loading = true
        let apiUrl = this.FORM.resource.api + '/' + this.ROUTE.params.id
        apiUrl += '?mode=validation&nodata=true'
        // return console.warn('api', apiUrl)
        this.$axios.put(apiUrl, {})
        .then((response) => {
          let message = response.data.message
          this.FORM.response.success({message:message})
          this.FORM.toView(response.data.id)
        })
        .catch((error) => {
          this.FORM.response.error(error.response || error, 'UPDATE FAILED')
          this.FORM.response.fields(error.response)
        })
        .finally(()=>{
          setTimeout(() => {
            this.FORM.loading = false
          }, 2000)

        })
      }

      this.$validator.validate().then(result => {
        if (!result) {
          return this.$q.notify({
            color:'negative', icon:'error', position:'top-right', timeout: 3000,
            message:this.$tc('messages.to_complete_form')
          })
        }

        submit()
      })
    },

    onSave() {
      const submit = () => {
        this.FORM.loading = true
        let {method, mode, apiUrl} = this.FORM.meta();
        this.$axios.set(method, apiUrl, this.rsForm)
        .then((response) => {
          let message = `${response.data.number}`
          this.FORM.response.success({message:message})
          this.FORM.toView(response.data.id)
        })
        .catch((error) => {
          this.FORM.response.error(error.response || error, 'UPDATE FAILED')
          this.FORM.response.fields(error.response)
        })
        .finally(()=>{
          setTimeout(() => {
            this.FORM.loading = false
          }, 2000)

        })
      }

      this.$validator.validate().then(result => {
        if (!result) {
          return this.$q.notify({
            color:'negative', icon:'error', position:'top-right', timeout: 3000,
            message:this.$tc('messages.to_complete_form')
          })
        }

        submit()
      })
    },
  },
}
</script>
<style lang="stylus">
.q-table--cell-separator tbody:not(:last-child) tr td {
    border-bottom-width: 1px;
}
</style>
