import React, { useMemo, useState } from 'react'
import { Table, Space } from 'antd'
import { useSelector } from 'react-redux'
import Decimal from 'decimal.js'
import { QuestionTooltip } from '../utils'


const { Summary } = Table
const { Cell } = Summary
const pageSize = 10


/**
 * @typedef {Object} InvoiceItem
 * @property {Object} product
 * @property {number} product.id
 * @property {string} [product.material]
 * @property {string} product.name
 * @property {string} product.spec
 * @property {string} product.unit
 * @property {number} quantity
 * @property {number} amount
 */


/**
 * Display product list of a partner.
 * @component
 * @param {Object} props 
 * @param {Object} props.partner - The partner data.
 * @param {Object[]} props.partner.invoices - The list of orders of the partner.
 * @param {'salesOrder'|'purchaseOrder'} props.partner.invoices[].type
 * @param {InvoiceItem[]} props.partner.invoices[].invoiceItems
 * @param {Object} [props.partner.invoices[].refund]
 * @param {'salesRefund'|'purchaseRefund'} props.partner.invoices[].refund.type
 * @param {InvoiceItem[]} props.partner.invoices[].refund.invoiceItems
 */
const PartnerProductTable = (props) => {
    const { partner } = props
    const { invoices: orders = [] } = partner

    const ifShowMaterial = useSelector(state => state.functionSetting.ifShowMaterial.value)
    const amountSign = useSelector(state => state.functionSetting.amountSign.value)
    const [curPage, setCurPage] = useState(1)

    const products = useMemo(() => {
        const pDict = orders.reduce((acc, order) => {
            order.invoiceItems.forEach(item => {
                const quantity = order.type === 'salesOrder' ? -item.quantity : item.quantity
                const amount = order.type === 'salesOrder' ? item.amount : -item.amount
                if (acc.hasOwnProperty(item.product.id)) {
                    acc[item.product.id].quantity = acc[item.product.id].quantity.plus(quantity)
                    acc[item.product.id].amount = acc[item.product.id].amount.plus(amount)
                } else {
                    acc[item.product.id] = {
                        ...item.product,
                        quantity: new Decimal(quantity),
                        amount: new Decimal(amount),
                    }
                }
            })
            const refundItems = order.refund?.invoiceItems ?? []
            refundItems.forEach(item => {
                const quantity = order.type === 'salesOrder' ? item.quantity : -item.quantity
                const amount = order.type === 'salesOrder' ? -item.amount : item.amount
                if (acc.hasOwnProperty(item.product.id)) {
                    acc[item.product.id].quantity = acc[item.product.id].quantity.plus(quantity)
                    acc[item.product.id].amount = acc[item.product.id].amount.plus(amount)
                } else {
                    acc[item.product.id] = {
                        ...item.product,
                        quantity: new Decimal(quantity),
                        amount: new Decimal(amount),
                    }
                }
            })
            return acc
        }, {})
        return Object.values(pDict)
    }, [orders])

    const columns = useMemo(() => {
        return [
            { title: '序号', fixed: 'left', render: (_, __, idx) => (curPage - 1) * pageSize + idx + 1 },
            ifShowMaterial ? { title: '材质', dataIndex: 'material' } : null,
            { title: '名称', dataIndex: 'name' },
            { title: '规格', dataIndex: 'spec' },
            { title: '单位', dataIndex: 'unit' },
            { title: '库存变化', dataIndex: 'quantity', render: q => q.toLocaleString() },
            {
                title: <Space>营业额<QuestionTooltip title='正数代表收入' /></Space>,
                dataIndex: 'amount',
                render: a => a.toCurrencyString(amountSign)
            },
        ]
            .filter(c => c)
            .map(c => ({ ...c, align: 'center' }))
    }, [ifShowMaterial, amountSign, curPage])

    const summary = useMemo(() => {
        const totalAmount = products.reduce((acc, p) => acc.plus(p.amount), new Decimal(0))
        return <Summary fixed>
            <Summary.Row className='my-summary-row'>
                <Cell index={0} align='center' className='my-summary-cell-title'>合计</Cell>
                <Cell index={1} colSpan={ifShowMaterial + 3}>{products.length} 项</Cell>
                <Cell index={ifShowMaterial + 4} align='center' />
                <Cell index={ifShowMaterial + 5} align='center'>{totalAmount.toCurrencyString(amountSign)}</Cell>
            </Summary.Row>
        </Summary>
    }, [products, ifShowMaterial, amountSign])

    return <Table columns={columns} dataSource={products}
        scroll={{ x: 'max-content' }}
        summary={_ => summary}
        pagination={{
            current: curPage,
            total: products.length,
            pageSize: pageSize,
            onChange: setCurPage,
            showQuickJumper: true
        }} />
}



export default PartnerProductTable