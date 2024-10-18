import React from 'react'
import ReactEcharts from 'echarts-for-react'
import { useSelector } from 'react-redux'
import { INVOICE_BASICS } from '../../utils/invoiceUtils'


const ProductLineChart = ({ product, type='salesOrder', field='quantity' }) => {
    const ifShowDiscount = useSelector(state => state.functionSetting.ifShowDiscount.value)

    const color = INVOICE_BASICS[type].color
    const items = (product?.invoiceItems ?? [])
        .filter(item => item.invoice.type === type)
        .sort((a, b) => a.invoice.number.localeCompare(b.invoice.number))
        .map(item => ({ ...item, value: item[field] }))
    const partnerTitle = INVOICE_BASICS[type]?.partnerTitle

    const option = {
        color: color,
        xAxis: {
            name: '单号',
            type: 'category',
            data: items.map(i => i.invoice.number),
            axisPointer: {
                label: {
                    formatter: function (params) {
                        return params.value
                    },
                    backgroundColor: color
                },
            },
        },
        yAxis: {
            type: 'value',
            axisPointer: {
                snap: true,
                label: {
                    backgroundColor: color
                }
            }
        },
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'cross'
            },
            formatter: function (params) {
                if (params.componentType === 'series') {
                    const item = params.data
                    const remark = item.remark ? `备注：${item.remark}` : ''
                    return `<div style="border-bottom:dashed lightgray;padding-bottom:5px;">
                        单价：${item.price?.toLocaleString()}<br/>
                        数量：${item.quantity?.toLocaleString()}<br/>
                        ${ifShowDiscount ? '折后价' : '金额'}：${item.amount?.toLocaleString()}<br/>
                        ${remark}
                    </div>
                    <div style="padding-top:5px;">
                        ${partnerTitle}：${item.invoice?.partnerName}<br/>
                        单号：${item.invoice?.number}
                    </div>`
                }
            }
        },
        series: [
            { 
                data: items, 
                type: 'line',
                smooth: true,
                markPoint: {
                    data: [
                        { type: 'max', name: 'Max' },
                        { type: 'min', name: 'Min' }
                    ]
                },
            },
        ]
    }

    return <ReactEcharts option={option} />
}

export default ProductLineChart