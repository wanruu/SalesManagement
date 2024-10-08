import React, { useState, useEffect } from 'react'
import { Table, Space, Button, Modal, message, Affix, theme } from 'antd'
import {
    ExclamationCircleFilled, PlusOutlined, ClearOutlined,
    ExportOutlined, UpOutlined, DownOutlined
} from '@ant-design/icons'
import _ from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { DEFAULT_PAGINATION, invoiceSettings } from '../utils/config'
import { MyWorkBook, MyWorkSheet } from '../utils/export'
import ProductSearchBox from '../components/product/SearchBox'
import { ProductForm } from '../components/Form'
import productService from '../services/productService'
import { ProductManager } from '../components/ProductManager'


const { confirm } = Modal


export default function ProductPage() {
    // states
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(undefined)
    const [editProduct, setEditProduct] = useState(undefined)
    const [affixed, setAffixed] = useState(false)

    // utils
    const [messageApi, contextHolder] = message.useMessage()
    const { token: { colorBgContainer }, } = theme.useToken()
    
    // redux
    const showSearchBox = useSelector(state => state.page.product.showSearchBox)
    const dispatch = useDispatch()
    

    const ifShowMaterial = invoiceSettings.get('ifShowMaterial') === 'true'

    const load = () => {
        productService.fetchMany().then(res => {
            setProducts(res.data)
        }).catch(err => {

        })
    }

    const tableColumns = [
        { title: '序号', align: 'center', render: (_, __, idx) => idx + 1, fixed: 'left' },
        !ifShowMaterial ? null :
        { title: '材质', dataIndex: 'material', align: 'center' },
        { title: '名称', dataIndex: 'name', align: 'center' },
        { title: '规格', dataIndex: 'spec', align: 'center' },
        // { title: '库存', dataIndex: 'quantity', align: 'center', render: quantity => <span style={{ color: quantity < 0 ? 'red': 'black' }}>{quantity.toLocaleString()}</span> },
        { title: '单位', dataIndex: 'unit', align: 'center' },
        // { title: '预估重量', dataIndex: 'estimatedWeight', align: 'center', render: w => w == null ? null : w.toLocaleString() },
        {
            title: '操作', align: 'center', fixed: 'right', render: (_, record) =>
                <Space>
                    <Button type='primary' ghost onClick={_ => setEditProduct(record)}>编辑</Button>
                    {record.invoiceItemNum > 0 ?
                        <Button onClick={_ => setSelectedProduct(record)}>查看</Button> :
                        <Button danger onClick={_ => showDeleteConfirm([record])}>删除</Button>
                    }
                </Space>
        }
    ].filter(i => i != null)
    

    const showDeleteConfirm = (products) => {
        const title = products.length === 1 ? `是否删除产品 “${products[0].material} ${products[0].name} ${products[0].spec}” ?` : `是否删除 ${products.length} 个产品 ?`
        confirm({
            title: title,
            icon: <ExclamationCircleFilled />,
            content: '确认删除后不可撤销',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                productService.deleteMany(products).then(res => {
                    messageApi.open({ type: 'success', content: '删除成功' })
                    load()
                }).catch(err => {
                    messageApi.open({ type: 'error', content: '删除失败' })
                    load()
                })
            }
        })
    }

    const handleExport = () => {
        const ifShowMaterial = invoiceSettings.get('ifShowMaterial') === 'true'
        const headers = [
            ifShowMaterial ? { title: '材质', dataIndex: 'material' } : null,
            { title: '名称', dataIndex: 'name' },
            { title: '规格', dataIndex: 'spec' },
            { title: '单位', dataIndex: 'unit' },
        ].filter(i => i != null)
        let wb = new MyWorkBook('产品')
        let ws = new MyWorkSheet('总览')
        ws.writeJson(filteredProducts, headers)
        wb.writeSheet(ws)
        wb.save()
    }

    const handleCreateProduct = () => {
        setEditProduct({
            material: '', name: '', spec: '',
            unit: JSON.parse(invoiceSettings.get('unitOptions')).filter(unit => unit.default)[0].label
        })
    }

    useEffect(load, [])

    // scroll position listener & recover
    const scrollY = useSelector(state => state.page.product.scrollY)

    useEffect(() => {
        const handleScroll = () => {
            dispatch({ type: 'page/updateScrollY', menuKey: 'product', scrollY: window.scrollY })
        }
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    useEffect(() => window.scrollTo(0, scrollY), [products])
    // ------------------------------------

    return <Space direction='vertical' style={{ width: '100%' }}>
        {contextHolder}
        <Modal open={editProduct} onCancel={_ => setEditProduct(undefined)} title={editProduct && editProduct.id ? '编辑产品' : '新增产品'} footer={null} destroyOnClose>
            <ProductForm product={editProduct} onProductChange={_ => {
                setEditProduct(undefined)
                load()
            }} />
        </Modal>

        <Modal open={selectedProduct} onCancel={_ => setSelectedProduct(undefined)} title='产品详情' footer={null} width='90%'>
            <ProductManager product={selectedProduct} />
        </Modal>

        <Affix offsetTop={0} onChange={setAffixed}>
            <Space className={`toolBar-${affixed}`} direction='vertical' style={{ background: colorBgContainer }} size={0}>
                <Space wrap>
                    <Button icon={<PlusOutlined />} onClick={handleCreateProduct}>
                        新增
                    </Button>
                    <Button icon={<ExportOutlined />} disabled={filteredProducts.length === 0} onClick={handleExport}>
                        导出
                    </Button>
                    <Button icon={<ClearOutlined />} type='dashed' disabled={filteredProducts.filter(p => !p.invoiceItemNum > 0).length === 0}
                        onClick={_ => showDeleteConfirm(filteredProducts.filter(p => !p.invoiceItemNum > 0))} danger>
                        清理
                    </Button>
                    <Button onClick={_ => dispatch({ type: 'page/toggleShowSearchBox', menuKey: 'product' })}
                        icon={showSearchBox ? <UpOutlined /> : <DownOutlined />}>
                        {showSearchBox ? '收起搜索' : '展开搜索'}
                    </Button>
                </Space>
                <ProductSearchBox data={products} setFilteredData={setFilteredProducts} mode='simple' />
            </Space>
        </Affix>

        <div className='pageMainContent'>
            <Table dataSource={filteredProducts} bordered rowKey={record => record.id} columns={tableColumns}
                pagination={DEFAULT_PAGINATION} scroll={{ x: 'max-content' }} />
        </div>
    </Space>
}