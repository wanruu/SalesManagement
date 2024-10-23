import React, { useMemo, useState } from 'react'
import { Layout, theme, Menu } from 'antd'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import {
    SettingOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
    UserOutlined,
    BarChartOutlined,
    DropboxOutlined,
    EditOutlined
} from '@ant-design/icons'
import SettingPage from './pages/SettingPage'
import ProductPage from './pages/ProductPage'
import PartnerPage from './pages/PartnerPage'
import InvoicePage from './pages/InvoicePage'
import StatisticPage from './pages/StatisticPage'
import DraftPage from './pages/DraftPage'
import { useSelector } from 'react-redux'


const { Header, Content, Footer, Sider } = Layout


const AppWrapper = () => {
    return <BrowserRouter>
        <App />
    </BrowserRouter>
}


const App = () => {
    const [collapsed, setCollapsed] = useState(false)
    const { token: { colorBgContainer }, } = theme.useToken()
    const ifShowRefund = useSelector(state => state.functionSetting.ifShowRefund.value)
    const location = useLocation()

    const siderWidth = useMemo(() => {
        return collapsed ? 80 : 200
    }, [collapsed])


    const menuItems = useMemo(() => [
        {
            label: <Link to='/'>工作区</Link>,
            icon: <EditOutlined />,
            key: '/',
        },
        {
            label: '发货清单',
            icon: <PlusCircleOutlined />,
            key: '/order',
            children: [
                {
                    label: <Link to='/salesOrder'>销售单</Link>,
                    key: '/salesOrder',
                },
                {
                    label: <Link to='/purchaseOrder'>采购单</Link>,
                    key: '/purchaseOrder',
                }
            ]
        },
        ifShowRefund ? {
            label: '退货清单',
            icon: <MinusCircleOutlined />,
            key: '/refund',
            children: [
                {
                    label: <Link to='/salesRefund'>销售退货</Link>,
                    key: '/salesRefund',
                },
                {
                    label: <Link to='/purchaseRefund'>采购退货</Link>,
                    key: '/purchaseRefund',
                }
            ],
        } : null,
        {
            label: <Link to='/product'>产品</Link>,
            icon: <DropboxOutlined />,
            key: '/product',
        },
        {
            label: <Link to='/partner'>客户 / 供应商</Link>,
            icon: <UserOutlined />,
            key: '/partner',
        },
        {
            label: <Link to='/stat'>统计</Link>,
            icon: <BarChartOutlined />,
            key: '/stat',
        },
        {
            label: <Link to='/setting'>设置</Link>,
            icon: <SettingOutlined />,
            key: '/setting',
        }
    ].filter(c=>c), [ifShowRefund])

    return (
        <Layout hasSider style={{ background: colorBgContainer }}>
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}
                style={{ overflow: 'auto', height: '100vh', left: 0, top: 0, bottom: 0, position: 'fixed' }}>
                <Menu theme='dark' mode='inline' defaultOpenKeys={['order', 'refund']} selectedKeys={[location.pathname]}
                    items={menuItems} />
            </Sider>
            <Layout style={{ marginLeft: siderWidth, transition: 'margin 0.2s ease-in-out' }}>
                <Content style={{ background: colorBgContainer, overflow: 'initial' }}>
                    <Routes>
                        <Route path='/' element={<DraftPage />} />
                        <Route path='salesOrder' element={<InvoicePage type='salesOrder' key='salesOrder' />} />
                        <Route path='purchaseOrder' element={<InvoicePage type='purchaseOrder' key='purchaseOrder' />} />
                        <Route path='salesRefund' element={<InvoicePage type='salesRefund' key='salesRefund' />} />
                        <Route path='purchaseRefund' element={<InvoicePage type='purchaseRefund' key='purchaseRefund' />} />
                        <Route path='product' element={<ProductPage />} />
                        <Route path='partner' element={<PartnerPage />} />
                        <Route path='stat' element={<StatisticPage />} />
                        <Route path='setting' element={<SettingPage />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    )
}

export default AppWrapper
