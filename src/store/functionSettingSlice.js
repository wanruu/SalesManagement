import { createSlice } from '@reduxjs/toolkit'


const SLICE_NAME = 'functionSetting'


const DEFAULT_SETTINGS = {
    // discount
    ifShowDiscount: { value: false, defaultValue: false },
    // material
    ifShowMaterial: { value: false, defaultValue: false },
    // delivered
    ifShowDelivered: { value: false, defaultValue: false },
    // payment
    ifShowPayment: { value: false, defaultValue: false },
    // refund
    ifShowRefund: { value: true, defaultValue: true },
    // unit
    units: { value: ['只', '千只'], defaultValue: ['只', '千只'] },
    defaultUnit: { value: '只', defaultValue: '只' },
    // amount
    amountSign: { value: '￥', defaultValue: '' },
    allowEditAmount: { value: false, defaultValue: false },
    itemAmountDigitNum: { value: 3, defaultValue: 3 },
    invoiceAmountDigitNum: { value: 2, defaultValue: 2 },
    // remark calculator
    ifShowRemarkCalculator: { value: true, defaultValue: true },
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
