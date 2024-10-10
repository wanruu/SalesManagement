import React from 'react'
import { Tag } from 'antd'


const INVOICE_TYPE_2_DICT = {
    'salesOrder': { label: '销售单', color: 'blue' },
    'purchaseOrder': { label: '采购单', color: 'gold' },
    'salesRefund': { label: '销售退款', color: 'blue' },
    'purchaseRefund': { label: '采购退款', color: 'gold' }
}


const InvoiceTypeTag = ({ type }) => {
    return <Tag color={INVOICE_TYPE_2_DICT[type]?.color}>
        {INVOICE_TYPE_2_DICT[type]?.label}
    </Tag>
}


export default InvoiceTypeTag