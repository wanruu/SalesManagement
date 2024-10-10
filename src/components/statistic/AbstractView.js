import React, { useEffect, useMemo, useState } from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import Axios from 'axios'
import Title from 'antd/es/typography/Title'


export default function AbstractView({ dateRange }) {
    const [saleStat, setSaleStat] = useState({
        grossIncome: null,
        income: null,
        refund: null,
        nCustomers: null,
        nProducts: null,
        nInvoices: null
    })

    const numFormatter = (value) => {
        return value == null ? '...' : value.toLocaleString()
    }

    const loadSalesStat = () => {
        Axios({
            method: 'get',
            baseURL: baseURL(),
            url: 'statistic/sales',
        }).then(res => {
            setSaleStat(res.data)
        }).catch(err => {

        })
    }

    useEffect(loadSalesStat, [])

    const getOption = () => {
        return {
            title: { text: historyStat.length === 0 ? '暂无数据' : '', x: 'center', y: 'center' },
            xAxis: {
                type: 'category',
                data: historyStat.map(history => {
                    const d = dayjs(history.date).format(DATE_FORMAT)
                    if (historyRange === 'day') return d
                    if (historyRange === 'month') return d.slice(0, 8)
                    if (historyRange === 'year') return d.slice(0, 5)
                }),
            },
            yAxis: {
                type: 'value'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    const data = params[0].data
                    const result = `成交金额：¥ ${data.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br/>`
                    const d = dayjs(data.date).format(DATE_FORMAT)
                    if (historyRange === 'day') return result + `日期：${d}`
                    if (historyRange === 'month') return result + `月份：${d.slice(0, 8)}`
                    if (historyRange === 'year') return result + `年份：${d.slice(0, 5)}`
                }
            },
            series: [
                {
                    data: historyStat.map(history => ({
                        value: history.amount,
                        date: history.date,
                    })),
                    type: 'line'
                }
            ]
        }
    }

    return <>
        <Title id='summary' level={2}>销售摘要</Title>
        <Card bordered={true}>
            <Row gutter={16} wrap>
                <Col span={8}>
                    <Statistic title='净收入' value={saleStat.grossIncome} precision={2} formatter={numFormatter} />
                </Col>
                <Col span={8}>
                    <Statistic title='营业额' value={saleStat.income} precision={2} formatter={numFormatter} />
                </Col>
                <Col span={8}>
                    <Statistic title='退款' value={saleStat.refund} precision={2} formatter={numFormatter} />
                </Col>
                <Col span={8}>
                    <Statistic title='成交单数' value={saleStat.nInvoices} formatter={numFormatter} />
                </Col>
                <Col span={8}>
                    <Statistic title='客户数' value={saleStat.nCustomers} formatter={numFormatter} />
                </Col>
                <Col span={8}>
                    <Statistic title='产品数' value={saleStat.nProducts} formatter={numFormatter} />
                </Col>
            </Row>
        </Card>
    </>
}