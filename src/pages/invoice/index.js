import React, { useEffect, useState } from 'react'
import { Modal, Button, Space, message } from 'antd'
import { Decimal } from 'decimal.js'
import { ExclamationCircleFilled, ExportOutlined, PlusOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { invoiceService } from '../../services'
import { INVOICE_BASICS, DATE_FORMAT } from '../../utils/invoiceUtils'
import { MyWorkBook, MyWorkSheet } from '../../utils/export'
import InvoiceTable from './InvoiceTable'
import SearchManager from '../../components/SearchManager'
import { useNavigate } from 'react-router-dom'
import InvoiceManager from '../../components/InvoiceManager'
import { pick, omit } from 'lodash'


const InvoicePage = ({ type }) => {
    const [invoices, setInvoices] = useState([])
    const [selectedInvoice, setSelectedInvoice] = useState(undefined)
    const [mode, setMode] = useState('view')
    const [messageApi, contextHolder] = message.useMessage()
    const navigate = useNavigate()

    // redux
    const searchMode = useSelector(state => state.page[type].search.mode)
    const searchForm = useSelector(state => state.page[type].search.form)
    const ifShowDelivered = useSelector(state => state.functionSetting.ifShowDelivered.value)
    const ifShowPayment = useSelector(state => state.functionSetting.ifShowPayment.value)
    const defaultUnit = useSelector(state => state.functionSetting.defaultUnit.value)
    const dispatch = useDispatch()

    const load = () => {
        const params = searchMode == 'simple' ? pick(searchForm, ['keyword']) : {
            ...omit(searchForm, ['keyword']),
            startDate: searchForm.date?.[0]?.format(DATE_FORMAT),
            endDate: searchForm.date?.[1]?.format(DATE_FORMAT),
        }
        invoiceService.fetchMany(type, params).then(response => {
            const newInvoices = response.data.map(invoice => {
                invoice.paid = Decimal(invoice.payment).plus(invoice.prepayment).toNumber()
                invoice.unpaid = Decimal(invoice.amount).minus(invoice.paid).toNumber()
                return invoice
            })
            setInvoices(newInvoices)
        }).catch(err => {
            setInvoices([])
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
        Modal.confirm({
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

    const handleCreate = () => {
        dispatch({ type: 'draft/add', payload: { type: type, defaultUnit: defaultUnit } })
        navigate('/')
    }

    // scroll position listener & recover
    const scrollY = useSelector(state => state.page[type]?.scrollY)

    useEffect(() => {
        const handleScroll = () => {
            dispatch({ type: 'page/updateScrollY', payload: { pageKey: type, scrollY: window.scrollY } })
        }
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [type])

    useEffect(() => window.scrollTo(0, scrollY), [invoices])
    // ------------------------------------


    return <Space className='page-main-content' direction='vertical' style={{ width: '100%' }}>
        {contextHolder}
        <Modal title={`${INVOICE_BASICS[selectedInvoice?.type]?.title} ${selectedInvoice?.number}`}
            open={selectedInvoice} onCancel={_ => {
                setSelectedInvoice(undefined)
                setMode('view')
            }}
            footer={null} width='90%'>
            <InvoiceManager type={selectedInvoice?.type} invoice={selectedInvoice} mode={mode}
                onCancel={_ => setSelectedInvoice(undefined)}
                onFormChange={_ => {}}
                onInvoiceChange={_ => load()}
                onModeChange={setMode}
            />
        </Modal>

        <Space wrap>
            <Button icon={<PlusOutlined />} onClick={handleCreate}>新增</Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
        </Space>
        <SearchManager pageKey={type} onSearch={load}
            simpleSearchHelp={`支持单号、${INVOICE_BASICS[type]?.partnerTitle}、日期（文字、拼音及首字母），以空格分开。`} />

        <InvoiceTable type={type} invoices={invoices} 
            onDelete={i => showDeleteConfirm([i])}
            onSelect={setSelectedInvoice} />        
    </Space>
}


export default InvoicePage