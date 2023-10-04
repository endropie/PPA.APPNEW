<template>
  <q-page padding class="column justify-start items-center" :dark="LAYOUT.isDark">
    <page-print v-if="VIEW.show">
      <span slot="header-subtitle">Warehouses - voucher stocks</span>
      <div slot="header-tags" class="print-hide">
      <q-chip class="shadow-1" square outline
        color="blue-grey" text-color="white"
        label="NCR" v-if="rsView.transaction === 'RETURN'" />
        <ux-chip-status :row="rsView" tag outline small square icon='bookmark' />
      </div>
      <div class="row q-col-gutter-md" >
        <div class="col-12">
          <div class="row justify-between q-gutter-sm" >
            <div class="items-end q-pt-md">
              <div class="text-h6 text-uppercase">
                {{$tc('general.opname_voucher', 2)}}
              </div>
              <span class="text-subtitle2 text-no-wrap" v-show="rsView.number">
                #{{rsView.fullnumber || rsView.number}}
              </span>
            </div>
            <div>
              <q-markup-table separator="cell" :dark="LAYOUT.isDark"
                class="super-dense bordered no-shadow"
                v-if="rsView.opname_stock">
                <tr>
                  <th>{{$tc('label.number')}}</th>
                  <td>
                    {{rsView.opname_stock.fullnumber || rsView.opname_stock.number}}
                  </td>
                </tr>
                <tr>
                  <th>{{$tc('label.date')}}</th>
                  <td>{{ $app.date_format(rsView.opname_stock.date) }}</td>
                </tr>
              </q-markup-table>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="row  items-center q-gutter-sm">
            <div class="col column  text-no-wrap">
              <span class="text-weight-medium">{{rsView.item.part_name}}</span>
              <span class="text-caption">[{{rsView.item.customer_code}}] {{rsView.item.part_subname || '--'}}</span>
            </div>
            <div class="col text-center">
              <q-chip dense square color="blue-grey" text-color="white" :label="rsView.stockist" />
            </div>
            <div class="col no-wrap text-right">
              <span class="text-weight-medium">{{$app.number_format(rsView.quantity)}}
                <span class="on-right">{{rsView.unit.code}}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="row q-gutter-xs print-hide" style="padding-top:50px">
        <q-btn :label="$tc('form.list')" icon="list" color="dark" :to="`${VIEW.resource.uri}?return`" />
        <q-btn :label="$tc('form.print')" color="grey" icon="print" @click.native="print()" />
        <q-btn :label="$tc('form.edit')" color="green" icon="edit" :to="`${VIEW.resource.uri}/${ROUTE.params.id}/edit`" v-if="IS_EDITABLE && isCanUpdate" />
        <q-space />
        <ux-btn-dropdown color="blue-grey"
          :options="[
            { label: $tc('form.add_new'), color:'green', icon: 'add',
              hidden: !isCanCreate,
              detail: $tc('messages.process_create'),
              actions: () => {
                $router.push(`${VIEW.resource.uri}/create`)
              }
            },
            { label: String('Delete').toUpperCase(), color:'red', icon: 'delete',
              hidden: !IS_EDITABLE || !isCanDelete,
              detail: $tc('messages.process_delete'),
              actions: () => {
                VIEW.delete()
              }
            },
            { label: $tc('form.validation').toUpperCase(), color:'teal', icon: 'check',
              hidden: !IS_EDITABLE || !this.$app.can('opname-vouchers-validation'),
              detail:$tc('messages.process_validation'),
              actions: () => {
                setValidation()
              }
            },
            { label: 'VOID', color:'red', icon: 'block',
              hidden: !IS_VOID,
              detail: $tc('messages.process_void'),
              actions: () => {
                VIEW.void(()=> init() )
              }
            },
          ]"/>
      </div>
    </page-print>
    <q-inner-loading :showing="VIEW.loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script>

import MixView from 'src/mixins/mix-view.vue'
import PagePrint from 'components/page-print'
import PagePrintBreak from 'components/page-print-break'

export default {
  mixins: [MixView],
  components: { PagePrint },
  data () {
    return {
      VIEW: {
        resource:{
          api: '/api/v1/warehouses/opname-vouchers',
          uri: '/admin/warehouses/opname-vouchers',
          params: '?mode=view'
        }
      },
      rsView: {},
      count: 0,
    }
  },
  created() {
    this.init()
  },
  computed: {
    isCanCreate() {
      return this.$app.can('opname-vouchers-create')
    },
    isCanUpdate() {
      return this.$app.can('opname-vouchers-update')
    },
    isCanDelete() {
      return this.$app.can('opname-vouchers-delete')
    },
    IS_REVISE() {
      if (this.IS_EDITABLE) return false
      if (this.rsView.deleted_at) return false
      if (['VOID','OPEN'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_VOID() {
      if (this.IS_EDITABLE) return false
      if (!this.$app.can('opname-vouchers-void')) return false
      if (['VOID'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_EDITABLE() {
      if (this.rsView.deleted_at || this.rsView.status !== 'OPEN') return false
      if (Object.keys(this.rsView.has_relationship || {}).length > 0) return false
      return true
    },
  },
  methods: {
    setRevision () {
      this.$router.push(`${this.VIEW.resource.uri}/${this.ROUTE.params.id}/revision`)
    },
    setValidation () {
      const submit = () => {
        this.VIEW.loading = true
        let apiUrl = this.VIEW.resource.api + '/' + this.ROUTE.params.id
        apiUrl += '?mode=validation&nodata=true'
        this.$axios.put(apiUrl, {})
        .then((response) => {
          this.$app.notify.success({
            message: this.$tc('messages.success_validated').toUpperCase(),
            detail: this.$tc('messages.form_has_validated',1, {v:response.data.number})
          })
          this.init()
        })
        .catch((error) => {
          this.$app.response.error(error.response || error, 'UPDATE FAILED');
        })
        .finally(()=>{
          setTimeout(() => {
            this.VIEW.loading = false
          }, 1000)

        });
      }

      this.$q.dialog({
        title: this.$tc('form.confirm'),
        message: this.$tc('messages.to_sure', 1, {v: this.$tc('form.validation')}),
        cancel: true,
        persistent: true
      }).onOk(() => {
        submit()
      })
    },
    init() {
      this.VIEW.load((data) => {
        this.setView(data || {})
      })
    },
    setView(data) {
      this.rsView =  JSON.parse(JSON.stringify(data))
    },
  }
}
</script>
