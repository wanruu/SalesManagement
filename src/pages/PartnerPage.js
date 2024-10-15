import React, { useState, useEffect } from 'react'
import { Table, Button, Space, message, Modal, Tag, theme, Affix } from 'antd'
import {
    ExclamationCircleFilled, PlusOutlined, ClearOutlined,
    ExportOutlined, DownOutlined, UpOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'


const { confirm } = Modal


import { partnerService } from '../services'
import { PartnerForm } from '../components/PartnerManager'
import { MyWorkBook, MyWorkSheet } from '../utils/export'
import { PartnerSearch } from '../components/Search'
import { PartnerTable } from '../components/Table'


export default function PartnerPage() {
    const [partners, setPartners] = useState([])
    const [filteredPartners, setFilteredPartners] = useState([])

    const [messageApi, contextHolder] = message.useMessage()
    const [editPartner, setEditPartner] = useState(undefined)
    const [selectedPartner, setSelectedPartner] = useState(undefined)
    const { token: { colorBgContainer }, } = theme.useToken()
    const showSearchBox = useSelector(state => state.page.partner?.showSearchBox)
    const dispatch = useDispatch()
    const [affixed, setAffixed] = useState(false)

    const load = () => {
        partnerService.fetchMany().then(res => {
            setPartners(res.data)
        }).catch(err => {

        })
    }

    const showDeleteConfirm = (partners) => {
        const title = partners.length === 1 ? `是否删除交易对象 “${partners[0].name}” ?` : `是否删除 ${partners.length} 个交易对象?`
        confirm({
            title: title, icon: <ExclamationCircleFilled />,
            content: '确认删除后不可撤销',
            okText: '删除', okType: 'danger', cancelText: '取消',
            onOk() {
                partnerService.deleteMany(partners).then(res => {
                    messageApi.open({ type: 'success', content: '删除成功' })
                    load()
                }).catch(err => {
                    messageApi.open({ type: 'error', content: '删除失败' })
                })
            }
        })
    }

    const handleExport = () => {
        const headers = [
            { title: '姓名', dataIndex: 'name' },
            { title: '文件位置', dataIndex: 'folder' },
            { title: '电话', dataIndex: 'phone' },
            { title: '地址', dataIndex: 'address' },
            { title: '客户', dataIndex: 'isCustomer' },
            { title: '供应商', dataIndex: 'isProvider' }
        ]
        let wb = new MyWorkBook('交易对象')
        let ws = new MyWorkSheet('总览')
        ws.writeJson(filteredPartners.map(p => {
            p.isCustomer = p.isCustomer ? '是' : ''
            p.isProvider = p.isProvider ? '是' : ''
            return p
        }), headers)
        wb.writeSheet(ws)
        wb.save()
    }

    useEffect(load, [])

    // scroll position listener & recover
    const scrollY = useSelector(state => state.page.partner.scrollY)

    useEffect(() => {
        const handleScroll = () => {
            dispatch({ type: 'page/updateScrollY', menuKey: 'partner', scrollY: window.scrollY })
        }
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    useEffect(() => window.scrollTo(0, scrollY), [partners])
    // ------------------------------------

    return <Space direction='vertical' style={{ width: '100%' }} className='pageMainContent'>
        {contextHolder}

        <Modal title={editPartner?.name ? '编辑交易对象' : '新增交易对象'} open={editPartner} destroyOnClose
            onCancel={_ => setEditPartner(undefined)} footer={null}>
            <PartnerForm partner={editPartner} onPartnerChange={_ => {
                setEditPartner(undefined)
                load()
            }} />
        </Modal>

        <Modal open={selectedPartner} onCancel={_ => setSelectedPartner(undefined)} title='交易对象详情' footer={null} width='90%'>
            
        </Modal>

        {/* <Affix offsetTop={0} onChange={setAffixed}>
            <Space className={`toolBar-${affixed}`} direction='vertical' style={{ background: colorBgContainer }} size={0}>
                <Space wrap>
                    <Button icon={<PlusOutlined />} onClick={_ => setEditPartner({ name: '', phone: '', address: '', folder: '' })}>新增</Button>
                    <Button icon={<ExportOutlined />} onClick={handleExport} disabled={filteredPartners.length === 0}>导出</Button>
                    <Button icon={<ClearOutlined />} type='dashed' danger disabled={filteredPartners.filter(p => !p.isCustomer && !p.isProvider).length === 0}
                        onClick={_ => showDeleteConfirm(filteredPartners.filter(p => !p.isCustomer && !p.isProvider).map(p => p.name))}>清理</Button>
                    <Button onClick={_ => dispatch({ type: 'page/toggleShowSearchBox', menuKey: 'partner' })}
                        icon={showSearchBox ? <UpOutlined /> : <DownOutlined />}>
                        {showSearchBox ? '收起搜索' : '展开搜索'}
                    </Button>
                </Space>
                <PartnerSearch data={partners} setFilteredData={setFilteredPartners} />
            </Space>
        </Affix> */}

        <PartnerTable partners={partners} 
            onEdit={p => setEditPartner(p)} 
            onSelect={p => setSelectedPartner(p)}
            onDelete={p => showDeleteConfirm([p])}
        />
    </Space>
}