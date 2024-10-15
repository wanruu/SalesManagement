import React, { useEffect } from 'react'
import { Button, message, Form, Input, Col, Space } from 'antd'
import { partnerService } from '../../services'

const { Item } = Form

/*
    Optional:
        partner
        onPartnerChange
*/
const PartnerForm = ({ partner, onPartnerChange }) => {
    const [form] = Form.useForm()

    const handleFinish = async () => {
        const data = form.getFieldsValue(true)
        const newPartner = {
            name: data.name,
            folder: data.folder,
            phone: data.phone,
            address: data.address,
        }
        const messageKey = 'partner'
        message.open({ type: 'loading', key: messageKey, content: '提交中' })
        try {
            let res
            if (partner.name) {
                res = await partnerService.update(partner.name, newPartner)
            } else {
                res = await partnerService.create(newPartner)
            }
            onPartnerChange?.(res.data)
            message.open({ key: messageKey, type: 'success', content: '保存成功' })
        } catch (err) {
            if (err.response?.data?.error == 'SequelizeUniqueConstraintError') {
                message.open({ type: 'error', key: messageKey, content: '姓名重复' })
            } else {
                message.open({ 
                    type: 'error', key: messageKey, duration: 5,
                    content: `${err.message}. ${err.response?.data?.error}` 
                })
            }
        }
    }

    // rules
    const nameRules = [
        { required: true }, { whitespace: true },
        { warningOnly: true, validator: async (rule, value) => {
            if (partner.name && value !== partner.name) throw new Error()
        }}
    ]
    const phoneRules = [
        // { pattern: new RegExp('^[0-9]{11}$', 'g'), message: '电话不是11位数字', warningOnly: true },
        { whitespace: true },
        { warningOnly: true, validator: async (rule, value) => {
            if (partner.name && value !== partner.phone) throw new Error()
        }}
    ]
    const addressRules = [
        { whitespace: true },
        { warningOnly: true, validator: async (rule, value) => {
            if (partner.name && value !== partner.address) throw new Error()
        }}
    ]
    const folderRules = [
        { whitespace: true },
        { warningOnly: true, validator: async (rule, value) => {
            if (partner.name && value !== partner.folder) throw new Error()
        }}
    ]

    // initialize form
    const resetForm = () => {
        form.setFieldsValue(partner)
    }
    useEffect(resetForm, [])

    return <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} 
        onFinish={handleFinish} onReset={resetForm} form={form}>
        <Item label='姓名' name='name' rules={nameRules}>
            <Input allowClear />
        </Item>
        <Item label='文件位置' name='folder' rules={folderRules}>
            <Input allowClear />
        </Item>
        <Item label='电话' name='phone' rules={phoneRules}>
            <Input allowClear />
        </Item>
        <Item label='地址' name='address' rules={addressRules}>
            <Input allowClear />
        </Item>
        <Col align='middle'>
            <Space>
                <Button htmlType='reset'>重置</Button>
                <Button type='primary' htmlType='submit'>保存</Button>
            </Space>
        </Col>
    </Form>
}


export default PartnerForm