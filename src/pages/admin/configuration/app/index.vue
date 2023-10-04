<template>
<q-page padding >
  <q-card class="main-box" style="height: calc(100vh - 100px)">
      <q-splitter style="height: 100%" v-model="splitterModel">

        <template v-slot:before>
          <q-tabs class="text-primary" v-model="tab" vertical >
            <q-tab name="general"
              icon="dashboard"
              :label="$q.screen.lt.sm ? undefined : $tc('label.general')"
              v-if="$app.can()"/>
            <q-tab name="item"
              icon="style"
              :label="$q.screen.lt.sm ? undefined : $tc('general.item')"
              v-if="$app.can()"/>
            <q-tab name="incoming_good"
              icon="move_to_inbox"
              :label="$q.screen.lt.sm ? undefined : $tc('general.incoming_good')"
              v-if="$app.can()"/>
            <q-tab name="delivery_order"
              icon="unarchive"
              :label="$q.screen.lt.sm ? undefined : $tc('general.sj_delivery')"
              v-if="$app.can()"
            />
            <q-tab name="delivery_order_internal"
              icon="unarchive"
              :label="$q.screen.lt.sm ? undefined : $tc('general.sj_internal')"
              v-if="$app.can()"
            />
          </q-tabs>
        </template>

        <template v-slot:after>
          <q-tab-panels class="main-box fit" v-model="tab"
            animated transition-prev="jump-up" transition-next="jump-up">
            <q-tab-panel name="general">
              <commponet :is="components[tab]" />
            </q-tab-panel>

            <q-tab-panel name="item">
              <commponet :is="components[tab]" />
            </q-tab-panel>

            <q-tab-panel name="incoming_good">
              <commponet :is="components[tab]" />
            </q-tab-panel>
            <q-tab-panel name="delivery_order">
              <commponet :is="components[tab]" />
            </q-tab-panel>
            <q-tab-panel name="delivery_order_internal">
              <commponet :is="components[tab]" />
            </q-tab-panel>

          </q-tab-panels>
        </template>

      </q-splitter>
  </q-card>
</q-page>
</template>

<script>
import FormGeneral from './general'
import FormItem from './item'
import FormIncomingGood from './incoming-good'
import FormDeliveryOrder from './delivery-order'
import FormDeliveryOrderInternal from './delivery-order-internal'

export default {
  data () {
    return {
      components: {
        general: FormGeneral,
        item: FormItem,
        incoming_good: FormIncomingGood,
        delivery_order: FormDeliveryOrder,
        delivery_order_internal: FormDeliveryOrderInternal
      },
      tab: 'general',
      splitterModel: 20
    }
  }
}
</script>
