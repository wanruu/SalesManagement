import React, { useEffect, useMemo, useState } from 'react'
import ProductTable from './ProductTable'
import { productService } from '../../services'
import { useSelector } from 'react-redux'
import { Col, Row, Segmented, Select, Radio, Divider } from 'antd'
import { AppstoreOutlined, LineChartOutlined, DotChartOutlined } from '@ant-design/icons';
import { ProductLineChart, ProductScatterChart } from '../Chart'
import { INVOICE_BASICS } from '../../utils/invoiceUtils'


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


const ProductManager = ({ product: initProduct }) => {
    const [product, setProduct] = useState({})
    
    // control display
    const [display, setDisplay] = useState('scatter')
    const [chartField, setChartField] = useState('price')
    const [invoiceType, setInvoceType] = useState('salesOrder')
    const lineChartTypeOptions = useMemo(() => {
        const allTypes = [...new Set((product.invoiceItems??[]).map(i => i.invoice.type))]
        return ['salesOrder', 'salesRefund', 'purchaseOrder', 'purchaseRefund']
            .filter(key => allTypes.includes(key))
            .map(i => {
                return { label: INVOICE_BASICS[i].title, value: i }
            })
    }, [product])

    useEffect(() => {
        setInvoceType(lineChartTypeOptions?.[0]?.value)
    }, [lineChartTypeOptions])


    const displayDict = {
        'table': <ProductTable product={product} />,
        'scatter': <ProductScatterChart product={product} field={chartField} />,
        'line': <ProductLineChart product={product} type={invoiceType} field={chartField} />,
    }

    // load
    const load = () => {
        productService.fetchById(initProduct.id).then(res => {
            setProduct(res.data)
        }).catch(err => {
            setProduct({})
        })
    }

    useEffect(load, [initProduct.id])
    
    return <>
        <Header product={product} />
        <Divider />
        <Row justify='space-between' style={{ marginBottom: '15px' }}>
            <Segmented options={displayOptions} value={display} onChange={setDisplay} />
            {
                display === 'table' ? null :
                <Select options={chartFieldOptions} value={chartField} onChange={setChartField} />
            }
        </Row>
        {
            display === 'line' ?
            <Radio.Group options={lineChartTypeOptions} value={invoiceType} 
                onChange={e => setInvoceType(e.target.value)} /> : null
        }
        { displayDict[display] }
    </>
}

export default ProductManager