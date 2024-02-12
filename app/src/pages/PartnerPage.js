import React, { useState, useEffect } from 'react'
import { Table, Button, Space, message, Modal, Tag, theme, Affix } from 'antd'
import Axios from 'axios'
import {
    ExclamationCircleFilled, PlusOutlined, ClearOutlined,
    ExportOutlined, DownOutlined, UpOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'


const { confirm } = Modal


import PartnerEditView from '../components/partner/PartnerEditView'
import PartnerView from '../components/partner/PartnerView'
import { baseURL, DEFAULT_PAGINATION } from '../utils/config'
import { exportExcel } from '../utils/export'
import SearchBox from '../components/partner/SearchBox'


export default function PartnerPage() {
    const [partners, setPartners] = useState([])
    const [filteredPartners, setFilteredPartners] = useState([])

    const [messageApi, contextHolder] = message.useMessage()
    const [editPartner, setEditPartner] = useState(undefined)
    const [selectedPartnerName, setSelectedPartnerName] = useState(undefined)
    const { token: { colorBgContainer }, } = theme.useToken()
    const showSearchBox = useSelector(state => state.page.partner?.showSearchBox)
    const dispatch = useDispatch()
    const [affixed, setAffixed] = useState(false)

    const load = () => {
        Axios({
            method: 'get',
            baseURL: baseURL(),
            url: '/partner',
            'Content-Type': 'application/json',
        }).then(res => {
            setPartners(res.data)
        }).catch(_ => { })
    }

    const showDeleteConfirm = (names) => {
        const title = names.length === 1 ? `是否删除交易对象 “${names[0]}” ?` : `是否删除 ${names.length} 个交易对象?`
        confirm({
            title: title, icon: <ExclamationCircleFilled />,
            content: '确认删除后不可撤销',
            okText: '删除', okType: 'danger', cancelText: '取消',
            onOk() {
                Axios({
                    method: 'delete',
                    baseURL: baseURL(),
                    url: `/partner`,
                    data: { names: names },
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

    const handleExport = () => {
        const partners = filteredPartners.map(p => {
            return { '姓名': p.name, '电话': p.phone, '地址': p.address }
        })
        exportExcel('交易对象', partners)
    }

    const columns = [
        { title: '序号', align: 'center', render: (_, __, idx) => idx + 1, fixed: 'left' },
        { title: '姓名', align: 'center', dataIndex: 'name' },
        { title: '文件位置', align: 'center', dataIndex: 'folder' },
        { title: '电话', align: 'center', dataIndex: 'phone' },
        { title: '地址', align: 'center', dataIndex: 'address' },
        {
            title: '身份', align: 'center', render: (_, record) => {
                const customer = record.orderId == null ? null : <Tag color='blue'>客户</Tag>
                const provider = record.purchaseId == null ? null : <Tag color='gold'>供应商</Tag>
                return <>{customer} {provider}</>
            }
        },
        {
            title: '操作', align: 'center', fixed: 'right', render: (_, record) =>
                <Space>
                    <Button type='primary' ghost onClick={_ => setEditPartner(record)}>编辑</Button>
                    {
                        record.purchaseId != null || record.orderId != null ?
                            <Button onClick={_ => setSelectedPartnerName(record.name)}>查看</Button> :
                            <Button danger onClick={_ => showDeleteConfirm([record.name])}>删除</Button>
                    }
                </Space>
        }
    ]

    useEffect(load, [])

    return <Space direction='vertical' style={{ width: '100%' }}>
        {contextHolder}

        <Modal title={editPartner && editPartner.name !== '' ? '编辑交易对象' : '新增交易对象'} open={editPartner !== undefined} destroyOnClose
            onCancel={_ => setEditPartner(undefined)} footer={null}>
            <PartnerEditView partner={editPartner} dismiss={_ => setEditPartner(undefined)} refresh={load} messageApi={messageApi} />
        </Modal>

        <Modal open={selectedPartnerName !== undefined} onCancel={_ => setSelectedPartnerName(undefined)} title='交易对象详情' footer={null} destroyOnClose width={900}>
            <PartnerView name={selectedPartnerName} dismiss={_ => setSelectedPartnerName(undefined)} refresh={load} />
        </Modal>

        <Affix offsetTop={0} onChange={setAffixed}>
            <Space className={`toolBar-${affixed}`} direction='vertical' style={{ background: colorBgContainer }} size={0}>
                <Space wrap>
                    <Button icon={<PlusOutlined />} onClick={_ => setEditPartner({ name: '', phone: '', address: '', folder: '' })}>新增</Button>
                    <Button icon={<ExportOutlined />} onClick={handleExport} disabled={filteredPartners.length === 0}>导出</Button>
                    <Button icon={<ClearOutlined />} type='dashed' danger disabled={filteredPartners.filter(p => p.orderId == null && p.purchaseId == null).length === 0}
                        onClick={_ => showDeleteConfirm(filteredPartners.filter(p => p.orderId == null && p.purchaseId == null).map(p => p.name))}>清理</Button>
                    <Button onClick={_ => dispatch({ type: 'page/toggleShowSearchBox', menuKey: 'partner' })}
                        icon={showSearchBox ? <UpOutlined /> : <DownOutlined />}>
                        {showSearchBox ? '收起搜索' : '展开搜索'}
                    </Button>
                </Space>
                <SearchBox data={partners} setFilteredData={setFilteredPartners} />
            </Space>
        </Affix>

        <div className='pageMainContent'>
            <Table dataSource={filteredPartners} size='middle' bordered rowKey={record => record.name}
                scroll={{ x: 'max-content' }} pagination={DEFAULT_PAGINATION} columns={columns} />
        </div>
    </Space>
}