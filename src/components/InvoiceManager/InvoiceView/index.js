import React from 'react'
import InvoiceViewTable from './InvoiceViewTable'
import InvoiceViewHeader from './InvoiceViewHeader'
import { Space } from 'antd'
import { BaseInvoice, BaseInvoiceItem, Product } from '../../../types'


/**
 * @typedef {BaseInvoiceItem & {product: Product}} InvoiceItem
 * @typedef ExtraInvoice
 * @property {InvoiceItem[]} invoiceItems
 * @property {BaseInvoice} [order]
 * @property {BaseInvoice} [refund]
 */


/**
 * @component
 * @param {Object} props 
 * @param {BaseInvoice & ExtraInvoice} props.invoice
 */

const InvoiceView = ({ invoice }) => {
    return (
        <Space direction='vertical' style={{ width: '100%' }} size={15}>
            <InvoiceViewHeader invoice={invoice} />
            <InvoiceViewTable invoice={invoice} />
        </Space>
    )
}


export default InvoiceView