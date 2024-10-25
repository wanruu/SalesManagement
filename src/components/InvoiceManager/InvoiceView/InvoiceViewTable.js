import React, { useMemo, useState } from 'react'
import { Table } from 'antd'
import { useSelector } from 'react-redux'
import { DeliverTag } from '../../Tag'
import { BaseInvoice, BaseInvoiceItem, Product } from '../../../types'
import Decimal from 'decimal.js'


const pageSize = 10

/**
 * @typedef {BaseInvoiceItem & {product: Product}} InvoiceItem
 */

/**
 * @component
 * @param {Object} props  
 * @param {BaseInvoice & {invoiceItems: InvoiceItem[]}} props.invoice
 */
const InvoiceViewTable = (props) => {
    const { invoice } = props
    const { invoiceItems = [], type } = invoice ?? {}

    const [curPage, setCurPage] = useState(1)

    // redux
    const amountSign = useSelector(state => state.functionSetting.amountSign.value)
    const ifShowMaterial = useSelector(state => state.functionSetting.ifShowMaterial.value)
    const ifShowDiscount = useSelector(state => state.functionSetting.ifShowDiscount.value)
    const ifShowDelivered = useSelector(state => state.functionSetting.ifShowDelivered.value)

    const columns = useMemo(() => {
        return [
            { title: '序号', fixed: 'left', render: (_, __, idx) => (curPage - 1) * pageSize + idx + 1 },
            !ifShowMaterial ? null : { title: '材质', dataIndex: ['product', 'material'], },
            { title: '名称', dataIndex: ['product', 'name'], },
            { title: '规格', dataIndex: ['product', 'spec'], },
            { title: '数量', dataIndex: 'quantity' },
            { title: '单位', dataIndex: ['product', 'unit'], },
            { title: '单价', dataIndex: 'price', render: p => Decimal(p || 0).toCurrencyString(amountSign) },
            !ifShowDiscount ? null : {
                title: '金额', dataIndex: 'originalAmount',
                render: a => Decimal(a || 0).toCurrencyString(amountSign)
            },
            !ifShowDiscount ? null : { title: '折扣', dataIndex: 'discount', render: d => `${d}%` },
            {
                title: ifShowDiscount ? '折后价' : '金额', dataIndex: 'amount',
                render: a => Decimal(a || 0).toCurrencyString(amountSign)
            },
            type != 'purchaseOrder' ? null : {
                title: '重量', dataIndex: 'weight', render: w => w?.toLocaleString()
            },
            { title: '备注', dataIndex: 'remark', width: 200 },
            !ifShowDelivered ? null : {
                title: '配送', dataIndex: 'delivered', render: d =>
                    <DeliverTag value={d ? '已配送' : '未配送'} />
            }
        ]
            .filter(i => i)
            .map(col => ({ ...col, align: 'center' }))
    }, [curPage, ifShowDiscount])

    return <Table dataSource={invoiceItems} columns={columns}
        bordered scroll={{ x: 'max-content' }}
        pagination={{
            pageSize: pageSize,
            current: curPage,
            onChange: setCurPage,
            total: invoiceItems.length,
            showQuickJumper: true,
        }} />
}


export default InvoiceViewTable