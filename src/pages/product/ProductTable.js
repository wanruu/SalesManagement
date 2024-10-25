import React, { useState } from 'react'
import { Button, Table, Space } from 'antd'
import { useSelector } from 'react-redux'
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'


const ProductTable = ({ products, onSelect, onEdit, onDelete }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const ifShowMaterial = useSelector(state => state.functionSetting.ifShowMaterial.value)

    const columns = [
        { title: '序号', fixed: 'left', render: (_, __, idx) => (currentPage - 1) * pageSize + idx + 1 },
        !ifShowMaterial ? null :
        { title: '材质', dataIndex: 'material' },
        { title: '名称', dataIndex: 'name' },
        { title: '规格', dataIndex: 'spec' },
        // { title: '库存', dataIndex: 'quantity', render: quantity => <span style={{ color: quantity < 0 ? 'red': 'black' }}>{quantity.toLocaleString()}</span> },
        { title: '单位', dataIndex: 'unit' },
        // { title: '预估重量', dataIndex: 'estimatedWeight', render: w => w == null ? null : w.toLocaleString() },
        {
            title: '操作', render: (_, product) =>
                <Space>
                    <Button type='primary' ghost onClick={_ => onEdit?.(product)} icon={<EditOutlined />} />
                    {product.invoiceItemNum > 0 ?
                        <Button onClick={_ => onSelect?.(product)} icon={<EyeOutlined />} /> :
                        <Button danger onClick={_ => onDelete?.(product)} icon={<DeleteOutlined />} />
                    }
                </Space>
        }
    ]
    .filter(i => i != null)
    .map(i => ({ ...i, align: 'center' }))
    

    return <Table dataSource={products??[]} bordered rowKey={product => product.id} 
        columns={columns} scroll={{ x: 'max-content' }}
        pagination={{
            current: currentPage,
            pageSize: pageSize, 
            total: (products??[]).length,
            onChange: handlePageChange,
        }} />
}


export default ProductTable