import React, { useState } from 'react'
import { Form, Input, Table, Button, InputNumber, Select, Space, Modal } from 'antd'
import { LineChartOutlined } from '@ant-design/icons'
import Decimal from 'decimal.js'
import { emptyInvoiceItem } from '../../../utils/invoiceUtils'
import { ProductInput } from '../../Input'
import { productService } from '../../../services'
import { updateItemAmount, updateTotalAmount, updateQuantityByRemark, deliveredOptions } from './InvoiceFormTableUtils'
import { useSelector } from 'react-redux'
import { ProductManager } from '../../ProductManager'


const { Item } = Form


const tableId = 'orderFormTable'
const getPopupContainer = () => document.getElementById(tableId)


// present all items in invoiceItems
const OrderFormTable = ({ type }) => {
    const form = Form.useFormInstance()
    const partnerName = Form.useWatch('partnerName', form)
    const [historyProduct, setHistoryProduct] = useState(undefined)  // TODO: history modal

    const ifShowDiscount = useSelector(state => state.functionSetting.ifShowDiscount.value)
    const ifShowMaterial = useSelector(state => state.functionSetting.ifShowMaterial.value)
    const ifShowDelivered = useSelector(state => state.functionSetting.ifShowDelivered.value)
    const allowEditAmount = useSelector(state => state.functionSetting.allowEditAmount.value)
    const ifShowRemarkCalculator = useSelector(state => state.functionSetting.ifShowRemarkCalculator.value)
    const units = useSelector(state => state.functionSetting.units.value)

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
                    const unitOptions = units.map(u => ({ label: u, value: u }))
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
        )
    }

    const columns = (remove) => [
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
        { title: '操作', width: 70, fixed: 'right', render: (_, field, idx) => (
            <Button danger onClick={_ => remove(field.name)}>
                删除
            </Button>
        )},
    ]
    .filter(i => i != null)
    .map(i => ({ ...i, align: 'center' }))

    return <>
        <Modal title='产品详情' open={historyProduct} onCancel={_ => setHistoryProduct(undefined)} width='90%'
            footer={(_, { CancelBtn }) =>  <CancelBtn />}>
            <ProductManager product={historyProduct} partnerName={partnerName}
                display='line' field='price' invoiceType={type} />
        </Modal>
        <Form.List name='invoiceItems' rules={[{required: true}]}>
            {(fields, { add, remove }) =>
                <Table className='invoice-form-table order-form-table' id={tableId}
                    scroll={{ x: 'max-content', y: 'max-content' }} bordered
                    dataSource={fields} columns={columns(remove)}
                    footer={_ => 
                        <Button onClick={_ => add(emptyInvoiceItem())} type='primary' ghost>
                            新增一项
                        </Button>}
                />
            }
        </Form.List>
    </>
}


export default OrderFormTable