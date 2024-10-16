
export const baseURL = () => {
    return `http://${window.electronAPI.queryServerIp()}:${window.electronAPI.queryServerPort()}/v1`
}

export const DATE_FORMAT = 'YYYY-MM-DD'


export const DEFAULT_PAGINATION = {
    defaultPageSize: 50, 
    pageSizeOptions: [50, 100], 
    showQuickJumper: true, 
    showSizeChanger: true
}


export const INVOICE_BASICS = {
    salesOrder: {
        title: '销售单',
        partnerTitle: '客户',
        label: '销售',
        relatedInvoiceTitle: '关联退货单',
        addressTitle: '收货地址',
        refundType: 'salesRefund',
    },
    salesRefund: {
        title: '销售退货单',
        partnerTitle: '客户',
        label: '销售退货',
        relatedInvoiceTitle: '关联销售单',
        addressTitle: '发货地址',
        orderType: 'salesOrder'
    },
    purchaseOrder: {
        title: '采购单',
        partnerTitle: '供应商',
        label: '采购',
        relatedInvoiceTitle: '关联退货单',
        addressTitle: '发货地址',
        refundType: 'purchaseRefund',
    },
    purchaseRefund: {
        title: '采购退货单',
        partnerTitle: '供应商',
        label: '采购退货',
        relatedInvoiceTitle: '关联采购单',
        addressTitle: '收货地址',
        orderType: 'purchaseOrder',
    },
}