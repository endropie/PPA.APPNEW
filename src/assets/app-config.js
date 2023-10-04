import moment from 'moment'

const config = {
  general: {
    // baseURL: 'http://10.20.10.2:8000' // 'http://560234d3.ngrok.io'
  },
  options: {
    state_colors: {
      OPEN: 'blue',
      VALIDATED: 'green',
      PRODUCTED: 'teal',
      PACKED: 'teal',
      CONFIRMED: 'green-10',
      CLOSED: 'red',
      REJECTED: 'red-9',
      REVISED: 'red-9',
      VOID: 'red-10',
      DELETED: 'dark'
    },
    prefix_intervals: [
      { value: '', label: '-' },
      { value: '{Y}', label: `YYYY`, digit: `${moment().format('YYYY')}` },
      { value: '{y}', label: `YY`, digit: `${moment().format('YY')}` },
      { value: '{Y-m}', label: `YYYY-MM`, digit: `${moment().format('YYYY-MM')}` }
    ],
    transaction_mode: [
      { label: 'REGULER', value: 'REGULER' },
      { label: 'RETURN', value: 'RETURN' }
    ],
    worktime: [
      { label: 'REGULER', value: 'REGULER' },
      { label: 'OVERTIME', value: 'OVERTIME', color: 'secondary' }
    ],
    order_mode: [
      { label: 'HARIAN', value: 'NONE' },
      { label: 'PO', value: 'PO' },
      { label: 'AKUMULASI', value: 'ACCUMULATE' }
    ],
    invoice_mode: [
      { value: 'JOIN', label: 'JOIN', detail: 'Service & material are joined', color: 'positive' },
      { value: 'SEPARATE', label: 'SEPARATE', detail: 'Service & material are specific-separated', color: 'orange' },
      { value: 'DETAIL', label: 'DETAIL', detail: 'Service & material are specified', color: 'blue' },
      { value: 'SUMMARY', label: 'SUMMARY', detail: 'Service summary & material specified', color: 'info' }
    ],
    delivery_mode: [
      { value: 'JOIN', label: 'JOIN', detail: 'Service & material are joined', color: 'positive' },
      { value: 'SEPARATE', label: 'SEPARATE', detail: 'Service & material are separated', color: 'orange' },
      { value: 'DETAIL', label: 'DETAIL', detail: 'Service & material Specified', color: 'blue' },
      { value: 'UNIT_DETAIL', label: 'UNIT_DETAIL', detail: 'Units of service & material Specified', color: 'info' }
    ]
  },
  items: {
    stockists: [
      { value: 'FM', code: 'FM', label: 'FRESH' },
      { value: 'WIP', code: 'WIP', label: 'WORK PROCESS' },
      { value: 'PFG', code: 'PFG', label: 'PRE-FINISH GOOD' },
      { value: 'FG', code: 'FG', label: 'FINISH GOOD' },
      { value: 'NC', code: 'NC', label: 'NC-REPAIR', color: 'warning' },
      { value: 'NCR', code: 'NCR', label: 'NCR-REPAIR', color: 'orange-8' },
      { value: 'NG', code: 'NG', label: 'NG', color: 'red' }
    ]
  },
  incoming_good: {
    hide_view_columns: ['part_subname']
  },
  sj_delivery: {
    hide_view_columns: ['part_subname']
  },
  references: {
    vehicle_type: ['DELIVERY', 'OFFICE', 'OTHERS'],
    vehicle_owner: ['PPA', 'RENTAL', 'OTHERS']
  }
}

export default config
