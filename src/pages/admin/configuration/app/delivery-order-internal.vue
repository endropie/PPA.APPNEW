<template>
    <q-card highlight class="main-box no-margin no-shadow">
      <q-card-section>
        <span class="text-h4 text-uppercase text-blue-grey" header>{{$tc('general.sj_delivery')}}</span>
      </q-card-section>
      <q-separator inset/>
      <q-card-section class="row q-col-gutter-xs" v-if="FORM.show">
        <div class="col-12 self-center">
          <q-chip outline square color="primary" >
            <q-badge :label="'NUMBER'" class="on-left"></q-badge>
            {{EXAMP}}
          </q-chip>
        </div>

        <q-input class="col-12 col-sm-4"
          name="number_prefix"
          :label="$tc('label.code', 1, {v:'prefix'})"
          v-model="rsForm.number_prefix"
          v-validate="'required|max:10'"
          :error="errors.has('number_prefix')"
          :error-message="errors.first('number_prefix')"
        />

        <q-select class="col-12 col-sm-4"
          name="number_interval"
          label="Interval Prefix"
          v-model="rsForm.number_interval"
          :options="CONFIG.options['prefix_intervals']"
          emit-value map-options
          v-validate="''"
          :error="errors.has('number_interval')"
          :error-message="errors.first('number_interval')"
        />

        <q-input class="col-12 col-sm-4"
          name="number_digit"
          :label="$tc('label.quantity', 1, {v: 'Digit'})"
          v-model="rsForm.number_digit"
          v-validate="'max:191'"
          :error="errors.has('number_digit')"
          :error-message="errors.first('number_digit')"
        />

      </q-card-section>
      <q-separator inset />
      <q-card-actions class="q-gutter-sm" align="right">
          <q-btn dense color="positive"  @click="onSave()">Save</q-btn>
      </q-card-actions>

    <q-inner-loading :showing="FORM.loading" >
      <q-spinner-dots size="70px" color="primary" />
    </q-inner-loading>
    </q-card>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      FORM: {
        show: false,
        resource: {
          name: 'sj_internal',
          api: '/api/v1/setting'
        }
      },
      rsForm: {
        number_prefix: null,
        number_interval: null,
        number_digit: null
      }
    }
  },
  created () {
    // Component Page Created!
    this.init()
  },
  watch: {
    '$route': 'init'
  },
  computed: {
    EXAMP () {
      const separator = this.SETTING.general.prefix_separator
      let example = ''
      if (this.rsForm.number_prefix) example += this.rsForm.number_prefix + separator
      if (this.rsForm.number_interval) {
        const find = this.CONFIG.options['prefix_intervals'].find(x => x.value === this.rsForm.number_interval)
        if (find) {
          example += find.digit + separator
        }
      }

      return example + String(1).padStart(this.rsForm.number_digit || 5, '0')
    },

    INDEXED_EXAMP () {
      const separator = this.SETTING.general.prefix_separator
      let example = '[CODE CUST]' + separator

      if (this.rsForm.indexed_number_interval) {
        const find = this.CONFIG.options['prefix_intervals'].find(x => x.value === this.rsForm.indexed_number_interval)
        if (find) {
          example += find.digit + separator
        }
      }

      return example + String(1).padStart(this.rsForm.indexed_number_digit || 5, '0')
    }
  },
  methods: {
    init () {
      this.FORM.loading = true
      this.FORM.show = false
      const resource = JSON.parse(JSON.stringify(this.$store.state.admin.SETTING[this.FORM.resource.name]))
      this.rsForm = { ...this.rsForm, ...resource }

      setTimeout(() => {
        this.FORM.loading = false
        this.FORM.show = true
      }, 500)
    },
    onSave () {
      this.$validator.validateAll().then(result => {
        if (!result) {
          this.$q.notify({
            color: 'negative',
            icon: 'error',
            position: 'top-right',
            timeout: 3000,
            message: this.$tc('messages.to_complete_form')
          })

          return
        }
        this.FORM.loading = true
        this.$axios.set('POST', `${this.FORM.resource.api}/${this.FORM.resource.name}`, this.rsForm)
          .then((response) => {
            this.FORM.response.success({ mode: 'edit', label: 'Setting' })
            this.$store.commit('admin/setSetting', response.data)
            this.$nextTick(() => this.$validator.reset())
          })
          .catch((error) => {
            this.FORM.response.fields(error.response)
            this.FORM.response.error(error.response || error, 'Setting')
          })
          .finally(() => {
            this.FORM.loading = false
          })
      })
    }
  }
}
</script>
