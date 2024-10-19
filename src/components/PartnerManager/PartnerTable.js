import { Table } from 'antd'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { InvoiceTypeTag } from '../Tag'
import Decimal from 'decimal.js'


const PartnerTable = ({ partner }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }
    const setting = useSelector(state => ({
        amountSign: state.functionSetting.amountSign.value,
        ifShowPayment: state.functionSetting.ifShowPayment.value,
        ifShowDelivered: state.functionSetting.ifShowDelivered.value,
    }))

    const columns = [
        { title: '序号', fixed: 'left', render: (_, __, idx) => (currentPage - 1) * pageSize + idx + 1 },
        { title: '单号', dataIndex: 'number', },
        { title: '类型', dataIndex: 'type', render: t => <InvoiceTypeTag type={t} /> },
        { title: '金额', dataIndex: 'amount', render: a => setting.amountSign + a?.toLocaleString() },
        setting.ifShowPayment ?
        { title: '付款', dataIndex: 'paid', render: (_, invoice) => {
            const paid = Decimal(invoice.prepayment||0).plus(invoice.payment||0)
            return setting.amountSign + paid.toLocaleString()
        } } : null,
        { title: '关联退货单', dataIndex: ['refund', 'number'], },
    ]
    .filter(c => c != null)
    .map(c => ({ ...c, align: 'center' }))

    return <Table dataSource={partner?.invoices??[]} columns={columns}
        scroll={{ x: 'max-content' }}
        pagination={{
            current: currentPage,
            pageSize: pageSize, 
            total: (partner?.invoices??[]).length,
            onChange: handlePageChange,
        }} />
}

export default PartnerTable