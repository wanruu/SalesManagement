import { Input, InputNumber, Space, Select, Checkbox, Form, Radio, Row, Divider, Tooltip, Card, Button } from 'antd'
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import dayjs from 'dayjs'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { DATE_FORMAT, INVOICE_BASICS } from '../../utils/config'
import { InvoicePrint } from '../InvoiceManager'
import Title from 'antd/es/typography/Title'


const { Item } = Form


const TipsView = ({ title }) => {
    return (
        <Tooltip title={title} >
            <QuestionCircleOutlined style={{ marginLeft: '3px', color: 'gray' }} />
        </Tooltip>
    )
}


const subtitleStyleOptions = [
    { label: '标题同行', value: 'inline' },
    { label: '另起一行', value: 'multi' }
]


const PrintSettingView = () => {
    const settings = useSelector(state => state.printSetting)
    const dispatch = useDispatch()

    const handleChange = (key, value) => {
        dispatch({
            type: 'printSetting/setItem', 
            payload: { key: key, value: value }
        })
    }

    const InputNumberItem = (key, label) => {
        return <Item label={label}>
            <InputNumber keyboard={false}
                placeholder={settings[key]?.defaultValue}
                value={settings[key]?.value}
                onChange={value => handleChange(key, value)}
            />
        </Item>
    }

    const InputItem = (key, label, maxWidth='300px') => {
        return <Item label={label}>
            <Input style={{ maxWidth: maxWidth }}
                placeholder={settings[key]?.defaultValue}
                value={settings[key]?.value}
                onChange={e => handleChange(key, e.target.value)}
            />
        </Item>
    }

    return (<>
        <Title id='print' level={2}>打印设置</Title>

        <Card>
            <Title id='print-overall' level={3}>清单整体</Title>
            { InputNumberItem('width', '宽度') }
            { InputNumberItem('height', '高度') }
            { InputNumberItem('hPadding', '水平边距') }
            { InputNumberItem('vPadding', '垂直边距') }
            <Divider />


            <Title id='print-title' level={3}>标题 & 副标题</Title>
            { InputItem('title', '标题') }
            { InputNumberItem('titleFontSize', '标题字号') }
            <Item label='副标题'>
                <Space wrap>
                    {
                        ['salesOrderSubtitle', 'salesRefundSubtitle', 'purchaseOrderSubtitle', 'purchaseRefundSubtitle'].map(key => (
                            <Input key={key} style={{ width: '110px' }}
                                placeholder={settings[key]?.defaultValue}
                                value={settings[key]?.value}
                                onChange={e => handleChange(key, e.target.value)}
                            />
                        ))
                    }
                </Space>
            </Item>
            <Item label='副标题样式'>
                <Select options={subtitleStyleOptions} style={{ width: '110px' }}
                    value={settings.subtitleStyle?.value}
                    onChange={val => handleChange('subtitleStyle', val)}
                />
            </Item>
            <Item label={<>副标题字号<TipsView title='当样式为“另起一行“时才可指定字号。' /></>}>
                {settings.subtitleStyle?.value === 'inline' ?
                    <InputNumber disabled={true} value={settings.titleFontSize?.value || settings.titleFontSize?.defaultValue} /> :
                    <InputNumber keyboard={false} 
                        placeholder={settings.subtitleFontSize?.defaultValue}
                        value={settings.subtitleFontSize?.value}
                        onChange={val => handleChange('subtitleFontSize', val)}
                    />
                }
            </Item>
            <Divider />


            <Title id='print-info' level={3}>头部</Title>
            <Item label='客户 / 供应商'>
                <Checkbox checked={settings.ifShowPhone?.value} onChange={e => {
                    handleChange('ifShowPhone', e.target.checked)
                }}>
                    显示电话 (如有)
                </Checkbox>
                <Checkbox checked={settings.ifShowAddress?.value} onChange={e => {
                     handleChange('ifShowAddress', e.target.checked)
                }}>
                    显示地址 (如有)
                </Checkbox>
            </Item>
            { InputNumberItem('headerFontSize', '字号') }
            <Divider />


            <Title id='print-table' level={3}>表格</Title>
            { InputNumberItem('tableFontSize', '字号') }
            { InputItem('amountSign', '金额符号', '100px') }
            <Divider />


            <Title id='print-footer' level={3}>脚注</Title>
            <Item label={<>脚注<TipsView title='以回车键分行，每行脚注将依次列在单据脚注位置，单据脚注为两列。' /></>}>
                <Input.TextArea style={{ maxWidth: '600px' }} autoSize
                    placeholder={settings.footer?.defaultValue}
                    value={settings.footer?.value} 
                    onChange={e => handleChange('footer', e.target.value)} />
            </Item>
            { InputNumberItem('footerFontSize', '字号') }
            <Divider />

            <Title id='print-preview' level={3}>打印预览</Title>
            <PrintPreview />
        </Card>
    </>)
}


const PrintPreview = () => {
    const [previewType, setPreviewType] = useState(undefined)
    const [previewItemNum, setPreviewItemNum] = useState(8)

    const initInvoiceForPreview = (itemNum) => {
        return {
            number: `${dayjs().format('YYYYMMDD')}0001`,
            partner: {
                name: '交易对象', 
                phone: '12345678901',
                address: '地址地址地址地址地址地址地址地址地址地址地址地址地址地址地址',
            },
            date: dayjs().format(DATE_FORMAT),
            amount: '0',
            invoiceItems: [...Array(itemNum).keys()].map((_, idx) => {
                return {
                    product: {
                        material: `材质${idx + 1}`, name: `名称${idx + 1}`, spec: `规格${idx + 1}`,
                        unit: '只',
                    },
                    quantity: idx + 1,
                    price: 0, amount: 0, remark: `备注${idx + 1}`
                }
            })
        }
    }
    return (
        <>
            <Space wrap>
                <Radio.Group value={previewType} onChange={e => setPreviewType(e.target.value)} >
                    <Radio value={undefined}>不显示</Radio>
                    {Object.keys(INVOICE_BASICS).map(type => 
                        <Radio key={type} value={type}>
                            {INVOICE_BASICS[type].title}
                        </Radio>
                    )}
                </Radio.Group>
                <InputNumber style={{ width: '120px' }} addonBefore='产品数' value={previewItemNum}
                    onChange={num => setPreviewItemNum(num)} />
            </Space>

            {
                previewType ?
                    <div style={{ overflowX: 'auto', overflowY: 'clip' }}>
                        <InvoicePrint footer={false} type={previewType} 
                            invoice={initInvoiceForPreview(Math.round(previewItemNum))} />
                    </div> : null
            }
        </>
    )
}

export default PrintSettingView