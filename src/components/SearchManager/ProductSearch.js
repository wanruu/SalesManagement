import React, { useEffect } from 'react'
import { Form, Select, Space, Input, Button } from 'antd'
import { useSelector } from 'react-redux'


const { Item } = Form


const ProductSearch = ({ initialValues, onSearch, onChange }) => {
    const [form] = Form.useForm()

    const ifShowMaterial = useSelector(state => state.functionSetting.ifShowMaterial.value)
    const units = useSelector(state => state.functionSetting.units.value)
    const unitOptions = units.map(u => ({ label: u, value: u }))

    const initForm = () => {
        form.resetFields()
        form.setFieldsValue(initialValues)
    }
    const resetForm = () => {
        form.resetFields()
        onChange?.(form.getFieldsValue())
    }

    useEffect(initForm, [])

    const itemStyle = { style: { margin: '8px 0px' } }
    
    return (
        <Form form={form} onFinish={_ => onSearch?.()} onReset={resetForm}
            onValuesChange={onChange}
            labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {
                ifShowMaterial ?
                    <Item label='材质' name='material' {...itemStyle}>
                        <Input placeholder='材质' allowClear style={{ maxWidth: '400px'}} />
                    </Item> : null
            }
            <Item label='名称' name='name' {...itemStyle}>
                <Input placeholder='名称' allowClear style={{ maxWidth: '400px'}} />
            </Item>
            <Item label='规格' name='spec' {...itemStyle}>
                <Input placeholder='规格' allowClear style={{ maxWidth: '400px'}} />
            </Item>
            <Item label='单位' name='unit' {...itemStyle}>
                <Select placeholder='选择单位' allowClear mode='multiple'
                    options={unitOptions} style={{ maxWidth: '400px'}}
                />
            </Item>
            <Item label=' ' colon={false} style={{ marginTop: 0, marginBottom: 0 }} >
                <Space direction='horizontal'>
                    <Button htmlType='reset'>清空</Button>
                    <Button htmlType='submit' type='primary'>搜索</Button>
                </Space>
            </Item>
        </Form>
    )
}

export default ProductSearch