import React, { useEffect, useRef, useState } from 'react'
import { Form, Select, DatePicker, Space, Input, Button, Tooltip, Row, Divider } from 'antd'
import { ExclamationCircleOutlined, SwapOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { DATE_FORMAT, INVOICE_BASICS } from '../../utils/config'
import { DeliverTag } from '../Tag'


const { Item } = Form
const { RangePicker } = DatePicker


const INVOICE_DELIVER_OPTIONS = [
    '未配送', '部分配送', '全部配送'
].map(val => ({ value: val, label: val }))



function InvoiceSearch({ type, initialValues, onSearch, onChange, onReset }) {
    const [form] = Form.useForm()

    const ifShowDelivered = useSelector(state => state.functionSetting.ifShowDelivered.value)

    const initForm = () => {
        form.resetFields()
        form.setFieldsValue(initialValues)
    }
    const resetForm = () => {
        form.resetFields()
        onReset?.()
    }

    useEffect(initForm, [])

    const deliveredTagRender = (props) => {
        const { label, value, closable, onClose } = props
        const onPreventMouseDown = (event) => {
            event.preventDefault()
            event.stopPropagation()
        }
        return <DeliverTag value={label} 
            onMouseDown={onPreventMouseDown}
            closable={closable} onClose={onClose}
            style={{ marginRight: 3 }}
         />
    }

    const partnerTitle = INVOICE_BASICS[type].partnerTitle
    const itemStyle = { style: { margin: '8px 0px' } }

    return (
        <Form form={form} onFinish={_ => onSearch?.()} onReset={resetForm}
            onValuesChange={onChange}
            labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            <Item label='单号' name='number' {...itemStyle}>
                <Input placeholder='单号' allowClear style={{ maxWidth: '400px' }} />
            </Item>
            <Item label={partnerTitle} name='partnerName' {...itemStyle}>
                <Input placeholder={partnerTitle + '名称'} allowClear style={{ maxWidth: '400px' }} />
            </Item>
            <Item label='日期' name='date' {...itemStyle}>
                <RangePicker format={DATE_FORMAT} allowEmpty={[true, true]} style={{ maxWidth: '400px' }} />
            </Item>
            {
                ifShowDelivered ?
                    <Item label='配送情况' name='delivered' {...itemStyle}>
                        <Select placeholder='选择配送情况'
                            mode='multiple' tagRender={deliveredTagRender}
                            options={INVOICE_DELIVER_OPTIONS} allowClear
                            style={{ maxWidth: '400px' }}
                        />
                    </Item> : null
            }

            <Item label=' ' colon={false} style={{ marginTop: 0, marginBottom: 0 }} >
                <Space direction='horizontal'>
                    <Button htmlType='reset'>清空</Button>
                    <Button htmlType='submit' type='primary'>搜索</Button>
                </Space>
            </Item>
        </Form>
    )
}

export default InvoiceSearch