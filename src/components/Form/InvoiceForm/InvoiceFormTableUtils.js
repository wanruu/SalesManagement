import { evaluate } from 'mathjs'
import Decimal from 'decimal.js'
import { invoiceSettings } from '../../../utils/config'


const calcEquation = (equation) => {
    try {
        const newEquation = equation.replace(/）/g, ')').replace(/（/g, '(').match(/[0-9\+\-\*\/()\.]+/)[0]
        return parseFloat(evaluate(newEquation).toFixed(5))
    } catch (err) { }
}

const calcItemAmount = (item) => {
    const quantity = Decimal(item.quantity || 0)
    const price = Decimal(item.price || 0)
    const discount = Decimal(item.discount || 0)
    const itemAmountDigitNum = parseInt(invoiceSettings.get('itemAmountDigitNum'))
    const originalAmount = quantity.times(price).toFixed(itemAmountDigitNum, Decimal.ROUND_HALF_UP)
    const amount = quantity.times(price).times(discount).dividedBy(100).toFixed(itemAmountDigitNum, Decimal.ROUND_HALF_UP)
    return { originalAmount, amount }
}

const calcTotalAmount = (items) => {
    const invoiceAmountDigitNum = parseInt(invoiceSettings.get('invoiceAmountDigitNum'))
    const amount = items.reduce((previous, current) => {
        return previous.plus(current.amount || 0)
    }, Decimal(0)).toFixed(invoiceAmountDigitNum, Decimal.ROUND_HALF_UP)
    return amount
}

const updateQuantityByRemark = (form, rowIndex) => {
    const remark = form.getFieldValue(['invoiceItems', rowIndex, 'remark'])
    const quantity = calcEquation(remark)
    if (quantity) {
        form.setFieldValue(['invoiceItems', rowIndex, 'quantity'], quantity)
        updateItemAmount(form, rowIndex)
    }
}

const updateTotalAmount = (form) => {
    const items = (form.getFieldValue('invoiceItems') ?? [])
    const amount = calcTotalAmount(items)
    form.setFieldValue('amount', amount)
}

const updateItemAmount = (form, rowIndex) => {
    const item = form.getFieldValue(['invoiceItems', rowIndex])
    const { originalAmount, amount } = calcItemAmount(item)
    form.setFieldValue(['invoiceItems', rowIndex, 'originalAmount'], originalAmount)
    form.setFieldValue(['invoiceItems', rowIndex, 'amount'], amount)
    updateTotalAmount(form)
}

const deliveredOptions = [{ label: '未配送', value: false }, { label: '已配送', value: true }]


export { 
    calcEquation, calcItemAmount, calcTotalAmount, 
    updateQuantityByRemark, updateTotalAmount, updateItemAmount,
    deliveredOptions
}