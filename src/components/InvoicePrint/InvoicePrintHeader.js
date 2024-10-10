import React from 'react'
import dayjs from 'dayjs'
import { Row, Col, Space } from 'antd'
import { FieldNumberOutlined } from '@ant-design/icons'
import { printSettings, INVOICE_BASICS, DATE_FORMAT } from '../../utils/config'


/* 
    Required: invoice, type 
*/
const InvoicePrintHeader = ({ type, invoice }) => {
    // Style
    const fontSize = { fontSize: printSettings.get('headerFontSize') + 'px' }

    // Display condition
    const ifShowAddress = printSettings.get('ifShowAddress') === 'true' && invoice?.partner?.address
    const ifShowPhone = printSettings.get('ifShowPhone') === 'true' && invoice?.partner?.phone
    const ifInline = printSettings.get('subtitleStyle') === 'inline'

    // Content
    const title = printSettings.get('title').replace(/ /g, '\xa0')
    const subtitle = {
        salesOrder: printSettings.get('salesOrderSubtitle'),
        salesRefund: printSettings.get('salesRefundSubtitle'),
        purchaseOrder: printSettings.get('purchaseOrderSubtitle'),
        purchaseRefund: printSettings.get('purchaseRefundSubtitle')
    }[type].replace(/ /g, '\xa0') || '错误'
    // Style
    const titleFontSize = { fontSize: printSettings.get('titleFontSize') + 'px' }
    const subtitleFontSize = { fontSize: printSettings.get('subtitleFontSize') + 'px' }    

    // Return
    return <Space style={{ width: '100%' }} direction='vertical' size='10px'>
        <Space direction='vertical' style={{ width: '100%' }} align='center' size={0}>
            {ifInline ?
                <span style={{ ...titleFontSize }}>{title}&nbsp;&nbsp;&nbsp;{subtitle}</span> :
                <span style={{ ...titleFontSize }}>{title}</span>
            }
            {ifInline ? null : <span style={{ ...subtitleFontSize }}>{subtitle}</span>}
        </Space>
        <Row>
            <Col span={8} style={{ ...fontSize }} align='left'>
                {INVOICE_BASICS[type].partnerTitle}：
                {invoice?.partner?.name}
            </Col>
            <Col span={8} style={{ ...fontSize }} align='center'>
                日期：{dayjs(invoice?.date).format(DATE_FORMAT)}
            </Col>
            <Col span={8} style={{ ...fontSize }} align='right'>
                <FieldNumberOutlined style={{ marginRight: '4px' }} />
                {invoice?.number}
            </Col>
        </Row>
        {!ifShowPhone ? null : <span style={{ ...fontSize }}>电话：{invoice?.phone}</span>}
        {!ifShowAddress ? null :
            <span style={{ ...fontSize }}>
                {INVOICE_BASICS[type].addressTitle}：
                {invoice?.address}
            </span>
        }
    </Space>
}



export default InvoicePrintHeader