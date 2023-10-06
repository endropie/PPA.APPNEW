<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table  ref="table" class="table-index th-uppercase"
        :title="TABLE.getTitle()"
        :data="TABLE.rowData"
        :columns="TABLE.columns"
        :filter="TABLE.filter"
        selection="none"
        :selected.sync="TABLE.selected"
        row-key="id"
        :pagination.sync="TABLE.pagination"
        @request="TABLE.compute"
        :loading="TABLE.loading">

        <template v-slot:top>
          <table-header
            :title="TABLE.getTitle()"
            :TABLE.sync="TABLE"
            :filter.sync="TABLE.filter"
            :menus="[
              { shortcut: true,
                label: $tc('form.add'),
                detail: $tc('messages.form_new'),
                icon: 'add',
                hidden:!$app.can('units-create'),
                to: `${TABLE.resource.uri}/create`
              }
            ]" />

        </template>

        <!-- slot name syntax: body-cell-<column_name> -->
        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">
          <q-btn dense flat color="light" icon="edit" :to="`${TABLE.resource.uri}/${rs.row.id}/edit`" v-if="isCanUpdate" />
          <q-btn dense flat color="light" icon="delete" @click.native="TABLE.delete(rs.row)" v-if="isCanDelete" />
        </q-td>
      </q-table>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import MixIndex from 'src/mixins/mix-index.vue'

export default {
  mixins: [MixIndex],
  data () {
    return {
      TABLE: {
        resource: {
          api: '/api/v1/references/units',
          uri: '/admin/references/units',
        },
        columns: [
          { name: 'prefix', label: '', align: 'left'},
          { name: 'code', field: 'code', label: this.$tc('label.code'), align: 'left', sortable: true},
          { name: 'name', field: 'name', label: this.$tc('label.unit'), align: 'left', sortable: true},
          { name: 'decimal_in', field: 'decimal_in', label: this.$tc('label.quantity', 1, {v:'Decimal'}), align: 'right', sortable: false},
        ]
      },
    }
  },
  created () {
    // Page Component mounted!
    this.INDEX.load()
  },
  computed: {
    isCanUpdate(){
      return this.$app.can('units-update')
    },
    isCanDelete(){
      return this.$app.can('units-delete')
    },
  }
}
</script>
