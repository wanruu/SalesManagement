import React, { useState, useEffect, useMemo } from 'react'
import { Button, Space, Modal } from 'antd'
import { ClearOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { partnerService } from '@/services'
import PartnerTable from './PartnerTable'
import PartnerManager from '@/components/PartnerManager'
import SearchManager from '@/components/SearchManager'
import { DeleteConfirm } from '@/components/Modal'
import PartnerForm from './PartnerForm'
import { pick, omit } from 'lodash'


/**
 * @typedef Partner
 * @property {string} name
 * @property {string} [address]
 * @property {string} [phone]
 * @property {string} [folder]
 */


/**
 * @component
 */
const PartnerPage = () => {
    /** 
     * @type {[(Partner & {salesNum: number, purchaseNum: number})[], Function]}
     */
    const [partners, setPartners] = useState([])
    /** 
     * @type {[Partner?, Function]} 
     */
    const [partnerToEdit, setPartnerToEdit] = useState(undefined)
    /** 
     * @type {[Partner?, Function]} 
     */
    const [partnerToView, setPartnerToView] = useState(undefined)
    /** 
     * @type {[Partner[], Function]}
     */
    const [partnersToDelete, setPartnersToDelete] = useState([])


    const emptyPartners = useMemo(() => {
        return partners.filter(p => p.salesNum + p.purchaseNum == 0)
    }, [partners])


    // redux
    const searchMode = useSelector(state => state.page.partner.search.mode)
    const searchForm = useSelector(state => state.page.partner.search.form)
    const dispatch = useDispatch()

    const load = () => {
        const params = searchMode == 'simple' ? pick(searchForm, ['keyword']) : omit(searchForm, ['keyword'])
        partnerService.fetchMany(params).then(res => {
            setPartners(res.data)
        }).catch(err => {
            setPartners([])
            dispatch({
                type: 'globalInfo/addMessage',
                payload: { type: 'error', duration: 5, content: `加载失败：${err.message}. ${err.response?.data?.error}` }
            });
        })
    }


    const handlePartnerDelete = () => {
        const messageKey = 'delete-partner'
        dispatch({
            type: 'globalInfo/addMessage',
            payload: { key: messageKey, type: 'loading', duration: 86400, content: '删除中' }
        });
        partnerService.deleteMany(partnersToDelete).then(res => {
            dispatch({
                type: 'globalInfo/addMessage',
                payload: { key: messageKey, type: 'success', content: '删除成功' }
            });
            const names = partnersToDelete.map(p => p.name)
            setPartners(partners.filter(p => !names.includes(p.name)))
            setPartnersToDelete([])
        }).catch(err => {
            dispatch({
                type: 'globalInfo/addMessage',
                payload: { key: messageKey, type: 'error', duration: 5, content: `删除失败：${err.message}. ${err.response?.data?.error}`, }
            });
            setPartnersToDelete([])
        })
    }

    /**
     * Handle partner edit/create submission.
     * @param {Partner} partner
     */
    const handlePartnerChange = (partner, name) => {
        // prevent reloading from server
        const idx = partners.findIndex(p => p.name === name)
        const newPartners = [...partners]
        if (idx === -1) {
            newPartners.unshift(partner)
        } else {
            newPartners[idx] = { ...newPartners[idx], partner }
        }
        setPartnerToEdit(undefined)
        setPartners(newPartners)
    }

    // scroll position listener & recover
    const scrollY = useSelector(state => state.page.partner.scrollY)

    useEffect(() => {
        const handleScroll = () => {
            dispatch({ type: 'page/updateScrollY', payload: { pageKey: 'partner', scrollY: window.scrollY } })
        }
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    useEffect(() => window.scrollTo(0, scrollY), [partners])
    // ------------------------------------


    return <Space direction='vertical' style={{ width: '100%' }} className='page-main-content'>
        {/* Must be destroyOnClose, or the form can't be reset. */}
        <Modal title={partnerToEdit?.name ? '编辑交易对象' : '新增交易对象'} open={partnerToEdit} destroyOnClose
            onCancel={_ => setPartnerToEdit(undefined)} footer={null}>
            <PartnerForm partner={partnerToEdit} onPartnerChange={p => handlePartnerChange(p, partnerToEdit?.name)} />
        </Modal>

        <Modal open={partnerToView} title='交易对象' width='90%'
            onCancel={_ => setPartnerToView(undefined)} footer={null}>
            <PartnerManager partner={partnerToView} onPartnerChange={p => handlePartnerChange(p, partnerToView?.name)} />
        </Modal>

        <DeleteConfirm open={partnersToDelete.length > 0} onCancel={_ => setPartnersToDelete([])}
            title={partnersToDelete.length === 1 ? `是否删除交易对象 “${partnersToDelete[0].name}” ?` : `是否删除 ${partnersToDelete.length} 个交易对象?`}
            onOk={handlePartnerDelete} />

        <Space wrap>
            <Button icon={<PlusOutlined />} type='primary' ghost onClick={_ => setPartnerToEdit({})}>新增</Button>
            <Button icon={<ClearOutlined />} type='dashed' danger disabled={emptyPartners.length === 0}
                onClick={_ => setPartnersToDelete(emptyPartners)}>一键清理</Button>
            <Button icon={<ReloadOutlined />} onClick={_ => {
                setPartners([])
                load()
            }}>刷新</Button>
        </Space>
        <SearchManager pageKey='partner' onSearch={load}
            simpleSearchHelp='支持姓名、文件夹、电话、地址（文字、拼音及首字母），以空格分开。' />
        <PartnerTable partners={partners}
            onEdit={setPartnerToEdit} onSelect={setPartnerToView}
            onDelete={p => setPartnersToDelete([p])}
        />
    </Space>
}

export default PartnerPage