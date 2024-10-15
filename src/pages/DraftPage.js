import React, { useState, useRef } from 'react'
import { Table, Modal, Button, FloatButton, Space, Popover, Tabs, Segmented } from 'antd'
import { PlusOutlined, InboxOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { InvoiceManager } from '../components/InvoiceManager'
import { emptyInvoice } from '../utils/invoiceUtils'
import { INVOICE_BASICS } from '../utils/config'


const initialItem = {
    label: '首页',
    children: 'test',
    key: 'main',
    closable: false
}


const typeOptions = Object.keys(INVOICE_BASICS).map(key => (
    { value: key, label: INVOICE_BASICS[key].title }
))

const DraftPage = () => {
    const [invoices, setInvoices] = useState([])
    const [tabKeys, setTabKeys] = useState([])
    const [activeTabKey, setActiveTabKey] = useState('main')
    const newTabIndex = useRef(0)

    const add = () => {
        const newActiveKey = `newTab${newTabIndex.current++}`
        const newTabKeys = [...tabKeys]
        newTabKeys.push(newActiveKey)
        setTabKeys(newTabKeys)

        const newInvoices = [...invoices]
        newInvoices.push(emptyInvoice(1, 'salesOrder'))
        setInvoices(newInvoices)
    
        setActiveTabKey(newActiveKey)
    }

    const remove = (targetKey) => {
        let newActiveKey = activeTabKey
        let lastIndex = -1
        tabKeys.forEach((item, i) => {
            if (item === targetKey) {
                lastIndex = i - 1
            }
        })
        const newTabKeys = tabKeys.filter((item) => item !== targetKey);
        if (newTabKeys.length && newActiveKey === targetKey) {
            if (lastIndex >= 0) {
                newActiveKey = newTabKeys[lastIndex]
            } else {
                newActiveKey = newTabKeys[0]
            }
        } else if (newTabKeys.length == 0) {
            newActiveKey = 'main'
        }
        const newInvoice = [...invoices]
        newInvoice.splice(lastIndex, 1)
        setInvoices(newInvoice)
        setTabKeys(newTabKeys)
        setActiveTabKey(newActiveKey)
    }

    const onEdit = (targetKey, action) => {
        if (action === 'add') {
            add()
        } else {
            remove(targetKey)
        }
    }

    const getTabItems = () => {
        const tabs = invoices.map((invoice, idx) => ({
            label: invoice.number ? `${INVOICE_BASICS[invoice.type].label}${invoice.number}` : '新建',
            key: tabKeys[idx],
            children: <>
                { invoice.number ? null : 
                    <Segmented options={typeOptions} style={{ margin: '15px' }}
                        value={invoice.type} onChange={val => {
                            const newInvoices = [...invoices]
                            newInvoices[idx].type = val
                            setInvoices(newInvoices)
                        }} /> 
                }
                <InvoiceManager type={invoice.type} initInvoice={invoice} initMode='edit' 
                    onCancel={_ => remove(tabKeys[idx])} 
                    onInvoiceChange={invoice => {
                        const newInvoices = [...invoices]
                        newInvoices[idx] = invoice
                        setInvoices(newInvoices)
                    }} />
            </>
        }))
        return [initialItem, ...tabs]
    }

    return (<div className='pageMainContent'>
        <Tabs type="editable-card"
            onChange={newActiveKey => setActiveTabKey(newActiveKey)}
            activeKey={activeTabKey}
            onEdit={onEdit}
            items={getTabItems()}
        />
    </div>)
}


export default DraftPage