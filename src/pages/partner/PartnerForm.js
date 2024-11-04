import React from 'react'
import { Button, Form, Input, Col, Space } from 'antd'
import { partnerService } from '@/services'
import { useDispatch } from 'react-redux'


const formItems = [
    {
        key: 'name', label: '姓名', dataIndex: 'name',
        rules: [{ required: true }, { whitespace: true }]
    },
    {
        key: 'folder', label: '文件夹', dataIndex: 'folder',
        rules: [{ whitespace: true }]
    },
    {
        key: 'phone', label: '电话', dataIndex: 'phone',
        rules: [{ whitespace: true }]
    },
    {
        key: 'address', label: '地址', dataIndex: 'address',
        rules: [{ whitespace: true }]
    }
]


/**
 * @component
 * @param {Object} props 
 * @param {Object} props.partner
 * @param {string} props.partner.name
 * @param {string} [props.partner.phone]
 * @param {string} [props.partner.address]
 * @param {string} [props.partner.folder]
 * @param {Function} [props.onPartnerChange]
 */
const PartnerForm = (props) => {
    const { partner, onPartnerChange } = props
    const [form] = Form.useForm()
    const dispatch = useDispatch()

    const handleFinish = async () => {
        const newPartner = form.getFieldsValue()
        const messageKey = 'submit-partner'
        dispatch({
            type: 'globalInfo/addMessage',
            payload: { key: messageKey, type: 'loading', content: '保存中', duration: 86400 }
        });
        try {
            let res
            if (partner.name) {
                res = await partnerService.update(partner.name, newPartner)
            } else {
                res = await partnerService.create(newPartner)
            }
            onPartnerChange?.(res.data)
            dispatch({
                type: 'globalInfo/addMessage',
                payload: { key: messageKey, type: 'success', content: '保存成功' }
            });
        } catch (err) {
            if (err.response?.data?.error == 'SequelizeUniqueConstraintError') {
                dispatch({
                    type: 'globalInfo/addMessage',
                    payload: { key: messageKey, type: 'error', content: '姓名重复' }
                });
            } else {
                dispatch({
                    type: 'globalInfo/addMessage',
                    payload: { key: messageKey, type: 'error', content: `保存失败：${err.message}. ${err.response?.data?.error}`, duration: 5 }
                });
            }
        }
    }

    return <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} initialValues={partner}
        onFinish={handleFinish} form={form}>
        {formItems.map(item => (
            <Form.Item key={item.key} label={item.label} name={item.dataIndex} rules={item.rules}>
                <Input allowClear />
            </Form.Item>
        ))}

        <Col align='middle'>
            <Space>
                <Button htmlType='reset'>重置</Button>
                <Button type='primary' htmlType='submit'>保存</Button>
            </Space>
        </Col>
    </Form>
}


export default PartnerForm