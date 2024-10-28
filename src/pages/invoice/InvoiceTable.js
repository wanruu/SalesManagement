import React, { useMemo, useState } from 'react'
import { Table, Button } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { DeliverTag } from '@/components/Tag'
import { useSelector } from 'react-redux'
import { INVOICE_BASICS } from '@/utils/invoiceUtils'
import Decimal from 'decimal.js'


const InvoiceTable = ({ type, invoices, onSelect, onDelete, onCreateRefund }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const ifShowDelivered = useSelector(state => state.functionSetting.ifShowDelivered.value)
    const ifShowPayment = useSelector(state => state.functionSetting.ifShowPayment.value)
    const ifShowRefund = useSelector(state => state.functionSetting.ifShowRefund.value)
    const amountSign = useSelector(state => state.functionSetting.amountSign.value)

    const columns = useMemo(() => {
        return [
            { title: '序号', fixed: 'left', render: (_, __, idx) => (currentPage - 1) * pageSize + idx + 1 },
            { title: '单号', dataIndex: 'number', render: (number, invoice) => <a onClick={_ => onSelect(invoice)}>{number}</a> },
            { title: INVOICE_BASICS[type].partnerTitle, dataIndex: 'partnerName' },
            { title: '日期', dataIndex: 'date' },
            { title: '金额', dataIndex: 'amount', render: amount => amountSign + amount.toLocaleString() },
            !ifShowPayment ? null : {
                title: '已付', 
                render: (_, invoice) => Decimal(invoice.payment).plus(invoice.prepayment).toCurrencyString(amountSign)
            },
            !ifShowPayment ? null : {
                title: '未付', dataIndex: 'unpaid', 
                render: (_, invoice) => {
                    const unpaid = new Decimal(invoice.amount).minus(invoice.payment).minus(invoice.prepayment)
                    return <span style={{ color: unpaid.isZero() ? 'black' : 'red' }}>
                        {unpaid.toCurrencyString(amountSign)}
                    </span>
                }
            },
            !ifShowDelivered ? null : { title: '配送情况', dataIndex: 'delivered', render: d => <DeliverTag value={d} /> },
            !ifShowRefund ? null : {
                title: INVOICE_BASICS[type].relatedInvoiceTitle, 
                dataIndex: type.includes('Order') ? 'refund' : 'order',
                render: (relatedInvoice, invoice) => {
                    if (type.includes('Order') && !relatedInvoice) {
                        return <Button icon={<PlusOutlined />} onClick={_ => onCreateRefund?.(invoice)} />
                    }
                    return relatedInvoice ? <a onClick={_ => onSelect(relatedInvoice)}>{relatedInvoice.number}</a> : null
                }
            },
            { title: '操作', render: (_, invoice) => <Button onClick={_ => onDelete(invoice)} danger icon={<DeleteOutlined />} /> }
        ]
            .filter(i => i != null)
            .map(col => ({ ...col, align: 'center' }))
    }, [type, onSelect, onDelete])

    return <Table dataSource={invoices} bordered rowKey='id'
        columns={columns} scroll={{ x: 'max-content' }}
        pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: (invoices ?? []).length,
            onChange: setCurrentPage,
        }}
    />
}


export default InvoiceTable