import React from 'react'
import { Form, Input, Table, Button, InputNumber, Select, Space, Col } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import Decimal from 'decimal.js'
import { updateItemAmount, updateTotalAmount, updateQuantityByRemark, deliveredOptions } from './utils'
import { useSelector } from 'react-redux'


const { Item } = Form


const tableId = 'refundFormTable'
const getPopupContainer = () => document.getElementById(tableId)


/*
    Include all items from related order
 */
const AllRefundTable = () => {
    const form = Form.useFormInstance()
    const ifShowDiscount = useSelector(state => state.functionSetting.ifShowDiscount.value)
    const ifShowMaterial = useSelector(state => state.functionSetting.ifShowMaterial.value)
    const ifShowDelivered = useSelector(state => state.functionSetting.ifShowDelivered.value)

    const refund = (rowIndex) => {
        const item = form.getFieldValue(['order', 'invoiceItems', rowIndex])
        const newItem = {
            product: item.product,
            maxQuantity: item.quantity,
            price: item.price,
            discount: item.discount,
            originalAmount: null,
            quantity: null,
            amount: null,
            remark: null,
            delivered: false,
        }
        const items = [...form.getFieldValue('invoiceItems') ?? []]
        items.push(newItem)
        form.setFieldValue('invoiceItems', items)
    }

    const refundAll = () => {
        const items = form.getFieldValue(['order', 'invoiceItems']) ?? []
        const newItems = items.map(item => ({
            product: item.product,
            maxQuantity: item.quantity,
            price: item.price,
            discount: item.discount,
            originalAmount: null,
            quantity: null,
            amount: null,
            remark: null,
            delivered: false,
        }))
        form.setFieldValue('invoiceItems', newItems)
    }

    const getRefundDisabled = (rowIndex) => {
        const refundedItems = form.getFieldValue('invoiceItems') ?? []
        const curItem = form.getFieldValue(['order', 'invoiceItems', rowIndex])
        return refundedItems.find(item => (
            // they are regarded as the same items
            item.product.id == curItem.product.id &&
            item.price == curItem.price &&
            item.discount == curItem.discount
        ))
    }

    // Render
    const render = (name) => (
        (_, field, idx) => form.getFieldValue(['order', 'invoiceItems', field.name, ...name])
    )

    const discountRender = (_, field, idx) => (
        form.getFieldValue(['order', 'invoiceItems', field.name, 'discount']) + '%'
    )

    const deliveredRender = (_, field, idx) => (
        // TODO: tag module
        deliveredOptions.find(o => 
            o.value == form.getFieldValue(['order', 'invoiceItems', field.name, 'delivered'])
        ).label
    )

    const operRender = (_, field, idx) => {
        return <Item shouldUpdate noStyle>
            {_ => (
                <Button type='primary' ghost onClick={_ => refund(field.name)} disabled={getRefundDisabled(field.name)}>
                    退货
                </Button>
            )}
        </Item>
    }

    const columns = [
        { title: '序号', width: 70, fixed: 'left', render: (_, field) => field.name + 1 },
        !ifShowMaterial ? null :
        { title: '材质', width: 100, render: render(['product', 'material']) },
        { title: '名称', width: 140, render: render(['product', 'name']) },
        { title: '规格', width: 100, render: render(['product', 'spec']) },
        { title: '数量', width: 100, render: render(['quantity']) },
        { title: '单位', width: 80, render: render(['product', 'unit']) },
        { title: '单价', width: 90, render: render(['price']) },
        !ifShowDiscount ? null :
        { title: '金额', width: 80, render: render(['originalAmount']) },
        !ifShowDiscount ? null :
        { title: '折扣', width: 80, render: discountRender },
        { title: ifShowDiscount ? '折后价' : '金额', width: 80, render: render(['amount']) },
        { title: '备注', width: 180, render: render(['remark']) },
        !ifShowDelivered ? null :
        { title: '配送', width: 80, render: deliveredRender },
        { title: '操作', width: 70, render: operRender },
    ]
    .filter(i => i != null)
    .map(i => ({ ...i, align: 'center' }))

    return <Form.List name={['order', 'invoiceItems']}>
        {(fields) =>
            <Table dataSource={fields} columns={columns} 
                className='invoice-form-table' bordered
                scroll={{ x: 'max-content' }} 
                footer={_ => (
                    <Col>
                        <Button type='primary' ghost onClick={refundAll}>
                            全部退货
                        </Button>
                    </Col>
                )}
            />
        }
    </Form.List>
}


/*
    Only include selected items
 */
const RefundTable = () => {
    const form = Form.useFormInstance()
    const ifShowDiscount = useSelector(state => state.functionSetting.ifShowDiscount.value)
    const ifShowMaterial = useSelector(state => state.functionSetting.ifShowMaterial.value)
    const ifShowDelivered = useSelector(state => state.functionSetting.ifShowDelivered.value)
    const allowEditAmount = useSelector(state => state.functionSetting.allowEditAmount.value)
    const ifShowRemarkCalculator = useSelector(state => state.functionSetting.ifShowRemarkCalculator.value)

    const render = (name) => (
        (_, field, idx) => form.getFieldValue(['invoiceItems', field.name, ...name])
    )

    const renders = {
        quantityRender: (_, field, idx) => {
            const maxQuantity = form.getFieldValue(['invoiceItems', field.name, 'maxQuantity'])
            return <Space.Compact>
                <Item name={[field.name, 'quantity']} rules={[{required: true}]} noStyle>
                    <InputNumber min={0} stringMode keyboard={false} controls={false}
                        placeholder={maxQuantity}
                        onChange={_ => updateItemAmount(form, field.name)} />
                </Item>
                <Button icon={<EditOutlined />} onClick={_ => {
                    form.setFieldValue(['invoiceItems', field.name, 'quantity'], maxQuantity)
                    updateItemAmount(form, field.name)
                }} />
            </Space.Compact>
        },
        originalAmountRender: (_, field, idx) => {
            return allowEditAmount ?
            <Item name={[field.name, 'originalAmount']} rules={[{required: true}]} noStyle>
                <InputNumber keyboard={false} controls={false}
                    onChange={value => {
                        const discount = form.getFieldValue(['invoiceItems', field.name, 'discount'])
                        form.setFieldValue(['invoiceItems', field.name, 'amount'], Decimal(value ?? 0).times(discount).dividedBy(100).toString())
                        updateTotalAmount(form)
                    }} />
            </Item> :
            parseFloat(form.getFieldValue(['invoiceItems', field.name, 'originalAmount'])).toLocaleString()
        },
        amountRender: (_, field, idx) => {
            return allowEditAmount ?
                <Item name={[field.name, 'amount']} rules={[{required: true}]} noStyle>
                    <InputNumber keyboard={false} controls={false} onChange={_ => updateTotalAmount(form)} />
                </Item> :
                parseFloat(form.getFieldValue(['invoiceItems', field.name, 'amount'])).toLocaleString()
        },  
        discountRender: (_, field, idx) => (
            `${form.getFieldValue(['invoiceItems', field.name, 'discount'])}%`
        ),
        remarkRender: (_, field, idx) => {
            return <Space.Compact>
                <Item name={[field.name, 'remark']} noStyle><Input /></Item>
                {
                    !ifShowRemarkCalculator ? null :
                    <Button onClick={_ => updateQuantityByRemark(form, field.name)} icon='=' />
                }
            </Space.Compact>
        },
        deliveredRender: (_, field, idx) => (
            <Item name={[field.name, 'delivered']} noStyle>
                <Select options={deliveredOptions} getPopupContainer={getPopupContainer} />
            </Item>
        ),
        operRender: (_, field, idx) => (
            <Button danger onClick={_ => removeItem(field.name)}>移除</Button>
        ),
    }

    const removeItem = (rowIndex) => {
        const items = [...form.getFieldValue('invoiceItems')]
        items.splice(rowIndex, 1)
        form.setFieldValue('invoiceItems', items)
        updateTotalAmount(form)
    }

    const removeAll = () => {
        form.setFieldValue('invoiceItems', [])
        updateTotalAmount(form)
    }

    const columns = [
        { title: '序号', width: 70, fixed: 'left', render: (_, field) => field.name + 1 },
        !ifShowMaterial ? null :
        { title: '材质', width: 100, render: render(['product', 'material']) },
        { title: '名称', width: 140, render: render(['product', 'name']) },
        { title: '规格', width: 100, render: render(['product', 'spec']) },
        { title: '数量', width: 100, render: renders.quantityRender },
        { title: '单位', width: 80, render: render(['product', 'unit']) },
        { title: '单价', width: 90, render: render(['price']) },
        !ifShowDiscount ? null :
        { title: '金额', width: 80, render: renders.originalAmountRender },
        !ifShowDiscount ? null :
        { title: '折扣', width: 80, render: renders.discountRender },
        { title: ifShowDiscount ? '折后价' : '金额', width: 80, render: renders.amountRender },
        { title: '备注', width: 180, render: renders.remarkRender },
        !ifShowDelivered ? null :
        { title: '配送', width: 80, render: renders.deliveredRender },
        { title: '操作', width: 70, render: renders.operRender },
    ]
    .filter(i => i != null)
    .map(i => ({ ...i, align: 'center' }))

    return <Form.List name='invoiceItems' rules={[{required: true}]}>
        {(fields) =>
            <Table id={tableId} className='invoice-form-table refundFormTable'
                scroll={{ x: 'max-content' }} bordered
                dataSource={fields} columns={columns}
                footer={_ => (
                    <Col>
                        <Button danger onClick={removeAll}>全部移除</Button>
                    </Col>
                )}
            />
        }
    </Form.List>
}



export { RefundTable, AllRefundTable }