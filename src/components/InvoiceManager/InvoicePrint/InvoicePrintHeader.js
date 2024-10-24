import React from 'react'
import dayjs from 'dayjs'
import { Row, Col, Space } from 'antd'
import { FieldNumberOutlined } from '@ant-design/icons'
import { INVOICE_BASICS, DATE_FORMAT } from '../../../utils/invoiceUtils'
import { useSelector } from 'react-redux'
import { Partner, InvoiceType } from '../../../types'



/**
 * @component
 * @param {Object} props 
 * @param {Object} props.invoice
 * @param {InvoiceType} props.invoice.type
 * @param {string} props.invoice.number
 * @param {string} props.invoice.date
 * @param {Partner} props.invoice.partner
 */
const InvoicePrintHeader = (props) => {
    const { invoice } = props
    const { type, number, date, partner={} } = invoice ?? {}

    const settings = useSelector(state => state.printSetting)
    const getSetting = (key) => {
        return settings[key]?.value || settings[key]?.defaultValue
    }

    // Style
    const fontSize = { fontSize: getSetting('headerFontSize') + 'px' }
    const titleFontSize = { fontSize: getSetting('titleFontSize') + 'px' }
    const subtitleFontSize = { fontSize: getSetting('subtitleFontSize') + 'px' }    

    // Display condition
    const ifShowAddress = settings.ifShowAddress.value && partner.address
    const ifShowPhone = settings.ifShowPhone.value && partner.phone
    const ifInline = settings.subtitleStyle.value === 'inline'

    // Content
    const title = getSetting('title').replace(/ /g, '\xa0')
    const subtitle = {
        salesOrder: getSetting('salesOrderSubtitle'),
        salesRefund: getSetting('salesRefundSubtitle'),
        purchaseOrder: getSetting('purchaseOrderSubtitle'),
        purchaseRefund: getSetting('purchaseRefundSubtitle')
    }[type].replace(/ /g, '\xa0') || '错误'

    // Return
    return (
        <Space style={{ width: '100%' }} direction='vertical' size='10px'>
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
                    {partner.name}
                </Col>
                <Col span={8} style={{ ...fontSize }} align='center'>
                    日期：{dayjs(date).format(DATE_FORMAT)}
                </Col>
                <Col span={8} style={{ ...fontSize }} align='right'>
                    <FieldNumberOutlined style={{ marginRight: '4px' }} />
                    {number}
                </Col>
            </Row>
            {!ifShowPhone ? null : <Col align='left' style={{ ...fontSize }}>电话：{partner.phone}</Col>}
            {!ifShowAddress ? null :
                <Col align='left' style={{ ...fontSize }}>
                    {INVOICE_BASICS[type].addressTitle}：
                    {partner.address}
                </Col>
            }
        </Space>
    )
}



export default InvoicePrintHeader