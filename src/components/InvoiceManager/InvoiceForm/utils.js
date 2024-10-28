import { evaluate } from 'mathjs'
import Decimal from 'decimal.js'
import store from '@/store'


export const calcEquation = (equation) => {
    try {
        const newEquation = equation.replace(/）/g, ')').replace(/（/g, '(').match(/[0-9\+\-\*\/()\.]+/)[0]
        return parseFloat(evaluate(newEquation).toFixed(5))
    } catch (err) { }
}

export const calcItemAmount = (item) => {
    const itemAmountDigitNum = store.getState().functionSetting.itemAmountDigitNum.value
    const quantity = Decimal(item.quantity || 0)
    const price = Decimal(item.price || 0)
    const discount = Decimal(item.discount || 0)
    const originalAmount = quantity.times(price).toFixed(itemAmountDigitNum, Decimal.ROUND_HALF_UP)
    const amount = quantity.times(price).times(discount).dividedBy(100).toFixed(itemAmountDigitNum, Decimal.ROUND_HALF_UP)
    return { originalAmount, amount }
}

export const calcTotalAmount = (items) => {
    const invoiceAmountDigitNum = store.getState().functionSetting.invoiceAmountDigitNum.value
    const amount = items.reduce((previous, current) => {
        return previous.plus(current.amount || 0)
    }, Decimal(0)).toFixed(invoiceAmountDigitNum, Decimal.ROUND_HALF_UP)
    return amount
}

export const updateQuantityByRemark = (form, rowIndex) => {
    const remark = form.getFieldValue(['invoiceItems', rowIndex, 'remark'])
    const quantity = calcEquation(remark)
    if (quantity) {
        form.setFieldValue(['invoiceItems', rowIndex, 'quantity'], quantity)
        updateItemAmount(form, rowIndex)
    }
}

export const updateTotalAmount = (form) => {
    const items = (form.getFieldValue('invoiceItems') ?? [])
    const amount = calcTotalAmount(items)
    form.setFieldValue('amount', amount)
}

export const updateItemAmount = (form, rowIndex) => {
    const item = form.getFieldValue(['invoiceItems', rowIndex])
    const { originalAmount, amount } = calcItemAmount(item)
    form.setFieldValue(['invoiceItems', rowIndex, 'originalAmount'], originalAmount)
    form.setFieldValue(['invoiceItems', rowIndex, 'amount'], amount)
    updateTotalAmount(form)
}

export const deliveredOptions = [{ label: '未配送', value: false }, { label: '已配送', value: true }]