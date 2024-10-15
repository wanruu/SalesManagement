import React, { useState, useEffect } from 'react'
import { Form, Input, Table, Button, Space } from 'antd'
import { INVOICE_BASICS, invoiceSettings } from '../../../utils/config'
import { invoiceService } from '../../../services'
import { PartnerInput } from '../../Input'


const { Item } = Form


/*
    Required: type
    Optional: onCancel
*/
const OrderSelection = ({ type, onCancel }) => {
    const orderType = INVOICE_BASICS[type].orderType

    const form = Form.useFormInstance()
    const [searchForm] = Form.useForm()
    const [orders, setOrders] = useState([])

    const load = () => {
        // TODO: filter by searchForm
        invoiceService.fetchMany(orderType).then(res => {
            setOrders(res.data)
        }).catch(err => {
            // TODO
        })
    }

    const getOrderColumns = () => {
        const selectOrder = (order) => {
            invoiceService.fetch(order.type, order.id).then(res => {
                const values = {
                    order: res.data,
                    partnerName: res.data.partnerName,
                    partner: res.data.partner,
                    invoiceItems: [],
                    amount: 0,
                }
                form.setFieldsValue(values)
                onCancel?.()
            })
        }
        return [
            { title: '序号', render: (_, __, idx) => idx + 1 },
            { title: INVOICE_BASICS[orderType]?.title, dataIndex: 'number', },
            { title: INVOICE_BASICS[orderType]?.partnerTitle, dataIndex: 'partnerName', },
            { title: '金额', dataIndex: 'amount', render: amount => {
                const amountSign = invoiceSettings.get('ifShowAmountSign') === 'true' ? invoiceSettings.get('amountSign') : ''
                return amountSign + amount.toLocaleString()
            }},
            { title: '日期', dataIndex: 'date' },
            { title: '操作', render: (_, order) => (
                form.getFieldValue(['order', 'id']) == order.id ?
                <Button disabled>已选择</Button> :
                <Button onClick={_ => selectOrder(order)}>选择</Button>
            )}
        ].map(col => ({ ...col, align: 'center' }))
    }

    useEffect(load, [])

    return (
        <Space direction='vertical' style={{ width: '100%' }} size={20}>
            <Form form={searchForm} onFinish={load} style={{ paddingTop: 10 }}>
                <Space.Compact>
                    <Item name='number' noStyle>
                        <Input placeholder='单号' allowClear />
                    </Item>
                    <Item name='partnerName' noStyle>
                        <PartnerInput placeholder='姓名（支持拼音、首字母）' allowClear />
                    </Item>
                    <Item noStyle>
                        <Button type='primary' htmlType='submit'>搜索</Button>
                    </Item>
                </Space.Compact>
            </Form>
            <Table dataSource={orders} size='small' columns={getOrderColumns()}
                pagination={{ showSizeChanger: false, showQuickJumper: true }}
            /> 
        </Space>
    )
}


export default OrderSelection