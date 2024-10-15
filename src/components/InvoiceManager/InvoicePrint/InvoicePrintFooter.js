import React from 'react'
import { Row, Col } from 'antd'
import { useSelector } from 'react-redux'


const InvoicePrintFooter = () => {
    const footer = useSelector(state => state.printSetting.footer.value ?? '')
    const fontSize = useSelector(state => state.printSetting.footerFontSize.value || state.printSetting.footerFontSize.defaultValue)

    // Reshape footer lines to [x,2]
    const lines = footer.split('\n').map(line => line.replace(/ /g, '\xa0'))
    const content = lines.reduce((res, line) => {
        if (res.length === 0 || res.at(-1).length === 2) res.push([line])
        else res.at(-1).push(line)
        return res
    }, [])

    // Return
    return content.map((arr, idx) =>
        <Row key={idx}>
            <Col align='left' span={12} style={{ fontSize: fontSize + 'px' }}>
                {arr[0]}
            </Col>
            {arr.length !== 2 ? null :
                <Col align='left' span={12} style={{ fontSize: fontSize + 'px' }}>
                    {arr[1]}
                </Col>
            }
        </Row>
    )
}



export default InvoicePrintFooter