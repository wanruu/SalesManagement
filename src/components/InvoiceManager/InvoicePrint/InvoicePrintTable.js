import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import Decimal from 'decimal.js'
import { get } from 'lodash'
import { BaseInvoiceItem } from '@/types'



/**
 * @component
 * @param {Object} props 
 * @param {Object} props.invoice
 * @param {number} props.invoice.amount
 * @param {BaseInvoiceItem[]} props.invoice.invoiceItems
 */
const InvoicePrintTable = (props) => {
    const { invoice } = props
    const { invoiceItems = [], amount = -1 } = invoice

    const ifShowMaterial = useSelector(state => state.functionSetting.ifShowMaterial.value)
    const amountSign = useSelector(state => state.printSetting.amountSign.value)
    const fontSize = useSelector(state => state.printSetting.tableFontSize.value || state.printSetting.tableFontSize.defaultValue)

    const columns = useMemo(() => {
        return [
            ifShowMaterial ? { title: '材质', dataIndex: ['product', 'material'], width: '5%' } : null,
            { title: '名称', dataIndex: ['product', 'name'], width: '10%' },
            { title: '规格', dataIndex: ['product', 'spec'], width: '10%' },
            { title: '数量', dataIndex: 'quantity', width: '8%', render: q => q.toLocaleString() },
            { title: '单位', dataIndex: ['product', 'unit'], width: '6%' },
            { title: '单价', dataIndex: 'price', width: '8%', render: p => Decimal(p).toCurrencyString(amountSign) },
            { title: '金额', dataIndex: 'amount', width: '11%', render: a => Decimal(a).toCurrencyString(amountSign) },
            { title: '备注', dataIndex: 'remark', width: '15%' }
        ]
            .filter(i => i)
            .map(i => i.render ? i : { ...i, render: data => data })
    }, [ifShowMaterial, amountSign])

    return (
        <div style={{ fontSize: fontSize + 'px' }}>
            <table className='invoice-print-table' style={{ width: '100%', height: '100%' }} >
                <thead>
                    <tr>
                        <th style={{ width: '04.0%', }}>序号</th>
                        {columns.map(col =>
                            <th key={col.title} style={{ width: col.width }}>
                                {col.title}
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {invoiceItems.map((item, itemIdx) =>
                        <tr key={item.id}>
                            <td>{itemIdx + 1}</td>
                            {columns.map(col =>
                                <th key={col.title}>
                                    {col.render(get(item, col.dataIndex))}
                                </th>
                            )}
                        </tr>
                    )}
                    <tr>
                        <td>合计</td>
                        <td style={{ textAlign: 'left' }} colSpan={ifShowMaterial + 5}>
                            <span style={{ marginLeft: '5px' }}>{digitUppercase(amount)}</span>
                        </td>
                        <td style={{ textAlign: 'left' }} colSpan={2}>
                            <span style={{ marginLeft: '5px' }}>
                                {Decimal(amount).toCurrencyString(amountSign)}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}


export default InvoicePrintTable



const digitUppercase = (n) => {
    // 向右移位
    const shiftRight = (number, digit) => {
        digit = parseInt(digit, 10)
        var value = number.toString().split('e')
        return +(value[0] + 'e' + (value[1] ? (+value[1] + digit) : digit))
    }
    // 向左移位
    const shiftLeft = (number, digit) => {
        digit = parseInt(digit, 10)
        var value = number.toString().split('e')
        return +(value[0] + 'e' + (value[1] ? (+value[1] - digit) : -digit))
    }

    const fraction = ['角', '分']
    const digit = [
        '零', '壹', '贰', '叁', '肆',
        '伍', '陆', '柒', '捌', '玖'
    ]
    const unit = [
        ['元', '万', '亿'],
        ['', '拾', '佰', '仟']
    ]
    var head = n < 0 ? '欠' : ''
    n = Math.abs(n)
    var s = ''
    for (var x = 0; x < fraction.length; x++) {
        s += (digit[Math.floor(shiftRight(n, 1 + x)) % 10] + fraction[x]).replace(/零./, '')
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