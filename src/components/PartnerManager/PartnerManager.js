import { Col, Row, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import { partnerService } from '../../services'
import PartnerTable from './PartnerTable'


const span = { xs: 24, sm: 12, md: 8, lg: 6 }


const PartnerManager = ({ partner: initPartner }) => {
    const [partner, setPartner] = useState({})

    const load = () => {
        if (initPartner.name) {
            partnerService.fetch(initPartner.name).then(res => {
                setPartner(res.data)
            }).catch(err => {
                setPartner({})
            })
        }
    }

    useEffect(load, [initPartner])

    return <Space direction='vertical' style={{ width: '100%', paddingTop: '5px' }} size={15}>
        <Row gutter={[8,8]} justify='start'>
            <Col {...span}>姓名：{ partner.name }</Col>
            <Col {...span}>电话：{ partner.phone }</Col>
            <Col {...span}>地址：{ partner.address }</Col>
            <Col {...span}>文件位置：{ partner.folder }</Col>
        </Row>
        <PartnerTable partner={partner} />
    </Space>
}

export default PartnerManager