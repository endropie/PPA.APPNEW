<template>
  <q-page padding class="justify-start column">
    <page-print v-if="VIEW.show">
      <div slot="header-title">PRE - DELIVERY</div>
      <div slot="header-tags" class="print-hide">
        <ux-chip-status :row="rsView" tag outline small square icon='bookmark' />
      </div>

      <div class="justify-between row q-col-gutter-y-sm" >
        <div class="profile self-bottom">
          <q-markup-table dense class="super-dense no-shadow no-highlight text-weight-medium">
            <tr>
              <td>{{$tc('general.customer')}}</td>
              <td>
                <span v-if="rsView.customer"> {{rsView.customer.name}} </span>
                <span v-else v-text="`-`" />
              </td>
            </tr>
            <tr>
              <td>{{$tc('label.transaction')}}</td>
              <td>{{ rsView.transaction }}</td>
            </tr>
          </q-markup-table>
        </div>
        <div class="info">
          <q-markup-table dense square bordered class="super-dense no-shadow no-highlight" separator="cell">
            <tbody>
              <tr>
                <td class="text-weight-medium">{{$tc('label.number')}}</td>
                <td>{{ rsView.fullnumber || rsView.number }}</td>
              </tr>
              <tr>
                <td class="text-weight-medium">{{$tc('label.delivery_date')}}</td>
                <td>{{$app.date_format(rsView.date)}}</td>
              </tr>
              <tr>
                <td class="text-weight-medium">RIT</td>
                <td>{{$app.date_format(rsView.date +' '+ rsView.trip_time, 'HH:mm')}}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
        <div class="col-12">
          <q-markup-table dense bordered class="no-shadow no-highlight th-uppercase" separator="cell">
            <thead>
            <q-tr>
              <q-th>{{ $tc('label.name', 1, {v: $tc('label.part')}) }}</q-th>
              <q-th>{{ $app.setting('item.subname_label') }}</q-th>
              <q-th>{{ $tc('label.unit') }}</q-th>
              <q-th>{{ $tc('label.quantity') }}</q-th>
              <q-th>{{ $tc('label.encasement') }}</q-th>
            </q-tr>
            </thead>
            <tbody>
            <q-tr v-for="(row, index) in rsView.delivery_task_items" :key="index">
              <q-td>{{row.item.part_name}}</q-td>
              <q-td>{{row.item.part_subname}}</q-td>
              <q-td class="text-center">{{row.unit.code}}</q-td>
              <q-td class="text-right">{{$app.number_format(row.quantity, $app.get(row, 'unit.decimal_in') || 0)}}</q-td>
              <q-td>{{row.encasement || '-'}}</q-td>
            </q-tr>
            </tbody>
          </q-markup-table>
        </div>
        <div class="col-12">
            <div class="q-mb-sm text-italic">{{$tc('label.description')}}:</div>
            <div class="q-mb-md text-weight-light" style="">{{ rsView.description }}</div>
        </div>
        <div class="col-12 row q-gutter-xs print-hide " style="padding-top:50px">
          <q-btn :label="$tc('form.back')" icon="cancel"  color="dark" :to="`${VIEW.resource.uri}?return`" />
          <q-btn :label="$tc('form.edit')" icon="edit" color="positive" :to="`${VIEW.resource.uri}/${ROUTE.params.id}/edit`"  v-if="IS_EDITABLE && $app.can('delivery-tasks-update')" />
          <q-btn :label="$tc('form.print')" icon="print" color="grey" @click.native="VIEW.print()" />
          <q-space />
          <ux-btn-dropdown color="blue-grey"
            :options="[
              { label: $tc('form.add_new'), color:'green', icon: 'add',
                detail: $tc('messages.process_create'),
                hidden: !$app.can('delivery-tasks-create'),
                actions: () => {
                  $router.push(`${VIEW.resource.uri}/create`)
                }
              },
              { label: 'DELETE', color:'red', icon: 'delete',
                detail: $tc('messages.process_delete'),
                hidden: !IS_EDITABLE || !$app.can('delivery-tasks-delete'),
                actions: () => {
                  VIEW.delete()
                }
              },
              { label: $tc('form.revision').toUpperCase(), color:'orange', icon: 'edit',
                detail: $tc('messages.process_revise'),
                hidden: !IS_VOID || !$app.can('delivery-tasks-revision'),
                actions: () => {
                  $router.push(`${VIEW.resource.uri}/${ROUTE.params.id}/revision`)
                }
              },
              { label: 'CLOSE', color:'red-10', icon: 'lock',
                detail: $tc('messages.process_close'),
                hidden: !IS_CLOSE || !$app.can('delivery-tasks-revision'),
                actions: () => {
                  setClose()
                }
              },
              { label: 'VOID', color:'red', icon: 'block',
                detail: $tc('messages.process_void'),
                hidden: !IS_VOID || !$app.can('delivery-tasks-void'),
                actions: () => {
                  VIEW.void(()=> init() )
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
          api: '/api/v1/incomes/delivery-tasks',
          uri: '/admin/deliveries/delivery-tasks'
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
