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
    const settings = {}
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
        const localValue = JSON.parse(localStorage.getItem(`${SLICE_NAME}/${key}`))
        const defaultValue = DEFAULT_SETTINGS[key]
        settings[key] = { value: localValue, defaultValue: defaultValue }
    }
    return settings
})()


const functionSettingSlice = createSlice({
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


export const { setItem } = functionSettingSlice.actions

export default functionSettingSlice.reducer
