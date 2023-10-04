<template>
  <div class="q-my-md" v-if="record">
    <q-list dense bordered separator class="fit" v-if="validations.length">
      <q-item-label class="text-h6 text-weight-bold" header>
        VALIDATIONS
      </q-item-label>
      <q-separator />
      <q-expansion-item v-for="(validation, key) in validations" :key="key">
        <template v-slot:header>
          <q-item-section avatar>
            <q-chip dense outline color="blue-grey" text-color="white">
              #{{ validation.id }}
            </q-chip>
          </q-item-section>

          <q-item-section>
            {{ $app.moment(validation.date).format('ll') }}
          </q-item-section>
        </template>

        <q-list separator style="backdrop-filter: contrast(0.8);">
          <q-item v-for="(item, itemKey) in validation.incoming_validation_items" :key="itemKey">
            <q-item-section>
              <div v-if="DETAIL[item.incoming_good_item_id]" class="column">
                <span class="">{{ DETAIL[item.incoming_good_item_id].item.part_name }}</span>
                <span class="text-caption text-sm text-bold">{{ DETAIL[item.incoming_good_item_id].item.part_subname }}</span>
              </div>
            </q-item-section>
            <q-item-section side>
              <div class="text-nowrap">
                {{ Number(item.quantity) }}

                <span v-if="DETAIL[item.incoming_good_item_id]">
                  {{ DETAIL[item.incoming_good_item_id].unit.code }}
                </span>
              </div>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <div class="row justify-end">
                <q-btn color="red" icon="delete" :label="$tc('form.delete')" size="sm" @click="setDelete(validation.id)"  />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script>

export default {
  props: {
    record: Object
  },
  data () {
    return {
      loading: false,
      validations: []
    }
  },
  created () {
    this.init()
  },
  computed: {
    DETAIL () {
      if (!this.record) return Object.assign({})
      return this.record.incoming_good_items.reduce((result, detail) => {
        result[detail.id] = detail
        return result
      }, {})
    }
  },
  methods: {
    init () {
      this.loading = true
      const apiURL = `/api/v1/warehouses/incoming-goods/${this.record.id}/partial-validations`
      this.$axios.get(apiURL)
        .then((response) => {
          this.validations = response.data
        })
        .catch((error) => {
          this.$app.response.error(error.response, 'VALIDATION FAILED')
        })
        .finally(() => {
          this.loading = false
        })
    },
    setDelete (id) {
      const submit = () => {
        this.loading = true
        const apiURL = `/api/v1/warehouses/incoming-goods/${this.record.id}/partial-validations/${id}`
        this.$axios.delete(apiURL)
          .then((response) => {
            this.$app.notify.success({ message: 'Validation has been Deleted.' })
            this.init()
            this.$emit('reload')
          })
          .catch((error) => {
            this.$app.response.error(error.response || error, 'DELETE FAILED!')
          })
          .finally(() => {
            setTimeout(() => {
              this.loading = false
            }, 1000)
          })
      }

      this.$validator.validate().then(result => {
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

        this.$q.dialog({
          title: this.$tc('form.confirm'),
          message: this.$tc('messages.to_sure', 1, { v: this.$tc('form.delete') }),
          cancel: true,
          persistent: true
        }).onOk(() => {
          submit()
        })
      })
    }
  }
}
</script>
