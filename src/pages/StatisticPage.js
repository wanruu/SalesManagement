import dayjs from 'dayjs'
import Axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, Col, Row, Select, Space, Button, DatePicker } from 'antd'
import ReactEcharts from 'echarts-for-react'
import Title from 'antd/es/typography/Title'


import { DATE_FORMAT, baseURL } from '../utils/config'
import AbstractView from '../components/statistic/AbstractView'
import RangeSelectView from '../components/statistic/RangeSelectView'




export default function StatisticPage() {
    const [dateRange, setDateRange] = useState([null, null])

    return (
        <div className='pageMainContent'>
            <RangeSelectView dateRange={dateRange} setDateRange={setDateRange} />

            <AbstractView />

            <Title id='summary' level={2}>收支趋势图</Title>
            {/* <ReactEcharts option={getOption()} /> */}
        </div>
    )
}
