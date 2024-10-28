import React, { useEffect, useState } from 'react';
import { DatePicker, Space, Select } from 'antd';
import dayjs from 'dayjs';
import './selector.style.scss';

const { RangePicker } = DatePicker;

/**
 * 
 * @param {Object} props
 * @param {Date[]} props.value
 * @param {(date: Date[]) => void} props.onChange
 */

export default function DateRangeSelector({ 
    value,
    onChange,
    ...props
}) {
    const initValue = value || [null, null];
    const [dateRange, setDateRange] = useState(initValue);
    const [rangeMode, setRangeMode] = useState('date');

    useEffect(() => {
        if (value === undefined) return;
        if (value === null) {
            setDateRange([null, null]);
            return;
        }
        if (value !== dateRange) {
            setDateRange(value);
        }
    }, [value]);

    const handleChange = (value) => {
        console.log(value);
        if (value === null) {
            setDateRange([null, null]);
            onChange(null);
        } else {
            const [date1, date2] = value;
            setDateRange([date1, date2]);
            onChange([date1, date2]);
        }
    };

    const handleRangeSwitch = (type) => {
        setRangeMode('date');
        handleChange([ dayjs().startOf(type), dayjs().endOf(type) ])
    };

    return (
        <div className='daterange-selector-wrap'>
            <div className='daterange-selector'>
                <a onClick={() => handleRangeSwitch('today')}>
                    今日
                </a>
                <a onClick={() => handleRangeSwitch('week')}>
                    本周
                </a>
                <a onClick={() => handleRangeSwitch('month')}>
                    本月
                </a>
                <a onClick={() => handleRangeSwitch('year')}>
                    本年
                </a>
            </div>
            <Space.Compact>
                <Select
                    style={{ width: 70, textAlign: 'center' }}
                    options={[
                        { label: '日期', value: 'date' },
                        { label: '周', value: 'week' },
                        { label: '月', value: 'month' },
                        { label: '年', value: 'year' }
                    ]}
                    value={rangeMode}
                    onChange={setRangeMode}
                />
                <RangePicker
                    picker={rangeMode}
                    value={dateRange}
                    onChange={handleChange}
                    {...props}
                />
            </Space.Compact>
        </div>
    );
}


