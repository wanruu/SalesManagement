import { Col, Row, Space, Tabs } from 'antd'
import React, { useEffect, useState } from 'react'
import { partnerService } from '../../services'
import { PartnerInvoiceItemTable, PartnerInvoiceTable, PartnerProductTable } from '../Table'


const span = { xs: 24, sm: 12, md: 8, lg: 6 }


/**
 * @component
 * @param {Object} props
 * @param {Object} props.partner
 * @param {string} props.partner.name
 */
const PartnerManager = (props) => {
    const { partner: initPartner } = props
    const { name: partnerName } = initPartner

    const [partner, setPartner] = useState({})
    const [tabKey, setTabKey] = useState(0)

    const load = () => {
        if (partnerName) {
            partnerService.fetch(partnerName).then(res => {
                setPartner(res.data)
            }).catch(err => {
                setPartner({})
            })
        }
    }

    useEffect(load, [initPartner])

    const tabItems = [
        {
            label: '总览',
            key: 0,
            children: <PartnerInvoiceTable partner={partner} />,
        },
        {
            label: '明细',
            key: 1,
            children: <PartnerInvoiceItemTable partner={partner} />,
        },
        {
            label: '产品',
            key: 2,
            children: <PartnerProductTable partner={partner} />,
        },
    ]


    return <Space direction='vertical' style={{ width: '100%', paddingTop: '5px' }} size={15}>
        <Row gutter={[8, 8]} justify='start'>
            <Col {...span}>姓名：{partner.name}</Col>
            <Col {...span}>电话：{partner.phone}</Col>
            <Col {...span}>地址：{partner.address}</Col>
            <Col {...span}>文件位置：{partner.folder}</Col>
        </Row>
        <Tabs defaultActiveKey='1'
            onChange={setTabKey}
            activeKey={tabKey}
            items={tabItems} />
    </Space>
}

export default PartnerManager