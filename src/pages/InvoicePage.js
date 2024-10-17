import React, { useEffect, useState } from 'react'
import { Modal, Button, Space, message } from 'antd'
import { Decimal } from 'decimal.js'
import { ExclamationCircleFilled, ExportOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { invoiceService } from '../services'
import { INVOICE_BASICS } from '../utils/config'
import { MyWorkBook, MyWorkSheet } from '../utils/export'
import { InvoiceTable } from '../components/Table'
import { SearchManager } from '../components/Search'


const { confirm } = Modal


const InvoicePage = ({ type }) => {
    const [invoices, setInvoices] = useState([])
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(undefined)
    const [messageApi, contextHolder] = message.useMessage()

    // redux
    const searchMode = useSelector(state => state.page[type].searchMode)
    const keywords = useSelector(state => state.page[type].keywords)
    const searchForm = useSelector(state => state.page[type].searchForm)
    const dispatch = useDispatch()

    const load = () => {
        const params = searchMode == 'simple' ? { keyword: keywords } : searchForm
        console.log(params)
        invoiceService.fetchMany(type, params).then(response => {
            const newInvoices = response.data.map(invoice => {
                invoice.paid = Decimal(invoice.payment).plus(invoice.prepayment).toNumber()
                invoice.unpaid = Decimal(invoice.amount).minus(invoice.paid).toNumber()
                return invoice
            })
            setInvoices(newInvoices)
        }).catch(err => {
            // TODO
        })
    }

    const showDeleteConfirm = (invoices) => {
        var title
        if (invoices.length === 1) {
            const invoiceNameDict = {
                'salesOrder': '销售清单',
                'purchaseOrder': '采购清单',
                'salesRefund': '销售退货单',
                'purchaseRefund': '采购退货单'
            }
            title = `是否删除${invoiceNameDict[invoices[0].type]} ${invoices[0].number} ?`
        } else {
            title = `是否删除 ${invoices.length} 张清单?`
        }
        confirm({
            title: title, 
            icon: <ExclamationCircleFilled />,
            content: '确认删除后不可撤销，同时仓库中产品的库存会相应恢复。',
            okText: '删除', okType: 'danger', cancelText: '取消',
            onOk() {
                try {
                    invoiceService.deleteMany(invoices).then(responses => {
                        load()
                        messageApi.open({ type: 'success', content: '删除成功' })
                    })
                } catch (err) {
                    messageApi.open({ type: 'error', content: '删除失败' })
                }
            }
        })
    }

    const ifShowDelivered = useSelector(state => state.functionSetting.ifShowDelivered.value)
    const ifShowPayment = useSelector(state => state.functionSetting.ifShowPayment.value)

    // button handler
    const handleExport = () => {
        const headers = [
            { title: '单号', dataIndex: 'id' },
            { title: '客户', dataIndex: 'partner' },
            { title: '日期', dataIndex: 'date' },
            { title: '金额', dataIndex: 'amount' },
            ifShowPayment ? { title: '订金', dataIndex: 'prepayment' } : null,
            ifShowPayment ? { title: '尾款', dataIndex: 'payment' } : null,
            ifShowPayment ? { title: '已付', dataIndex: 'paid' } : null,
            ifShowPayment ? { title: '未付', dataIndex: 'unpaid' } : null,
            ifShowDelivered ? { title: '配送情况', dataIndex: 'delivered' } : null,
            { title: '关联退货单', dataIndex: 'refundId' }
        ].filter(h => h != null)
        let wb = new MyWorkBook(INVOICE_BASICS[type].title ?? '错误')
        let ws = new MyWorkSheet('总览')
        ws.writeJson(invoices, headers)
        wb.writeSheet(ws)
        wb.save()
    }

    // scroll position listener & recover
    const scrollY = useSelector(state => state.page[type]?.scrollY)

    useEffect(() => {
        const handleScroll = () => {
            dispatch({ type: 'page/updateScrollY', menuKey: type, scrollY: window.scrollY })
        }
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [type])

    useEffect(() => window.scrollTo(0, scrollY), [invoices])
    // ------------------------------------


    return <Space className='pageMainContent' direction='vertical' style={{ width: '100%' }}>
        {contextHolder}

        <Space wrap>
            <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
        </Space>
        <SearchManager pageKey={type} onSearch={load} />

        <InvoiceTable type={type} invoices={invoices} 
            onDelete={i => showDeleteConfirm([i])}
            onSelect={setSelectedInvoiceId} />        
    </Space>
}


export default InvoicePage