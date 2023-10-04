<template>
  <q-page padding class="items-center justify-start column">
    <div class="" >
      <page-print v-if="VIEW.show">
        <div slot="header-tags" class="print-hide">
          <ux-chip-status :row="rsView" tag outline small square icon='bookmark' />
          <q-chip tag outline small square icon='bookmark'
            label="CHECKOUT" class="text-weight-medium"
            color="blue-grey" text-color="white"
            v-if="rsView.delivery_checkout_id"
          />
        </div>
        <div class="column" style="min-width:120mm">
          <div class="row q-gutter-x-sm q-pb-sm" :class="{'no-wrap': $q.screen.gt.xs}">
              <ux-qrcode :value="valQrCode(rsView)" :options="{ width: 96, height: 96, margin: 1 }" />
              <div class="items-start">
                <div class="text-h6 text-uppercase">
                  {{ $tc('general.deportation_good') }}
                </div>
                <div v-if="rsView.customer">
                  {{ rsView.customer.name }}
                </div>
              </div>
              <q-space />
              <div class="items-start justify-end row q-gutter-x-sm">
                <q-markup-table class="super-dense no-shadow no-highlight"
                  dense square bordered separator="cell">
                  <tbody>
                    <tr>
                      <td>{{$tc('label.number')}}</td>
                      <td>{{rsView.fullnumber || rsView.number}}</td>
                    </tr>
                    <tr>
                      <td>{{$tc('label.date')}}</td>
                      <td>{{ $app.date_format(rsView.date) }}</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
          </div>
          <div class="">
            <q-markup-table dense bordered square separator="cell" class="table-print no-shadow no-highlight">
              <thead>
              <q-tr class="text-uppercase" style="line-height:25px">
                <q-th width="35%">{{ $tc('label.name', 1, {v: $tc('label.part')}) }}</q-th>
                <q-th width="30%">{{ $app.setting('item.subname_label') }}</q-th>
                <q-th width="15%"> Stock </q-th>
                <q-th width="20%">{{ $tc('label.quantity') }}</q-th>
                <q-th width="15%">{{ $tc('label.unit') }}</q-th>
              </q-tr>
              </thead>
              <tbody>
                <q-tr v-for="(row, index) in rsView.deportation_good_items" :key="index" :request-order-item-id="row.id">
                  <q-td>{{row.item.part_name}}</q-td>
                  <q-td>{{row.item.part_subname}}</q-td>
                  <q-td align="center">{{ row.stockist_from }}</q-td>
                  <q-td class="text-right">{{$app.number_format(row.quantity, row.unit.decimal_in)}}</q-td>
                  <q-td class="text-center">{{row.unit.code}}</q-td>
                </q-tr>
              </tbody>
            </q-markup-table>
          </div>
          <div class="">
              <div class="q-my-xs text-italic">{{$tc('label.description')}}:</div>
              <div class="q-my-xs text-weight-light" style="min-height:30px">{{ rsView.description }}</div>
          </div>
        </div>
        <div class="page-break-inside">
          <q-markup-table dense class="no-shadow text-weight-light" style="">
            <tr class="text-center">
              <td width="21%" style="min-height:30px">
                <div class="sign-name">Diterima Oleh</div>
                <div class="sign-tag row no-wrap q-mx-lg">( <q-space/>. . . . . . . . . . . . . .<q-space/> )</div>
              </td>
              <td width="21%">
                <div class="sign-name">Outgoing Oleh</div>
                <div class="sign-tag row no-wrap q-mx-lg">( <q-space/>. . . . . . . . . . . . . .<q-space/> )</div>
              </td>
              <td width="21%">
                <div class="sign-name">Security</div>
                <div class="sign-tag row no-wrap q-mx-lg">( <q-space/>. . . . . . . . . . . . . .<q-space/> )</div>
              </td>
              <td width="21%" class="text-capitalize">
                <div class="sign-name">Hormat Kami</div>
                <div class="sign-tag row no-wrap q-mx-lg" v-if="rsView.created_user">(<q-space/>{{rsView.created_user.name}}<q-space/>)</div>
                <div class="sign-tag row no-wrap q-mx-lg" v-else>( <q-space/>. . . . . . . . . . . . . .<q-space/> )</div>
              </td>
            </tr>
          </q-markup-table>
        </div>
        <div class="row q-gutter-xs print-hide" style="padding-top:50px">
          <q-btn :label="$tc('form.back')" color="dark" icon="cancel" :to="`${VIEW.resource.uri}?return`" />
          <q-btn :label="$tc('form.print')" color="grey" icon="print" @click.native="print()" />
          <q-btn :label="$tc('form.edit')" color="green" icon="edit" :to="`${VIEW.resource.uri}/${ROUTE.params.id}/edit`"
            v-if="IS_EDITABLE && isCanUpdate" />
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
                hidden: !IS_EDITABLE || !this.$app.can('deportation-goods-validation'),
                detail:$tc('messages.process_validation'),
                actions: () => {
                  setValidation()
                }
              },
              /* {
                label: (`${$tc('form.revision')}`).toUpperCase(), color:'orange', icon: 'edit',
                hidden: !IS_REVISE || rsView.status !== 'VALIDATED' || !this.$app.can('deportation-goods-revision'),
                detail:$tc('messages.process_revise'),
                actions: () => {
                  setRevision()
                }
              }, */
              { label: 'VOID', color:'red', icon: 'block',
                hidden: !IS_VOID,
                detail: $tc('messages.process_void'),
                actions: () => {
                  VIEW.void(()=> init() )
                }
              }
            ]"/>
        </div>
      </page-print>
    </div>
    <q-inner-loading :showing="VIEW.loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script>

import MixView from 'src/mixins/mix-view.vue'
import PagePrint from 'components/page-print'

export default {
  mixins: [MixView],
  components: { PagePrint },
  data () {
    return {
      VIEW: {
        resource: {
          api: '/api/v1/warehouses/deportation-goods',
          uri: '/admin/deliveries/deportation-goods',
          params: '?mode=view'
        }
      },
      rsView: {},
      count: 0
    }
  },
  created () {
    this.init()
  },
  computed: {
    isCanCreate () {
      return this.$app.can('deportation-goods-create')
    },
    isCanUpdate () {
      return this.$app.can('deportation-goods-update')
    },
    isCanDelete () {
      return this.$app.can('deportation-goods-delete')
    },
    IS_REVISE () {
      if (this.IS_EDITABLE) return false
      if (this.rsView.deleted_at) return false
      if (['VOID', 'OPEN'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_VOID () {
      if (this.IS_EDITABLE) return false
      if (this.rsView.deleted_at) return false
      if (!this.$app.can('deportation-goods-void')) return false
      if (['VOID'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_EDITABLE () {
      if (this.rsView.deleted_at || this.rsView.status !== 'OPEN') return false
      if (Object.keys(this.rsView.has_relationship || {}).length > 0) return false
      return true
    }
  },
  methods: {
    valQrCode (data) {
      return `/deportation-goods/${data.id}`
    },
    setRevision () {
      this.$router.push(`${this.VIEW.resource.uri}/${this.ROUTE.params.id}/revision`)
    },
    setValidation () {
      const submit = () => {
        this.$q.loading.show()
        const apiUrl = `${this.VIEW.resource.api}/${this.rsView.id}/validation?nodata`

        this.$axios.set('PUT', apiUrl, this.rsForm)
          .then((response) => {
            let message = response.data.number + ' - #' + response.data.id
            this.$app.notify.success('VALIDATION SUCCESS', message)
            this.init()
          })
          .catch((error) => {
            let message = error.response
              ? (error.response.data.message || undefined) : undefined
            this.$app.notify.error('VALIDATION FAILED', message)
            console.error('ERROR', error.response || error)
          })
          .finally(() => {
            this.$q.loading.hide()
          })
      }

      this.$q.dialog({
        title: this.$tc('form.confirm'),
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.validation') }),
        cancel: true,
        persistent: true
      }).onOk(() => {
        submit()
      })
    },
    init () {
      this.VIEW.load((data) => {
        this.setView(data || {})
      })
    },

    setView (data) {
      this.rsView = JSON.parse(JSON.stringify(data))
    }
  }
}
</script>

<style lang="stylus">
.info, .info th
  text-transform uppercase
  font-size 11px
  font-weight 500

.table-print
  .q-table tr, .q-table td
    line-height normal
    height unset !important
  .q-table td
    padding-top 2px
    padding-bottom 2px
.sign-tag
  margin-top 40px
  vertical-align bottom
</style>
