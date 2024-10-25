import React, { useState } from 'react'
import { Table, Button, Space } from 'antd'
import { InvoiceTypeTag } from '../../components/Tag'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'


const DraftTable = ({ drafts, onEdit, onDelete }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const columns = [
        { title: '序号', fixed: 'left', render: (_, __, idx) => (currentPage - 1) * pageSize + idx + 1 },
        { title: '标签', dataIndex: 'label' },
        { title: '类型', dataIndex: 'type', render: type => <InvoiceTypeTag type={type} /> },
        { title: '交易对象', dataIndex: ['editInvoice', 'partnerName'] },
        { title: '创建时间', dataIndex: ['createAt'], render: d => d?.format('HH:mm:ss') },
        { title: '产品数', dataIndex: ['editInvoice', 'invoiceItems'], render: i => i?.length },
        { title: '操作', render: (_, draft) => (
            <Space>
                <Button onClick={_ => onEdit?.(draft)} type='primary' ghost icon={<EditOutlined />} />
                <Button onClick={_ => onDelete?.(draft)} danger icon={<DeleteOutlined />} />
            </Space>
        )}
    ].map(i => ({ ...i, align: 'center' }))

    return (
        <Table dataSource={drafts.filter(d => !d.invoice)} rowKey={r => r.createAt}
            columns={columns} scroll={{ x: 'max-content' }}
            pagination={{
                current: currentPage,
                pageSize: pageSize, 
                total: (drafts??[]).length,
                onChange: handlePageChange,
            }}
        />
    )
}


export default DraftTable