import React, { useMemo } from 'react'
import { Table, Button, Tag } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'


import { DEFAULT_PAGINATION, DELIVER_COLORS, invoiceSettings, INVOICE_BASICS } from '../../utils/config'


const InvoiceTable = ({ type, invoices, onSelect, onDelete }) => {
    const columns = useMemo(() => {
        const ifShowDelivered = invoiceSettings.get('ifShowDelivered') == 'true'
        const amountSign = invoiceSettings.get('ifShowAmountSign') === 'true' ? invoiceSettings.get('amountSign') : ''
        const ifShowPayment = invoiceSettings.get('ifShowPayment') === 'true'
        const ifShowRefund = invoiceSettings.get('ifShowRefund') === 'true'
        return [
            {
                title: '序号',
                fixed: 'left', 
                render: (_, __, idx) => idx + 1,
            },
            {
                title: '单号',
                dataIndex: 'number',
                render: (number, invoice) => (
                    <a onClick={_ => onSelect(invoice)}>
                        {number}
                    </a>
                )
            },
            { 
                title: INVOICE_BASICS[type].partnerTitle,
                dataIndex: 'partnerName'
            },
            { 
                title: '日期',
                dataIndex: 'date'
            },
            { 
                title: '金额',
                dataIndex: 'amount',
                render: amount => amountSign + amount.toLocaleString() 
            },
            ifShowPayment ? 
            {
                title: '已付',
                dataIndex: 'paid',
                render: paid => amountSign + paid.toLocaleString()
            } : null,
            ifShowPayment ? 
            {
                title: '未付', 
                dataIndex: 'unpaid', 
                render: unpaid => (
                    <span style={{ color: unpaid === 0 ? 'black' : 'red' }}>
                        {amountSign + unpaid.toLocaleString()}
                    </span>
                )
            } : null,
            ifShowDelivered ? 
            {
                title: '配送情况', 
                dataIndex: 'delivered',
                render: d => <Tag color={DELIVER_COLORS[d]}>{d}</Tag>
            } : null,
            ifShowRefund ? 
            {
                title: INVOICE_BASICS[type].relatedInvoiceTitle,
                dataIndex: ['salesOrder', 'purchaseOrder'].includes(type) ? 'refund' : 'order', 
                render: relatedInvoice => (
                    relatedInvoice ? <a onClick={_ => onSelect(relatedInvoice)}>{relatedInvoice.number}</a> : null
                )
            } : null,
            {
                title: '操作', 
                fixed: 'right',
                render: (_, invoice) => (
                    <Button onClick={_ => onDelete(invoice)} danger icon={<DeleteOutlined />} />
                )
            }
        ]
        .filter(i => i != null)
        .map(col => ({ ...col, align: 'center' }))
    }, [type, onSelect, onDelete])

    return <Table dataSource={invoices} bordered rowKey={record => record.id}
        columns={columns} pagination={DEFAULT_PAGINATION} scroll={{ x: 'max-content' }} />
}


export default InvoiceTable