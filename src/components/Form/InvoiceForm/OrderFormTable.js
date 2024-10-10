import React, { useState } from 'react'
import { Form, Input, Table, Button, InputNumber, Select, Space } from 'antd'
import { LineChartOutlined } from '@ant-design/icons'
import Decimal from 'decimal.js'
import { invoiceSettings } from '../../../utils/config'
import { emptyInvoiceItem } from '../../../utils/invoiceUtils'
import { ProductInput } from '../../Input'
import productService from '../../../services/productService'
import { updateItemAmount, updateTotalAmount, updateQuantityByRemark, deliveredOptions } from './InvoiceFormTableUtils'

const { Item } = Form


const tableId = 'orderFormTable'
const getPopupContainer = () => document.getElementById(tableId)


// present all items in invoiceItems
const OrderFormTable = () => {
    const form = Form.useFormInstance()
    const [historyProduct, setHistoryProduct] = useState(undefined)  // TODO: history modal

    const ifShowDiscount = invoiceSettings.get('ifShowDiscount') === 'true'
    const ifShowMaterial = invoiceSettings.get('ifShowMaterial') === 'true'
    const ifShowDelivered = invoiceSettings.get('ifShowDelivered') === 'true'
    const allowEditAmount = invoiceSettings.get('allowEditAmount') === 'true'
    const ifShowRemarkCalculator = invoiceSettings.get('ifShowRemarkCalculator') === 'true'

    const updateUnit = (rowIndex) => {
        const product = form.getFieldValue(['invoiceItems', rowIndex, 'product'])
        productService.fetchByInfo(product).then(res => {
            form.setFieldValue(['invoiceItems', rowIndex, 'product', 'unit'], res.data.unit)
            form.setFieldValue(['invoiceItems', rowIndex, 'product', 'id'], res.data.id)
        }).catch(_ => {
            form.setFieldValue(['invoiceItems', rowIndex, 'product', 'id'], undefined)
        })
    }

    const renders = {
        productRender: (property) => (
            (_, field, idx) => (
                <Item name={[field.name, 'product', property]} rules={[{required: true}]} noStyle>
                    <ProductInput property={property} style={{ width: '100%' }}
                        onChange={_ => updateUnit(field.name)} />
                </Item>
            )
        ),
        quantityRender: (_, field, idx) => (
            <Item name={[field.name, 'quantity']} rules={[{required: true}]} noStyle>
                <InputNumber min={0} stringMode keyboard={false} controls={false}
                    onChange={_ => updateItemAmount(form, field.name)} />
            </Item>
        ),
        unitRender: (_, field, idx) => (
            <Item noStyle shouldUpdate={(prevValues, curValues) => {
                const prev = prevValues.invoiceItems[field.name]?.product
                const cur = curValues.invoiceItems[field.name]?.product
                return prev?.material != cur?.material || prev?.name != cur?.name || prev?.spec != cur?.spec || prev?.id != cur?.id
            }}>
                {({ getFieldValue }) => {
                    const product = getFieldValue(['invoiceItems', field.name, 'product'])
                    const unitOptions = JSON.parse(invoiceSettings.get('unitOptions')).filter(unit => unit.showing)
                    return product.id ? product?.unit :
                        <Item name={[field.name, 'product', 'unit']} rules={[{required: true}]} noStyle>
                            <Select align='center' style={{ width: '100%' }} options={unitOptions}
                                getPopupContainer={getPopupContainer} />
                        </Item>
                }}
            </Item>
        ),
        priceRender: (_, field, idx) => (
            <Item noStyle shouldUpdate={(prevValues, curValues) => {
                const prev = prevValues.invoiceItems[field.name]?.product
                const cur = curValues.invoiceItems[field.name]?.product
                return prev?.material != cur?.material || prev?.name != cur?.name || prev?.spec != cur?.spec
            }}>
                {({ getFieldValue }) => {
                    const item = getFieldValue(['invoiceItems', field.name])
                    const historyDisabled = (() => {
                        if (ifShowMaterial) {
                            if (item.product.material && item.product.name && item.product.spec) {
                                return false
                            }
                        } else if (item.product.name && item.product.spec) {
                            return false
                        }
                        return true
                    })()
                    return <Space.Compact>
                        <Item name={[field.name, 'price']} noStyle rules={[{required: true}]}>
                            <InputNumber controls={false} min={0} stringMode keyboard={false}
                                onChange={_ => updateItemAmount(form, field.name)} />
                        </Item>
                        <Button icon={<LineChartOutlined />} disabled={historyDisabled}
                            onClick={_ => setHistoryProduct(item.product)} />
                    </Space.Compact>
                }}
            </Item>
        ),
        originalAmountRender: (_, field, idx) => {
            const item = form.getFieldValue(['invoiceItems', field.name])
            return allowEditAmount ? (
                <Item name={[field.name, 'originalAmount']} rules={[{required: true}]} noStyle>
                    <InputNumber keyboard={false} controls={false}
                        onChange={value => {
                            form.setFieldValue(['invoiceItems', field.name, 'amount'], Decimal(value ?? 0).times(item.discount).dividedBy(100).toString())
                            updateTotalAmount(form)
                        }} />
                </Item>
            ) : parseFloat(item.originalAmount).toLocaleString()
        },
        amountRender: (_, field, idx) => (
            allowEditAmount ?
            <Item name={[field.name, 'amount']} rules={[{required: true}]} noStyle>
                <InputNumber keyboard={false} controls={false} onChange={_ => updateTotalAmount(form)} />
            </Item> :
            <span>
                { parseFloat(form.getFieldValue(['invoiceItems', field.name, 'amount'])).toLocaleString() }
            </span>
        ),
        discountRender: (_, field, idx) => (
            <Item name={[field.name, 'discount']} rules={[{required: true}]} noStyle> 
                <InputNumber addonAfter='%' min={0} max={100} controls={false} 
                    className='discountInput' keyboard={false} 
                    onChange={ _ => updateItemAmount(form, field.name)}/>
            </Item>
        ),
        remarkRender: (_, field, idx) => (
            <Space.Compact>
                <Item name={[field.name, 'remark']} noStyle><Input /></Item>
                {
                    !ifShowRemarkCalculator ? null :
                    <Button onClick={_ => updateQuantityByRemark(form, field.name)} icon='=' />
                }
            </Space.Compact>
        ),
        deliveredRender: (_, field, idx) => (
            <Item name={[field.name, 'delivered']} noStyle>
                <Select options={deliveredOptions} getPopupContainer={getPopupContainer} />
            </Item>
        ),
        operRender: (_, field, idx) => (
            <Button danger onClick={_ => deleteItem(field.name)}>
                删除
            </Button>
        ),
    }

    const addItem = () => {
        form.setFieldValue('invoiceItems', [...form.getFieldValue('invoiceItems'), emptyInvoiceItem()])
    }

    const deleteItem = (rowIndex) => {
        const items = form.getFieldValue('invoiceItems')
        items.splice(rowIndex, 1)
        form.setFieldValue('invoiceItems', items)
        updateTotalAmount(form)
    }

    const columns = [
        { title: '序号', width: 70, fixed: 'left', render: (_, field, idx) => field.name + 1 },
        !ifShowMaterial ? null :
        { title: '材质', width: 100, render: renders.productRender('material') },
        { title: '名称', width: 140, render: renders.productRender('name') },
        { title: '规格', width: 100, render: renders.productRender('spec') },
        { title: '数量', width: 100, render: renders.quantityRender },
        { title: '单位', width: 80, render: renders.unitRender },
        { title: '单价', width: 130, render: renders.priceRender },
        !ifShowDiscount ? null :
        { title: '金额', width: 80, render: renders.originalAmountRender },
        !ifShowDiscount ? null :
        { title: '折扣', width: 80, render: renders.discountRender },
        { title: ifShowDiscount ? '折后价' : '金额', width: 80, render: renders.amountRender },
        { title: '备注', width: 180, render: renders.remarkRender },
        !ifShowDelivered ? null :
        { title: '配送', width: 80, render: renders.deliveredRender },
        { title: '操作', width: 70, fixed: 'right', render: renders.operRender },
    ]
    .filter(i => i != null)
    .map(i => ({ ...i, align: 'center' }))

    return <Form.List name='invoiceItems' rules={[{required: true}]}>
        {(fields) =>
            <Table className='invoiceFormTable orderFormTable' id={tableId}
                scroll={{ x: 'max-content', y: 'max-content' }} bordered
                dataSource={fields} columns={columns}
                footer={_ => <Button onClick={addItem} type='primary' ghost>新增一项</Button>}
            />
        }
    </Form.List>
}


export default OrderFormTable