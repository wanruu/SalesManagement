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


export function digitUppercase(n) {
    var fraction = ['角', '分']
    var digit = [
        '零', '壹', '贰', '叁', '肆',
        '伍', '陆', '柒', '捌', '玖'
    ]
    var unit = [
        ['元', '万', '亿'],
        ['', '拾', '佰', '仟']
    ]
    var head = n < 0 ? '欠' : ''
    n = Math.abs(n)
    var s = ''
    for (var x = 0; x < fraction.length; x++) {
        s += (digit[Math.floor(shiftRight(n,1+x)) % 10] + fraction[x]).replace(/零./, '')
    }
    s = s || '整'
    n = Math.floor(n)
    for (var i = 0; i < unit[0].length && n > 0; i++) {
        var p = ''
        for (var j = 0; j < unit[1].length && n > 0; j++) {
            p = digit[n % 10] + unit[1][j] + p
            n = Math.floor(shiftLeft(n, 1))
        }
        s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s
    }
    return head + s.replace(/(零.)*零元/, '元')
        .replace(/(零.)+/g, '零')
        .replace(/^整$/, '零元整')
}

// 向右移位
function shiftRight(number, digit){
    digit = parseInt(digit, 10)
    var value = number.toString().split('e')
    return +(value[0] + 'e' + (value[1] ? (+value[1] + digit) : digit))
}
// 向左移位
function shiftLeft(number, digit){
    digit = parseInt(digit, 10)
    var value = number.toString().split('e')
    return +(value[0] + 'e' + (value[1] ? (+value[1] - digit) : -digit))
}
