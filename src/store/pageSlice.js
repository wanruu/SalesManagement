import { createSlice } from '@reduxjs/toolkit'


const initPage = () => (
    {
        search: {
            mode: 'simple',
            form: {}
        },
        scrollY: 0
    }
)

const pageSlice = createSlice({
    name: 'page',
    initialState: {
        salesOrder: initPage(),
        purchaseOrder: initPage(),
        salesRefund: initPage(),
        purchaseRefund: initPage(),
        product: initPage(),
        partner: initPage(),
        setting: initPage(),
    },
    reducers: {
        updateSearchForm(state, action) {
            const { pageKey, form } = action.payload
            const curPageDict = {}
            curPageDict[pageKey] = {
                ...state[pageKey],
                search: {
                    ...state[pageKey].search,
                    form: {
                        ...state[pageKey].search.form,
                        ...form
                    }
                }
            }
            return { ...state, ...curPageDict }
        },
        updateSearchMode(state, action) {
            const { pageKey, mode } = action.payload
            const curPageDict = {}
            curPageDict[pageKey] = {
                ...state[pageKey],
                search: {
                    ...state[pageKey].search,
                    mode: mode,
                }
            }
            return { ...state, ...curPageDict }
        },
        updateScrollY(state, action) {
            const { pageKey, scrollY } = action.payload
            const curPageDict = {}
            curPageDict[pageKey] = {
                ...state[pageKey],
                scrollY: scrollY
            }
            return { ...state, ...curPageDict }
        }
    }
})

export default pageSlice.reducer