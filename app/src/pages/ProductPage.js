import React, { useState, useEffect } from 'react'
import { Table, Space, Button, Modal, message, Affix, theme } from 'antd'
import Axios from 'axios'
import {
    ExclamationCircleFilled, PlusOutlined, ClearOutlined,
    ExportOutlined
} from '@ant-design/icons'
import _ from 'lodash'

const { confirm } = Modal


import { baseURL, DEFAULT_PAGINATION, invoiceSettings } from '../utils/config'
import { exportExcel, getExportData } from '../utils/export'
import ProductEditView from '../components/product/ProductEditView'
import ProductView from '../components/product/ProductView'
import ProductSearchBox from '../components/product/SearchBox'


export default function ProductPage() {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])

    const [selectedProductId, setSelectedProductId] = useState(undefined)
    const [editProduct, setEditProduct] = useState(undefined)
    const [messageApi, contextHolder] = message.useMessage()

    const { token: { colorBgContainer }, } = theme.useToken()

    // 否则不及时更新
    const [ifShowMaterial, setIfShowMaterial] = useState(invoiceSettings.get('ifShowMaterial') === 'true')

    // load (table data)
    const load = () => {
        Axios({
            method: 'get',
            baseURL: baseURL(),
            url: '/product',
            'Content-Type': 'application/json',
        }).then(res => {
            setProducts(res.data)
        }).catch(_ => { })
    }
    const getTableColumns = () => {
        return [
            { title: '序号', align: 'center', render: (_, __, idx) => idx + 1, fixed: 'left' },
            ifShowMaterial ? { title: '材质', dataIndex: 'material', align: 'center' } : null,
            { title: '名称', dataIndex: 'name', align: 'center' },
            { title: '规格', dataIndex: 'spec', align: 'center' },
            // { title: '库存', dataIndex: 'quantity', align: 'center', render: quantity => <span style={{ color: quantity < 0 ? 'red': 'black' }}>{quantity.toLocaleString()}</span> },
            { title: '单位', dataIndex: 'unit', align: 'center' },
            // { title: '预估重量', dataIndex: 'estimatedWeight', align: 'center', render: w => w == null ? null : w.toLocaleString() },
            {
                title: '操作', align: 'center', fixed: 'right', render: (_, record) =>
                    <Space>
                        <Button type='primary' ghost onClick={_ => setEditProduct(record)}>编辑</Button>
                        {record.invoiceNum > 0 ?
                            <Button onClick={_ => setSelectedProductId(record.id)}>查看</Button> :
                            <Button danger onClick={_ => showDeleteConfirm([record])}>删除</Button>
                        }
                    </Space>
            }
        ].filter(i => i != null)
    }

    // delete products
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
                Axios({
                    method: 'delete',
                    baseURL: baseURL(),
                    url: `/product`,
                    data: { ids: products.map(p => p.id) },
                    'Content-Type': 'application/json',
                }).then(_ => {
                    messageApi.open({ type: 'success', content: '删除成功' })
                    load()
                }).catch(_ => {
                    messageApi.open({ type: 'error', content: '删除失败' })
                })
            }
        })
    }

    // export
    const exportProducts = () => {
        const productTableColumns = [
            ifShowMaterial ? { title: '材质', dataIndex: 'material' } : null,
            { title: '名称', dataIndex: 'name' },
            { title: '规格', dataIndex: 'spec' },
            { title: '库存', dataIndex: 'quantity' },
            { title: '单位', dataIndex: 'unit' },
        ].filter(i => i != null)
        exportExcel('产品', getExportData(productTableColumns, filteredProducts))
    }

    // effect
    useEffect(load, [])
    useEffect(() => {
        setIfShowMaterial(invoiceSettings.get('ifShowMaterial') === 'true')
    }, [invoiceSettings.get('ifShowMaterial')])


    // handler
    const handleCreateProduct = () => {
        setEditProduct({
            material: '', name: '', spec: '',
            unit: JSON.parse(invoiceSettings.get('unitOptions')).filter(unit => unit.default)[0].label
        })
    }

    return <Space direction='vertical' style={{ width: '100%' }}>
        {contextHolder}
        <Modal open={editProduct !== undefined} onCancel={_ => setEditProduct(undefined)} title={editProduct && editProduct.id ? '编辑产品' : '新增产品'} footer={null} destroyOnClose>
            <ProductEditView product={editProduct} dismiss={_ => setEditProduct(undefined)} refresh={load} messageApi={messageApi} />
        </Modal>

        <Modal open={selectedProductId !== undefined} onCancel={_ => setSelectedProductId(undefined)} title='产品详情' footer={null} destroyOnClose width={900}>
            <ProductView id={selectedProductId} dismiss={_ => setSelectedProductId(undefined)} />
        </Modal>

        <Affix offsetTop={0}>
            <Space className='toolBar' style={{ background: colorBgContainer, justifyContent: 'space-between' }}>
                <ProductSearchBox data={products} setFilteredData={setFilteredProducts} mode='simple' />
                <Space>
                    <Button icon={<PlusOutlined />} onClick={handleCreateProduct}>
                        新增
                    </Button>
                    <Button icon={<ExportOutlined />} disabled={filteredProducts.length === 0} onClick={exportProducts}>
                        导出
                    </Button>
                    <Button icon={<ClearOutlined />} type='dashed' disabled={filteredProducts.filter(p => !p.invoiceNum > 0).length === 0}
                        onClick={_ => showDeleteConfirm(filteredProducts.filter(p => !p.invoiceNum > 0))} danger>
                        清理
                    </Button>
                </Space>
            </Space>
        </Affix>

        <div className='pageMainContent'>
            <Table dataSource={filteredProducts} size='middle' bordered rowKey={record => record.id} columns={getTableColumns()}
                pagination={DEFAULT_PAGINATION} scroll={{ x: 'max-content' }} />
        </div>
    </Space>
}