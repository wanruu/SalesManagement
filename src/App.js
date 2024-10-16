import React, { useMemo, useState } from 'react'
import { Layout, theme, Menu } from 'antd'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
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


function App() {
    const [collapsed, setCollapsed] = useState(false)
    const { token: { colorBgContainer }, } = theme.useToken()
    const ifShowRefund = useSelector(state => state.functionSetting.ifShowRefund.value)

    const siderWidth = useMemo(() => {
        return collapsed ? 80 : 200
    }, [collapsed])

    return (
        <BrowserRouter>
            <Layout hasSider style={{ background: colorBgContainer }}>
                <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}
                    style={{ overflow: 'auto', height: '100vh', left: 0, top: 0, bottom: 0, position: 'fixed' }}>
                    <Menu theme='dark' mode='inline' defaultOpenKeys={['order', 'refund']} defaultSelectedKeys={['/']} >
                        <Menu.Item key='/' icon={<EditOutlined />}>
                            <Link to='/'>工作区</Link>
                        </Menu.Item>
                        <Menu.SubMenu key='order' title='发货清单' icon={<PlusCircleOutlined />}>
                            <Menu.Item key='salesOrder'>
                                <Link to='/salesorder'>销售单</Link>
                            </Menu.Item>
                            <Menu.Item key='purchaseOrder'>
                                <Link to='/purchaseOrder'>采购单</Link>
                            </Menu.Item>
                        </Menu.SubMenu>
                        {
                            ifShowRefund ? 
                            <Menu.SubMenu key='refund' title='退货清单' icon={<MinusCircleOutlined />}>
                                <Menu.Item key='salesRefund'>
                                    <Link to='/salesRefund'>销售退货</Link>
                                </Menu.Item>
                                <Menu.Item key='purchaseRefund'>
                                    <Link to='/purchaseRefund'>采购退货</Link>
                                </Menu.Item>
                            </Menu.SubMenu> : null
                        }
                        <Menu.Item key='product' icon={<DropboxOutlined />}>
                            <Link to='/product'>产品</Link>
                        </Menu.Item>
                        <Menu.Item key='partner' icon={<UserOutlined />}>
                            <Link to='/partner'>客户 / 供应商</Link>
                        </Menu.Item>
                        <Menu.Item key='stat' icon={<BarChartOutlined />}>
                            <Link to='/stat'>统计数据</Link>
                        </Menu.Item>
                        <Menu.Item key='settings' icon={<SettingOutlined />}>
                            <Link to='/settings'>设置</Link>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout style={{ marginLeft: siderWidth, transition: 'margin 0.2s ease-in-out'}}>
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
                            <Route path='settings' element={<SettingPage />} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </BrowserRouter>
    )
}

export default App
