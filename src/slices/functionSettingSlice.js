import { createSlice } from '@reduxjs/toolkit'


const SLICE_NAME = 'functionSetting'


const DEFAULT_SETTINGS = {
    // discount
    ifShowDiscount: false,
    // material
    ifShowMaterial: false,
    // delivered
    ifShowDelivered: false,
    // payment
    ifShowPayment: false,
    // refund
    ifShowRefund: false,
    // unit
    units: ['只', '千只'],
    defaultUnit: '只',
    // amount
    amountSign: '￥',
    allowEditAmount: false,
    itemAmountDigitNum: 3,
    invoiceAmountDigitNum: 2,
    // remark calculator
    ifShowRemarkCalculator: true,
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


const functionSettingSlice = createSlice({
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


export const { setItem } = functionSettingSlice.actions

export default functionSettingSlice.reducer