import React from 'react'
import InvoiceViewTable from './InvoiceViewTable'
import InvoiceViewHeader from './InvoiceViewHeader'

/*
    Required: type, invoice
    Optional: 
*/
const InvoiceView = ({ type, invoice }) => {
    return (<>
        <InvoiceViewHeader type={type} invoice={invoice} />
        <InvoiceViewTable type={type} invoice={invoice} />
    </>)
}


export default InvoiceView