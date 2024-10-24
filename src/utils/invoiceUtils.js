import dayjs from 'dayjs'
import store from '../store'


export const DATE_FORMAT = 'YYYY-MM-DD'


export const emptyInvoiceItem = (unit=null) => {
    if (!unit) {
        unit = store.getState().functionSetting.defaultUnit.value
    }
    return {
        product: { material: '', name: '', spec: '', unit: unit, },
        quantity: null, price: null, originalAmount: '0', 
        discount: 100, amount: '0', remark: '', 
        delivered: false, weight: null
    }
}

export const emptyInvoice = (itemsNum=0, defaultUnit=null) => {
    if (!defaultUnit && itemsNum !== 0) {
        defaultUnit = store.getState().functionSetting.defaultUnit.value
    }
    return {
        partnerName: '',
        date: dayjs(),
        amount: '0',
        prepayment: '',
        payment: '',
        invoiceItems:  [...Array(itemsNum).keys()].map(_ => emptyInvoiceItem(defaultUnit))
    }
}

export const INVOICE_BASICS = {
    salesOrder: {
        title: '销售单',
        partnerTitle: '客户',
        label: '销售',
        relatedInvoiceTitle: '关联退货单',
        addressTitle: '收货地址',
        refundType: 'salesRefund',
        color: '#5470C6',
    },
    salesRefund: {
        title: '销售退货单',
        partnerTitle: '客户',
        label: '销售退货',
        relatedInvoiceTitle: '关联销售单',
        addressTitle: '发货地址',
        orderType: 'salesOrder',
        color: '#fac858',
    },
    purchaseOrder: {
        title: '采购单',
        partnerTitle: '供应商',
        label: '采购',
        relatedInvoiceTitle: '关联退货单',
        addressTitle: '发货地址',
        refundType: 'purchaseRefund',
        color: '#91cc75',
    },
    purchaseRefund: {
        title: '采购退货单',
        partnerTitle: '供应商',
        label: '采购退货',
        relatedInvoiceTitle: '关联采购单',
        addressTitle: '收货地址',
        orderType: 'purchaseOrder',
        color: '#ee6666',
    },
}