<template>
  <div class="column page-print shadow-2" :class="{'bg-dark': $q.dark.isActive}">
    <div class="page-print-layout">
      <table style="width:100%">
        <thead>
          <tr>
            <td :class="{'header-line': true}">
              <div class="page-print-header header">
                <slot name="header">
                  <div class="items-center row" >
                    <div class="self-center head-icon">
                      <slot name="'header-icon'">
                        <q-avatar color="transparent" text-color="primary" rounded class="q-mr-sm">
                          <img src="/statics/icons/ppa-icon.png" width="100%" />
                        </q-avatar>
                        <!-- <div>
                          <q-icon  name="widgets" color="primary" class=""/>
                        </div> -->
                      </slot>
                    </div>
                    <div class="head-brand col-grow text-no-wrap ">
                      <div  class="title text-weight-bold text-uppercase ellipsis text-truncate">
                        <slot name="header-title">
                          <span>{{ CorporateName || 'MY-CORPORATION' }}</span>
                        </slot>
                      </div>
                      <div class="subtitle text-weight-light ellipsis text-truncate">
                        <slot name="header-subtitle">
                          <span>{{ CorporateAddress || '' }}</span>
                        </slot>
                      </div>
                    </div>
                    <q-space />
                    <div class="items-end self-end col-auto">
                      <slot name="header-tags"></slot>
                    </div>
                  </div>
                </slot>
              </div>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="page-print-body">
              <slot></slot>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="page-print-footer">
              <slot name="footer"></slot>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <q-space />
    <div class="page-print-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'page-print',
  computed: {
    CorporateName () {
      if (!this.$store.state.admin.SETTING.general) return ''
      return this.$store.state.admin.SETTING.general.app_corporate
    },
    CorporateAddress () {
      if (!this.$store.state.admin.SETTING.general) return ''
      return this.$store.state.admin.SETTING.general.app_corporate_address
    }
  }
}
</script>
<style lang="stylus">
.page-print
  .page-print-layout
    padding 0 10px
  .page-print-actions
    padding 10px
  .header-line
    border-bottom-width 1px
    border-bottom-style solid
    border-bottom-color rgba(0,0,0,0.12)
  .header
    .head-brand
      padding 5px 0px 0px

      .title
        font-size 20px
        line-height 100%
        span
          line-height 1.12
          letter-spacing 0.02em
      .subtitle
        font-size 80%
        // line-height 0.12
        letter-spacing -0.02em

.super-dense .q-table
  tbody
    tr, th, td
      height unset
  th:last-child,
  td:last-child
    padding-right: 8px
  th,
  td
    padding: 3px 6px

.profile, .info
  // font-size:12px
  line-height normal
  address
    white-space: pre-wrap;
    font-style normal

@media print
  body
    margin 0 auto
  .q-layout, .q-page
    padding 0
    height unset !important
    min-height unset !important
  .q-table__container
    background-color transparent
  .q-page-container
    padding-top: unset !important
    // padding 5px !important
  .q-page.items-center, .q-page.flex-center
    align-items normal

  .page-print
    display block
    padding 0 !important
    // margin 0 !important
    box-shadow none
    -webkit-box-shadow none

    .page-print-body
      font-size 12px

    .page-print-header div.header
      display table-header-group

    .page-print-footer
      display table-row-group

.page-print.multi-page::before
  content ''
  top: 0
  display block
  page-break-after always

.page-print.multi-page
  display block
  page-break-before always

</style>
