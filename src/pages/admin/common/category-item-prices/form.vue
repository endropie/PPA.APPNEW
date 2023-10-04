<template>
<q-page padding class="form-page row justify-center">
  <q-card inline class="main-box self-start" v-if="rsForm">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
      </form-header>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="row q-col-gutter-sm">

        <ux-select class="col-12"
          filter clearable :disable="Boolean(rsForm.id)"
          v-model="rsForm.customer"
          v-validate="'required'" data-vv-as="customer"
          :label="$tc('general.customer')" stack-label
          :source="`/api/v1/incomes/customers?mode=all&--limit=50`"
          :option-label="(opt) => opt.name"
          :name="`customer_id`"
          :error="errors.has(`customer_id`)"
          :error-message="errors.first(`customer_id`)"
          @input="(v) => {
            rsForm.customer_id = v ? v.id : null
          }"
        />
        <q-input class="col-grow"
          v-model="rsForm.name"
          v-validate="'required'"
          :label="$tc('label.name')" stack-label
          :name="`name`"
          :error="errors.has(`name`)"
          :error-message="errors.first(`name`)"
        />
        <ux-numeric class="col-auto"
          v-model="rsForm.price"
          v-validate="''"
          :label="$tc('label.price')" stack-label
          :name="`price`"
          :error="errors.has(`price`)"
          :error-message="errors.first(`price`)"
        />
      </div>
      <q-input filled
        v-model="rsForm.description"
        type="textarea"
        rows="3"
        :label="$tc('label.description')"  stack-label
      />
    </q-card-section>
    <q-separator />
    <q-card-actions class="group">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="FORM.reset()"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading">
    <q-spinner-dots size="70px" color="primary" />
  </q-inner-loading>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      FORM: {
        resource: {
          uri: '/admin/common/category-item-prices',
          api: '/api/v1/common/category-item-prices'
        }
      },
      rsForm: null,
      setDefault: () => {
        return {
          id: null,
          name: null,
          price: null,
          customer_id: null,
          customer: null,
          description: null
        }
      }
    }
  },
  created () {
    // Component Page Mounted!
    this.init()
  },
  watch: {
    '$route': 'init'
  },
  methods: {
    init () {
      this.FORM.load((data) => {
        this.setForm(data || this.setDefault())
      })
    },
    setForm (data) {
      this.rsForm = JSON.parse(JSON.stringify(data))
    },
    onReset () {
      const reset = () => {
        this.$nextTick(() => {
          this.$validator.reset()
          this.setForm(this.FORM.data)
        })
      }

      this.$q.dialog({
        title: 'Reset Confirmation',
        message: 'Data will be reset to defaults',
        cancel: true
      }).onOk(() => {
        reset()
      })
    },
    onSave () {
      const submit = () => {
        this.FORM.loading = true
        let { method, apiUrl } = this.FORM.meta()
        this.$axios.set(method, apiUrl, this.rsForm)
          .then((response) => {
            const label = response.data.name + ' - #' + response.data.id
            this.FORM.response.success({ message: label })
            this.FORM.toIndex()
          })
          .catch((error) => {
            console.error(error.response || error)
            this.FORM.response.fields(error.response)
            this.FORM.response.error(error.response || error, 'Submit')
          })
          .finally(() => {
            this.FORM.loading = false
          })
      }

      this.$validator.validate().then(result => {
        if (!result) return this.$q.notify({ color: 'negative', icon: 'error', position: 'top-right', timeout: 3000, message: this.$tc('messages.to_complete_form') })

        this.$q.dialog({
          title: 'Submit Confirmation',
          message: 'Data will be send to submit',
          cancel: true
        }).onOk(() => {
          submit()
        })
      })
    }
  }
}
</script>
