<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table  ref="table" class="table-index table-striped th-uppercase"
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
            :menus="[
              { shortcut: true,
                label: $tc('form.add'),
                detail: $tc('messages.form_new'),
                icon: 'add',
                hidden:!$app.can('employees-create'),
                to: `${TABLE.resource.uri}/create`
              }
            ]" />
        </template>

        <!-- slot name syntax: body-cell-<column_name> -->
        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">
          <q-btn dense flat color="light" icon="edit"   :to="`${TABLE.resource.uri}/${rs.row.id}/edit`" />
          <q-btn dense flat color="light" icon="delete" @click.native="TABLE.delete(rs.row)" />
        </q-td>
         <q-td slot="body-cell-department" slot-scope="rs" :props="rs">
          <span v-if="rs.row.department" v-text="rs.row.department.name"/>
          <span v-else v-text="'-'" />
        </q-td>
         <q-td slot="body-cell-position" slot-scope="rs" :props="rs">
          <span v-if="rs.row.position" v-text="rs.row.position.name"/>
          <span v-else v-text="'-'" />
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
      TABLE:{
        mode: 'index',
        resource:{
          api: '/api/v1/common/employees',
          uri: '/admin/common/employees',
        },
        columns: [
          { name: 'prefix', label: '', align: 'left'},
          { name: 'code', field: 'code', label: 'NIK', align: 'left', sortable: true},
          { name: 'name', field: 'name', label: this.$tc('label.name'), align: 'left', sortable: true},
          { name: 'position', field: 'position_id', label: this.$tc('general.position'), align: 'left'},
          { name: 'department', field: 'department_id', label: this.$tc('general.department'), align: 'left'},
          { name: 'phone', field: 'phone', label: this.$tc('label.phone'), align: 'left'},
          { name: 'email', field: 'email', label: this.$tc('label.email'), align: 'left'},
        ],
        pagination : {
          page: 1,
          rowsPerPage: 10,
          rowsNumber: 10 // specifying this determines pagination is server-side,
        },
        filter: '',
        selected: [
          // initial selection => { id: 5 }
        ],
        loading: false,
      },
    }
  },
  created () {
    // Page Component mounted!
    this.INDEX.load()
  }
}
</script>
