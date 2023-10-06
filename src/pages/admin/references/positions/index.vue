<template>
  <q-page padding class="page-index">
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" class="table-index th-uppercase"
        color="primary"
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
                hidden:!$app.can('positions-create'),
                to: `${TABLE.resource.uri}/create`
              }
            ]">
          </table-header>
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
      userID: 1,
      partnerID: 2,
      name: '',
      TABLE: {
        show:false,
        resource:{
          api: '/api/v1/references/positions',
          uri: '/admin/references/positions',
        },
        columns: [
          { name: 'prefix', label: '', align: 'left'},
          { name: 'name', field: 'name', label: this.$tc('label.name'), align: 'left', sortable: true},
          { name: 'description', field: 'description', label: this.$tc('label.description'), align: 'left'},
        ],
        rowData:[],
        resData:[],
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
  computed:{
    isCanUpdate(){
      return this.$app.can('positions-update')
    },
    isCanDelete(){
      return this.$app.can('positions-delete')
    },
  },
  mounted () {
    // Page Component mounted!
    this.INDEX.load()
  }
}
</script>
