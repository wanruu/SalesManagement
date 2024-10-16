import { createSlice } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { INVOICE_BASICS } from '../utils/config'
import { emptyInvoice } from '../utils/invoiceUtils'


const draftSlice = createSlice({
    name: 'draft',
    initialState: {
        newTabIndex: 1,
        activeKey: 'main',
        drafts: [], // [{ invoice, editInvoice, type, key, label, createAt, open }]
    },
    reducers: {
        add(state, action) {
            const { type, defaultUnit } = action.payload
            const tabIndex = state.newTabIndex
            const newDraft = {
                editInvoice: type.includes('Order') ? emptyInvoice(1, defaultUnit) : emptyInvoice(0),
                type: type,
                key: tabIndex,
                label: `新建 ${tabIndex}`,
                createAt: dayjs(),
                open: true,
            }
            let newDrafts = state.drafts.slice()
            newDrafts.push(newDraft)
            return {
                ...state,
                newTabIndex: tabIndex + 1,
                activeKey: newDraft.key,
                drafts: newDrafts,
            }
        },
        remove(state, action) {
            const { key } = action.payload
            let newDrafts = state.drafts.slice()
            let newActiveKey = state.activeKey
            const matchedIndex = newDrafts.findIndex(draft => draft.key === key)
            if (matchedIndex !== -1) {
                newDrafts.splice(matchedIndex, 1)
                if (key === newActiveKey) {
                    if (matchedIndex < newDrafts.length) {
                        newActiveKey = newDrafts[matchedIndex].key
                    } else if (newDrafts.length === 0) {
                        newActiveKey = 'main'
                    } else {
                        newActiveKey = newDrafts[matchedIndex-1].key
                    }
                }
            }
            return {
                ...state,
                activeKey: newActiveKey,
                drafts: newDrafts
            }
        },
        hide(state, action) {
            const { key } = action.payload
            let newActiveKey = state.activeKey
            const newDrafts = state.drafts.map(draft => {
                if (draft.key === key) {
                    return { ...draft, open: false }
                }
                return draft
            })
            if (key === newActiveKey) {
                // find last open tab key
                const oldOpenDrafts = state.drafts.filter(d => d.open)
                let lastIndex = -1
                oldOpenDrafts.forEach((draft, i) => {
                    if (draft.key === key) {
                        lastIndex = i - 1
                    }
                })
                // update key
                if (lastIndex >= 0) {
                    newActiveKey = oldOpenDrafts[lastIndex].key
                } else {
                    newActiveKey = 'main'
                }
            }
            return {
                ...state,
                activeKey: newActiveKey,
                drafts: newDrafts
            }
        },
        show(state, action) {
            const { key } = action.payload
            const newDrafts = state.drafts.map(draft => {
                if (draft.key === key) {
                    return { ...draft, open: true }
                }
                return draft
            })
            return {
                ...state,
                activeKey: key,
                drafts: newDrafts
            }
        },
        switchTab(state, action) {
            const { key } = action.payload
            return {
                ...state,
                activeKey: key,
            }
        },
        updateType(state, action) {
            const { type, key, defaultUnit } = action.payload
            const newDrafts = state.drafts.map(draft => {
                if (draft.key === key) {
                    return { 
                        ...draft, 
                        type: type, 
                        editInvoice: type.includes('Order') ? emptyInvoice(1, defaultUnit) : emptyInvoice(0)
                    }
                }
                return draft
            })
            return {
                ...state,
                drafts: newDrafts
            }
        },
        updateInvoice(state, action) {
            const { invoice, key } = action.payload
            const newDrafts = state.drafts.map(draft => {
                if (draft.key === key) {
                    return { 
                        ...draft, 
                        invoice: invoice, 
                        label: `${INVOICE_BASICS[draft.type].label}${invoice.number}`
                    }
                }
                return draft
            })
            return {
                ...state,
                drafts: newDrafts
            }
        },
        updateEditInvoice(state, action) {
            const { values, key } = action.payload
            const newDrafts = state.drafts.map(draft => {
                if (draft.key === key) {
                    return { 
                        ...draft, 
                        editInvoice: values
                    }
                }
                return draft
            })
            return {
                ...state,
                drafts: newDrafts
            }
        },
    }
})


export const { 
    add, remove, hide, show,
    switchTab,
    updateType, updateInvoice, updateEditInvoice
} = draftSlice.actions

export default draftSlice.reducer