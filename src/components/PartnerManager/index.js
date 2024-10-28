import { Col, message, Row, Space, Tabs } from 'antd'
import React, { useEffect, useState } from 'react'
import { partnerService } from '@/services'
import PartnerInvoiceItemTable from './PartnerInvoiceItemTable'
import PartnerInvoiceTable from './PartnerInvoiceTable'
import PartnerProductTable from './PartnerProductTable'
import { EditableItem } from '../Input'
import { pick, isEqual } from 'lodash'
import { InvoiceManagerModal } from '../InvoiceManager'



/**
 * @component
 * @param {Object} props
 * @param {Object} props.partner
 * @param {string} props.partner.name
 * @param {Function} [props.onPartnerChange]
 */
const PartnerManager = (props) => {
    const { partner: initPartner, onPartnerChange } = props
    const { name: partnerName } = initPartner

    const [partner, setPartner] = useState({})
    const [tabKey, setTabKey] = useState(0)
    const [invoiceToView, setInvoiceToView] = useState(undefined)

    const load = () => {
        if (partnerName) {
            partnerService.fetch(partnerName).then(res => {
                setPartner(res.data)
            }).catch(err => {
                setPartner({})
            })
        }
    }

    const handlePartnerChange = (newPartner) => {
        onPartnerChange(newPartner)
        setPartner({ ...partner, ...newPartner })
    }

    const afterInvoiceDelete = (invoice) => {
        const newInvoices = partner.invoices.filter(i => i.id !== invoice.id)
        const newPartner = { ...partner, invoices: newInvoices }
        if (invoice.type.includes('sales')) {
            newPartner.salesNum -= 1
        } else {
            newPartner.purchaseNum -= 1
        }
        setPartner(newPartner)
        setInvoiceToView(undefined)
    }


    useEffect(load, [partnerName])

    const tabItems = [
        {
            label: '总览',
            key: 0,
            children: <PartnerInvoiceTable partner={partner} onSelectInvoice={setInvoiceToView} />,
        },
        {
            label: '明细',
            key: 1,
            children: <PartnerInvoiceItemTable partner={partner} onSelectInvoice={setInvoiceToView} />,
        },
        {
            label: '产品',
            key: 2,
            children: <PartnerProductTable partner={partner} />,
        },
    ]

    return <Space direction='vertical' style={{ width: '100%', paddingTop: '5px' }} size={15}>
        <InvoiceManagerModal open={invoiceToView} invoice={invoiceToView}
            onCancel={() => setInvoiceToView(undefined)}
            onSave={load}  // TODO: prevent reloading
            onDelete={afterInvoiceDelete}
        />

        <PartnerInfo partner={partner} onPartnerChange={handlePartnerChange} />
        <Tabs defaultActiveKey='1'
            onChange={setTabKey}
            activeKey={tabKey}
            items={tabItems} />
    </Space>
}


const PartnerInfo = (props) => {
    const { partner, onPartnerChange } = props

    const items = [
        { key: 'name', label: '姓名', name: 'name', },
        { key: 'folder', label: '文件夹', name: 'folder' },
        { key: 'phone', label: '电话', name: 'phone' },
        { key: 'address', label: '地址', name: 'address' },
    ]

    const handleSave = (values) => {
        const fieldnames = ['name', 'phone', 'address', 'folder']
        const newPartner = pick(values, fieldnames)
        if (!isEqual(newPartner, pick(partner, fieldnames))) {
            const messageKey = 'update-partner'
            message.open({
                type: 'loading', duration: 86400,
                content: '保存中', key: messageKey
            })
            partnerService.update(partner.name, newPartner).then(res => {
                onPartnerChange(res.data)
                message.open({ type: 'success', content: '保存成功', key: messageKey })
            }).catch(err => {
                message.open({
                    type: 'error', duration: 5, key: messageKey,
                    content: `保存失败：${err.message}. ${err.response?.data?.error}`,
                })
            })
        }
    }

    return (
        <Row gutter={[8, 2]} justify='start'>
            {items.map(item => (
                <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
                    <EditableItem record={partner} dataIndex={item.name} label={item.label}
                        handleSave={handleSave} rules={item.rules} />
                </Col>
            ))}
        </Row>
    )
}

export default PartnerManager