import React from 'react'
import { Row, Col } from 'antd'
import { printSettings } from '../../utils/config'


const InvoicePrintFooter = () => {
    // Reshape footer lines to [x,2]
    const lines = printSettings.get('footer').split('\n').map(line => line.replace(/ /g, '\xa0'))
    const content = lines.reduce((res, line) => {
        if (res.length === 0 || res.at(-1).length === 2) res.push([line])
        else res.at(-1).push(line)
        return res
    }, [])

    // Style
    const fontSize = { fontSize: printSettings.get('footerFontSize') + 'px' }

    // Return
    return content.map((arr, idx) =>
        <Row key={idx}>
            <Col align='left' span={12} style={{ ...fontSize }}>
                {arr[0]}
            </Col>
            {arr.length !== 2 ? null :
                <Col align='left' span={12} style={{ ...fontSize }}>
                    {arr[1]}
                </Col>
            }
        </Row>
    )
}



export default InvoicePrintFooter