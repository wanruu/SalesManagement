import React from 'react'
import { Table } from 'antd'
import { invoiceSettings } from '../../utils/config'
import { InvoiceTypeTag } from '../Tag'

const ProductTable = ({ product }) => {
    const ifShowDiscount = invoiceSettings.get('ifShowDiscount') === 'true'
    const amountSign = invoiceSettings.get('ifShowAmountSign') === 'true' ? invoiceSettings.get('amountSign') : ''
    
    const columns = [
        { title: '序号', fixed: 'left', width: 50, render: (_, __, idx) => idx + 1 },
        { title: '单号', dataIndex: 'id', width: 140,
            sorter: (a, b) => a.invoiceId > b.invoiceId ? 1 : (a.invoiceId < b.invoiceId ? -1 : 0) 
        },
        { title: '交易对象', dataIndex: 'partnerName', width: 150 },
        { title: '日期', dataIndex: 'date', width: 100, 
            sorter: (a, b) => a.date > b.date ? 1 : (a.date < b.date ? -1 : 0) 
        },
        { title: '单价', dataIndex: 'price', width: 90, 
            render: p => amountSign + p.toLocaleString(),
            sorter: (a, b) => a.price - b.price
        },
        { title: '数量', dataIndex: 'quantity', width: 80, render: q =>  q.toLocaleString(),
            sorter: (a, b) => a.quantity - b.quantity 
        },
        ifShowDiscount ? 
        { 
            title: '金额', dataIndex: 'originalAmount', width: 90, 
            render: a => amountSign + a.toLocaleString(),
            sorter: (a, b) => a.originalAmount - b.originalAmount
        } : null,
        ifShowDiscount ? { title: '折扣', dataIndex: 'discount', width: 50, render: d => `${d}%` } : null,
        {
            title: ifShowDiscount ? '折后价' : '金额', dataIndex: 'amount', width: 90, 
            render: a => amountSign + a.toLocaleString(),
            sorter: (a, b) => a.amount - b.amount
        },
        { title: '重量', dataIndex: 'weight', width: 80, render: w => w ? w.toLocaleString() : null },
        { title: '备注', dataIndex: 'remark', width: 150 },
        { title: '类型', dataIndex: 'type', width: 90, fixed: 'right', 
            render: type => <InvoiceTypeTag type={type}/>,
        }
    ]
    .filter(i => i != null)
    .map(i => ({ ...i, align: 'center' }))
    
    return <Table dataSource={product?.invoiceItems} columns={columns}
        style={{ height: 400 }} scroll={{ x: 'max-content', y: 400 }} rowKey={r => r.invoiceId} bordered
    />
}

export default ProductTable