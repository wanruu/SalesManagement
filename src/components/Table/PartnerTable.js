import React, { useMemo, useState } from 'react'
import { Button, Table, Space } from 'antd'
import { PartnerTypeTag } from '../Tag'


/**
 * Table for partner list.
 * @component
 * @param {Object} props 
 * @param {Object} props.partner
 * @param {string} props.partner.name
 * @param {string} [props.partner.folder]
 * @param {string} [props.partner.phone]
 * @param {string} [props.partner.address]
 * @param {Function} [props.onSelect]
 * @param {Function} [props.onEdit]
 * @param {Function} [props.onDelete]
 */
const PartnerTable = (props) => {
    const { partners = [], onSelect, onEdit, onDelete } = props

    const [curPage, setCurPage] = useState(1)
    const pageSize = 10

    const columns = useMemo(() => {
        return [
            { title: '序号', fixed: 'left', render: (_, __, idx) => (curPage - 1) * pageSize + idx + 1 },
            { title: '姓名', dataIndex: 'name' },
            { title: '文件位置', dataIndex: 'folder' },
            { title: '电话', dataIndex: 'phone' },
            { title: '地址', dataIndex: 'address' },
            { title: '身份', render: (_, partner) => <PartnerTypeTag {...partner} /> },
            {
                title: '操作', fixed: 'right', render: (_, partner) =>
                    <Space>
                        <Button type='primary' ghost onClick={_ => onEdit?.(partner)}>编辑</Button>
                        {partner.salesNum + partner.purchaseNum > 0 ?
                            <Button onClick={_ => onSelect?.(partner)}>查看</Button> :
                            <Button danger onClick={_ => onDelete?.(partner)}>删除</Button>
                        }
                    </Space>
            }
        ].map(i => ({ ...i, align: 'center' }))
    }, [curPage])

    return <Table dataSource={partners} bordered rowKey={record => record.name}
        columns={columns} scroll={{ x: 'max-content' }}
        pagination={{
            current: curPage,
            pageSize: pageSize,
            total: partners.length,
            onChange: setCurPage,
        }} />
}


export default PartnerTable