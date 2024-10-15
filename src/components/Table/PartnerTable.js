import React, { useState } from 'react'
import { Button, Table, Space } from 'antd'
import { PartnerTypeTag } from '../Tag'


/*
    Required: 
        partners
        onSelect
        onEdit
        onDelete
 */
const PartnerTable = ({ partners, onSelect, onEdit, onDelete }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const columns = [
        { title: '序号', fixed: 'left', render: (_, __, idx) => (currentPage - 1) * pageSize + idx + 1 },
        { title: '姓名', dataIndex: 'name' },
        { title: '文件位置', dataIndex: 'folder' },
        { title: '电话', dataIndex: 'phone' },
        { title: '地址', dataIndex: 'address' },
        { title: '身份', render: (_, partner) => <PartnerTypeTag {...partner} /> },
        { title: '操作', fixed: 'right', render: (_, partner) =>
            <Space>
                <Button type='primary' ghost onClick={_ => onEdit?.(partner)}>编辑</Button>
                { partner.invoiceNum > 0 ?
                    <Button onClick={_ => onSelect?.(partner)}>查看</Button> :
                    <Button danger onClick={_ => onDelete?.(partner)}>删除</Button>
                }
            </Space>
        }
    ].map(i => ({ ...i, align: 'center' }))

    return <Table dataSource={partners??[]} bordered rowKey={record => record.name}
        columns={columns} scroll={{ x: 'max-content' }}
        pagination={{
            current: currentPage,
            pageSize: pageSize, 
            total: (partners??[]).length,
            onChange: handlePageChange,
        }} />
}


export default PartnerTable