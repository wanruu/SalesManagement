import React, { useState, useEffect, useMemo } from 'react'
import { Space, Button, Modal } from 'antd'
import { PlusOutlined, ClearOutlined, ReloadOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { productService } from '@/services'
import ProductManager from '@/components/ProductManager'
import SearchManager from '@/components/SearchManager'
import ProductTable from './ProductTable'
import ProductForm from './ProductForm'
import { pick, omit } from 'lodash'
import { DeleteConfirm } from '@/components/Modal'



const ProductPage = () => {
    // states
    const [products, setProducts] = useState([])
    const [productToView, setProductToView] = useState(undefined)
    const [productToEdit, setProductToEdit] = useState(undefined)
    const [productsToDelete, setProductsToDelete] = useState([])

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

    const deleteConfirmTitle = useMemo(() => {
        if (productsToDelete.length === 1) {
            const info = [ifShowMaterial ? productsToDelete[0].material : null, productsToDelete[0].name, productsToDelete[0].spec].filter(i => i)
            return `是否删除产品 “${info.join(' ')}” ?`
        }
        return `是否删除 ${productsToDelete.length} 个产品 ?`
    }, [ifShowMaterial, productsToDelete])

    const handleProductsDelete = () => {
        const messageKey = 'delete-product'
        dispatch({
            type: 'globalInfo/addMessage',
            payload: { key: messageKey, type: 'loading', duration: 86400, content: '删除中' }
        });
        productService.deleteMany(productsToDelete).then(res => {
            dispatch({
                type: 'globalInfo/addMessage',
                payload: { key: messageKey, type: 'success', content: '删除成功' }
            });
            const ids = productsToDelete.map(p => p.id)
            setProducts(products.filter(p => !ids.includes(p.id)))
            setProductsToDelete([])
        }).catch(err => {
            dispatch({
                type: 'globalInfo/addMessage',
                payload: { key: messageKey, type: 'error', duration: 5, content: `删除失败：${err.message}. ${err.response?.data?.error}` }
            });
            setProductsToDelete([])
        })
    }

    const handleProductChange = (product, id) => {
        // prevent reloading from server
        const idx = products.findIndex(p => p.id === id)
        const newProducts = [...products]
        if (idx === -1) {
            newProducts.unshift(product)
        } else {
            newProducts[idx] = product
        }
        setProductToEdit(undefined)
        setProducts(newProducts)
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

        <Modal open={productToEdit} onCancel={_ => setProductToEdit(undefined)} title={productToEdit && productToEdit.id ? '编辑产品' : '新增产品'} footer={null} destroyOnClose>
            <ProductForm product={productToEdit} onProductChange={product => handleProductChange(product, productToEdit.id)} />
        </Modal>

        <Modal open={productToView} onCancel={_ => setProductToView(undefined)} title='产品详情' width='90%'
            footer={(_, { CancelBtn }) => <CancelBtn />}>
            <ProductManager product={productToView} />
        </Modal>

        <DeleteConfirm open={productsToDelete.length > 0} onCancel={_ => setProductsToDelete([])}
            title={deleteConfirmTitle} onOk={handleProductsDelete} />

        <Space wrap>
            <Button icon={<PlusOutlined />} onClick={_ => setProductToEdit({ material: '', unit: defaultUnit })} type='primary' ghost>
                新增
            </Button>
            <Button icon={<ClearOutlined />} type='dashed' disabled={products.filter(p => !p.invoiceItemNum > 0).length === 0}
                onClick={_ => setProductsToDelete(products.filter(p => !p.invoiceItemNum > 0))} danger>
                一键清理
            </Button>
            <Button icon={<ReloadOutlined />} onClick={_ => {
                setProducts([])
                load()
            }}>刷新</Button>
        </Space>

        <SearchManager pageKey='product' onSearch={load}
            simpleSearchHelp={`支持${ifShowMaterial ? '材质、' : ''}名称、规格、单位（文字、拼音及首字母），以空格分开。`} />

        <ProductTable products={products}
            onSelect={setProductToView} onEdit={setProductToEdit}
            onDelete={p => setProductsToDelete([p])}
        />
    </Space>
}


export default ProductPage