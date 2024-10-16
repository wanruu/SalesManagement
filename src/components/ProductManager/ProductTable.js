import React from 'react'
import { Table } from 'antd'
import { InvoiceTypeTag } from '../Tag'
import { useSelector } from 'react-redux'


const ProductTable = ({ product }) => {
    const ifShowDiscount = useSelector(state => state.functionSetting.ifShowDiscount.value)
    const amountSign = useSelector(state => state.functionSetting.amountSign.value)

    const columns = [
        { title: '序号', fixed: 'left', render: (_, __, idx) => idx + 1 },
        { title: '单号', dataIndex: ['invoice', 'number'],
            sorter: (a, b) => a.invoice.number.localeCompare(b.invoice.number)
        },
        { title: '交易对象', dataIndex: ['invoice', 'partnerName'] },
        { title: '日期', dataIndex: ['invoice', 'date'], 
            sorter: (a, b) => a.invoice.date.localeCompare(b.invoice.date)
        },
        { title: '类型', dataIndex: ['invoice', 'type'],
            render: type => <InvoiceTypeTag type={type}/>,
        },
        { title: '单价', dataIndex: 'price', 
            render: p => amountSign + p.toLocaleString(),
            sorter: (a, b) => a.price - b.price
        },
        { title: '数量', dataIndex: 'quantity', render: q => q.toLocaleString(),
            sorter: (a, b) => a.quantity - b.quantity 
        },
        ifShowDiscount ? 
        { 
            title: '金额', dataIndex: 'originalAmount', 
            render: a => amountSign + a.toLocaleString(),
            sorter: (a, b) => a.originalAmount - b.originalAmount
        } : null,
        ifShowDiscount ? 
        { title: '折扣', dataIndex: 'discount', render: d => `${d}%` } : null,
        {
            title: ifShowDiscount ? '折后价' : '金额', dataIndex: 'amount', 
            render: a => amountSign + a.toLocaleString(),
            sorter: (a, b) => a.amount - b.amount
        },
        { title: '重量', dataIndex: 'weight', render: w => w?.toLocaleString() },
        { title: '备注', dataIndex: 'remark', width: 180 },
    ]
    .filter(i => i != null)
    .map(i => ({ ...i, align: 'center' }))
    
    return <Table dataSource={product?.invoiceItems} columns={columns}
        scroll={{ x: 'max-content' }} rowKey={r => r.id} bordered
    />
}

export default ProductTable