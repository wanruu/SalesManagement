import React from 'react'
import { Tabs, Segmented } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { InvoiceManager } from '../components/InvoiceManager'
import { INVOICE_BASICS } from '../utils/config'
import { DraftTable } from '../components/Table'


const typeOptions = Object.keys(INVOICE_BASICS).map(key => (
    { value: key, label: INVOICE_BASICS[key].title }
))


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