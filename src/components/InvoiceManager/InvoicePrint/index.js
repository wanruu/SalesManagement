import React, { useRef } from 'react'
import { Col, Space, Button } from 'antd'
import { useReactToPrint } from 'react-to-print'
import { useSelector } from 'react-redux'
import InvoicePrintTable from './InvoicePrintTable'
import InvoicePrintHeader from './InvoicePrintHeader'
import InvoicePrintFooter from './InvoicePrintFooter'
import './invoice-print.style.scss'
import { BaseInvoice, Partner, BaseInvoiceItem, Product } from '../../../types';



/**
 * @component
 * @param {Object} props 
 * @param {BaseInvoice & {partner: Partner, invoiceItems: BaseInvoiceItem & {product: Product}}} props.invoice
 * @param {boolean} [props.footer]
 * @param {function} [props.onCancel]
 */
const InvoicePrint = (props) => {
    const { invoice, footer = true, onCancel } = props

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
        <Col align='middle' style={{ overflowX: 'auto', overflowY: 'clip', margin: '15px 0' }}>
            <div ref={componentRef} >
                <div className='invoice-wrapper' style={wrapperStyle}>
                    <div className='invoice-content' style={contentStyle}>
                        <Space direction='vertical' style={{ width: '100%' }} size={5}>
                            <InvoicePrintHeader invoice={invoice} />
                            <InvoicePrintTable invoice={invoice} />
                            <InvoicePrintFooter />
                        </Space>
                    </div>
                </div>
            </div>
        </Col>
        {footer ? defaultFooter : null}
    </>)
}


export default InvoicePrint