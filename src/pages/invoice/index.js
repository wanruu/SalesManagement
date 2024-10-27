import React, { useEffect, useMemo, useState } from 'react'
import { Modal, Button, Space, message } from 'antd'
import { Decimal } from 'decimal.js'
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { invoiceService } from '../../services'
import { INVOICE_BASICS, DATE_FORMAT } from '../../utils/invoiceUtils'
import InvoiceTable from './InvoiceTable'
import SearchManager from '../../components/SearchManager'
import { useNavigate } from 'react-router-dom'
import InvoiceManager from '../../components/InvoiceManager'
import { pick, omit } from 'lodash'
import { DeleteConfirm } from '../../components/Modal'



const InvoicePage = ({ type }) => {
    // state
    const [invoices, setInvoices] = useState([])
    const [invoiceToView, setInvoiceToView] = useState(undefined)
    const [invoicesToDelete, setInvoicesToDelete] = useState([])
    const [mode, setMode] = useState('view')
    const deleteConfirmTitle = useMemo(() => {
        const invoiceTitle = INVOICE_BASICS[type]?.title
        if (invoicesToDelete.length === 1) {
            return `是否删除${invoiceTitle} ${invoicesToDelete[0].number} ?`
        } else {
            return `是否删除 ${invoicesToDelete.length} 张${invoiceTitle} ?`
        }
    }, [invoicesToDelete])
    
    // utils
    const [messageApi, contextHolder] = message.useMessage()
    const navigate = useNavigate()

    // redux
    const searchMode = useSelector(state => state.page[type].search.mode)
    const searchForm = useSelector(state => state.page[type].search.form)
    const defaultUnit = useSelector(state => state.functionSetting.defaultUnit.value)
    const dispatch = useDispatch()

    // handler
    const load = () => {
        const params = searchMode == 'simple' ? pick(searchForm, ['keyword']) : {
            ...omit(searchForm, ['keyword']),
            startDate: searchForm.date?.[0]?.format(DATE_FORMAT),
            endDate: searchForm.date?.[1]?.format(DATE_FORMAT),
        }
        invoiceService.fetchMany(type, params).then(res => {
            setInvoices(res.data)
        }).catch(err => {
            setInvoices([])
        })
    }

    const handleCreate = () => {
        dispatch({ type: 'draft/add', payload: { type: type, defaultUnit: defaultUnit } })
        navigate('/')
    }

    const handleDelete = () => {
        const messageKey = 'delete-invoice'
        messageApi.open({ key: messageKey, type: 'loading', content: '删除中', duration: 86400 })
        invoiceService.deleteMany(invoicesToDelete).then(res => {
            messageApi.open({ key: messageKey, type: 'success', content: '删除成功' })
            const ids = invoicesToDelete.map(i => i.id)
            setInvoices(invoices.filter(i => !ids.includes(i.id)))
            setInvoicesToDelete([])
        }).catch(err => {
            messageApi.open({
                key: messageKey, type: 'error', duration: 5,
                content: `删除失败：${err.message}. ${err.response?.data?.error}`,
            })
            setInvoicesToDelete([])
        })
    }

    const handleInvoiceChange = (invoice, id) => {
        // prevent reloading from server
        const idx = invoices.findIndex(i => i.id === id)
        const newInvoices = [...invoices]
        if (idx === -1) {
            newInvoices.unshift(invoice)
        } else {            
            newInvoices[idx] = invoice
        }
        setInvoices(newInvoices)
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
        <Modal title={`${INVOICE_BASICS[invoiceToView?.type]?.title} ${invoiceToView?.number}`}
            open={invoiceToView} onCancel={_ => {
                setInvoiceToView(undefined)
                setMode('view')
            }}
            footer={null} width='90%'>
            <InvoiceManager type={invoiceToView?.type} invoice={invoiceToView} mode={mode}
                onCancel={_ => setInvoiceToView(undefined)}
                onFormChange={_ => {}}
                onInvoiceChange={invoice => handleInvoiceChange(invoice, invoiceToView.id)}
                onModeChange={setMode}
            />
        </Modal>

        <DeleteConfirm open={invoicesToDelete.length > 0} onCancel={_ => setInvoicesToDelete([])}
            title={deleteConfirmTitle} onOk={handleDelete} />

        <Space wrap>
            <Button icon={<PlusOutlined />} onClick={handleCreate} type='primary' ghost>新增</Button>
            <Button icon={<ReloadOutlined />} onClick={_ => {
                setInvoices([])
                load()
            }}>刷新</Button>
        </Space>

        <SearchManager pageKey={type} onSearch={load}
            simpleSearchHelp={`支持单号、${INVOICE_BASICS[type]?.partnerTitle}、日期（文字、拼音及首字母），以空格分开。`} />

        <InvoiceTable type={type} invoices={invoices} 
            onDelete={i => setInvoicesToDelete([i])}
            onSelect={setInvoiceToView} />        
    </Space>
}


export default InvoicePage