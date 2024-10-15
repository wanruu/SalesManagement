import React from 'react'
import { Table, Button, Space, Tabs, Segmented } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { InvoiceManager } from '../components/InvoiceManager'
import { INVOICE_BASICS } from '../utils/config'
import { InvoiceTypeTag } from '../components/Tag'


const typeOptions = Object.keys(INVOICE_BASICS).map(key => (
    { value: key, label: INVOICE_BASICS[key].title }
))


const DraftTable = ({ drafts, onEdit, onDelete }) => {
    const columns = [
        { title: '标签', dataIndex: 'label' },
        { title: '类型', dataIndex: 'type', render: type => <InvoiceTypeTag type={type} /> },
        { title: '交易对象', dataIndex: ['editInvoice', 'partnerName'] },
        { title: '创建时间', dataIndex: ['createAt'], render: d => d?.format('HH:mm:ss') },
        { title: '产品数', dataIndex: ['editInvoice', 'invoiceItems'], render: i => i?.length },
        { title: '操作', render: (_, draft, index) => (<Space>
            <Button onClick={_ => onEdit?.(draft)} type='primary' ghost>编辑</Button>
            <Button onClick={_ => onDelete?.(draft)} danger>删除</Button>
        </Space>)}
    ].map(i => ({ ...i, align: 'center' }))

    return <Table dataSource={drafts.filter(d => !d.invoice)} 
        columns={columns} scroll={{ x: 'max-content' }} />
}


const DraftPage = () => {
    const drafts = useSelector(state => state.draft.drafts)
    const activeKey = useSelector(state => state.draft.activeKey)
    const dispatch = useDispatch()

    const handleTabEdit = (targetKey, action) => {
        if (action === 'add') {
            dispatch({ type: 'draft/add', payload: { type: 'salesOrder' } })
        } else {
            if (drafts.find(d => d.key === targetKey)?.invoice?.number) {
                dispatch({ type: 'draft/remove', payload: { key: targetKey } })
            } else {
                dispatch({ type: 'draft/hide', payload: { key: targetKey } })
            }
        }
    }

    const handleTabChange = (newActiveKey) => {
        dispatch({ type: 'draft/switchTab', payload: { key: newActiveKey } })
    }

    const getTabItems = () => {
        const tabs = drafts.filter(d => d.open).map((draft, idx) => {
            const { invoice, editInvoice, type, key, label } = draft
            const children = <>
                { invoice?.number ? null : 
                    <Segmented options={typeOptions} style={{ margin: '15px' }}
                        value={type}
                        onChange={val => {
                            dispatch({ type: 'draft/updateType', payload: { key: key, type: val } })
                        }} 
                    />
                }
                <InvoiceManager type={type} invoice={invoice} editInvoice={editInvoice} mode='edit' 
                    onCancel={_ => {
                        dispatch({ type: 'draft/remove', payload: { key: key } })
                    }}
                    onFormChange={(changedValues, values) => {
                        dispatch({ type: 'draft/updateEditInvoice', payload: { key: key, values: values } })
                    }}
                    onInvoiceChange={invoice => {
                        dispatch({ type: 'draft/updateInvoice', payload: { key: key, invoice: invoice }})
                    }} />
            </>
            return {
                label: label,
                key: key,
                children: children,
            }
        })
        return [initialItem, ...tabs]
    }

    const initialItem = {
        label: '首页',
        children: <>
            草稿箱
            <DraftTable drafts={drafts}
                onEdit={draft => dispatch({ type: 'draft/show', payload: { key: draft.key } })} 
                onDelete={draft => dispatch({ type: 'draft/remove', payload: { key: draft.key } })}
            />
        </>,
        key: 'main',
        closable: false
    }

    return (<div className='pageMainContent'>
        <Tabs type="editable-card"
            onChange={handleTabChange}
            activeKey={activeKey}
            onEdit={handleTabEdit}
            items={getTabItems()}
        />
    </div>)
}


export default DraftPage