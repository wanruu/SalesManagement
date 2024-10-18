import React, { useEffect, useState } from 'react'
import { Col, Button, Space } from 'antd'
import { InvoicePrint }  from './InvoicePrint'
import { InvoiceView } from './InvoiceView'
import { InvoiceForm } from './InvoiceForm'
import { invoiceService } from '../../services'


/*
    Required: type
    Optional:
        invoice
        editInvoice
        mode
        onInvoiceChange
        onFormChange
        onCancel
 */
const InvoiceManager = ({ 
    type, 
    invoice: initInvoice,
    editInvoice,
    mode: initMode='view', 
    onInvoiceChange, onFormChange, onCancel 
}) => {
    const [invoice, setInvoice] = useState(undefined)
    const [mode, setMode] = useState(initMode)
    
    const load = () => {
        const id = initInvoice?.id
        if (id) {
            invoiceService.fetch(type, id).then(res => {
                setInvoice(res.data)
            }).catch(err => {

            })
        }
    }

    const modeDict = {
        'edit': (
            <InvoiceForm type={type}
                editInvoice={editInvoice}
                invoice={invoice}
                onCancel={_ => {
                    invoice?.id ? setMode('view') : onCancel?.()
                }}
                onFormChange={onFormChange}
                onInvoiceChange={invoice => {
                    onInvoiceChange?.(invoice)
                    setInvoice(invoice)
                    setMode('view')
                }} />
        ),
        'view': <InvoiceView type={type} invoice={invoice} />,
        'print': <InvoicePrint type={type} invoice={invoice} onCancel={_ => setMode('view')} />
    }

    useEffect(load, [type, initInvoice])

    return (
        <div style={{ padding: '15px' }}>
            { modeDict[mode] }
            {
                mode != 'view' ? null :
                <Col align='end'>
                    <Space>
                        <Button onClick={_ => onCancel?.()}>关闭</Button>
                        <Button onClick={_ => setMode('print')}>打印预览</Button>
                        <Button onClick={_ => setMode('edit')} type='primary'>编辑</Button>
                    </Space>
                </Col>
            }
        </div>
    )
}


export default InvoiceManager