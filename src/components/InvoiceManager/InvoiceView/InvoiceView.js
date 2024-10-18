import React from 'react'
import InvoiceViewTable from './InvoiceViewTable'
import InvoiceViewHeader from './InvoiceViewHeader'
import { Space } from 'antd'


/*
    Required: type, invoice
    Optional: 
*/
const InvoiceView = ({ type, invoice }) => {
    return (<Space direction='vertical' style={{ width: '100%' }} size={15}>
        <InvoiceViewHeader type={type} invoice={invoice} />
        <InvoiceViewTable type={type} invoice={invoice} />
    </Space>)
}


export default InvoiceView