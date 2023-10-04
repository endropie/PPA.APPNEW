import Modal from 'components/Modal'
import AdminMenuItem from 'components/AdminMenuItem'
import AdminTabs from 'components/AdminTabs'
import AdminHeader from 'components/AdminHeader'
import AdminAccurate from 'components/AdminAccurate'
import ListItem from 'components/ListItem'

import UXModalView from 'components/UXModalView'
import Commentable from 'components/Commentable'
import UXSelectFilter from 'components/UXSelectFilter'
import UXSelect from 'components/UXSelect'
import UXBtnSelect from 'components/UXBtnSelect'
import UXNumeric from 'components/UXNumeric'
import UXDate from 'components/UXDate'
import UXDatetime from 'components/UXDatetime'
import UXRecurring from 'components/UXRecurring'

import UXBadgeStatus from 'components/UXBadgeStatus'
import UXChipStatus from 'components/UXChipStatus'
import UXBtnDropdown from 'components/UXBtnDropdown'

import VueQrcode from '@chenfengyuan/vue-qrcode'

// leave the export, even if you don't use it
export default async ({ app, store, router, Vue }) => {
  Vue.component('modal', Modal)
  Vue.component('Admin-tabs', AdminTabs)
  Vue.component('admin-header', AdminHeader)
  Vue.component('admin-accurate', AdminAccurate)
  Vue.component('admin-menu-item', AdminMenuItem)
  Vue.component('list-item', ListItem)

  // Form Components //
  // Vue.component('ux-modal-source', UXModalSource)
  Vue.component('ux-modal-view', UXModalView)
  Vue.component('commentable', Commentable)
  Vue.component('ux-select-filter', UXSelectFilter)
  Vue.component('ux-select', UXSelect)
  Vue.component('ux-btn-select', UXBtnSelect)
  Vue.component('ux-numeric', UXNumeric)
  Vue.component('ux-date', UXDate)
  Vue.component('ux-datetime', UXDatetime)
  Vue.component('ux-recurring', UXRecurring)

  Vue.component('ux-badge-status', UXBadgeStatus)
  Vue.component('ux-chip-status', UXChipStatus)
  Vue.component('ux-btn-dropdown', UXBtnDropdown)

  Vue.component('ux-qrcode', VueQrcode)
}
