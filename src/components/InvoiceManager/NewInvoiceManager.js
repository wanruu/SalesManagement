import React, { useEffect, useState } from 'react'
import { Col, Button, Space, message } from 'antd'
import InvoicePrint from './InvoicePrint'
import InvoiceView from './InvoiceView'
import InvoiceForm from './InvoiceForm'
import { invoiceService } from '@/services'
import { INVOICE_BASICS } from '@/utils/invoiceUtils'
import { DeleteConfirm } from '../Modal'



const NewInvoiceManager = (props) => {
    const {
        type, invoice: initInvoice, editInvoice, mode,
        onModeChange, onSave, onFormChange, onCancel,
    } = props

    const [invoice, setInvoice] = useState(initInvoice)
    const [showingDeleteConfirm, setShowingDeleteConfirm] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()
    const deleteConfirmTitle = `是否删除${INVOICE_BASICS[type]?.title} ${invoice?.number} ?`

    const modeDict = {
        'edit': (
            <InvoiceForm type={type}
                editInvoice={editInvoice}
                invoice={invoice}
                onCancel={_ => {
                    invoice?.id ? onModeChange?.('view') : onCancel?.()
                }}
                onFormChange={onFormChange}
                onSave={invoice => {
                    onSave?.(invoice)
                    setInvoice(invoice)
                    onModeChange?.('view')
                }} />
        ),
        'view': <InvoiceView invoice={invoice} />,
        'print': <InvoicePrint invoice={invoice} onCancel={_ => onModeChange?.('view')} />
    }

    // load
    useEffect(() => {
        const id = initInvoice?.id
        if (id) {
            invoiceService.fetch(type, id).then(res => {
                setInvoice(res.data)
            }).catch(err => {
                setInvoice({})
                if (err.status === 404) {
                    onCancel?.()
                }
            })
        }
    }, [type, initInvoice])


    const handleDelete = () => {
        const messageKey = 'delete-invoice'
        messageApi.open({ key: messageKey, type: 'loading', content: '删除中', duration: 86400 })
        invoiceService.delete(invoice.type, invoice.id).then(res => {
            messageApi.open({ key: messageKey, type: 'success', content: '删除成功' })
            setShowingDeleteConfirm(false)
            onCancel?.()
        }).catch(err => {
            messageApi.open({
                key: messageKey, type: 'error', duration: 5,
                content: `删除失败：${err.message}. ${err.response?.data?.error}`,
            })
        })
    }

    return (
        <>
            {contextHolder}
            <DeleteConfirm title={deleteConfirmTitle} open={showingDeleteConfirm}
                zIndex={1500}
                onCancel={_ => setShowingDeleteConfirm(false)}
                onOk={handleDelete}
            />

            <div style={{ marginTop: '15px' }}>
                {modeDict[mode]}
                {
                    mode != 'view' ? null :
                        <Col align='end'>
                            <Space>
                                <Button onClick={_ => onCancel?.()}>关闭</Button>
                                <Button onClick={_ => setShowingDeleteConfirm(true)} danger>删除</Button>
                                <Button onClick={_ => onModeChange?.('print')}>打印预览</Button>
                                <Button onClick={_ => onModeChange?.('edit')} type='primary' ghost>编辑</Button>
                            </Space>
                        </Col>
                }
            </div>
        </>
    )
}


export default NewInvoiceManager