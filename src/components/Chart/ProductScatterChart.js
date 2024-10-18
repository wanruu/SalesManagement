import React, { useMemo } from 'react'
import ReactEcharts from 'echarts-for-react'
import { INVOICE_BASICS } from '../../utils/invoiceUtils'
import _ from 'lodash'


const ProductScatterChart = ({ product, field='price' }) => {
    const scatters = useMemo(() => {
        return _.groupBy((product?.invoiceItems ?? []), item => item.invoice.type)
    }, [product, field])

    const types = ['salesOrder', 'salesRefund', 'purchaseOrder', 'purchaseRefund']
        .filter(t => scatters.hasOwnProperty(t))

    const option = {
        legend: {
            show: true,
        },
        xAxis: {
            name: '日期',
            type: 'time',
            minInterval: 24 * 3600 * 1000,
            axisLabel: {
                formatter: (function(value) {
                    var date = new Date(value)
                    const texts = [date.getFullYear(), (date.getMonth() + 1), date.getDate()]
                    return texts.join('-')
                })
            },
        },
        yAxis: {
            type: 'value',
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                const date = `<div>${params[0]?.data?.[0]}</div>`
                const lines = params.map(p => {
                    return `<div>
                        ${p.marker}
                        <span style='padding-right:10px;'>${p.seriesName}</span>
                        <b>${p.data[1]}</b>
                    </div>`
                })
                return [date, ...lines].join('')
            }
        },
        series: types.map(type => ({
            type: 'scatter',
            data: scatters[type].map(item => [item.invoice.date, item[field]]),
            name: INVOICE_BASICS[type].title,
            color: INVOICE_BASICS[type].color,
        }))
    }

    return <ReactEcharts option={option} />
}

export default ProductScatterChart