<template>
<q-page padding class="form-page row justify-center">
  <q-card inline class="main-box self-start" v-if="rsForm">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()" >
      </form-header>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-card flat bordered class="q-mb-sm">
        <q-card-section>
          <div class="row no-wrap"
            v-for="(row, rowIndex) in rsForm.rute_customers" :key="rowIndex"
          >
            <ux-select class="col" style="max-width:2000px"
              filter clearable use-chip
              v-model="row.customer"
              v-validate="'required'" data-vv-as="customer"
              :label="$tc('general.customer')" stack-label
              :source="`/api/v1/incomes/customers?mode=all&--limit=50`"
              :option-label="(opt) => opt.name"
              :name="`rute_customers.${rowIndex}.customer_id`"
              :error="errors.has(`rute_customers.${rowIndex}.customer_id`)"
              :error-message="errors.first(`rute_customers.${rowIndex}.customer_id`)"
              @input="(v) => {
                row.customer_id = v ? v.id : null
                row.code = v ? v.code : null
                setName()
              }"
            />
            <q-input class="col"
              label=" "
              v-model="row.code" @input="setName"
              v-validate="'required'" data-vv-as="Place code"
              :name="`rute_customers.${rowIndex}.customer_id`"
              :error="errors.has(`rute_customers.${rowIndex}.customer_id`)"
              :error-message="errors.first(`rute_customers.${rowIndex}.customer_id`)"
            />
            <div class="col-auto">
              <q-btn flat dense color="blue-grey" icon="clear" @click="removeDetail" />
            </div>
          </div>
          <div class="column">
              <q-btn outline color="blue-grey" :label="$tc('form.add')" @click="addNewDetail" />
          </div>
        </q-card-section>
      </q-card>
      <div class="row q-col-gutter-sm">
        <q-input class="col-12"
          v-model="rsForm.name"
          v-validate="'required'"
          :label="$tc('label.name')" stack-label
          :name="`name`"
          :error="errors.has(`name`)"
          :error-message="errors.first(`name`)"
        />
        <!-- <ux-numeric class="col-12 col-sm-6"
          v-model="rsForm.cost"
          v-validate="''"
          :label="$tc('label.cost')" stack-label
          :name="`cost`"
          :error="errors.has(`cost`)"
          :error-message="errors.first(`cost`)"
        /> -->
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
          uri: '/admin/common/rutes',
          api: '/api/v1/common/rutes'
        }
      },
      rsForm: null,
      setDefault: () => {
        return {
          id: null,
          name: null,
          cost: null,
          description: null,
          rute_customers: [{
            customer_id: null,
            customer: null,
            code: null
          }]
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
    addNewDetail () {
      const newitem = Object.assign(this.setDefault().rute_customers[0], { _autofocus: true })
      this.rsForm.rute_customers.push(newitem)
    },
    removeDetail (index) {
      this.rsForm.rute_customers.splice(index, 1)
      if (!this.rsForm.rute_customers.length) this.addNewDetail()
      this.setName()
    },
    setName () {
      this.rsForm.name = this.rsForm.rute_customers.map(item => item.code).join(' + ')
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
