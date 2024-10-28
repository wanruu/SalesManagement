import React, { useState } from 'react'
import { Button, Space, Col, message } from 'antd'
import InvoiceForm from './InvoiceForm'
import InvoiceView from './InvoiceView'
import InvoicePrint from './InvoicePrint'
import { invoiceService } from '@/services'
import { INVOICE_BASICS } from '@/utils/invoiceUtils'
import { DeleteConfirm } from '../Modal'



const ExistingInvoiceManager = (props) => {
    const { invoice, onSave, onCancel, onDelete } = props
    const [mode, setMode] = useState('view')
    const deleteConfirmTitle = `是否删除${INVOICE_BASICS[invoice.type]?.title} ${invoice.number} ?`
    const [showingDeleteConfirm, setShowingDeleteConfirm] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()

    const modeDict = {
        'edit': (
            <InvoiceForm type={invoice.type}
                editInvoice={undefined}
                invoice={invoice}
                onCancel={onCancel}
                onFormChange={_ => {}}
                onSave={invoice => {
                    onSave?.(invoice)
                    setMode('view')
                }} />
        ),
        'view': <InvoiceView invoice={invoice} />,
        'print': <InvoicePrint invoice={invoice} onCancel={_ => setMode('view')} />
    }


    const handleDelete = () => {
        const messageKey = 'delete-invoice'
        messageApi.open({ key: messageKey, type: 'loading', content: '删除中', duration: 86400 })
        invoiceService.delete(invoice.type, invoice.id).then(res => {
            messageApi.open({ key: messageKey, type: 'success', content: '删除成功' })
            setShowingDeleteConfirm(false)
            onDelete?.(invoice)
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
                                <Button onClick={_ => setMode('print')}>打印预览</Button>
                                <Button onClick={_ => setMode('edit')} type='primary' ghost>编辑</Button>
                            </Space>
                        </Col>
                }
            </div>
        </>
    )
}


export default ExistingInvoiceManager