
export default {
  order_NONE: 'Harian',
  order_PO: 'PO',
  order_ACCUMULATE: 'Akumulasi',
  service: {
    bounded: 'Kawasan terikat',
    exclude: 'Exclude Harga Jasa'
  },
  order_lots: 'Lot of Order',
  partialidate_allowed: 'Partial Validation',
  delivery_manual_allowed: 'SJDO Manual',
  delivery_over_allowed: 'Auto SJ-Internal',
  invoice_request_required: 'Invoice by Sales Order',
  invoice_category_price: 'Invoice Category Price',
  order_monthly_actived: 'PO Monthly actived',
  order_manual_allowed: 'PO Daily editable',
  detail: {
    order_lots: 'Prefix number pada detail PO (required)',
    partialidate_allowed: 'Validasi sebagian pada Kedatangan Barang',
    delivery_manual_allowed: 'Bolehkan Tambah/edit SJDO',
    delivery_over_allowed: 'Bolehkan process SJ-Internal saat over Delivery Loading',
    invoice_request_required: 'Invoice berdasarkan S.O yang telah CLOSED',
    invoice_category_price: 'Kategori harga pada generate invoice',
    order_monthly_actived: 'Tanggal active PO (generate) setiap akhir bulan',
    order_manual_allowed: 'Bolehkan Tambah/edit PO [Harian] customer'
  },
  tooltip: {
    service_bounded: 'Tanpa PPN materal'
  }
}
