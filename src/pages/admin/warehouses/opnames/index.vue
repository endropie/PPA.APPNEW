<template>
  <q-page padding class="page-index" >
    <q-pull-to-refresh @refresh="TABLE.refresh" inline>
      <q-table ref="table" inline class="table-index table-striped th-uppercase" color="primary" :dark="LAYOUT.isDark"
        :title="TABLE.getTitle()"
        :data="TABLE.rowData"
        :columns="TABLE.columns"
        selection="none"
        :selected.sync="TABLE.selected"
        row-key="id"
        :pagination.sync="TABLE.pagination"
        @request="TABLE.compute"
        :loading="TABLE.loading">

        <!-- Table Header -->
        <template v-slot:top>
          <table-header hide-search
            :title="TABLE.getTitle()"
            :TABLE.sync="TABLE"
            :filter.sync="TABLE.filter"
            :menus="[
              { label: $tc('form.add'),
                detail: $tc('messages.form_new'),
                icon: 'add',
                shortcut: true,
                hidden:!$app.can('incoming-goods-create'),
                to: `${TABLE.resource.uri}/create`
              },
              { label: $tc('label.trash'),
                detail:  $tc('messages.show_deleted'),
                shortcut: true,
                icon: Boolean(FILTERABLE.fill.withTrashed.value)? 'mdi-cup' : 'mdi-cup-off',
                closePopup: false,
                outline: true,
                actions:() => {
                  FILTERABLE.toggleTrash()
                  FILTERABLE.submit()
                }
              }
            ]">

            <div class="row items-start q-col-gutter-xs" >

              <q-select class="col-12 col-sm-6" autocomplete="off"
                multiple use-chips use-input new-value-mode="add"
                dense hide-dropdown-icon
                v-model="FILTERABLE.search" emit-value
                :placeholder="`${$tc('form.search',2)}...`"
                standout="bg-blue-grey-5 text-white"
                :bg-color="LAYOUT.isDark ? 'blue-grey-9' : 'blue-grey-1'"
                :dark="LAYOUT.isDark"
                @input="FILTERABLE.submit">

                <template slot="before">
                </template>
                <template slot="append">
                  <q-btn flat dense icon="search" dark-percentage color="fadded" @click="FILTERABLE.submit"/>
                </template>
              </q-select>

            </div>
          </table-header>
        </template>

        <!-- slot name syntax: body-cell-<column_name> -->
        <q-td slot="body-cell-prefix" slot-scope="rs" :props="rs" style="width:35px">
          <q-btn flat dense color="light" icon="description" :to="`${TABLE.resource.uri}/${rs.row.id}`" />
          <!-- <q-btn v-if="isCanUpdate && isEditable(rs.row)" flat dense color="light" icon="edit" :to="`${TABLE.resource.uri}/${rs.row.id}/edit`" /> -->
          <!-- <q-btn v-if="isCanDelete && isEditable(rs.row)" flat dense color="light" icon="delete"  @click.native="TABLE.delete(rs.row)" /> -->
        </q-td>

        <q-td slot="body-cell-status" slot-scope="rs" :props="rs" style="width:35px">
          <div class="row justify-center">
            <ux-chip-status dense square :row="rs.row" />
          </div>
        </q-td>

        <q-td slot="body-cell-part" slot-scope="rs" :props="rs" class="no-padding">
          <div v-if="rs.row.item" class="column text-body2">
            <span>{{ rs.row.item.part_name }}</span>
            <small class="text-weight-light">[{{rs.row.item.customer_code}}] {{ rs.row.item.part_subname }}</small>
          </div>
          <div v-else class="text-caption text-italic">undefined!</div>
        </q-td>

        <q-td slot="body-cell-created_at" slot-scope="rs" :props="rs" class="no-padding">
          <div class="column text-body">
            <span class="text-uppercase text-grey-8">
              {{rs.row.created_user ? rs.row.created_user.name : 'undefined'}}
            </span>
            <small v-if="rs.row.created_at" class="text-grey">
              <q-icon name="mdi-earth"></q-icon>
              {{ $app.moment(rs.row.created_at).fromNow() }}
            </small>
          </div>
        </q-td>
      </q-table>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import MixIndex from 'src/mixins/mix-index.vue'
import MixSheet from 'src/mixins/mix-sheet.vue'
export default {
  mixins: [MixIndex, MixSheet],
  data () {
    return {
      SHEET: {
        // opnames: { api:'/api/v1/warehouses/opnames?mode=all' },
      },
      FILTERABLE: {
        fill: {
          opname_id: {
            value: null,
            transform: (value) => { return null }
          },
        }
      },
      TABLE: {
        mode: 'index',
        resource:{
          api: '/api/v1/warehouses/opnames',
          uri: '/admin/warehouses/opnames',
        },
        columns: [
          { name: 'prefix', label: '', align: 'left'},
          { name: 'number', label: this.$tc('label.number'), field: (item)=> item.fullnumber || item.number  , align: 'left', sortable: true },
          { name: 'status', label: '', field: 'status', align: 'left'},
          { name: 'created_at', label: this.$tc('form.create', 2), field: 'created_at', align: 'center', sortable: true },
        ],
      },
    }
  },
  created () {
    this.INDEX.load()
  },
  computed: {
    isCanUpdate(){
      return this.$app.can('opname-stocks-update')
    },
    isCanDelete(){
      return this.$app.can('opname-stocks-delete')
    }
  },
  methods:{
    isEditable(row) {
      if(row.deleted_at) return false
      if(row.status !== 'OPEN') return false
      if(row.hasOwnProperty('is_relationship') && row.is_relationship) return false
      return true
    }
  }
}
</script>
