import dayjs from 'dayjs'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, Col, Row, Select, Space, Button } from 'antd'
import ReactEcharts from 'echarts-for-react'
import { useDispatch } from 'react-redux'
import Title from 'antd/es/typography/Title'

import { DATE_FORMAT } from '@/utils/invoiceUtils'
// import AbstractView from '../components/statistic/AbstractView'
// import RangeSelectView from '../components/statistic/RangeSelectView'
import { DateRangeSelector } from '@/components/Selector'


export default function StatisticPage() {
    const [dateRange, setDateRange] = useState([null, null]);
    
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch({ type: 'globalInfo/addMessage', payload: {type: 'info', duration: 5, content: 'test1'} });
        dispatch({ type: 'globalInfo/addMessage', payload: {type: 'info', duration: 5, content: 'test2'} });
        dispatch({ type: 'globalInfo/addMessage', payload: {key: 'test3', type: 'info', duration: 5, content: 'test3'} });
        dispatch({ type: 'globalInfo/addMessage', payload: {key: 'test3', type: 'success', duration: 5, content: 'test3'} });
        dispatch({ type: 'globalInfo/addMessage', payload: {key: 'test3', type: 'warning', duration: 5, content: 'test3'} });
    },[]);
    
    const isActive = (type) => {
        return 'test';
    }

    return (
        <div className='page-main-content'>
            {/* <RangeSelectView dateRange={dateRange} setDateRange={setDateRange} /> */}

            {/* <AbstractView /> */}

            <Title id='summary' level={2}>收支趋势图</Title>
            {/* <ReactEcharts option={getOption()} /> */}

            <DateRangeSelector value={dateRange} onChange={setDateRange} />
            
        </div>
    )
}
