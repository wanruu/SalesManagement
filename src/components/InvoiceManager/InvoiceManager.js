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
        onModeChange
        onInvoiceChange
        onFormChange
        onCancel
 */
const InvoiceManager = ({ 
    type, 
    invoice: initInvoice,
    editInvoice,
    mode, onModeChange, 
    onInvoiceChange, onFormChange, onCancel 
}) => {
    const [invoice, setInvoice] = useState(undefined)
    
    const load = () => {
        const id = initInvoice?.id
        if (id) {
            invoiceService.fetch(type, id).then(res => {
                setInvoice(res.data)
            }).catch(err => {
                setInvoice({})
            })
        }
    }

    const modeDict = {
        'edit': (
            <InvoiceForm type={type}
                editInvoice={editInvoice}
                invoice={invoice}
                onCancel={_ => {
                    invoice?.id ? onModeChange?.('view') : onCancel?.()
                }}
                onFormChange={onFormChange}
                onInvoiceChange={invoice => {
                    onInvoiceChange?.(invoice)
                    setInvoice(invoice)
                    onModeChange?.('view')
                }} />
        ),
        'view': <InvoiceView type={type} invoice={invoice} />,
        'print': <InvoicePrint type={type} invoice={invoice} onCancel={_ => onModeChange?.('view')} />
    }

    useEffect(load, [type, initInvoice])

    return (
        <div style={{ marginTop: '15px' }}>
            { modeDict[mode] }
            {
                mode != 'view' ? null :
                <Col align='end'>
                    <Space>
                        <Button onClick={_ => onCancel?.()}>关闭</Button>
                        <Button onClick={_ => onModeChange?.('print')}>打印预览</Button>
                        <Button onClick={_ => onModeChange?.('edit')} type='primary'>编辑</Button>
                    </Space>
                </Col>
            }
        </div>
    )
}


export default InvoiceManager