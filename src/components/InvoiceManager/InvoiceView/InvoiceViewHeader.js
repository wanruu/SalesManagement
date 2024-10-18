import React, { useMemo } from 'react'
import { Col, Row, Space } from 'antd'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { DATE_FORMAT, INVOICE_BASICS } from '../../../utils/invoiceUtils'
import { useSelector } from 'react-redux'



/*
    Required: type, invoice
    Optional: allowEditPartner (false by default)
*/
const InvoiceViewHeader = ({ type, invoice, allowEditPartner }) => {
    const amountSign = useSelector(state => state.functionSetting.amountSign.value)
    const ifShowPayment = useSelector(state => state.functionSetting.ifShowPayment.value)

    const isRefund = ['salesRefund', 'purchaseRefund'].includes(type)
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

    return <Row justify='start' gutter={[8,8]}>
        <Col xs={12} sm={12} md={8}>
            { INVOICE_BASICS[type].partnerTitle }：
            { invoice?.partner?.name }
        </Col>
        <Col xs={12} sm={12} md={8}>
            日期：
            { dayjs(invoice?.date).format(DATE_FORMAT) }
        </Col>
        <Col xs={24} sm={12} md={8}>
            { INVOICE_BASICS[type].relatedInvoiceTitle }：
            { isRefund ? (invoice?.order?.number ?? '无') : (invoice?.refund?.number ?? '无') }
        </Col>
        <Col xs={8} sm={12} md={8}>
            总金额：
            { amountSign + (invoice?.amount||0).toLocaleString() }
        </Col>
        {
            !ifShowPayment ? null : <>
                <Col xs={8} sm={12} md={8}>已付：{ paidText }</Col>
                <Col xs={8} sm={12} md={8}>未付：{ unpaidText }</Col>
            </>
        }
    </Row>
}

{/* {TODO
    allowEditPartner === true ?
        <PartnerPopoverView refresh={refresh}
            partner={_.fromPairs(['name', 'folder', 'phone', 'address'].map(key => [key, invoice.partner[key]]))} />
        : invoice.partner.name
} */}


export default InvoiceViewHeader