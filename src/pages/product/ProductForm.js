import React, { useEffect } from 'react'
import { Input, Space, Button, Form, Col, Select } from 'antd'
import { productService } from '@/services'
import { useSelector, useDispatch } from 'react-redux'


const { Item } = Form

/*
    Optional: 
        product
        onProductChange
*/
const ProductForm = ({ product, onProductChange }) => {
    const [form] = Form.useForm()
    const ifShowMaterial = useSelector(state => state.functionSetting.ifShowMaterial.value)
    const units = useSelector(state => state.functionSetting.units.value)
    const unitOptions = units.map(u => ({ label: u, value: u }))
    const defaultUnit = useSelector(state => state.functionSetting.defaultUnit.value)
    const dispatch = useDispatch()

    const handleFinish = async () => {
        const data = form.getFieldsValue(true)
        const newProduct = {
            material: data.material,
            name: data.name,
            spec: data.spec,
            unit: data.unit,
        }
        const messageKey = 'product'
        dispatch({
            type: 'globalInfo/addMessage',
            payload: { key: messageKey, type: 'loading', content: '提交中', duration: 86400 }
        });
        try {
            let res
            if (product.id) {
                res = await productService.update(product.id, newProduct)
            } else {
                res = await productService.create(newProduct)
            }
            onProductChange?.(res.data)
            dispatch({
                type: 'globalInfo/addMessage',
                payload: { key: messageKey, type: 'success', content: '保存成功', }
            });
        } catch (err) {
            if (err.response?.data?.error == 'SequelizeUniqueConstraintError') {
                dispatch({
                    type: 'globalInfo/addMessage',
                    payload: { key: messageKey, type: 'error', content: '产品已存在' }
                });
            } else {
                dispatch({
                    type: 'globalInfo/addMessage',
                    payload: { key: messageKey, type: 'error', content: `${err.message}. ${err.response?.data?.error}` , duration: 5 }
                });
            }
        }
    }

    // rules
    const materialRules = [
        { required: true }, { whitespace: true },
        {
            warningOnly: true, validator: async (rule, value) => {
                if (product.id && value !== product.material) throw new Error()
            }
        }
    ]
    const nameRules = [
        { required: true }, { whitespace: true },
        {
            warningOnly: true, validator: async (rule, value) => {
                if (product.id && value !== product.name) throw new Error()
            }
        }
    ]
    const specRules = [
        { required: true }, { whitespace: true },
        {
            warningOnly: true, validator: async (rule, value) => {
                if (product.id && value !== product.spec) throw new Error()
            }
        }
    ]
    const unitRules = [
        { required: true, message: '请选择单位' },
        {
            warningOnly: true, validator: async (rule, value) => {
                if (product.id && value !== product.unit) throw new Error()
            }
        }
    ]

    const resetForm = () => {
        form.setFieldsValue(product)
    }
    useEffect(resetForm, [])

    return (
        <Form labelCol={{ span: 3 }} wrapperCol={{ span: 20 }} 
            onFinish={handleFinish} onReset={resetForm} form={form}>
            {
                ifShowMaterial ? 
                    <Item label='材质' name='material' rules={materialRules}>
                    <Input allowClear />
                </Item> : null
            }
            <Item label='名称' name='name' rules={nameRules}>
                <Input allowClear />
            </Item>
            <Item label='规格' name='spec' rules={specRules}>
                <Input allowClear />
            </Item>
            <Item label='单位' name='unit' rules={unitRules} initialValue={defaultUnit}>
                <Select options={unitOptions} />
            </Item>
            <Col align='middle'>
                <Space>
                    <Button htmlType='reset'>重置</Button>
                    <Button type='primary' htmlType='submit'>保存</Button>
                </Space>
            </Col>
        </Form>
    )
}


export default ProductForm