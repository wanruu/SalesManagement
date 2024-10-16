import React from 'react'
import { Tag } from 'antd'


const DELIVER_COLORS = {
    '全部配送': 'green',
    '已配送': 'green',
    '未配送': 'red',
    '部分配送': 'gold'
}


const DeliverTag = ({ value, ...restProps }) => {
    return <Tag color={DELIVER_COLORS[value]} {...restProps}>{value}</Tag>
}


export default DeliverTag