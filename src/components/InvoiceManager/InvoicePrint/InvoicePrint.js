import React, { useRef } from 'react'
import { Col, Space, Button } from 'antd'
import { useReactToPrint } from 'react-to-print'
import { useSelector } from 'react-redux'
import InvoicePrintTable from './InvoicePrintTable'
import InvoicePrintHeader from './InvoicePrintHeader'
import InvoicePrintFooter from './InvoicePrintFooter'
import './index.scss'


/*
    Required: 
        invoice
        type
    Optional: 
        footer: true/false
        onCancel: called when 'cancel' button is clicked
*/
const InvoicePrint = ({ type, invoice, footer=true, onCancel }) => {
    const width = useSelector(state => state.printSetting.width)
    const height = useSelector(state => state.printSetting.height)
    const wrapperStyle = {
        width: width.value || width.defaultValue + 'px', 
        height: height.value || height.defaultValue + 'px'
    }
    const vPadding = useSelector(state => state.printSetting.vPadding)
    const hPadding = useSelector(state => state.printSetting.hPadding)
    const contentStyle = {
        padding: `${vPadding.value || vPadding.defaultValue}px ${hPadding.value || hPadding.defaultValue}px`
    }

    // for print
    const componentRef = useRef(null)
    const handlePrint = useReactToPrint({ contentRef: componentRef })

    const defaultFooter = (
        <Col align='end'>
            <Space>
                <Button onClick={_ => onCancel?.()}>返回</Button>
                <Button onClick={handlePrint} type='primary'>打印</Button>
            </Space>
        </Col>
    )
    return (<>
        <Space direction='vertical' size='middle' style={{ width: '100%', marginTop: '10px', marginBottom: '10px' }}>
            <Col align='middle' style={{ overflowX: 'auto', overflowY: 'clip' }}>
                <div ref={componentRef} >
                    <div className='invoiceWrapper' style={wrapperStyle}>
                        <div className='invoiceContent' style={contentStyle}>
                            <Space direction='vertical' style={{ width: '100%' }} size={5}>
                                <InvoicePrintHeader type={type} invoice={invoice} />
                                <InvoicePrintTable invoice={invoice} />
                                <InvoicePrintFooter />
                            </Space>
                        </div>
                    </div>
                </div>
            </Col>
        </Space>
        { footer ? defaultFooter : null }
    </>)
}


export default InvoicePrint