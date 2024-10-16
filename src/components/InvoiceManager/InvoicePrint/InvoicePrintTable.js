import React from 'react'
import { digitUppercase } from '../../../utils/invoiceUtils'
import { useSelector } from 'react-redux'
import './InvoicePrintTable.scss'


/* 
    Required: invoice
*/
const InvoicePrintTable = ({ invoice }) => {
    const ifShowMaterial = useSelector(state => state.functionSetting.ifShowMaterial.value)

    const amountSign = useSelector(state => state.printSetting.amountSign.value)
    const fontSize = useSelector(state => state.printSetting.tableFontSize.value || state.printSetting.tableFontSize.defaultValue)
    const tableColumns = [
        ifShowMaterial ? { title: '材质', dataIndex: ['product', 'material'], width: '5%' } : null,
        { title: '名称', dataIndex: ['product', 'name'], width: '10%' },
        { title: '规格', dataIndex: ['product', 'spec'], width: '10%' },
        { title: '数量', dataIndex: 'quantity', width: '8%', render: q => q.toLocaleString() },
        { title: '单位', dataIndex: ['product', 'unit'], width: '6%' },
        {
            title: '单价', dataIndex: 'price', width: '8%', render: p =>
                amountSign + p.toLocaleString()
        },
        {
            title: '金额', dataIndex: 'amount', width: '11%', render: a =>
                amountSign + a.toLocaleString()
        },
        { title: '备注', dataIndex: 'remark', width: '15%' }
    ].filter(i => i != null)

    const getDataByIndex = (data, dataIndex) => {
        if (Array.isArray(dataIndex)) {
            var result = data
            for (const idx of dataIndex) {
                result = result[idx]
            }
            return result
        }
        return data[dataIndex]
    }

    return (
        <div style={{ fontSize: fontSize + 'px' }}>
            <table className='invoicePrintTable' style={{ width: '100%', height: '100%' }} >
                <thead>
                    <tr>
                        <th style={{ width: '04.0%', }}>序号</th>
                        { tableColumns.map(col => 
                            <th key={col.title} style={{ width: col.width }}>
                                {col.title}
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {(invoice?.invoiceItems??[]).filter(item => item.quantity != null).map((item, itemIdx) =>
                        <tr key={item.id}>
                            <td>{itemIdx + 1}</td>
                            { tableColumns.map(col =>
                                <th key={col.title}>
                                    { col.render ? col.render(getDataByIndex(item, col.dataIndex)) : getDataByIndex(item, col.dataIndex) }
                                </th>
                            )}
                        </tr>
                    )}
                    <tr>
                        <td>合计</td>
                        <td style={{ textAlign: 'left' }} colSpan={ifShowMaterial ? 6 : 5}>
                            <span style={{ marginLeft: '5px' }}>{digitUppercase(invoice?.amount)}</span>
                        </td>
                        <td style={{ textAlign: 'left' }} colSpan={2}>
                            <span style={{ marginLeft: '5px' }}>
                                {amountSign}
                                {invoice?.amount?.toLocaleString()}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}


export default InvoicePrintTable