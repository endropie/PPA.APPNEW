<template>
  <q-page padding class="column justify-start items-center" >
    <page-print v-if="VIEW.show">
      <span slot="header-subtitle">Warehouses - Stock Opname</span>
      <div slot="header-tags" class="print-hide">
        <ux-chip-status :row="{...rsView, status: rsView.opname.status}" tag outline small square icon='bookmark' />
      </div>
      <div class="row q-col-gutter-md" >
        <div class="col-12">
          <div class="row justify-between q-gutter-sm" >
            <div class="col items-end q-pt-md">
              <div class="text-h6 text-uppercase">
                {{$tc('general.opname_part')}}
              </div>
              <q-list style="max-width:300px">
                <q-item>
                  <q-item-section>
                    <span>{{rsView.item.part_name}}</span>
                    <small>[{{rsView.item.customer_code}}] {{rsView.item.part_subname}}</small>
                  </q-item-section>
                  <q-item-section side>{{rsView.stockist}}</q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-auto">
              <q-markup-table dense bordered class="no-shadow">
                <tbody>
                  <tr>
                    <td>{{$tc('label.number')}}</td>
                    <td>{{rsView.opname_number}}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
        </div>
        <div class="col-12 column">
          <q-markup-table dense bordered class="no-shadow" separator="cell" >
            <thead>
              <tr>
                <th>{{$tc('label.no',1,{v: 'Voucher'})}}</th>
                <th>{{$tc('label.unit')}}</th>
                <th>{{$tc('label.quantity')}}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in rsView.opname_vouchers" :key="i">
                <td>{{row.number}}</td>
                <td class="text-right">{{rsView.item.unit.code}}</td>
                <td class="text-right">{{$app.number_format(row.quantity)}}</td>
              </tr>
              <tr>
                <td class="text-right" colspan="2">{{$tc('items.stock_init')}}</td>
                <td class="text-right">{{$app.number_format(rsView.init_amount)}}</td>
              </tr>
              <tr>
                <td class="text-right" colspan="2">{{$tc('items.stock_final')}}</td>
                <td class="text-right">{{$app.number_format(rsView.final_amount)}}</td>
                <!-- <td>K=>{{rsView.final_amount}}</td> -->
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
      <div class="row q-gutter-xs print-hide q-mt-lg">
        <q-btn :label="$tc('form.list')" icon="list" color="dark" :to="`${VIEW.resource.uri}?return`" />
        <q-btn :label="$tc('form.print')" color="grey" icon="print" @click.native="print()" />
        <q-space />
        <ux-btn-dropdown v-show="false" color="blue-grey" no-caps
          :label="$tc('label.others')"
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
              hidden: !IS_EDITABLE || !this.$app.can('opname-stocks-validation'),
              detail:$tc('messages.process_validation'),
              actions: () => {
                setValidation()
              }
            },
            { label: (`${$tc('form.revision')}`).toUpperCase(), color:'orange', icon: 'edit',
              hidden: !IS_REVISE || rsView.status !== 'VALIDATED' || !this.$app.can('opname-stocks-revision'),
              // detail:$tc('messages.process_revision'),
              actions: () => {
                setRevision()
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
          api: '/api/v1/warehouses/opname-stocks',
          uri: '/admin/warehouses/opname-stocks',
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
      return this.$app.can('opname-stocks-create')
    },
    isCanUpdate() {
      return this.$app.can('opname-stocks-update')
    },
    isCanDelete() {
      return this.$app.can('opname-stocks-delete')
    },
    IS_REVISE() {
      if (this.IS_EDITABLE) return false
      if (this.rsView.deleted_at) return false
      if (['VOID','OPEN'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_VOID() {
      if (this.IS_EDITABLE) return false
      if (this.rsView.deleted_at) return false
      if (!this.$app.can('opname-stocks-void')) return false
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
