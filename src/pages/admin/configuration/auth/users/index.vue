<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table
        ref="table"
        class="table-index th-uppercase"
        :title="TABLE.getTitle()"
        :data="TABLE.rowData"
        :columns="TABLE.columns"
        :filter="TABLE.filter"
        :selected.sync="TABLE.selected"
        selection="none"
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
              { label: $tc('form.add'),
                detail: $tc('messages.form_new'),
                icon: 'add',
                shortcut: true,
                hidden:!$app.can('permissions-create'),
                to: `${TABLE.resource.uri}/create`
              }]">
          </table-header>
        </template>
        <!-- slot name syntax: body-cell-<column_name> -->
        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">
          <q-btn dense flat color="light" icon="edit"   :to="`${TABLE.resource.uri}/${rs.row.id}/edit`" />
          <q-btn v-if="rs.row.id !== 1" dense flat color="light" icon="delete" @click.native="TABLE.delete(rs.row)" />
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
          api: '/api/v1/auth/users',
          uri: '/admin/configuration/auth/users',
        },
        columns: [
          { name: 'prefix', label: '', align: 'left'},
          { name: 'name', field: 'name', label: 'Name', align: 'left', sortable: true},
          { name: 'email', field: 'email', label: 'Email', align: 'left', sortable: true}
        ]
      },
    }
  },
  created () {
    // Page Component mounted!
    this.INDEX.load()
  }
}
</script>
