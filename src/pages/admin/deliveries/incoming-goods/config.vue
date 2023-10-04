<template>
  <q-dialog ref="dialog" v-bind="$attrs" v-on="$listeners">
    <q-card  style="min-width:18rem">
      <q-card-section>
        <span class="text-h6 text-uppercase text-blue-grey" header>CONFIG::{{$tc('general.sj_delivery')}}</span>
      </q-card-section>
      <q-separator inset/>
      <q-card-section class="row">
        <q-select class="col-12"
          name="show"
          label="Hide View Columns"
          v-model="rsConfig.hide_view_columns"
          :options="['part_name', 'part_subname', 'quantity', 'unit', 'note']"
          multiple use-chips
          dense
          :error="errors.has('hide_view_columns')"
          :error-message="errors.first('hide_view_columns')" />

      </q-card-section>
      <q-separator inset />
      <q-card-actions class="q-gutter-sm" align="right">
          <q-btn dense color="positive"  @click="onSave()">Save</q-btn>
          <q-btn dense color="blue-grey"  @click="hide()">Cancel</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  data () {
    return {
      resource: {
        name: 'incoming_good'
      },
      rsConfig: {
        hide_view_columns: []
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
  methods: {
    show () {
      this.$refs['dialog'].show()
    },
    hide () {
      this.$refs['dialog'].hide()
    },
    init () {
      const resource = JSON.parse(JSON.stringify(this.$store.state.admin.CONFIG[this.resource.name]))
      this.rsConfig = { ...this.rsConfig, ...resource }
    },
    onSave () {
      this.$validator.validateAll().then(result => {
        if (!result) {
          return this.$q
            .notify({
              color: 'negative',
              icon: 'error',
              position: 'top-right',
              timeout: 3000,
              message: this.$tc('messages.to_complete_form')
            })
        }

        this.$app.config(this.resource.name, this.rsConfig)

        this.$emit('done')
        this.hide()
      })
    }
  }
}
</script>
