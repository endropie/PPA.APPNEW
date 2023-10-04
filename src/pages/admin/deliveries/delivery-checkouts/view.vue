<template>
  <q-page padding class="items-center justify-start column">
    <page-print v-if="rsView" :style="{'min-width': $q.screen.gt.sm ? '70%' : '100%'}">
      <div slot="header-title">DELIVERY CHECKOUT <span v-if="rsView">#{{rsView.fullnumber}}</span> </div>
      <div slot="header-tags" class="print-hide">
        <!-- <ux-chip-status :row="rsView" tag outline small square icon='bookmark' /> -->
      </div>

      <div class="column" style="min-height:3.25in;height:auto">
        <div class="justify-between row q-col-gutter-y-sm" >
          <div class="profile self-bottom">
            <q-markup-table dense class="super-dense no-shadow no-highlight text-weight-medium">
              <!-- <tbody></tbody> -->
            </q-markup-table>
          </div>
          <div class="info">
            <q-markup-table dense square bordered class="table-print dotted super-dense no-shadow no-highlight" separator="cell">
              <tbody>
                <tr>
                  <td class="text-weight-medium">{{$tc('label.date')}}</td>
                  <td>{{$app.date_format(rsView.date)}}</td>
                </tr>
                <tr>
                  <td class="text-weight-medium">{{$tc('general.vehicle')}}</td>
                  <td><span v-if="rsView.vehicle"> {{rsView.vehicle.number}} </span></td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
          <div class="col-12">
            <q-markup-table dense square bordered class="table-print dotted no-shadow no-highlight th-uppercase" separator="cell">
              <thead>
                <tr>
                  <q-th>{{ $tc('general.customer') }}</q-th>
                  <q-th>{{ $tc('general.delivery') }}</q-th>
                  <q-th>{{ $tc('label.transaction') }}</q-th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in rsView.delivery_loads" :key="`load-${index}`">
                  <q-td>{{ row.customer ? row.customer.name : `#${row.customer_id}`  }}</q-td>
                  <q-td>{{ row.fullnumber }}</q-td>
                  <q-td align="center">{{ row.transaction }}</q-td>
                </tr>
                <tr v-for="(row, index) in rsView.delivery_order_internals" :key="`internal-${index}`">
                  <q-td>{{ row.customer ? row.customer.name : `#${row.customer_id}`  }}</q-td>
                  <q-td>{{ row.fullnumber }} <span class="text-weight-medium on-right">[INTERNAL]</span></q-td>
                  <q-td align="center">{{ row.transaction }}</q-td>
                </tr>
                <tr v-for="(row, index) in rsView.deportation_goods" :key="`deportation-${index}`">
                  <q-td>{{ row.customer ? row.customer.name : `#${row.customer_id}`  }}</q-td>
                  <q-td>{{ row.fullnumber }}</q-td>
                  <q-td align="center" class="text-uppercase">{{ $tc('general.deportation_good', 2) }}</q-td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
          <div class="col-12">
              <div class="q-mb-sm text-italic">{{$tc('label.description')}}:</div>
              <div class="q-mb-md text-weight-light" style="">{{ rsView.description }}</div>
          </div>
        </div>
        <q-space />
        <div class="row q-gutter-xs print-hide " style="padding-top:50px">
          <q-btn :label="$tc('form.back')" icon="cancel"  color="dark" :to="`${VIEW.resource.uri}?return`" />
          <!-- <q-btn :label="$tc('form.edit')" icon="edit" color="positive" :to="`${VIEW.resource.uri}/${ROUTE.params.id}/edit`"  v-if="IS_EDITABLE && $app.can('delivery-checkouts-update')" /> -->
          <q-btn :label="$tc('form.print')" icon="print" color="grey" @click.native="VIEW.print()" />
          <q-space />
          <ux-btn-dropdown color="blue-grey"
            :options="[
              { label: $tc('form.add_new'), color:'green', icon: 'add',
                detail: $tc('messages.process_create'),
                hidden: !$app.can('delivery-checkouts-create'),
                actions: () => {
                  $router.push(`${VIEW.resource.uri}/create`)
                }
              },
              { label: 'DELETE', color:'red', icon: 'delete',
                detail: $tc('messages.process_delete'),
                hidden: !IS_EDITABLE || !$app.can('delivery-checkouts-delete'),
                actions: () => {
                  VIEW.delete()
                }
              },
              { label: 'VOID', color:'red', icon: 'block',
                detail: $tc('messages.process_void'),
                hidden: !IS_VOID || !$app.can('delivery-checkouts-void'),
                actions: () => {
                  VIEW.void(()=> $router.replace(VIEW.resource.uri) )
                }
              },
            ]"/>
        </div>
      </div>
    </page-print>
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
        data: {},
        resource: {
          api: '/api/v1/incomes/delivery-checkouts',
          uri: '/admin/deliveries/delivery-checkouts'
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
    IS_CLOSE () {
      if (this.rsView.deleted_at) return false
      if (['CLOSED'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_VOID () {
      if (this.IS_EDITABLE) return false
      if (this.rsView.deleted_at) return false
      if (['VOID', 'REVISED', 'CLOSED'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_EDITABLE () {
      if (this.rsView.deleted_at) return false
      if (this.rsView.is_overtime) return false
      if (this.rsView.status !== 'OPEN') return false
      if (Object.keys(this.rsView.has_relationship || {}).length > 0) return false
      return true
    }
  },
  methods: {
    init () {
      this.VIEW.load((data) => {
        this.setView(data || {})
      })
    },
    setView (data) {
      this.rsView = data
    },
    setClose () {
      const submit = () => {
        this.VIEW.show = false
        this.VIEW.loading = true
        let url = `${this.VIEW.resource.api}/${this.ROUTE.params.id}?mode=close&nodata=true`
        this.$axios.put(url)
          .then((response) => {
            this.init()
          })
          .catch(error => {
            this.$app.response.error(error.response, 'FORM CLOSED')
          })
          .finally(() => {
            this.VIEW.show = true
            setTimeout(() => {
              this.VIEW.loading = false
            }, 1000)
          })
      }

      this.$q.dialog({
        title: this.$tc('form.confirm', 1, { v: 'CLOSE' }),
        message: this.$tc('messages.to_sure', 1, { v: this.$tc('messages.process_close') }),
        cancel: true,
        persistent: true
      }).onOk(() => {
        submit()
      })
    }
  }
}
</script>
