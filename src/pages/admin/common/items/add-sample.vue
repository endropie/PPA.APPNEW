<template>
  <q-card>
    <q-card-section class="row items-center">
      <q-avatar icon="layers" color="primary" text-color="white" size="sm" />
      <span class="text-subtitle2 on-right">New Item sample</span>
    </q-card-section>
    <q-card-section class="q-py-none" v-if="rsItem">
      <div class="row items-center q-gutter-sm ">

        <q-input class="col-grow"
          outlined dense hide-bottom-space color="blue-grey-5"
          label="Part Name" name="part_name"
          v-model="rsItem.part_name"
          v-validate="'required'"
          :error="errors.has(`part_name`)"
        />
        <q-input class="col-grow"
          outlined dense hide-bottom-space color="blue-grey-5"
          label="Part No." name="part_number"
          v-model="rsItem.part_number"
          v-validate="'required'"
          :error="errors.has(`part_number`)"
        />
        <ux-select class="col-grow"
          outlined dense hide-bottom-space hide-dropdown-icon color="blue-grey-5"
          v-model="rsItem.unit" label="Unit" name="unit"
          source="/api/v1/references/units?mode=all"
          :option-label="(item) => item.code"
          option-value="id"
          filter clearable
          input-style="width:50px"
          v-validate="'required'"
          :error="errors.has(`unit`)"
          @input="(v) => rsItem.unit_id = v ? v.id : null"
        />
      </div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat label="Cancel" color="primary" v-close-popup />
      <q-btn flat label="ADD" color="primary" @click="save" />
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  props: {
    dataDefault: { type: Object, default: Object.assign({}) }
  },
  data () {
    return {
      rsItem: {
        part_name: null,
        part_number: null,
        unit: null,
        unit_id: null,
        sample: 1
      }
    }
  },
  methods: {
    save () {
      const submit = () => {
        this.$q.loading.show()
        const apiUrl = '/api/v1/common/items'
        this.$axios.post(apiUrl, { ...this.dataDefault, ...this.rsItem })
          .then((response) => {
            let message = response.data.part_name + ' - #' + response.data.id
            this.$app.notify.success({ message: message })
            this.$emit('done', response.data)
            this.$emit('hide')
          })
          .catch((error) => {
            this.$app.notify.error('ADD FAILED')
          })
          .finally(() => {
            setTimeout(() => {
              this.$q.loading.hide()
            }, 500)
          })
      }
      this.$validator.validate().then(result => {
        if (result) return submit()
        this.$q.notify({
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
