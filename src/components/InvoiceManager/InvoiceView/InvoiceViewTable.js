import React from 'react'
import { Table, Tag } from 'antd'
import { invoiceSettings, DELIVER_COLORS } from '../../../utils/config'


/*
    Required: type, invoice
*/
const InvoiceViewTable = ({ type, invoice }) => {
    const amountSign = invoiceSettings.get('ifShowAmountSign') === 'true' ? invoiceSettings.get('amountSign') : ''
    const ifShowMaterial = invoiceSettings.get('ifShowMaterial') === 'true'
    const ifShowDiscount = invoiceSettings.get('ifShowDiscount') === 'true'
    const ifShowDelivered = invoiceSettings.get('ifShowDelivered') === 'true'

    const columns = [
        { title: '序号', fixed: 'left', render: (_, __, idx) => idx + 1 },
        !ifShowMaterial ? null :
        { title: '材质', dataIndex: ['product', 'material'], },
        { title: '名称', dataIndex: ['product', 'name'], },
        { title: '规格', dataIndex: ['product', 'spec'], },
        { title: '数量', dataIndex: 'quantity' },
        { title: '单位', dataIndex: ['product', 'unit'], },
        { title: '单价', dataIndex: 'price', render: p => amountSign + p?.toLocaleString() },
        !ifShowDiscount ? null :
        { title: '金额', dataIndex: 'originalAmount', render: a => amountSign + a?.toLocaleString() },
        !ifShowDiscount ? null :
        { title: '折扣', dataIndex: 'discount', render: discount => `${discount}%` },
        {
            title: ifShowDiscount ? '折后价' : '金额', dataIndex: 'amount', 
            render: a => amountSign + a?.toLocaleString()
        },
        type != 'purchaseOrder' ? null :
        {
            title: '重量', dataIndex: 'weight', render: w => w?.toLocaleString()
        },
        { title: '备注', dataIndex: 'remark', width: 200 },
        !ifShowDelivered ? null :
        {
            title: '配送', dataIndex: 'delivered', fixed: 'right', render: delivered => {
                const text = delivered ? '已配送' : '未配送'
                return <Tag color={DELIVER_COLORS[text]}>{text}</Tag>
            }
        }
    ]
    .filter(i => i != null)
    .map(col => ({ ...col, align: 'center' }))

    return <Table className='fixedHeightTable' dataSource={invoice?.invoiceItems??[]} columns={columns}
        bordered scroll={{ x: 'max-content'}} />
}


export default InvoiceViewTable