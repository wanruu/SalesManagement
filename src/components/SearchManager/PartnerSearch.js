import React, { useEffect } from 'react'
import { Form, Space, Input, Button } from 'antd'

const { Item } = Form


const PartnerSearch = ({ initialValues, onSearch, onChange }) => {
    const [form] = Form.useForm()

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
            <Item label='姓名' name='name' {...itemStyle}>
                <Input placeholder='姓名' allowClear style={{ maxWidth: '400px'}} />
            </Item>
            <Item label='文件位置' name='folder' {...itemStyle}>
                <Input placeholder='文件位置' allowClear style={{ maxWidth: '400px'}} />
            </Item>
            <Item label='电话' name='phone' {...itemStyle}>
                <Input placeholder='电话' allowClear style={{ maxWidth: '400px'}} />
            </Item>
            <Item label='地址' name='address' {...itemStyle}>
                <Input placeholder='地址' allowClear style={{ maxWidth: '400px'}} />
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

export default PartnerSearch