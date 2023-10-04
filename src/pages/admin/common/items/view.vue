<template>
  <q-page padding class="justify justify-center">
    <q-card v-if="rsView" class="fit">
      <q-card-section horizontal class="bg-grey-1 q-py-sm q-px-md">
        <div class="text-truncate ellipsis">
          <span class="text-h6">{{ rsView.part_name }}</span>
          <br><span class="text-subtitle2">#{{ rsView.id }}</span>
        </div>
        <q-space />
        <div>
          <q-chip square outline color="secondary" class="text-weight-bold" :label="rsView.project" icon="bookmark" v-if="rsView.sample && rsView.project !== 'NONE'" />
          <q-chip square outline color="warning" class="text-weight-bold" label="SAMPLE" icon="bookmark" v-if="rsView.sample" />
          <q-btn dense flat round icon="more_vert">
            <q-menu>
              <q-list class="text-grey-8" style="min-width: 200px">
                <q-item clickable v-close-popup
                  :to="`${VIEW.resource.uri}/${rsView.id}/edit`"
                  v-if="$app.can('items-update')">
                  <q-item-section>{{$tc('form.edit')}}</q-item-section>
                  <q-item-section avatar><q-icon name="edit"/></q-item-section>
                </q-item>
                <q-item clickable v-close-popup
                  :to="`${VIEW.resource.uri}/${rsView.id}/edit-sample`"
                  v-if="rsView.sample && $app.can('items-sample')">
                  <q-item-section>{{$tc('form.edit')}} sample</q-item-section>
                  <q-item-section avatar><q-icon name="edit"/></q-item-section>
                </q-item>
                <q-item clickable v-close-popup
                  @click="sampleValidate"
                  v-if="IS_SAMPLE_VALIDATE && $app.can('items-sample')">
                  <q-item-section>Reguler Validasi</q-item-section>
                  <q-item-section avatar><q-icon name="done_all"/></q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup
                  @click="VIEW.delete"
                  v-if="this.$app.can('items-delete')">
                  <q-item-section>{{$tc('form.delete')}}</q-item-section>
                  <q-item-section avatar><q-icon name="mdi-delete"/></q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
        <!-- <div class="text-subtitle2">[{{rsView.customer_code}}] {{ rsView.part_number }}</div> -->
      </q-card-section>
      <q-tabs class="bg-grey-2 text-grey shadow-2"
        v-model="tab"
        align="left"
        inline-label
        active-color="primary">
        <q-tab name="info" icon="info" label="Info" />
        <!-- <q-tab name="detail" icon="money" label="Detail" /> -->
        <q-tab name="timeline" icon="movie" label="Timeline" />
      </q-tabs>
      <q-tab-panels v-model="tab" animated class="">
        <q-tab-panel name="info">
          <q-card flat bordered class="q-mb-sm">
            <q-card-section class="q-py-sm">
              <div class="text-subtitle2">Information </div>
            </q-card-section>
            <q-separator inset />
            <q-card-section>
              <div class="row">
                <q-list class="col-12 col-sm-6 col-md-3">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="code" color="primary"/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('general.customer')}}</q-item-label>
                      <q-item-label>{{rsView.customer.name}}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('general.brand')}}</q-item-label>
                      <q-item-label>{{rsView.brand ? rsView.brand.name : '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('general.specification')}}</q-item-label>
                      <q-item-label>{{rsView.specification ? rsView.specification.name : '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-list class="col-12 col-sm-6 col-md-3">
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('items.part_name')}}</q-item-label>
                      <q-item-label>{{rsView.part_name || '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('items.part_number')}}</q-item-label>
                      <q-item-label>{{rsView.part_number || '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('items.part_alias')}}</q-item-label>
                      <q-item-label>{{rsView.part_alias || '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-list class="col-12 col-sm-6 col-md-3">
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('label.code')}}</q-item-label>
                      <q-item-label>{{rsView.code || '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('label.unit')}}</q-item-label>
                      <q-item-label>{{rsView.unit ? rsView.unit.name : '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-list class="col-12 col-sm-6 col-md-3">
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('general.item_category')}}</q-item-label>
                      <q-item-label>{{rsView.category_item? rsView.category_item.name : '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('general.item_type')}}</q-item-label>
                      <q-item-label>{{rsView.type_item ? rsView.type_item.name : '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('general.size')}}</q-item-label>
                      <q-item-label>{{rsView.size ? rsView.size.name : '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-card-section>
          </q-card>
          <!-- ITEM ENGINERY -->
          <q-card flat bordered class="q-mb-sm">
            <q-card-section class="q-py-sm">
              <div class="text-subtitle2">Enginering details</div>
            </q-card-section>
            <q-separator inset />
            <q-card-section>
              <div class="row">

                <q-list class="col-12 col-sm-6 col-md-3">
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('items.packing_duration')}}</q-item-label>
                      <q-item-label>{{rsView.packing_duration ? $app.number_format(rsView.packing_duration) : '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('items.sa_dm')}}</q-item-label>
                      <q-item-label>{{rsView.sa_dm ? $app.number_format(rsView.sa_dm) : '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('items.weight')}}</q-item-label>
                      <q-item-label>{{rsView.weight ? $app.number_format(rsView.weight) : '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-list class="col-12 col-sm-6 col-md-3">
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('items.load_type')}}</q-item-label>
                      <q-item-label>{{rsView.load_type || '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="code" color="primary"/></q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{$tc('items.load_capacity')}}</q-item-label>
                      <q-item-label>{{rsView.load_capacity ? $app.number_format(rsView.load_capacity) : '-'}}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-card flat class="col-12 col-md-6">
                  <q-card-section class="q-py-xs">
                    <div class="text-weight-light text-grey">{{$tc('items.preline')}}</div>
                  </q-card-section>
                  <!-- <q-separator inset /> -->
                  <q-card-section class="q-py-sm column reverse">
                    <div v-for="(preline, i) in rsView.item_prelines" :key="i">
                      <q-chip outline square :label="rsView.item_prelines.length - i" color="blue-grey" />
                      {{ preline.line ? preline.line.name : '-' }}
                      <q-chip dense square label="MAIN" color="primary" text-color="white" v-if="preline.ismain" />
                      <span class="float-right">{{ preline.load_amount }} / {{ rsView.load_type || 'Hanger/Barel' }}</span>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </q-card-section>
          </q-card>
          <!-- ITEM DEPICTS -->
          <q-card flat bordered class="q-mb-sm">
            <q-card-section class="q-py-sm">
              <div class="text-subtitle2">{{$tc('items.depicts')}}</div>
            </q-card-section>
            <q-separator inset />
            <q-card-section class="q-py-sm">
              <div v-if="!rsView.depicts || !rsView.depicts.length" class="text-grey text-center">
                <q-avatar size="30px" font-size="24px" icon="info" class="no-margin"/>
                No files
              </div>
              <div v-else class="row q-gutter-sm">
                <q-card  v-for="(file, fileIndex) in rsView.depicts" :key="fileIndex">
                  <q-img v-if="file.__img"
                    placeholder-src="statics/images/stop_block.png"
                    :src="$axios.serverURL(file.url)"
                    spinner-color="white"
                    style="height: 7rem; max-width: 7rem;"
                    img-class=""
                    class="rounded-borders"
                  />
                  <q-avatar v-if="!file.__img"
                    square
                    size="7rem" font-size="52px"
                    color="blue-grey-1" text-color="blue-grey"
                    icon="mdi-file"
                  />
                <q-card-section horizontal style="max-width:7rem" class="q-px-sm items-center">
                  <div class="text-caption text-truncate ellipsis">
                    {{file.name}}
                  </div>
                  <q-space />
                  <q-btn flat dense icon="mdi-download" @click="openFile(file.url)" />
                </q-card-section>
                </q-card>
              </div>
            </q-card-section>

          </q-card>
          <!-- ITEM ESTIMATE -->
          <q-card flat bordered class="q-mb-sm">
            <q-card-section class="q-py-sm">
              <div class="text-subtitle2">{{$tc('label.estimate')}}</div>
            </q-card-section>
            <q-separator inset />
            <q-card-section class="q-py-sm" >
              <div v-if="!$app.can(['items-price','items-sample'])" class="text-grey">
                <q-avatar icon="info" /> NOT ALLOWED
              </div>
              <div v-else class="row">
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">{{$tc('items.estimate_price')}}</div>
                  <div>{{rsView.estimate_price ? $app.number_format(rsView.estimate_price) : '-'}}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">{{$tc('items.estimate_sadm')}}</div>
                  <div>{{rsView.estimate_sadm ? $app.number_format(rsView.estimate_sadm) : '-'}}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">{{$tc('items.estimate_monthly_amount')}}</div>
                  <div>{{rsView.estimate_monthly_amount ? $app.number_format(rsView.estimate_monthly_amount) : '-'}}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
          <!-- ITEM PRICE -->
          <q-card flat bordered class="q-mb-sm">
            <q-card-section class="q-py-sm">
              <div class="text-subtitle2">{{$tc('label.price')}}</div>
            </q-card-section>
            <q-separator inset />
            <q-card-section class="q-py-sm">
              <div v-if="!$app.can('items-price')" class="text-grey">
                <q-avatar icon="info" /> NOT ALLOWED
              </div>
              <div v-else class="row">
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">{{$tc('items.price')}}</div>
                  <div>{{rsView.price ? $app.number_format(rsView.price) : '-'}}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">{{$tc('items.price_area')}}</div>
                  <div>{{price_area ? $app.number_format(price_area) : '-'}}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">{{$tc('items.price_loaded')}}</div>
                  <div>{{price_loaded ? $app.number_format(price_loaded) : '-'}}</div>
                </div>
              </div>
            </q-card-section>
            <q-card-section class="q-py-sm">
              <div class="text-subtitle2">{{$tc('general.category_item_price')}}</div>
            </q-card-section>
            <q-separator inset />
            <q-card-section class="q-pt-sm q-pb-md">
              <div class="row">
                <div class="col-12 col-sm-8">
                  <div class="text-caption text-grey">Nama Kategori</div>
                  <div>{{rsView.category_item_price ? rsView.category_item_price.name : '-'}}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">Kategori Price</div>
                  <div>{{rsView.category_item_price ? $app.number_format(rsView.category_item_price.price) : '-'}}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <q-tab-panel name="detail">
          <q-card flat bordered class="q-mb-sm">
            <q-card-section class="q-py-sm">
              <div class="text-subtitle2">{{$tc('label.estimate')}}</div>
            </q-card-section>
            <q-separator inset />
            <q-card-section class="q-py-sm" >
              <div v-if="!$app.can(['items-price','items-sample'])" class="text-grey">
                <q-avatar icon="info" /> NOT ALLOWED
              </div>
              <div v-else class="row">
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">{{$tc('items.estimate_price')}}</div>
                  <div>{{rsView.estimate_price ? $app.number_format(rsView.estimate_price) : '-'}}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">{{$tc('items.estimate_sadm')}}</div>
                  <div>{{rsView.estimate_sadm ? $app.number_format(rsView.estimate_sadm) : '-'}}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">{{$tc('items.estimate_monthly_amount')}}</div>
                  <div>{{rsView.estimate_monthly_amount ? $app.number_format(rsView.estimate_monthly_amount) : '-'}}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
          <q-card flat bordered class="q-mb-sm">
            <q-card-section class="q-py-sm">
              <div class="text-subtitle2">{{$tc('label.price')}}</div>
            </q-card-section>
            <q-separator inset />
            <q-card-section class="q-py-sm">
              <div v-if="!$app.can('items-price')" class="text-grey">
                <q-avatar icon="info" /> NOT ALLOWED
              </div>
              <div v-else class="row">
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">{{$tc('items.price')}}</div>
                  <div>{{rsView.price ? $app.number_format(rsView.price) : '-'}}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">{{$tc('items.price_area')}}</div>
                  <div>{{price_area ? $app.number_format(price_area) : '-'}}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey">{{$tc('items.price_loaded')}}</div>
                  <div>{{price_loaded ? $app.number_format(price_loaded) : '-'}}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <q-tab-panel name="timeline">

        </q-tab-panel>
      </q-tab-panels>
      <q-card-section>
        <!-- code -->
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { openURL } from 'quasar'
import MixView from 'src/mixins/mix-view.vue'
// import StockTimeline from './stock-timeline.vue'

export default {
  mixins: [MixView],
  data () {
    return {
      tab: 'info',
      VIEW: {
        data: {},
        resource: {
          api: '/api/v1/common/items',
          uri: '/admin/common/items'
        }
      },
      rsView: null
    }
  },
  created () {
    this.init()
  },
  computed: {
    IS_VOID () {
      if (this.IS_EDITABLE) return false
      if (this.rsView.deleted_at) return false
      if (['VOID'].find(x => x === this.rsView.status)) return false
      return true
    },
    IS_EDITABLE () {
      if (this.rsView.revise_id) return false
      if (this.rsView.deleted_at) return false
      if (Object.keys(this.rsView.has_relationship || {}).length > 0) return false
      return true
    },
    IS_SAMPLE_VALIDATE () {
      if (!this.rsView.sample) return false
      if (this.rsView.deleted_at) return false
      if (this.rsView.sample_validated_at) return false
      return this.rsView.sample_enginered_at && this.rsView.sample_priced_at
    },
    price_area () {
      if (!Number(this.rsView.price) || !Number(this.rsView.sa_dm)) return null
      return Number(this.rsView.price) / Number(this.rsView.sa_dm)
    },
    price_loaded () {
      if (!Number(this.rsView.price) || !Number(this.rsView.sa_dm)) return null
      return Number(this.rsView.load_capacity || 0) * Number(this.rsView.price || 0)
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
    sampleValidate () {
      let url = `${this.VIEW.resource.api}/${this.rsView.id}/sample-validation`
      this.$q.loading.show()
      this.$axios.post(url)
        .then((response) => {
          this.$app.notify.success('SAMPLE VALIDATED')
          this.init()
        }).catch((error) => {
          this.$app.response.error(error.response || error)
        }).finally(() => {
          this.$q.loading.hide()
        })
    },
    openFile (v) {
      openURL(this.$axios.serverURL(v))
    },
    push (row) {
      let url = `${this.VIEW.resource.api}/${this.rsView.id}/accurate/push`
      this.$q.loading.show()
      this.$axios.post(url)
        .then((response) => {
          let msg = response.data.d[0] || ''
          return (response.data.s)
            ? this.$app.notify.success('ACCURATE PUSH', msg)
            : this.$app.notify.warning('ACCURATE PUSH', msg)
        }).catch((error) => {
          this.$app.response.error(error.response || error)
        }).finally(() => {
          this.$q.loading.hide()
        })
    }
  }
}
</script>
