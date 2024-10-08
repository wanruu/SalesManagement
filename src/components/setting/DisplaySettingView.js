import React, { useState } from 'react'
import { Card } from 'antd'


import { invoiceSettings } from '../../utils/config'
import SettingSwitchItem from './SettingSwitchItem'
import Title from 'antd/es/typography/Title'


export default function DisplaySettingView() {
    const [ifShowAmountSign, setIfShowAmountSign] = useState(invoiceSettings.get('ifShowAmountSign'))

    return (<>
        <Title id='display' level={2}>显示设置</Title>
        
        <Card>
            <Title id='display-amount' level={3}>金额</Title>
            <SettingSwitchItem keyy='ifShowAmountSign' value={ifShowAmountSign} setValue={setIfShowAmountSign} 
                label='显示金额符号' help='若开关打开，金额将会显示￥符号前缀，例如￥88；否则，只显示数字。不影响打印显示。' />
        </Card>
    </>)
}