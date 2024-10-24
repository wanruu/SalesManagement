import React, { useMemo, useState } from 'react'
import { Space, Table, Tag } from 'antd'
import { useSelector } from 'react-redux'
import Decimal from 'decimal.js'
import { CheckCircleOutlined } from '@ant-design/icons'
import { InvoiceTypeTag } from '../Tag'
import { CircleLabel, QuestionTooltip } from '../utils'
import './table.style.scss'



const { Summary } = Table
const { Cell } = Summary
const pageSize = 10
const crColor = 'red'
const drColor = 'orange'
const debtColHelp = <QuestionTooltip title={
    <div>
        <CircleLabel color={crColor} label='他人欠款' />
        <CircleLabel color={drColor} label='您欠他人款项' />
    </div>
} />




/**
 * Display invoice list of a partner. (order-refund style)
 * @component
 * @param {Object} props
 * @param {Object} props.partner - The partner data.
 * @param {Object[]} props.partner.invoices - An array of invoice objects. (order only)
 * @param {number} props.partner.invoices[].id - The order id.
 * @param {string} props.partner.invoices[].number - The order number.
 * @param {'salesOrder'|'purchaseOrder'} props.partner.invoices[].type - The order type.
 * @param {number} props.partner.invoices[].amount - The order amount.
 * @param {number} [props.partner.invoices[].prepayment] - The prepayment amount.
 * @param {number} [props.partner.invoices[].payment] - The payment amount.
 * @param {Object} [props.partner.invoices[].refund] - The refund object.
 * @param {number} props.partner.invoices[].refund.id - The refund id.
 * @param {string} props.partner.invoices[].refund.number - The refund number.
 * @param {'salesRefund'|'purchaseRefund'} props.partner.invoices[].refund.type - The refund type.
 * @param {number} props.partner.invoices[].refund.amount - The refund amount.
 * @param {number} [props.partner.invoices[].refund.prepayment] - The prepayment amount.
 * @param {number} [props.partner.invoices[].refund.payment] - The payment amount.
 * @param {Function} [props.onSelectInvoice] - Triggered when click on an invoice.
 */
const PartnerInvoiceTable = (props) => {
    const { partner, onSelectInvoice } = props
    const { invoices: orders = [] } = partner

    const [currentPage, setCurrentPage] = useState(1)
    const amountSign = useSelector(state => state.functionSetting.amountSign.value)
    const ifShowPayment = useSelector(state => state.functionSetting.ifShowPayment.value)
    const ifShowRefund = useSelector(state => state.functionSetting.ifShowRefund.value)

    const columns = useMemo(() => [
        { title: '序号', fixed: 'left', render: (_, __, idx) => (currentPage - 1) * pageSize + idx + 1 },
        {
            title: '单号', dataIndex: 'number',
            render: (number, order) =>
                <a onClick={_ => onSelectInvoice?.({
                    id: order.id,
                    number: order.number,
                    type: order.type,
                })}>{number}</a>
        },
        {
            title: <Space>交易金额
                {ifShowRefund ? <QuestionTooltip title='黑色是销售或采购金额，括号里灰色是退货金额（如有）。' /> : null}
            </Space>,
            dataIndex: 'amount',
            render: (amount, order) => {
                const a1 = Decimal(amount).toCurrencyString(amountSign)
                if (!order.refund) return a1
                const a2 = Decimal(order.refund.amount).toCurrencyString(amountSign)
                return <span>{a1} <span style={{ color: 'gray' }}>(-{a2})</span></span>
            },
        },
        ifShowRefund ?
            {
                title: '关联退货单', dataIndex: ['refund', 'number'],
                render: (number, refund) =>
                    number ? <a onClick={_ => onSelectInvoice?.({
                        id: refund.id,
                        type: refund.type
                    })}>{number}</a> : '-'
            } : null,
        {
            title: '净营业额',
            render: (_, order) => {
                const value = new Decimal(order.amount).minus(order.refund?.amount || 0)
                if (value.isZero()) return '-'
                const newValue = order.type === 'salesOrder' ? value : value.neg()
                return `${newValue.toCurrencyString(amountSign)}`
            }
        },
        ifShowPayment ?
            {
                title: <Space>结欠{debtColHelp}</Space>,
                render: (_, order) => {
                    const refund = order.refund
                    const value = new Decimal(order.amount).minus(order.prepayment || 0).minus(order.payment || 0)
                        .minus(refund?.amount || 0).plus(refund?.prepayment || 0).plus(refund?.payment || 0)
                    if (value.isZero()) return <Tag icon={<CheckCircleOutlined />}>已结清</Tag>
                    const style = (order.type === 'salesOrder') ^ value.isPos() ? { color: drColor } : { color: crColor }
                    return <span style={style}>{value.abs().toCurrencyString(amountSign)}</span>
                }
            } : null,
        { title: '类型', dataIndex: 'type', render: t => <InvoiceTypeTag type={t} /> },
    ]
        .filter(c => c != null)
        .map(c => ({ ...c, align: 'center' })), [currentPage, amountSign, ifShowPayment, ifShowRefund])

    const summary = useMemo(() => {
        const refunds = orders.filter(i => i.refund).map(i => i.refund)
        const amount = orders.reduce((prev, order) => {
            const tmp = new Decimal(order.amount).minus(order.refund?.amount || 0)
            if (order.type === 'salesOrder') return prev.plus(tmp)
            return prev.minus(tmp)
        }, new Decimal(0))
        const paid = ifShowPayment ? orders.reduce((prev, order) => {
            const tmp = new Decimal(order.prepayment || 0).plus(order.payment || 0)
                .minus(order.refund?.prepayment || 0).minus(order.refund?.payment || 0)
            if (order.type === 'salesOrder') return prev.plus(tmp)
            return prev.minus(tmp)
        }, new Decimal(0)) : 0
        const debt = amount.minus(paid)
        const debtStyle = debt.isPos() ? { color: crColor } : (debt.isNeg() ? { color: drColor } : {})
        return <Summary fixed>
            <Summary.Row className='my-summary-row'>
                <Cell index={0} align='center' className='my-summary-cell-title'>总计</Cell>
                <Cell index={1} align='center'>{orders.length} 单</Cell>
                <Cell index={2} />
                {
                    ifShowRefund ?
                        <Cell index={3} align='center'>{refunds.length} 单</Cell> : null
                }
                <Cell index={3 + ifShowRefund} align='center'>{amount.toCurrencyString(amountSign)}</Cell>
                {
                    ifShowPayment ?
                        <Cell index={4 + ifShowRefund} align='center'>
                            <span style={debtStyle}>{debt.abs().toCurrencyString(amountSign)}</span>
                        </Cell> : null
                }
                <Cell index={4 + ifShowPayment + ifShowRefund} />
            </Summary.Row>
        </Summary>
    }, [orders, ifShowRefund, amountSign, ifShowPayment])

    return <Table dataSource={orders} columns={columns} bordered
        scroll={{ x: 'max-content' }} rowKey={invoice => invoice.id}
        pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: orders.length,
            onChange: setCurrentPage,
        }}
        summary={_ => summary}
    />
}

export default PartnerInvoiceTable