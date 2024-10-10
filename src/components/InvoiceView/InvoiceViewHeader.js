import React, { useMemo } from 'react'
import { Col, Row, Space } from 'antd'
// import _ from 'lodash'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { invoiceSettings, DATE_FORMAT, INVOICE_BASICS } from '../../utils/config'
// import PartnerPopoverView from '../partner/PartnerPopoverView'



/*
    Required: type, invoice (refund的话items需要过滤quantity不为null)
    Optional: allowEditPartner (false by default), refresh (required if allowEditPartner=true)
*/
const InvoiceViewHeader = ({ type, invoice, allowEditPartner }) => {
    const isRefund = ['salesRefund', 'purchaseRefund'].includes(type)
    const amountSign = invoiceSettings.get('ifShowAmountSign') === 'true' ? invoiceSettings.get('amountSign') : ''
    const ifShowPayment = invoiceSettings.get('ifShowPayment') === 'true'
    const paidText = useMemo(() => {
        const paid = Decimal(invoice?.prepayment||0).plus(invoice?.payment||0).toNumber()
        const total = `${amountSign + paid.toLocaleString()}`
        if (invoice?.prepayment == 0) {
            return total
        }
        return total + 
        `（订金：${(invoice?.prepayment||0).toLocaleString()}，尾款：${(invoice?.payment||0).toLocaleString()}）`
    }, [invoice])
    const unpaidText = useMemo(() => {
        const unpaid = Decimal(invoice?.amount||0).minus(invoice?.prepayment||0).minus(invoice?.payment||0).toNumber()
        return <span style={{ color: unpaid === 0 ? 'black' : 'red' }}>
            {amountSign + unpaid.toLocaleString()}
        </span>
    }, [invoice])

    return <Space direction='vertical' style={{ width: '100%', marginTop: '10px', marginBottom: '15px' }}>
        <Row>
            <Col span={8}>
                { INVOICE_BASICS[type].partnerTitle }：
                { invoice?.partner?.name }
            </Col>
            <Col span={8}>
                日期：
                { dayjs(invoice?.date).format(DATE_FORMAT) }
            </Col>
            <Col span={8}>
                { INVOICE_BASICS[type].relatedInvoiceTitle }：
                { isRefund ? (invoice?.refund?.number ?? '无') : (invoice?.order?.number ?? '无') }
            </Col>
        </Row>
        <Row>
            <Col span={8}>
                总金额：
                { amountSign + (invoice?.amount||0).toLocaleString() }
            </Col>
            {
                !ifShowPayment ? null : <>
                    <Col span={8}>已付：{ paidText }</Col>
                    <Col span={8}>未付：{ unpaidText }</Col>
                </>
            }
        </Row>
    </Space>
}

{/* {TODO
    allowEditPartner === true ?
        <PartnerPopoverView refresh={refresh}
            partner={_.fromPairs(['name', 'folder', 'phone', 'address'].map(key => [key, invoice.partner[key]]))} />
        : invoice.partner.name
} */}


export default InvoiceViewHeader