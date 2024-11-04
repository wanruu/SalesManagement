import React, { useEffect } from 'react'
import { Form, Button, Space, Col, Divider } from 'antd'
import dayjs from 'dayjs'
import { DATE_FORMAT } from '@/utils/invoiceUtils'
import { invoiceService } from '@/services'
import InvoiceFormHeader from './InvoiceFormHeader'
import OrderFormTable from './OrderFormTable'
import { RefundTable, AllRefundTable } from './RefundFormTable'
import './invoice-form.style.scss'
import { useDispatch } from 'react-redux'


/*
    Required:
        type: salesOrder/salesRefund/purchaseOrder/purchaseRefund
        invoice: used to reset form (invoice with id field can be regarded as existing invoice)
    Optional:
        onCancel: called when form is cancelled
        onFormChange: called when form is changed
        onSave: called then form is successfully submitted and response is received
 */
const InvoiceForm = ({ type, editInvoice, invoice, onSave, onFormChange, onCancel }) => {
    const [form] = Form.useForm()
    const isOrder = type.includes('Order')
    const dispatch = useDispatch()

    const initForm = () => {
        form.resetFields(['order'])  // 其他field会在setFieldsValue之后更新，唯独order可能不会更新（当从refund切回order时）
        if (editInvoice) {
            const newInvoice = {
                ...editInvoice, 
                date: dayjs(editInvoice.date)
            }
            form.setFieldsValue(newInvoice)
        } else {
            form.setFieldsValue({
                ...invoice,
                date: dayjs(invoice.date)
            })
        }
    }

    const handleKeyDown = (event) => {
        // Prevent form submission when 'enter' is pressed
        event.key === 'Enter' && event.preventDefault()
    }

    const handleFinish = () => {
        const data = form.getFieldsValue(true)
        // Construct request body
        const invoiceItems = data.invoiceItems.map(item => {
            const common = {
                price: item.price,
                discount: item.discount,
                quantity: item.quantity,
                weight: item.weight,
                originalAmount: item.originalAmount,
                amount: item.amount,
                remark: item.remark,
                delivered: item.delivered,
            }
            return isOrder ? {
                ...common,
                material: item.product.material,
                name: item.product.name,
                spec: item.product.spec,
                unit: item.product.unit,
            } : {
                ...common,
                productId: item.product.id
            }
        })
        const newInvoice = {
            partnerName: data.partnerName,
            date: data.date.format(DATE_FORMAT),
            amount: data.amount || 0,
            prepayment: data.prepayment || 0,
            payment: data.payment || 0,
            orderId: data.order?.id,
            invoiceItems: invoiceItems
        }
    
        // Send request
        const messageKey = 'upload-invoice'
        dispatch({
            type: 'globalInfo/addMessage',
            payload: { key: messageKey, type: 'loading', content: '提交中', duration: 86400 }
        });
        if (invoice?.id) {
            invoiceService.update(type, invoice.id, newInvoice).then(res => {
                dispatch({
                    type: 'globalInfo/addMessage',
                    payload: { key: messageKey, type: 'success', content: '更新成功' }
                });
                onSave?.(res.data)
            }).catch(err => {
                dispatch({
                    type: 'globalInfo/addMessage',
                    payload: { key: messageKey, type: 'error', content: `${err.message}. ${err.response?.data?.error}`, duration: 5 }
                });
            })
        } else {
            invoiceService.create(type, newInvoice).then(res => {
                dispatch({
                    type: 'globalInfo/addMessage',
                    payload: { key: messageKey, type: 'success', content: '新建成功' }
                });
                onSave?.(res.data)
            }).catch(err => {
                dispatch({
                    type: 'globalInfo/addMessage',
                    payload: { key: messageKey, type: 'error', content: `${err.message}. ${err.response?.data?.error}`, duration: 5 }
                });
            })
        }
    }

    const handleFinishFailed = () => {
        dispatch({
            type: 'globalInfo/addMessage',
            payload: { type: 'error', content: '表格不完整' }
        });
    }

    // 确保金额改变时不调用，只有type改变才调用
    // type改变时会清空数据
    useEffect(initForm, [type])

    // form的onValuesChange只监听注册的项目
    // refund的partnerName, order, (partner), invoiceItems都是没有注册的
    // order的invoiceItems通过(add, remove)注册了, 但是refund的(add, remove)不方便传递
    const watchAll = Form.useWatch([], { form, preserve: true })
    useEffect(() => {
        onFormChange?.(watchAll)
    }, [watchAll])

    return (
        <Form form={form} onKeyDown={handleKeyDown} layout='inline'
            onFinish={handleFinish} onFinishFailed={handleFinishFailed}>
            <Space direction='vertical' style={{ width: '100%' }} size={15}>
                <InvoiceFormHeader type={type} />
                { isOrder ? <OrderFormTable type={type} /> : <RefundTable /> }
                <Col align='end'>
                    <Space>
                        <Button onClick={_ => onCancel?.()}>取消</Button>
                        <Button htmlType='submit' type='primary'>保存</Button>
                    </Space>
                </Col>
            </Space>
            { isOrder ? null : <>
                <Divider />
                <h2>所有产品</h2>
                <AllRefundTable onFormChange={onFormChange} />
            </>}
        </Form>
    )
}


export default InvoiceForm