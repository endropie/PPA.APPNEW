<template>
    <ux-select
      v-bind="$attrs"
      v-on="$listeners"
      :source="`${api}?mode=datagrid`"
    >
    <template slot="after">
      <q-btn dense outline color="primary" icon="add" @click="addPeriod" />
      <q-dialog ref="newModal" persistent>
        <q-card style="min-width:350px">
          <q-card-section >
            <div class="text-center q-mb-md text-h6 text-weight-medium"> New Period </div>
            <!-- <q-avatar icon="signal_wifi_off" color="primary" text-color="white" /> -->
            <div class="column q-gutter-sm" v-if="newPeriod">
              <q-select filled
                :label="$tc('label.period')"
                map-options emit-value
                :options="OPTIONS"
                v-model="newPeriod.period"
                name="period" v-validate="'required'"
                :error="errors.has('period')"
                :error-message="errors.first('period')"
              />
              <q-input filled
                type="number" min="0" max="31"
                v-model="newPeriod.days"
                label="Number days"
                input-style="text-align: center"
                name="days" v-validate="'required'"
                :error="errors.has('days')"
                :error-message="errors.first('days')"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" v-close-popup />
            <q-btn flat label="add" color="primary" @click="savePeriod" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </template>
  </ux-select>
</template>

<script>
export default {
  data: () => ({
    api: '/api/v1/incomes/forecast-periods',
    newPeriod: null
  }),
  computed: {
    OPTIONS () {
      let options = []
      for (let index = -6; index <= 6; index++) {
        const p = this.$app.moment().startOf('month').month(index + this.$app.moment().month())
        options.push({ value: p.format('YYYY-MM-DD'), label: p.format('MMMM YYYY') })
      }

      return options
    }
  },
  methods: {
    setNewPeriod () {
      this.newPeriod = {
        period: this.$app.moment().startOf('month').format('YYYY-MM-DD'),
        days: null
      }
    },
    addPeriod () {
      this.setNewPeriod()
      this.$refs.newModal.show()
    },
    savePeriod () {
      const submit = () => {
        this.$axios.post(this.api, this.newPeriod)
          .then((response) => {
            console.warn(response)
            this.$emit('input', response.data)
            this.$refs.newModal.hide()
          })
          .catch((error) => {
            console.error(this.$validator, error.response || error)

            if (this.$validator && error.response && error.response.status === 422) {
              for (const field in error.response.data.errors || {}) {
                console.warn('error', field)
                this.$validator.errors.add(Object.assign({ field: field, msg: error.response.data.errors[field][0] }))
              }
            }
          })
      }

      this.$validator.validate().then(result => {
        return (result) ? submit()
          : this.$q.notify({
            color: 'negative',
            icon: 'error',
            position: 'top-right',
            timeout: 3000,
            message: this.$tc('messages.to_complete_form')
          })
      })
    }
  }
}
</script>
