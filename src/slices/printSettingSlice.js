import { createSlice } from '@reduxjs/toolkit'


const SLICE_NAME = 'printSetting'


const DEFAULT_SETTINGS = {
    // size
    width: { value: null, defaultValue: 772 },
    height: { value: null, defaultValue: 493 },
    hPadding: { value: null, defaultValue: 28 },
    vPadding: { value: null, defaultValue: 24 },
    // title
    title: { value: null, defaultValue: 'xx公司' },
    titleFontSize: { value: null, defaultValue: 23 },
    // subtitle
    salesOrderSubtitle: { value: null, defaultValue: '销售单' },
    salesRefundSubtitle: { value: null, defaultValue: '销售退货单' },
    purchaseOrderSubtitle: { value: null, defaultValue: '采购单' },
    purchaseRefundSubtitle: { value: null, defaultValue: '采购退货单' },
    subtitleFontSize: { value: null, defaultValue: 20 },
    subtitleStyle: { value: 'inline', defaultValue: 'inline' },
    // header
    headerFontSize: { value: null, defaultValue: 14 },
    ifShowPhone: { value: true, defaultValue: true },
    ifShowAddress: { value: true, defaultValue: true },
    // footer
    footer: { value: null, defaultValue: '脚注1\n脚注2\n脚注3' },
    footerFontSize: { value: null, defaultValue: 12 },
    // table
    tableFontSize: { value: null, defaultValue: 14 },
    amountSign: { value: '¥', defaultValue: '' },
}


const initialState = (() => {
    const settings = DEFAULT_SETTINGS
    for (const key of Object.keys(settings)) {
        const localValue = JSON.parse(localStorage.getItem(`${SLICE_NAME}/${key}`))
        if (localValue !== null) {
            settings[key].value = localValue
        }
    }
    return settings
})()


const printSettingSlice = createSlice({
    name: SLICE_NAME,
    initialState: initialState,
    reducers: {
        setItem(state, action) {
            const { key, value } = action.payload
            localStorage.setItem(`${SLICE_NAME}/${key}`, JSON.stringify(value))
            return {
                ...state,
                [key]: {
                    ...state[key],
                    value: value
                }
            }
        }
    }
})


export const { setItem } = printSettingSlice.actions

export default printSettingSlice.reducer