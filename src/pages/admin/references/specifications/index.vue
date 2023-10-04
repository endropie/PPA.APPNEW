<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table  ref="table" class="table-index th-uppercase" :dark="LAYOUT.isDark"
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
            subtitle="Data option of Spesifications"
            :filter.sync="TABLE.filter"
            :menus="[
              { shortcut: true,
                label: $tc('form.add'),
                detail: $tc('messages.form_new'),
                icon: 'add',
                hidden:!$app.can('specifications-create'),
                to: `${TABLE.resource.uri}/create`
              }
            ]" />

        </template>

        <!-- slot name syntax: body-cell-<column_name> -->
        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">
          <q-btn v-if="isCanUpdate"
            dense flat color="light" icon="edit"
            :to="`${TABLE.resource.uri}/${rs.row.id}/edit`" />
          <q-btn v-if="isCanDelete"
            dense flat color="light" icon="delete"
            @click.native="TABLE.delete(rs.row)" />

        </q-td>
        <q-td slot="body-cell-description" slot-scope="rs" :props="rs" class="ellipsis" style="max-width:200px">
          {{ rs.row.description }}
          <q-tooltip v-if="rs.row.description" anchor="top middle" self="bottom middle" :offset="[1, 1]" style="max-width:320px">{{ rs.row.description }}</q-tooltip>
        </q-td>
        <q-td slot="body-cell-color" slot-scope="rs" :props="rs">
          <span v-if="rs.row.color"> {{ rs.row.color.name }}</span>
          <span v-else class="text-warning">- undefined -</span>
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
          api: '/api/v1/references/specifications',
          uri: '/admin/references/specifications',
        },
        columns: [
          { name: 'prefix', label: '', align: 'left'},

          { name: 'code', field: 'code', label: 'Intern code', align: 'left', sortable: true },
          {
            name: 'name', width: '200px',
            field: 'name',
            label: 'Spesification',
            align: 'left',
            sortable: true
          },
          { name: 'color', label: 'Color', field: 'color', align: 'center'},
          // { name: 'thick', label: 'Thickness (mm)', field: 'thick', sortable: true },
          { name: 'salt_white', label: 'White spray (h)', field: 'salt_white', sortable: true },
          { name: 'salt_red', label: 'Red spray (h)', field: 'salt_red', sortable: true },
          { name: 'description', label: this.$tc('label.description'), field: 'description', align: 'left'},
        ]
      }
    }
  },
  created () {
    // Page Component mounted!
    this.INDEX.load()
  },
  computed:{
    isCanUpdate(){
      return this.$app.can('specifications-update')
    },
    isCanDelete(){
      return this.$app.can('specifications-delete')
    },
  },
}
</script>
