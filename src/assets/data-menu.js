// import moment from 'moment'

const common = [
  {
    name: 'Customers',
    icon: 'group',
    path: 'customers',
    lang: 'general.customer',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'customers-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'customers-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'customers-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'customers-read' } }
    ]
  },
  {
    name: 'Part Items',
    path: 'items',
    icon: 'style',
    lang: 'general.item',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'items-read;items-validation;items-sample' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'items-create' } },
      { page: 'form-sample', path: 'create-sample', meta: { mode: 'create', permission: 'items-sample' } },
      { page: 'form-sample', path: ':id/edit-sample', meta: { mode: 'edit', permission: 'items-sample' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'items-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'items-read;items-validation;items-sample' } }
    ]
  },
  {
    name: 'New Part Sample',
    path: 'items/create-sample',
    icon: 'style'
  },
  {
    name: 'Category Price',
    icon: 'widgets',
    path: 'category-item-prices',
    lang: 'general.category_item_price',
    resources: [
      { page: 'index', path: '', meta: { permission: 'items-prices;items-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'items-prices;items-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'items-prices;items-update' } }
    ]
  },
  {
    name: 'Employee',
    path: 'employees',
    icon: 'style',
    lang: 'general.employee',
    resources: [
      { page: 'index', path: '', icon: 'mdi-account-group', meta: { permission: 'employees-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'employees-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'employees-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'employees-read' } }
    ]
  },
  {
    name: 'Vehicles',
    icon: 'mdi-car-multiple',
    path: 'vehicles',
    lang: 'general.vehicle',
    resources: [
      { page: 'index', path: '', meta: { permission: 'vehicles-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'vehicles-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'vehicles-update' } }
    ]
  },
  {
    name: 'Rute',
    icon: 'mdi-car-multiple',
    path: 'rutes',
    lang: 'general.rute',
    resources: [
      { page: 'index', path: '', meta: { permission: '' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: '' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: '' } }
    ]
  }
]

const incomes = [
  {
    name: 'Forecasts',
    icon: 'timeline',
    path: 'forecasts',
    lang: 'general.forecast',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'forecasts-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'forecasts-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'forecasts-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'forecasts-read' } }
    ]
  },
  {
    name: 'Sale Orders',
    icon: 'shop',
    path: 'request-orders',
    lang: 'general.request_order',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'request-orders-read;delivery-tasks-create' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'request-orders-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'request-orders-update' } },
      { page: 'form-reference', path: ':id/edit-reference', meta: { mode: 'edit', permission: 'request-orders-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'request-orders-read;delivery-tasks-create' } }
    ]
  },
  {
    name: 'Invoice-Collect',
    icon: 'shop',
    path: 'invoices',
    lang: 'general.acc_invoice',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'acc-invoices-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'acc-invoices-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'acc-invoices-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'acc-invoices-read' } },
      { page: 'stockcards', path: ':id/stockcards', meta: { mode: 'view', permission: 'acc-invoices-read' } }

    ]
  },
  {
    name: 'Forecast Collect',
    icon: 'timeline',
    path: 'forecast-loads',
    lang: 'general.forecast_load',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'forecasts-read' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'forecasts-read' } },
      { page: 'view-mp', path: ':id/man-power', meta: { mode: 'view', permission: 'forecasts-read' } }
    ]
  }
]

const expenses = [
  {
    hide: true,
    name: 'Purchase Orders',
    icon: 'shopping_basket',
    path: 'purchase-orders',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'purchase-orders-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'purchase-orders-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'purchase-orders-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'purchase-orders-read' } }
    ]
  },
  {
    hide: true,
    name: 'Purchase Deliveries',
    icon: 'archive',
    path: 'purchase-deliveries',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'purchase-delivery-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'purchase-delivery-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'purchase-delivery-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'purchase-delivery-read' } }
    ]
  },
  {
    hide: true,
    name: 'Purchase bills',
    icon: 'money',
    path: 'purchase-bills',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'purchase-bills-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'purchase-bills-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'purchase-bills-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'purchase-bills-read' } }
    ]
  }
]

const warehouses = [
  {
    name: 'Opname Stoks',
    icon: 'move_to_inbox',
    path: 'opnames',
    lang: 'general.opname_stock',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'opname-stocks-read' } },
      { page: 'form', path: 'create', icon: 'list', meta: { mode: 'create', permission: 'opname-stocks-create' } },
      { page: 'form', path: ':id/edit', icon: 'list', meta: { mode: 'edit', permission: 'opname-stocks-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'opname-stocks-read' } }
    ]
  },
  {
    name: 'Opname Parts',
    icon: 'move_to_inbox',
    path: 'opname-stocks',
    lang: 'general.opname_part',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'opname-stocks-read' } },
      { page: 'create', path: 'create', meta: { mode: 'create', permission: 'opname-stocks-create' } },
      // { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'opname-stocks-update' } },
      { page: 'view-period', path: 'period/:id', meta: { mode: 'view', permission: 'opname-stocks-read' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'opname-stocks-read' } }
    ]
  },
  {
    name: 'Stock Voucers',
    icon: 'move_to_inbox',
    path: 'opname-vouchers',
    lang: 'general.opname_voucher',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'opname-vouchers-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'opname-vouchers-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'opname-vouchers-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'opname-vouchers-read' } }
    ]
  }
]

const deliveries = [
  {
    name: 'Delivery (trip)',
    icon: 'calendar',
    path: 'delivery-trips',
    lang: 'general.delivery_calendar',
    resources: [
      { page: 'trip-days', path: '', icon: 'calendar', meta: { permission: null } }
    ]
  },
  {
    name: 'Delivery (outstanding)',
    icon: 'work',
    path: 'delivery-outstanding',
    lang: 'general.delivery_outstanding',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'delivery-tasks-read' } }
    ]
  },
  {
    name: 'Incoming Good',
    icon: 'move_to_inbox',
    path: 'incoming-goods',
    lang: 'general.incoming_good',
    param: `?`,
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'incoming-goods-read;delivery-tasks-create' } },
      { page: 'index-items', path: 'items', icon: 'list', meta: { permission: 'incoming-goods-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'incoming-goods-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'incoming-goods-update' } },
      { page: 'restoration', path: ':id/restoration', meta: { mode: 'edit', permission: 'incoming-goods-create' } },
      { page: 'validation', path: ':id/validation', meta: { mode: 'edit', permission: 'incoming-goods-validation' } },
      { page: 'partial-validation', path: ':id/partial-validation', meta: { mode: 'edit', permission: 'incoming-goods-validation' } },
      { page: 'standardization', path: ':id/standardization', meta: { mode: 'edit', permission: 'incoming-goods-standardization' } },
      { page: 'revision', path: ':id/revision', meta: { mode: 'edit', permission: 'incoming-goods-validation' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'incoming-goods-read;delivery-tasks-create' } }
    ]
  },
  {
    name: 'Pre Delivery',
    icon: 'work',
    path: 'delivery-tasks',
    lang: 'general.delivery_task',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'delivery-tasks-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'delivery-tasks-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'delivery-tasks-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'delivery-tasks-read' } }
    ]
  },
  {
    name: 'Delivery (Verify)',
    icon: 'work',
    path: 'delivery-verifies',
    lang: 'general.delivery_verify',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'delivery-verifies-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'delivery-verifies-create' } },
      { page: 'multi-create', path: 'multi-create', meta: { mode: 'create', permission: 'delivery-verifies-create' } },
      // { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'delivery-verifies-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'delivery-verifies-read' } }
    ]
  },
  {
    name: 'Delivery (Loading)',
    icon: 'work',
    path: 'delivery-loads',
    lang: 'general.delivery_load',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'delivery-loads-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'delivery-loads-create' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'delivery-loads-read' } },
      { page: 'view-delivery-orders', path: ':id/delivery-orders', meta: { mode: 'view', permission: 'delivery-loads-read' } }
    ]
  },
  {
    name: 'SJDO',
    icon: 'local_offer',
    path: 'delivery-orders',
    lang: 'general.sj_delivery',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'sj-delivery-orders-read' } },
      { page: 'index-items', path: 'items', icon: 'list', meta: { permission: 'sj-delivery-orders-read' } },
      { page: 'form-sample', path: 'create-sample', meta: { mode: 'create', permission: 'sj-delivery-orders-create' } },
      { page: 'form-sample', path: ':id/edit-sample', meta: { mode: 'edit', permission: 'sj-delivery-orders-update' } },
      { page: 'revision', path: ':id/revision', meta: { mode: 'edit', permission: 'sj-delivery-orders-revision' } },
      // { page: 'revision-internal', path: ':id/revision-internal', meta: { mode: 'edit', permission: 'sj-delivery-orders-revision' } },
      // { page: 'reconcile', path: ':id/reconcile', meta: { mode: 'edit', permission: 'sj-delivery-orders-create' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'sj-delivery-orders-read' } }
    ]
  },
  {
    name: 'Delivery (Intern)',
    icon: 'assignment',
    path: 'delivery-order-internals',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'sj-delivery-internals-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'sj-delivery-internals-create' } },
      // { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'sj-delivery-internals-update' } },
      { page: 'revision', path: ':id/revision', meta: { mode: 'edit', permission: 'sj-delivery-internals-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'sj-delivery-internals-read' } }
    ]
  },
  {
    name: 'Delivery Checkout',
    icon: 'work',
    path: 'delivery-checkouts',
    lang: 'general.delivery_checkout',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'delivery-checkouts-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'delivery-checkouts-create' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'delivery-checkouts-read' } }
    ]
  },
  {
    name: 'DEPORTATIONS',
    icon: 'local_offer',
    path: 'deportation-goods',
    lang: 'general.deportation_good',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'deportation-goods-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'deportation-goods-update' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'deportation-goods-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'deportation-goods-read' } }
    ]
  },
  {
    name: 'Proof of Handovers (SJDO)',
    icon: 'local_offer',
    path: 'delivery-handovers',
    lang: 'general.delivery_handovers',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'delivery-handovers-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'delivery-handovers-create' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'delivery-handovers-read' } }
    ]
  },
  {
    path: 'incoming-goods/items',
    icon: 'list',
    lang: 'general.incoming_good_items',
    meta: { permission: 'incoming-goods-read' }
  },
  {
    path: 'delivery-orders/items',
    icon: 'list',
    lang: 'general.sj_delivery_items',
    meta: { permission: 'sj-delivery-orders-read' }
  },
  {
    name: 'Report & Monitoring',
    icon: 'verified_user',
    menuicon: true,
    path: 'reports',
    children: [
      {
        name: 'Delivery Stockcard',
        icon: 'work',
        // lang: 'general.delivery_stockcard',
        path: 'delivery-stockcard'
      }
    ]
  }
]

const factories = [
  {
    name: 'Work Order',
    icon: 'work',
    path: 'work-orders',
    lang: 'general.work_order',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'work-orders-read' } },
      { page: 'items', path: 'items', icon: 'list', meta: { permission: 'work-orders-read' } },
      { page: 'lines', path: 'lines', icon: 'list', meta: { permission: 'work-orders-read' } },
      { page: 'packings', path: 'packings', icon: 'list', meta: { permission: 'work-orders-read' } },
      { page: 'hanger-lines', path: 'hanger-lines', icon: 'list', meta: { permission: 'work-orders-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'work-orders-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'work-orders-update' } },
      { page: 'revision', path: ':id/revision', meta: { mode: 'edit', permission: 'work-orders-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'work-orders-read' } },
      { page: 'view-prelines', path: ':id/prelines', meta: { mode: 'view', permission: 'work-orders-read' } }
    ]
  },
  {
    name: 'Work Production',
    icon: 'gavel',
    path: 'work-productions',
    lang: 'general.work_production',
    param: '/create',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'work-productions-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'work-productions-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'work-productions-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'work-productions-read' } }
    ]
  },
  {
    name: 'Inspection Packing',
    icon: 'move_to_inbox',
    path: 'packings',
    lang: 'general.packing',
    param: '/create',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'packings-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'packings-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'packings-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'packings-read' } }
    ]
  },
  {
    name: 'Packing Handover',
    icon: 'move_to_inbox',
    path: 'packing-loads',
    lang: 'general.packing_load',
    resources: [
      { page: 'index', path: '', icon: 'list', meta: { permission: 'packing-loads-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'packing-loads-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'packing-loads-update' } },
      { page: 'view', path: ':id', meta: { mode: 'view', permission: 'packing-loads-read' } }
    ]
  },
  {
    name: 'Report',
    icon: 'verified_user',
    menuicon: true,
    path: '',
    // lang: 'label.report',
    children: [
      {
        name: 'SPK Items',
        icon: 'work',
        lang: 'general.work_order_items',
        path: 'work-orders/items'
      },
      {
        name: 'SPK Lines',
        icon: 'work',
        lang: 'general.work_order_lines',
        path: 'work-orders/lines'
      },
      {
        name: 'SPK Hanger Lines',
        icon: 'work',
        lang: 'general.work_order_hanger_lines',
        path: 'work-orders/hanger-lines'
      },
      {
        name: 'SPK Pakings',
        icon: 'work',
        lang: 'general.work_order_packings',
        path: 'work-orders/packings'
      }
    ]
  }
]

const references = [
  {
    name: 'Departments',
    icon: 'mdi-flag-triangle',
    path: 'departments',
    lang: 'general.department',
    resources: [
      { page: 'index', path: '', meta: { permission: 'departments-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'departments-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'departments-update' } }
    ]
  },
  {
    name: 'Positions',
    icon: 'mdi-account-settings',
    path: 'positions',
    lang: 'general.position',
    resources: [
      { page: 'index', path: '', meta: { permission: 'positions-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'positions-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'positions-update' } }
    ]
  },
  {
    name: 'Brands',
    icon: 'format_bold',
    path: 'brands',
    lang: 'general.brand',
    resources: [
      { page: 'index', path: '', meta: { permission: 'brands-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'brands-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'brands-update' } }
    ]
  },
  {
    name: 'Packareas',
    icon: 'explore',
    path: 'packareas',
    lang: 'general.packarea',
    resources: [
      { page: 'index', path: '', meta: { permission: 'packareas-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'packareas-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'packareas-update' } }
    ]
  },
  {
    name: 'Specifications',
    icon: 'view_array',
    path: 'specifications',
    lang: 'general.specification',
    resources: [
      { page: 'index', path: '', meta: { permission: 'specifications-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'specifications-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'specifications-update' } }
    ]
  },
  {
    name: 'Lines',
    icon: 'insert_chart_outlined',
    path: 'lines',
    lang: 'general.line',
    resources: [
      { page: 'index', path: '', meta: { permission: 'lines-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'lines-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'lines-update' } }
    ]
  },
  {
    name: 'Colors',
    icon: 'color_lens',
    path: 'colors',
    lang: 'general.color',
    resources: [
      { page: 'index', path: '', meta: { permission: 'colors-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'colors-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'colors-update' } }
    ]
  },
  {
    name: 'Units',
    icon: 'web_asset',
    path: 'units',
    lang: 'general.unit',
    resources: [
      { page: 'index', path: '', meta: { permission: 'units-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'units-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'units-update' } }
    ]
  },
  {
    name: 'Sizes',
    icon: 'format_size',
    path: 'sizes',
    lang: 'general.size',
    resources: [
      { page: 'index', path: '', meta: { permission: 'sizes-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'sizes-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'sizes-update' } }
    ]
  },
  {
    name: 'Type of items',
    icon: 'dehaze',
    path: 'type-items',
    lang: 'general.item_type',
    resources: [
      { page: 'index', path: '', meta: { permission: 'type-items-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'type-items-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'type-items-update' } }
    ]
  },
  {
    name: 'Category of items',
    icon: 'table_chart',
    path: 'category-items',
    lang: 'general.item_category',
    resources: [
      { page: 'index', path: '', meta: { permission: 'category-items-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'category-items-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'category-items-update' } }
    ]
  },
  {
    name: 'Faults',
    icon: 'table_chart',
    path: 'faults',
    lang: 'general.fault',
    resources: [
      { page: 'index', path: '', meta: { permission: 'faults-read' } },
      { page: 'form', path: 'create', meta: { mode: 'create', permission: 'faults-create' } },
      { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'faults-update' } }
    ]
  }
]

const configuration = [
  { // Application
    name: 'Application',
    icon: 'mdi-settings-outline',
    path: 'app',
    lang: 'general.application',
    meta: { permission: 'setting' }
  },
  { // Profile
    name: 'Profile',
    icon: 'perm_identity',
    path: 'profile',
    lang: 'general.profile',
    resources: [
      { page: 'form', path: '', meta: { mode: 'edit', permission: 'profile' } }
    ]
  },
  {
    name: 'Authentication',
    icon: 'verified_user',
    menuicon: true,
    path: 'auth',
    lang: 'general.auth',
    children: [
      {
        name: 'Users',
        icon: 'supervisor_account',
        path: 'users',
        lang: 'auth.user',
        resources: [
          { page: 'index', path: '', icon: 'list', meta: { permission: 'users-read' } },
          { page: 'form', path: 'create', meta: { mode: 'create', permission: 'users-create' } },
          { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'users-update' } }
        ]
      },
      {
        name: 'Permissions',
        icon: 'verified_user',
        path: 'permissions',
        lang: 'auth.permission',
        resources: [
          { page: 'index', path: '', icon: 'list', meta: { permission: 'permissions-read' } },
          { page: 'form', path: 'create', meta: { mode: 'create', permission: 'permissions-create' } },
          { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'permissions-update' } }
        ]
      },
      {
        name: 'Roles',
        icon: 'supervised_user_circle',
        path: 'roles',
        lang: 'auth.role',
        resources: [
          { page: 'index', path: '', icon: 'list', meta: { permission: 'roles-read' } },
          { page: 'form', path: 'create', meta: { mode: 'create', permission: 'roles-create' } },
          { page: 'form', path: ':id/edit', meta: { mode: 'edit', permission: 'roles-update' } }
        ]
      }
    ]
  },
  { // Customize
    name: 'Customize',
    icon: 'perm_identity',
    path: 'customize',
    lang: 'general.layout',
    resources: [
      { page: 'form', path: '', meta: { mode: 'edit', permission: null } }
    ]
  }
]

export default [
  { // Desktop
    name: 'Desktop',
    icon: 'home',
    path: 'desktop',
    meta: {
      authenticated: true
    }
  },
  { // Dashboard
    name: 'Dashboard',
    icon: 'apps',
    path: 'dashboard'
  },
  { // common
    name: 'Common',
    icon: 'dns',
    path: 'common',
    lang: 'general.common',
    children: common
  },
  { // Incomes
    name: 'Incomes',
    icon: 'monetization_on',
    path: 'incomes',
    lang: 'general.income',
    children: incomes
  },
  { // Expenses
    hide: true,
    name: 'Expenses',
    icon: 'shopping_cart',
    path: 'expenses',
    lang: 'general.expense',
    children: expenses
  },
  { // Factory
    name: 'Factories',
    icon: 'group_work',
    path: 'factories',
    lang: 'general.factory',
    children: factories
  },
  { // Receipt & Delivery
    name: 'Receipt & Delivery',
    icon: 'local_shipping',
    path: 'deliveries',
    lang: 'general.receipt_delivery',
    children: deliveries
  },
  { // Warehouse
    name: 'Warehouse',
    icon: 'kitchen',
    path: 'warehouses',
    lang: 'general.warehouse',
    children: warehouses
  },
  { // References
    name: 'References',
    icon: 'dashboard',
    path: 'references',
    lang: 'general.preference',
    children: references
  },
  { // Configuration
    name: 'Configuration',
    icon: 'settings',
    path: 'configuration',
    lang: 'general.configuration',
    children: configuration
  }
  // {
  //   name: 'Documentation',
  //   icon: 'chrome_reader_mode',
  //   path: 'log',
  //   lang: 'general.documentation',
  //   file: 'README.md'
  //   // fileType: '.md'
  // }
]
