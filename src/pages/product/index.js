import React, { useState, useEffect } from 'react'
import { Space, Button, Modal, message } from 'antd'
import {
    ExclamationCircleFilled, PlusOutlined, ClearOutlined,
    ExportOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { MyWorkBook, MyWorkSheet } from '../../utils/export'
import { productService } from '../../services'
import ProductManager from '../../components/ProductManager'
import SearchManager from '../../components/SearchManager'
import ProductTable from './ProductTable'
import ProductForm from './ProductForm'
import { pick, omit } from 'lodash'


const { confirm } = Modal


const ProductPage = () => {
    // states
    const [products, setProducts] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(undefined)
    const [editProduct, setEditProduct] = useState(undefined)

    // utils
    const [messageApi, contextHolder] = message.useMessage()
    
    // redux
    const ifShowMaterial = useSelector(state => state.functionSetting.ifShowMaterial.value)
    const defaultUnit = useSelector(state => state.functionSetting.defaultUnit.value)
    const searchMode = useSelector(state => state.page.product.search.mode)
    const searchForm = useSelector(state => state.page.product.search.form)
    const dispatch = useDispatch()


    const load = () => {
        const params = searchMode == 'simple' ? pick(searchForm, ['keyword']) : omit(searchForm, ['keyword'])
        productService.fetchMany(params).then(res => {
            setProducts(res.data)
        }).catch(err => {
            setProducts([])
        })
    }

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
        const headers = [
            ifShowMaterial ? { title: '材质', dataIndex: 'material' } : null,
            { title: '名称', dataIndex: 'name' },
            { title: '规格', dataIndex: 'spec' },
            { title: '单位', dataIndex: 'unit' },
        ].filter(i => i != null)
        let wb = new MyWorkBook('产品')
        let ws = new MyWorkSheet('总览')
        ws.writeJson(products, headers)
        wb.writeSheet(ws)
        wb.save()
    }

    const handleCreateProduct = () => {
        setEditProduct({
            material: '', name: '', spec: '',
            unit: defaultUnit
        })
    }

    // scroll position listener & recover
    const scrollY = useSelector(state => state.page.product.scrollY)

    useEffect(() => {
        const handleScroll = () => {
            dispatch({ type: 'page/updateScrollY', payload: { pageKey: 'product', scrollY: window.scrollY } })
        }
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    useEffect(() => window.scrollTo(0, scrollY), [products])
    // ------------------------------------

    return <Space direction='vertical' style={{ width: '100%' }} className='page-main-content'>
        {contextHolder}

        <Modal open={editProduct} onCancel={_ => setEditProduct(undefined)} title={editProduct && editProduct.id ? '编辑产品' : '新增产品'} footer={null} destroyOnClose>
            <ProductForm product={editProduct} onProductChange={_ => {
                setEditProduct(undefined)
                load()
            }} />
        </Modal>

        <Modal open={selectedProduct} onCancel={_ => setSelectedProduct(undefined)} title='产品详情' width='90%'
            footer={(_, { CancelBtn }) => <CancelBtn />}>
            <ProductManager product={selectedProduct} />
        </Modal>

       <Space wrap>
            <Button icon={<PlusOutlined />} onClick={handleCreateProduct}>
                新增
            </Button>
            <Button icon={<ExportOutlined />} disabled={products.length === 0} onClick={handleExport}>
                导出
            </Button>
            <Button icon={<ClearOutlined />} type='dashed' disabled={products.filter(p => !p.invoiceItemNum > 0).length === 0}
                onClick={_ => showDeleteConfirm(products.filter(p => !p.invoiceItemNum > 0))} danger>
                清理
            </Button>
        </Space>

        <SearchManager pageKey='product' onSearch={load}
            simpleSearchHelp={`支持${ifShowMaterial ? '材质、' : ''}名称、规格、单位（文字、拼音及首字母），以空格分开。`} />
        <ProductTable products={products} 
            onSelect={p => setSelectedProduct(p)}
            onDelete={p => showDeleteConfirm([p])}
            onEdit={p => setEditProduct(p)}
        />
    </Space>
}


export default ProductPage