import dayjs from 'dayjs'
import Axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { Col, Row, Select, Space, Button, DatePicker } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'


import { baseURL } from '../../../utils/config'

const { RangePicker } = DatePicker


const RANGE_OPTIONS = [
    { value: 'week', label: '按周统计'},
    { value: 'month', label: '按月统计'},
    { value: 'year', label: '按年统计'},
    { value: 'all', label: '全部统计'},
    { value: 'custom', label: '范围统计'}
]



export default function RangeSelectView ({ dateRange, setDateRange }) {
    const [rangeOption, setRangeOption] = useState('week')

    const initRange = () => {
        const curr = dayjs()
        if (rangeOption === 'week') {
            setDateRange([curr.startOf('week'), null])
        } else if (rangeOption === 'month' || rangeOption === 'year') {
            setDateRange([curr, null])
        } else {
            Axios({
                method: 'get',
                baseURL: baseURL(),
                url: '/statistic/range',
                'Content-Type': 'application/json',
            }).then(res => {
                console.log(res.data)
                setDateRange([dayjs(res.data.minDate), dayjs(res.data.maxDate)])
            }).catch(_ => {
                setDateRange([dayjs(), dayjs()])
            })
        }
    }

    const handleRangeMinus = () => {
        const handleDateMinus = (date) => {
            if (date == null) {
                return null
            }
            if (rangeOption === 'week') {
                return date.subtract(7, 'day')
            } else if (rangeOption === 'month') {
                return date.subtract(1, 'month')
            } else if (rangeOption === 'year') {
                return date.subtract(1, 'year')
            }
        }
        setDateRange([handleDateMinus(dateRange[0]), handleDateMinus(dateRange[1])])
    }

    const handleRangePlus = () => {
        const handleDatePlus = (date) => {
            if (date == null) {
                return null
            }
            if (rangeOption === 'week') {
                return date.add(7, 'day')
            } else if (rangeOption === 'month') {
                return date.add(1, 'month')
            } else if (rangeOption === 'year') {
                return date.add(1, 'year')
            }
        }
        setDateRange([handleDatePlus(dateRange[0]), handleDatePlus(dateRange[1])])
    }


    const rangeDisplay = useMemo(() => {
        if (dateRange[0] == null && dateRange[1] == null) {
            return '...'
        } else if (dateRange[1] == null) {
            let dateCore
            if (rangeOption === 'year') {
                dateCore = <DatePicker picker='year' format='YYYY年' allowClear={false}
                    value={dateRange[0]} onChange={val => setDateRange([val, null])} />
            } else if (rangeOption === 'month') {
                dateCore = <DatePicker picker='month' format='YYYY年MM月' allowClear={false}
                    value={dateRange[0]} onChange={val => setDateRange([val, null])} />
            } else if (rangeOption === 'week') {
                dateCore = <DatePicker picker='week' allowClear={false} 
                    value={dateRange[0]} onChange={val => setDateRange([val.startOf('week'), null])} />
            }
            return <Space.Compact direction='horizontal'>
                <Button icon={<LeftOutlined />} onClick={_ => handleRangeMinus()}></Button>
                {dateCore}
                <Button icon={<RightOutlined />} onClick={_ => handleRangePlus()}></Button>
            </Space.Compact>
        } else {
            if (rangeOption === 'all') {
                return <RangePicker value={dateRange} allowClear={false} onChange={val => {
                    setDateRange(val)
                    setRangeOption('custom')
                }} />
            }
            return <RangePicker value={dateRange} onChange={val => setDateRange(val)} allowClear={false} />
        }
    }, [dateRange, rangeOption])

    useEffect(initRange, [rangeOption])

    return (
        <Row align='middle' style={{ marginTop: '15px' }}>
            <Col span={8}>
                <Select options={RANGE_OPTIONS} value={rangeOption} onChange={val => setRangeOption(val)} />
            </Col>
            <Col span={8} align='center'>
                {rangeDisplay}
            </Col>
        </Row>
    )
}