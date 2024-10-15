import React from 'react'
import { Tag } from 'antd'


const PartnerTypeTag = ({ salesNum, purchaseNum }) => {
    const customer = salesNum > 0 ? <Tag color='blue'>客户</Tag> : null
    const provider = purchaseNum > 0 ? <Tag color='gold'>供应商</Tag> : null
    return <>{customer} {provider}</>
}


export default PartnerTypeTag