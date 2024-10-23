import React, { useState, useEffect } from 'react'
import { Button, Space, message, Modal } from 'antd'
import { ExclamationCircleFilled, ClearOutlined, ExportOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { partnerService } from '../services'
import { PartnerForm, PartnerManager } from '../components/PartnerManager'
import { MyWorkBook, MyWorkSheet } from '../utils/export'
import { PartnerTable } from '../components/Table'
import SearchManager from '../components/Search/SearchManager'


const PartnerPage = () => {
    const [partners, setPartners] = useState([])

    const [messageApi, contextHolder] = message.useMessage()
    const [editPartner, setEditPartner] = useState(undefined)
    const [selectedPartner, setSelectedPartner] = useState(undefined)
    
    // redux
    const searchMode = useSelector(state => state.page.partner.searchMode)
    const keywords = useSelector(state => state.page.partner.keywords)
    const searchForm = useSelector(state => state.page.partner.searchForm)
    const dispatch = useDispatch()

    const load = () => {
        const params = searchMode == 'simple' ? { keyword: keywords } : searchForm
        partnerService.fetchMany(params).then(res => {
            setPartners(res.data)
        }).catch(err => {
            setPartners([])
        })
    }

    const showDeleteConfirm = (partners) => {
        const title = partners.length === 1 ? `是否删除交易对象 “${partners[0].name}” ?` : `是否删除 ${partners.length} 个交易对象?`
        Modal.confirm({
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
        ws.writeJson(partners.map(p => {
            p.isCustomer = p.isCustomer ? '是' : ''
            p.isProvider = p.isProvider ? '是' : ''
            return p
        }), headers)
        wb.writeSheet(ws)
        wb.save()
    }

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

    return <Space direction='vertical' style={{ width: '100%' }} className='page-main-content'>
        {contextHolder}

        <Modal title={editPartner?.name ? '编辑交易对象' : '新增交易对象'} open={editPartner} destroyOnClose
            onCancel={_ => setEditPartner(undefined)} footer={null}>
            <PartnerForm partner={editPartner} onPartnerChange={_ => {
                setEditPartner(undefined)
                load()
            }} />
        </Modal>

        <Modal open={selectedPartner} onCancel={_ => setSelectedPartner(undefined)} title='交易对象' width='90%'
            footer={null}>
            <PartnerManager partner={selectedPartner} />
        </Modal>

        <Space wrap>
            <Button icon={<ExportOutlined />} onClick={handleExport} disabled={partners.length === 0}>导出</Button>
            <Button icon={<ClearOutlined />} type='dashed' danger disabled={partners.filter(p => p.salesNum==0 && p.purchaseNum==0).length === 0}
                onClick={_ => showDeleteConfirm(partners.filter(p => p.salesNum==0 && p.purchaseNum==0))}>清理</Button>
        </Space>
        <SearchManager pageKey='partner' onSearch={load} />
        <PartnerTable partners={partners} 
            onEdit={p => setEditPartner(p)} 
            onSelect={p => setSelectedPartner(p)}
            onDelete={p => showDeleteConfirm([p])}
        />
        
    </Space>
}

export default PartnerPage