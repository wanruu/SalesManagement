import { createSlice } from '@reduxjs/toolkit'


const SLICE_NAME = 'printSetting'


const DEFAULT_SETTINGS = {
    // size
    width: 772,
    height: 493,
    hPadding: 28,
    vPadding: 24,
    // title
    title: 'xx公司',
    titleFontSize: 23,
    // subtitle
    salesOrderSubtitle: '销售单',
    salesRefundSubtitle: '销售退货单',
    purchaseOrderSubtitle: '采购单',
    purchaseRefundSubtitle: '采购退货单',
    subtitleFontSize: 20,
    subtitleStyle: 'inline',
    // header
    headerFontSize: 14,
    ifShowPhone: false,
    ifShowAddress: false,
    // footer
    footer: '脚注1\n脚注2\n脚注3',
    footerFontSize: 12,
    // table
    tableFontSize: 14,
    amountSign: '￥',
}


const initialState = (() => {
    const settings = DEFAULT_SETTINGS
    for (const key of Object.keys(settings)) {
        const localData = JSON.parse(localStorage.getItem(`${SLICE_NAME}/${key}`))
        if (localData !== null) {
            settings[key] = localData
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
            state[key] = value
            localStorage.setItem(`${SLICE_NAME}/${key}`, JSON.stringify(value))
        }
    }
})


export const { setItem } = printSettingSlice.actions

export default printSettingSlice.reducer