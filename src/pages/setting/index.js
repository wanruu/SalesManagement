import { Anchor, Row, Col } from 'antd'
import React, { useEffect } from 'react'
import * as XLSX from 'xlsx'

import { useSelector, useDispatch } from 'react-redux'


// import PhoneAccessView from '../components/common/PhoneAccessView'
import PrintSetting from './PrintSetting'
import FunctionSetting from './FunctionSetting'



export default function SettingPage() {
    // const handleUpload = (options) => {
    //     const { onSuccess, onError, file, onProgress } = options

    //     const xlsxFormatDate = (numb) => {
    //         const old = numb - 1
    //         const t = Math.round((old - Math.floor(old)) * 24 * 60 * 60)
    //         const time = new Date(1900, 0, old, 0, 0, t)
    //         const year = time.getFullYear() 
    //         const month = time.getMonth() + 1 
    //         const date = time.getDate() 
    //         return year + '-' + (month < 10 ? '0' + month : month) + '-' + (date < 10 ? '0' + date : date)
    //     }

    //     const groupData = (rows) => {
    //         // clean rows keys
    //         const newRows = rows.map((obj) => {
    //             const newObj = {} // 创建一个新的对象来存储处理后的键值对
    //             for (let key in obj) {
    //                 if (obj.hasOwnProperty(key)) {
    //                     const newKey = key.replace(/\s/g, '') // 去除空格，创建新的键名
    //                     newObj[newKey] = obj[key] // 将原始键名对应的值赋给新的键名
    //                     if (newKey !== key) {
    //                         delete obj[key] // 删除原始键名
    //                     }
    //                 }
    //             }
    //             return newObj
    //         })

    //         var invoices = []
    //         for (const row of newRows) {
    //             if (row['材质'] === undefined || row['物品名称'] === undefined || row['规格'] === undefined) {
    //                 continue
    //             }
    //             const item = {
    //                 material: row['材质'],
    //                 name: row['物品名称'],
    //                 spec: row['规格'],
    //                 unitPrice: row['单价'] === undefined ? 0 : row['单价'],
    //                 quantity: row['数量'] === undefined ? 0 : row['数量'],
    //                 remark: row['备注'] === undefined ? '' : row['备注'],

    //             }
    //             if (row['送货单号'] !== undefined) {
    //                 invoices.push({ 
    //                     no: row['送货单号'],
    //                     date: xlsxFormatDate(row['日期']),
    //                     customer: row['收货单位'],
    //                     isPaid: row['款项'] === '已收款',
    //                     isInvoiced: row['发票'] === '已开票',
    //                     items: [item]
    //                 })
    //             } else {
    //                 invoices[invoices.length-1].items.push(item)
    //             }
    //         }
    //         return invoices
    //     }

    //     const readFile = (file) => {
    //         const fileReader = new FileReader()
    //         fileReader.onload = (e) => {
    //             let workbook = XLSX.read(e.target.result, {type: 'binary'})
    //             Object.keys(workbook.Sheets).forEach(sheet => {
    //                 const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
    //                 // group by invoice
    //                 const invoices = groupData(data)
    //                 Axios({
    //                     method: 'post',
    //                     baseURL: baseURL(),
    //                     url: 'invoices/upload/',
    //                     data: {invoices: invoices},
    //                     'Content-Type': 'application/json',
    //                 }).then(res => {
    //                     onSuccess()
    //                 }).catch(err => {
    //                     onError(err)
    //                 })
    //             })
    //         }
    //         fileReader.readAsBinaryString(file)
    //     }
    //     readFile(file)
    // }

    const dispatch = useDispatch()


    const anchorItems = [
        {
            key: 'function', href: '#function', title: '功能设置', content: <FunctionSetting />,
            children: [
                { key: 'function-material', href: '#function-material', title: '材质' },
                { key: 'function-unit', href: '#function-unit', title: '单位' },
                { key: 'function-amount', href: '#function-amount', title: '金额' },
                { key: 'function-discount', href: '#function-discount', title: '折扣' },
                { key: 'function-remark', href: '#function-remark', title: '备注' },
                { key: 'function-deliver', href: '#function-deliver', title: '配送' },
                { key: 'function-payment', href: '#function-payment', title: '付款' },
                { key: 'function-refund', href: '#function-refund', title: '退货' },
            ]
        },
        {
            key: 'print', href: '#print', title: '打印设置', content: <PrintSetting />,
            children: [
                { key: 'print-overall', href: '#print-overall', title: '清单整体' },
                { key: 'print-title', href: '#print-title', title: '标题 & 副标题' },
                { key: 'print-info', href: '#print-info', title: '头部' },
                { key: 'print-table', href: '#print-table', title: '表格' },
                { key: 'print-footer', href: '#print-footer', title: '脚注' },
                { key: 'print-preview', href: '#print-preview', title: '打印预览' }
            ]
        },
    ]


    // scroll position listener & recover
    const scrollY = useSelector(state => state.page.setting.scrollY)

    useEffect(() => {
        const handleScroll = () => {
            dispatch({ type: 'page/updateScrollY', payload: { pageKey: 'setting', scrollY: window.scrollY } })
        }
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    useEffect(() => window.scrollTo(0, scrollY), [])
    // ------------------------------------


    return (<div style={{ display: 'flex' }}>
        <div style={{ width: '100%' }} className='page-main-content' id='setting-main-content'>
            {
                anchorItems.map(i => <div key={i.key}>{i.content}</div>)
            }
        </div>
        <div style={{ paddingRight: '20px', width: '180px' }}>
            <Anchor items={anchorItems} offsetTop={20} targetOffset={40} />
        </div>
    </div>)
}