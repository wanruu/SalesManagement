import React, { useEffect, useMemo, useState } from 'react'
import { Table } from 'antd'
import _ from 'lodash'
import { InvoiceTypeTag } from '../Tag'
import { useSelector } from 'react-redux'
import Decimal from 'decimal.js'
import './table.style.scss'


const { Summary } = Table
const { Cell } = Summary
const pageSize = 10


/**
 * @typedef {Object} InvoiceItem
 * @property {number} invoiceId
 * @property {Object} product
 * @property {number} product.id
 * @property {string} [product.material]
 * @property {string} product.name
 * @property {string} product.spec
 * @property {string} product.unit
 * @property {number} price
 * @property {number} quantity
 * @property {number} originalAmount
 * @property {number} discount
 * @property {number} amount
 */



/**
 * Display invoice details of a partner. (order-refund style)
 * @component
 * @param {Object} props
 * @param {Object} props.partner
 * @param {Object[]} props.partner.invoices
 * @param {'salesOrder'|'purchaseOrder'} props.partner.invoices[].type
 * @param {string} props.partner.invoices[].number
 * @param {InvoiceItem[]} props.partner.invoices[].invoiceItems
 * @param {Object} [props.partner.invoices[].refund]
 * @param {'salesRefund'|'purchaseRefund'} props.partner.invoices[].refund.type
 * @param {string} props.partner.invoices[].refund.number
 * @param {InvoiceItem[]} props.partner.invoices[].refund.invoiceItems
 * @param {Function} [props.onSelectInvoice] - Triggered when an invoice is selected.
 */
const PartnerInvoiceItemTable = (props) => {
    const { partner, onSelectInvoice } = props
    const { invoices: orders = [] } = partner

    const [curPage, setCurPage] = useState(1)
    const amountSign = useSelector(state => state.functionSetting.amountSign.value)
    const ifShowDiscount = useSelector(state => state.functionSetting.ifShowDiscount.value)
    const ifShowRefund = useSelector(state => state.functionSetting.ifShowRefund.value)
    useEffect(() => setCurPage(1), [orders])

    const items = useMemo(() => {
        const combinedItems = orders.map(invoice => {
            const { number: orderNumber, type: orderType, invoiceItems: orderItems = [], refund } = invoice
            const { number: refundNumber, type: refundType, invoiceItems: refundItems = [] } = refund ?? {}
            const orderBasic = { orderNumber: orderNumber, orderType: orderType }
            const refundBasic = { refundNumber: refundNumber, refundType: refundType }
            // merge
            const refundItemFlags = {}
            const leftJoinItems = orderItems.map(orderItem => {
                const refundItemIndex = refundItems.findIndex((refundItem, idx) => {
                    return refundItem.product.id === orderItem.product.id && refundItem.price === orderItem.price
                        && refundItem.discount === orderItem.discount && !refundItemFlags.hasOwnProperty(idx)
                })
                if (refundItemIndex > -1) {
                    refundItemFlags[refundItemIndex] = true
                }
                return {
                    orderItem: { ...orderItem, ...orderBasic },
                    refundItem: { ...refundItems[refundItemIndex] ?? {}, ...refundBasic },
                }
            })
            const missingRefundItems = refundItems
                .filter((_, index) => !refundItemFlags.hasOwnProperty(index))
                .map(item => ({ orderItem: orderBasic, refundItem: { ...item, ...refundBasic } }))
            const merged = [...leftJoinItems, ...missingRefundItems]
            return merged
        })
        const flatItems = combinedItems.reduce((acc, items) => [...acc, ...items], [])
        return flatItems
    }, [orders])


    /**
     * @type {number[]}
     */
    const rowSpans = useMemo(() => {
        const curPageOrderItems = items.slice(pageSize * (curPage - 1), pageSize * curPage).map(r => r.orderItem)
        const spans = new Array(curPageOrderItems.length).fill(1)
        for (let i = curPageOrderItems.length - 1; i > 0; i--) {
            if (curPageOrderItems[i].orderNumber === curPageOrderItems[i - 1].orderNumber) {
                spans[i - 1] += spans[i]
                spans[i] = 0
            }
        }
        return spans
    }, [items, pageSize, curPage])


    const columns = useMemo(() => [
        {
            title: '序号',
            fixed: 'left',
            render: (_, __, idx) => (curPage - 1) * pageSize + idx + 1
        },
        {
            title: '单号',
            dataIndex: ['orderItem', 'orderNumber'],
            onCell: (_, idx) => ({ rowSpan: rowSpans[idx] ?? 1 }),
            render: (number, record) =>
                <a onClick={_ => onSelectInvoice?.({ id: record.orderItem.invoiceId, type: record.orderItem.invoiceType })}>
                    {number}
                </a>
        },
        {
            title: '产品信息',
            children: [
                {
                    title: '材质',
                    dataIndex: ['orderItem', 'product', 'material'],
                    render: (material, record) => material ?? record.refundItem?.product?.material
                },
                {
                    title: '名称',
                    dataIndex: ['orderItem', 'product', 'name'],
                    render: (name, record) => name ?? record.refundItem?.product?.name
                },
                {
                    title: '规格',
                    dataIndex: ['orderItem', 'product', 'spec'],
                    render: (spec, record) => spec ?? record.refundItem?.product?.spec
                },
                {
                    title: '单位',
                    dataIndex: ['orderItem', 'product', 'unit'],
                    render: (unit, record) => unit ?? record.refundItem?.product?.unit
                },
                {
                    title: '单价',
                    dataIndex: ['orderItem', 'price'],
                    render: (p, record) => Decimal(p ?? record.refundItem?.price).toCurrencyString(amountSign),
                },
                ifShowDiscount ? {
                    title: '折扣',
                    dataIndex: ['orderItem', 'discount'],
                    render: (d, record) => d == undefined ? `${record.refundItem?.discount}%` : `${d}%`
                } : null,
            ].filter(c => c).map(c => ({ ...c, align: 'center' }))
        },
        {
            title: '数量',
            dataIndex: ['orderItem', 'quantity'],
            render: q => q ?? '-'.toLocaleString()
        },
        ifShowDiscount ? {
            title: '金额',
            dataIndex: ['orderItem', 'originalAmount'],
            render: a => a == undefined ? '-' : Decimal(a).toCurrencyString(amountSign),
        } : null,
        {
            title: ifShowDiscount ? '折后价' : '金额',
            dataIndex: ['orderItem', 'amount'],
            render: a => a == undefined ? '-' : Decimal(a).toCurrencyString(amountSign),
        },
        ifShowRefund ? {
            title: '关联退货单',
            dataIndex: ['refundItem', 'refundNumber'],
            onCell: (_, idx) => ({ rowSpan: rowSpans[idx] ?? 1 }),
            render: (number, record) => number ?
                <a onClick={_ => onSelectInvoice?.({ id: record.refundItem.invoiceId, type: record.refundItem.invoiceType })}>
                    {number}
                </a> : '-'
        } : null,
        ifShowRefund ? {
            title: '数量',
            dataIndex: ['refundItem', 'quantity'],
            render: q => q ?? '-'.toLocaleString()
        } : null,
        ifShowDiscount ? {
            title: '金额',
            dataIndex: ['refundItem', 'originalAmount'],
            render: a => a == undefined ? '-' : Decimal(a).toCurrencyString(amountSign),
        } : null,
        ifShowRefund ? {
            title: ifShowDiscount ? '折后价' : '金额',
            dataIndex: ['refundItem', 'amount'],
            render: a => a == undefined ? '-' : Decimal(a).toCurrencyString(amountSign),
        } : null,
        {
            title: '类型',
            fixed: 'right',
            dataIndex: ['orderItem', 'orderType'],
            render: (type) => <InvoiceTypeTag type={type} />,
            onCell: (_, idx) => ({ rowSpan: rowSpans[idx] ?? 1 }),
        }
    ].filter(c => c).map(c => ({ ...c, align: 'center' })),
        [rowSpans, ifShowDiscount, amountSign, ifShowRefund])

    const summary = useMemo(() => {
        const refundsNum = orders.reduce((acc, cur) => acc + (cur.refund ? 1 : 0), 0)
        const orderOriginalAmount = items.reduce((acc, cur) => acc.plus(cur.orderItem?.originalAmount ?? 0), new Decimal(0))
        const orderAmount = items.reduce((acc, cur) => acc.plus(cur.orderItem?.amount ?? 0), new Decimal(0))
        const refundOriginalAmount = items.reduce((acc, cur) => acc.plus(cur.refundItem?.originalAmount ?? 0), new Decimal(0))
        const refundAmount = items.reduce((acc, cur) => acc.plus(cur.refundItem?.amount ?? 0), new Decimal(0))

        const productSpan = columns.find(c => c.title == '产品信息').children.length
        const lastCellIndex = columns.length + productSpan - 2
        const discountOffset = ifShowDiscount ? 1 : 0

        return <Summary fixed>
            <Summary.Row className='my-summary-row'>
                <Cell index={0} className='my-summary-cell-title'>总计</Cell>
                <Cell index={1} align='center'>{orders.length} 单</Cell>
                <Cell index={2} align='center' colSpan={productSpan}>{items.length} 项</Cell>
                <Cell index={2 + productSpan} />
                {ifShowDiscount ?
                    <Cell index={3 + productSpan}>{orderOriginalAmount.toCurrencyString(amountSign)}</Cell> : null
                }
                <Cell index={2 + productSpan + discountOffset}>{orderAmount.toCurrencyString(amountSign)}</Cell>
                {!ifShowRefund ? null :
                    <>
                        <Cell index={3 + productSpan + discountOffset} align='center'>{refundsNum} 单</Cell>
                        <Cell index={4 + productSpan + discountOffset} />
                        {ifShowDiscount ?
                            <Cell index={5 + productSpan + discountOffset}>{refundOriginalAmount.toCurrencyString(amountSign)}</Cell> : null
                        }
                        <Cell index={4 + productSpan + discountOffset * 2}>{refundAmount.toCurrencyString(amountSign)}</Cell>
                    </>
                }
                <Cell index={lastCellIndex} />
            </Summary.Row>
        </Summary>
    }, [items, ifShowDiscount, amountSign, ifShowRefund])

    return <Table dataSource={items} columns={columns}
        scroll={{ x: 'max-content' }} bordered
        pagination={{
            current: curPage,
            pageSize: pageSize,
            total: items.length,
            onChange: setCurPage,
            showQuickJumper: true,
        }}
        summary={_ => summary} />
}


export default PartnerInvoiceItemTable