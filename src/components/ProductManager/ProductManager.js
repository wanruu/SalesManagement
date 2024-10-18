import React, { useEffect, useMemo, useState } from 'react'
import ProductTable from './ProductTable'
import { productService } from '../../services'
import { useSelector } from 'react-redux'
import { Col, Row, Segmented, Select, Radio, Divider, Space, Button } from 'antd'
import { AppstoreOutlined, LineChartOutlined, DotChartOutlined } from '@ant-design/icons';
import { ProductLineChart, ProductScatterChart } from '../Chart'
import { INVOICE_BASICS } from '../../utils/invoiceUtils'
import { PartnerInput } from '../Input'

const displayOptions = [
    {
        label: '表格',
        value: 'table',
        icon: <AppstoreOutlined />,
    },
    {
        label: '按单号',
        value: 'line',
        icon: <LineChartOutlined />,
    },
    {
        label: '按日期',
        value: 'scatter',
        icon: <DotChartOutlined />,
    }
]

const chartFieldOptions = [
    { label: '单价', value: 'price' },
    { label: '数量', value: 'quantity' },
]

const Header = ({ product }) => {
    const ifShowMaterial = useSelector(state => state.functionSetting.ifShowMaterial)
    const span = { xs: 12, sm: 8, md: 6, lg: 4 }
    return <Row gutter={[8,8]} justify='space-between'>
        {
            ifShowMaterial ? 
            <Col {...span}>
                材质：{ product.material }
            </Col> : null
        }
        <Col {...span}>
            名称：{ product.name }
        </Col>
        <Col {...span}>
            规格：{ product.spec }
        </Col>
        <Col {...span}>
            单位：{ product.unit }
        </Col>
        <Col {...span}>
            单位重量：{ product.unitWeight ?? '无' }
        </Col>
    </Row>
}


// 这里的控制比较复杂，因为设置modal为destroyOnClose会有chart渲染的问题，所以要处理数据的变化
const ProductManager = ({
    product: initProduct,
    partnerName: initPartnerName='',
    display: initDisplay='scatter',
    field: initField='price',
    invoiceType: initInvoiceType='salesOrder'
}) => {
    const [product, setProduct] = useState({})
    const [filteredProduct, setFilteredProduct] = useState({})

    const [partnerName, setPartnerName] = useState('')
    const [display, setDisplay] = useState('scatter')
    const [chartField, setChartField] = useState('price')
    const [invoiceType, setInvoceType] = useState('salesOrder')

    
    useEffect(() => setPartnerName(initPartnerName), [initPartnerName])
    useEffect(() => setDisplay(initDisplay), [initDisplay])
    useEffect(() => setChartField(initField), [initField])

    const allTypes = useMemo(() => [...new Set((filteredProduct.invoiceItems??[]).map(i => i.invoice.type))], [filteredProduct])
    const lineChartTypeOptions = useMemo(() => {
        return ['salesOrder', 'salesRefund', 'purchaseOrder', 'purchaseRefund']
            .filter(key => allTypes.includes(key))
            .map(i => {
                return { label: INVOICE_BASICS[i].title, value: i }
            })
    }, [allTypes])

    useEffect(() => {
        if (allTypes.includes(initInvoiceType)) {
            setInvoceType(initInvoiceType)
        } else {
            setInvoceType(['salesOrder', 'salesRefund', 'purchaseOrder', 'purchaseRefund']
                .find(t => allTypes.includes(t)))
        }
    }, [allTypes, initInvoiceType])
    

    const load = () => {
        productService.fetchById(initProduct.id).then(res => {
            setProduct(res.data)
        }).catch(err => {
            setProduct({})
        })
    }
    useEffect(load, [initProduct])

    const filter = () => {
        if (partnerName && partnerName !== '') {
            setFilteredProduct({
                ...product,
                invoiceItems: (product?.invoiceItems??[]).filter(i => i.invoice.partnerName.includes(partnerName))
            })
        } else {
            setFilteredProduct(product)
        }
    }
    useEffect(filter, [product])

    const handleKeyDown = (event) => {
        event.key === 'Enter' && filter()
    }

    const displayDict = {
        'table': <ProductTable product={filteredProduct} />,
        'scatter': <ProductScatterChart product={filteredProduct} field={chartField} />,
        'line': <ProductLineChart product={filteredProduct} type={invoiceType} field={chartField} />,
    }
    
    return <>
        <Header product={product} />
        <Divider />
        <Space wrap style={{ marginBottom: '15px', width: '100%', justifyContent: 'space-between' }}>
            <Segmented options={displayOptions} value={display} onChange={setDisplay} />
            <Space.Compact>
                <PartnerInput placeholder='交易对象名称' style={{ 'minWidth': '200px' }}
                    value={partnerName} onChange={setPartnerName} 
                    onKeyDown={handleKeyDown} />
                <Button onClick={filter}>筛选</Button>
            </Space.Compact>
        </Space>
        <Row justify='space-between' align='middle'>
            {
                display === 'table' ? null :
                <Select options={chartFieldOptions} value={chartField} onChange={setChartField} />
            }
            {
                display === 'line' ?
                <Radio.Group options={lineChartTypeOptions} value={invoiceType} 
                    onChange={e => setInvoceType(e.target.value)} /> : null
            }
        </Row>
        { displayDict[display] }
    </>
}

export default ProductManager