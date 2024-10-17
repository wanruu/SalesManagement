import React, { useState } from 'react'
import { Form, Button, InputNumber, Row, DatePicker, Space, Col, Modal } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import Decimal from 'decimal.js'
import { INVOICE_BASICS } from '../../../utils/invoiceUtils'
import { PartnerInput } from '../../Input'
import OrderSelection from './OrderSelection'
import { useSelector } from 'react-redux'


const { Item } = Form


/*
    Should be included in a form
    Required: 
        type: salesOrder / salesRefund / purchaseOrder / purchaseRefund
    Optional: 
 */
const InvoiceFormHeader = ({ type }) => {
    const form = Form.useFormInstance()
    const [isSelectionModalOpen, setSelectionModalOpen] = useState(false)
    const allowEditAmount = useSelector(state => state.functionSetting.allowEditAmount.value)
    const ifShowPayment = useSelector(state => state.functionSetting.ifShowPayment.value)

    // Layout
    const colLayout = { xs: 24, sm: 11, md: 7 }
    const formItemLayout = { labelCol: { span: 8 } }

    const isRefund = ['salesRefund', 'purchaseRefund'].includes(type)
    const modalTitle = `选择${INVOICE_BASICS[INVOICE_BASICS[type].orderType]?.title}（待退货）`

    return <Space direction='vertical' style={{ width: '100%' }} size={0}>
        <Modal title={modalTitle} open={isSelectionModalOpen} onCancel={_ => setSelectionModalOpen(false)} width='90%' footer={null}>
            <OrderSelection type={type} onCancel={_ => setSelectionModalOpen(false)} />
        </Modal>
        {/* PartnerName, Date, ProductSelection? */}
        <Row style={{ justifyContent: 'space-between' }} wrap>
            <Col {...colLayout}>
                {
                    isRefund ? (
                        <Item label={INVOICE_BASICS[type].partnerTitle} {...formItemLayout}>
                            {
                                form.getFieldValue('partnerName') || 
                                <span style={{ color: 'gray' }}>
                                    { `(选择${INVOICE_BASICS[INVOICE_BASICS[type].orderType].title}后显示)` }
                                </span> 
                            }
                        </Item>
                    ) : (
                        <Item label={INVOICE_BASICS[type].partnerTitle} name='partnerName'
                            {...formItemLayout} rules={[{required: true, message: ''}]}>
                            <PartnerInput />
                        </Item>
                    )
                }
            </Col>
            <Col {...colLayout}>
                <Item label='日期' name='date' {...formItemLayout} 
                    rules={[{required: true, message: ''}]}>
                    <DatePicker />
                </Item>
            </Col>
            { !isRefund ? null :
                <Col {...colLayout}>
                    <Item label={INVOICE_BASICS[type].relatedInvoiceTitle} {...formItemLayout}>
                        <Space>
                            { form.getFieldValue(['order', 'number']) }
                            <Button type='primary' ghost onClick={_ => setSelectionModalOpen(true)}>
                                { form.getFieldValue(['order', 'number']) ? '更改' : '选择' }
                            </Button>
                        </Space>
                    </Item>
                </Col>
            }
        </Row>
        {/* Amount, Prepayment?, (Payment + PaymentCalculation)? */}
        <Row style={{ justifyContent: 'space-between' }} wrap>
            <Col {...colLayout}>
                {
                    allowEditAmount ?
                    <Item label='总金额' name='amount' {...formItemLayout}>
                        <InputNumber keyboard={false} stringMode controls={false} />
                    </Item> :
                    <Item label='总金额' shouldUpdate={(prev, cur) => prev.amount != cur.amount } {...formItemLayout}>
                        {({ getFieldValue }) => (
                            parseFloat(getFieldValue('amount')).toLocaleString()
                        )}
                    </Item>
                }
            </Col>
            {
                isRefund || !ifShowPayment ? null :
                <Col {...colLayout}>
                    <Item label='订金' name='prepayment' {...formItemLayout}>
                        <InputNumber keyboard={false} stringMode controls={false} />
                    </Item>
                </Col>
            }
            {
                !ifShowPayment ? null:
                <Col {...colLayout}>
                    <Item label={isRefund ? '付款' : '尾款'} {...formItemLayout}
                        shouldUpdate={(prev, cur) => {
                            return prev.payment != cur.payment || prev.amount != cur.amount || prev.prepayment != cur.prepayment
                        }}>
                        {({ getFieldValue, setFieldValue }) => {
                            const p = Decimal(getFieldValue('amount') || 0).minus(getFieldValue('prepayment') || 0)
                            return (
                                <Space.Compact>
                                    <Item noStyle name='payment'>
                                        <InputNumber keyboard={false} stringMode controls={false}
                                            placeholder={`应付 ${p.toNumber().toLocaleString()}`} />
                                    </Item>
                                    <Button icon={<EditOutlined />}
                                        onClick={_ => setFieldValue('payment', p.toString())}
                                    />
                                </Space.Compact>
                            )
                        }}
                    </Item>
                </Col>
            }
        </Row>
    </Space>
}


export default InvoiceFormHeader