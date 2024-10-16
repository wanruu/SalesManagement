import React from 'react'
import { Form, Divider, Card, Segmented, Input } from 'antd'
import Title from 'antd/es/typography/Title'
import { TipsView, SwitchItem } from './utils'
import { useSelector, useDispatch } from 'react-redux'
import UnitSettingItem from './UnitSettingItem'


const { Item } = Form


const DIGIT_NUM_OPTIONS = [
    { label: '取整', value: 0 },
    { label: '2位小数', value: 2 },
    { label: '3位小数', value: 3 },
]


const FunctionSettingView = () => {
    const settings = useSelector(state => state.functionSetting)
    const dispatch = useDispatch()

    const handleChange = (key, value) => {
        dispatch({
            type: 'functionSetting/setItem', 
            payload: { key: key, value: value }
        })
    }

    const getSwitchItem = (key, label, help=null) => {
        return <SwitchItem label={label} 
            value={settings[key]?.value}
            onChange={value => handleChange(key, value)}
            help={help} />
    }
    return (<>
        <Title id='function' level={2}>功能设置</Title>
        <Card>
            <Title id='function-material' level={3}>材质</Title>
            { getSwitchItem('ifShowMaterial', '开启材质', '该开关不会影响原有数据，只是显示或隐藏材质项。') }
            <Divider />

            <Title id='function-unit' level={3}>单位</Title>
            <UnitSettingItem units={settings.units.value} defaultUnit={settings.defaultUnit.value}
                onUnitsChange={units => handleChange('units', units)}
                onDefaultUnitChange={unit => handleChange('defaultUnit', unit)}
            />

            <Title id='function-amount' level={3}>金额</Title>
            { getSwitchItem('allowEditAmount', '允许手动修改', '若开关打开，则允许在自动计算金额的基础上输入自定义金额。') }
            <Item label={<>总金额（自动计算）<TipsView title='不影响已创建的清单。' /></>}>
                <Segmented options={DIGIT_NUM_OPTIONS} 
                    value={settings.invoiceAmountDigitNum.value}
                    onChange={value => handleChange('invoiceAmountDigitNum', value)} />
            </Item>
            <Item label={<>单项金额（自动计算）<TipsView title='不影响已创建的清单。' /></>}>
                <Segmented options={DIGIT_NUM_OPTIONS} 
                    value={settings.itemAmountDigitNum.value}
                    onChange={value => handleChange('itemAmountDigitNum', value)} />
            </Item>
            <Item label={<>金额符号<TipsView title='不影响打印显示。' /></>}>
                <Input style={{ maxWidth: '100px' }}
                    placeholder={settings.amountSign?.defaultValue}
                    value={settings.amountSign?.value}
                    onChange={e => handleChange('amountSign', e.target.value)}
                />
            </Item>
            <Divider />

            <Title id='function-discount' level={3}>折扣</Title>
            { getSwitchItem('ifShowDiscount', '开启折扣', '该开关不会影响原有数据，只是显示或隐藏折扣及折前金额。') }
            <Divider />

            <Title id='function-remark' level={3}>备注</Title>
            { getSwitchItem('ifShowRemarkCalculator', '开启备注计算', '若开关打开，开单页面的备注栏将会显示“=”按钮，点击即可检测并计算备注栏中第一个算式，并将结果填入“数量”栏，最多保留五位小数。') }
            <Divider />

            <Title id='function-deliver' level={3}>配送</Title>
            { getSwitchItem('ifShowDelivered', '开启配送') }
            <Divider />

            <Title id='function-payment' level={3}>付款</Title>
            { getSwitchItem('ifShowPayment', '开启付款') }
            <Divider />

            <Title id='function-refund' level={3}>退货</Title>
            { getSwitchItem('ifShowRefund', '开启退货', '该开关不会影响原有数据，只是显示或隐藏退货页面。') }
        </Card>
    </>)
}


export default FunctionSettingView