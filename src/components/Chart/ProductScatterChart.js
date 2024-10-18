import React, { useMemo } from 'react'
import ReactEcharts from 'echarts-for-react'


const ProductScatterChart = ({ product, field='price' }) => {
    const salesOrderScatters = useMemo(() => {
        return (product?.invoiceItems ?? [])
            .filter(item => item.invoice.type === 'salesOrder')
            .map(item => [item.invoice.date, item[field]])
    }, [product, field])

    const purchaseOrderScatters = useMemo(() => {
        return (product?.invoiceItems ?? [])
            .filter(item => item.invoice.type === 'purchaseOrder')
            .map(item => [item.invoice.date, item[field]])
    }, [product, field])

    const option = {
        title: {
            text: salesOrderScatters.length + purchaseOrderScatters.length ? '' : '暂无数据',
            left: 'center',
            top: 'center'
        },
        legend: {
            show: true,
        },
        xAxis: {
            name: '日期',
            type: 'time',
            axisLabel: {
                formatter: (function(value){
                    var newDate = new Date(value)
                    return newDate.toLocaleDateString()
                })
            }
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
        series: [
            {
                type: 'scatter',
                data: salesOrderScatters,
                name: '销售单'
            },
            {
                type: 'scatter',
                data: purchaseOrderScatters,
                name: '采购单'
            },
        ]
    }

    return <ReactEcharts option={option} />
}

export default ProductScatterChart