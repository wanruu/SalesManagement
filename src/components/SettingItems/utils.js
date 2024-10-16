import React, { useState } from 'react'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { Form, Switch, Tooltip } from 'antd'

const { Item } = Form


export const TipsView = ({ title }) => {
    return (
        <Tooltip title={title} >
            <QuestionCircleOutlined style={{ marginLeft: '3px', color: 'gray' }} />
        </Tooltip>
    )
}


export const SwitchItem = ({ label, value, onChange, help=false }) => {
    return <Item label={<>
        { label }
        { help ? <TipsView title={help} /> : null }
    </>}>
        <Switch checked={value} onChange={val => onChange?.(val)} />
    </Item>
}