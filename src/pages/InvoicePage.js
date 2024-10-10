import React, { useEffect, useState } from 'react'
import { Modal, Button, Space, message, Tag, Affix, theme } from 'antd'
import { Decimal } from 'decimal.js'
import {
    ExclamationCircleFilled, ExportOutlined,
    DownOutlined, UpOutlined, PlusOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'

const { confirm } = Modal

import invoiceService from '../services/invoiceService'

import { INVOICE_TITLE_OPTIONS, invoiceSettings } from '../utils/config'
import { MyWorkBook, MyWorkSheet } from '../utils/export'
import InvoiceSearchBox from '../components/invoice/SearchBox'
import MyFloatButton from '../components/common/MyFloatButton'
import { emptyInvoice } from '../utils/invoiceUtils'
import InvoiceListView from '../components/invoice/InvoiceListView'
// import { NewInvoiceModal, InvoiceModal } from '../components/Modal'


export default function InvoicePage({ type }) {
    const [invoices, setInvoices] = useState([])
    const [filteredInvoices, setFilteredInvoices] = useState([])
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(undefined)
    const [newInvoice, setNewInvoice] = useState(undefined)

    const [messageApi, contextHolder] = message.useMessage()
    const { token: { colorBgContainer }, } = theme.useToken()
    
    const showSearchBox = useSelector(state => state.page[type]?.showSearchBox)
    const dispatch = useDispatch()
    const [affixed, setAffixed] = useState(false)

    const isOrder = ['salesOrder', 'purchaseOrder'].includes(type)

    const load = () => {
        invoiceService.fetchMany(type).then(response => {
            const newInvoices = response.data.map(invoice => {
                invoice.paid = Decimal(invoice.payment).plus(invoice.prepayment).toNumber()
                invoice.unpaid = Decimal(invoice.amount).minus(invoice.paid).toNumber()
                if (invoice.deliveredItemNum == invoice.totalItemNum)
                    invoice.delivered = '全部配送'
                else if (invoice.deliveredItemNum == 0)
                    invoice.delivered = '未配送'
                else
                    invoice.delivered = '部分配送'
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

    // button handler
    const handleExport = () => {
        const ifShowDelivered = invoiceSettings.get('ifShowDelivered') == 'true'
        const ifShowPayment = invoiceSettings.get('ifShowPayment') === 'true'
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
        const title = INVOICE_TITLE_OPTIONS.filter(o => o.key === type)?.[0]?.label || ''
        let wb = new MyWorkBook(title ? title + '单' : '错误')
        let ws = new MyWorkSheet('总览')
        ws.writeJson(filteredInvoices, headers)
        wb.writeSheet(ws)
        wb.save()
    }

    const handleCreate = () => {
        setNewInvoice(emptyInvoice(isOrder ? 1 : 0))
    }

    const handleSearchToggle = () => {
        dispatch({ type: 'page/toggleShowSearchBox', menuKey: type })
    }

    useEffect(load, [type])


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


    return <Space direction='vertical' style={{ width: '100%' }}>
        {contextHolder}

        {/* <InvoiceModal
            open={selectedInvoiceId}
            id={selectedInvoiceId?.id}
            type={selectedInvoiceId?.type}
            onCancel={_ => setSelectedInvoiceId(undefined)}
            onChange={load}
        />

        <NewInvoiceModal open={newInvoice} onCancel={_ => setNewInvoice(undefined)}
            type={type} invoice={newInvoice} setInvoice={setNewInvoice}
            onSubmit={load} /> */}

        <Affix offsetTop={0} onChange={setAffixed}>
            <Space className={`toolBar-${affixed}`} direction='vertical' style={{ background: colorBgContainer }} size={0}>
                <Space wrap>
                    <Button icon={<PlusOutlined />} onClick={handleCreate}>新增</Button>
                    <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
                    <Button onClick={handleSearchToggle} icon={showSearchBox ? <UpOutlined /> : <DownOutlined />}>
                        {showSearchBox ? '收起搜索' : '展开搜索'}
                    </Button>
                </Space>
                {/* <InvoiceSearchBox data={invoices} setFilteredData={setFilteredInvoices} type={type} /> */}
            </Space>
        </Affix>

        <div className='pageMainContent'>
            <InvoiceListView type={type} invoices={invoices} 
                onDelete={i => showDeleteConfirm([i])}
                onSelect={setSelectedInvoiceId} />
        </div>
        {/* <MyFloatButton type={type} /> */}
    </Space>
}
