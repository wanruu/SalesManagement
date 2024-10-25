import React, { useMemo } from 'react'
import { Col, Row } from 'antd'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { DATE_FORMAT, INVOICE_BASICS } from '../../../utils/invoiceUtils'
import { useSelector } from 'react-redux'
import { BaseInvoice } from '../../../types'



/**
 * @component
 * @param {Object} props 
 * @param {BaseInvoice & {order?: BaseInvoice, refund?: BaseInvoice}} props.invoice
 */
const InvoiceViewHeader = (props) => {
    const { invoice } = props
    const { type, prepayment = 0, payment = 0, amount = 0 } = invoice ?? {}

    // redux
    const amountSign = useSelector(state => state.functionSetting.amountSign.value)
    const ifShowPayment = useSelector(state => state.functionSetting.ifShowPayment.value)

    // View
    const colSpan = { xs: 24, sm: 12, md: 8 }

    const paidItem = useMemo(() => {
        const value = Decimal(prepayment).plus(payment).toCurrencyString(amountSign)
        const note = `（订金：${prepayment.toLocaleString()}，尾款：${payment.toLocaleString()}）`
        const text = prepayment == 0 ? value : (value + note)
        return `已付：${text}`
    }, [prepayment, payment, amountSign])

    const unpaidItem = useMemo(() => {
        const value = Decimal(amount).minus(prepayment).minus(payment)
        return (
            <>未付：
                <span style={{ color: value.isZero() ? 'black' : 'red' }}>
                    {value.toCurrencyString(amountSign)}
                </span>
            </>
        )
    }, [amount, prepayment, payment, amountSign])

    return (
        <Row justify='start' gutter={[8, 8]}>
            <Col {...colSpan}>
                {INVOICE_BASICS[type]?.partnerTitle}：
                {invoice.partnerName}
            </Col>
            <Col {...colSpan}>
                日期：{dayjs(invoice.date).format(DATE_FORMAT)}
            </Col>
            <Col {...colSpan}>
                {INVOICE_BASICS[type]?.relatedInvoiceTitle}：
                {type?.includes('Refund') ? (invoice.order?.number ?? '无') : (invoice.refund?.number ?? '无')}
            </Col>
            <Col {...colSpan}>
                总金额：{Decimal(amount).toCurrencyString(amountSign)}
            </Col>
            {
                !ifShowPayment ? null : <>
                    <Col {...colSpan}>{paidItem}</Col>
                    <Col {...colSpan}>{unpaidItem}</Col>
                </>
            }
        </Row>
    )
}


export default InvoiceViewHeader