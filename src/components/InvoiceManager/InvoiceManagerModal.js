import React, { useState, useEffect } from 'react'
import { Modal } from 'antd'
import { invoiceService } from '@/services'
import ExistingInvoiceManager from './ExistingInvoiceManager'
import { INVOICE_BASICS } from '@/utils/invoiceUtils'



const InvoiceManagerModal = (props) => {
    const { invoice: initInvoice, open, onCancel, onSave, onDelete, ...rest } = props
    const { type, id } = initInvoice ?? {}
    const [invoice, setInvoice] = useState({})
    const title = `${INVOICE_BASICS[type]?.title} ${invoice.number}`


    const handleSave = (invoice) => {
        onSave?.(invoice)
        setInvoice(invoice)
    }

    // load
    useEffect(() => {
        if (type && id) {
            invoiceService.fetch(type, id).then(res => {
                setInvoice(res.data)
            }).catch(err => {
                setInvoice({})
            })
        }
    }, [type, id])

    return (
        <Modal title={title} open={open} onCancel={onCancel} footer={null} destroyOnClose width='90%' {...rest}>
            <ExistingInvoiceManager invoice={invoice}
                onSave={handleSave} onCancel={onCancel} onDelete={onDelete}
            />
        </Modal>
    )
}



export default InvoiceManagerModal