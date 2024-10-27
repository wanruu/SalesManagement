import React, { useEffect, useState } from 'react';
import { DatePicker } from 'antd';
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

    useEffect(() => {
        if (value === undefined) return;
        if (value !== dateRange) {
            setDateRange(value);
        }
    }, [value]);

    const valueOnChange = ([date1, date2]) => {
        setDateRange([date1, date2]);
        onChange([date1, date2]);
    };

    const setRange = (type) => {
        valueOnChange([ dayjs().startOf(type), dayjs().endOf(type) ])
    };

    return (
        <div className='daterange-selector-wrap'>
            <div className='daterange-selector'>
                <a onClick={() => setRange('today')}>
                    今日
                </a>
                <a onClick={() => setRange('week')}>
                    本周
                </a>
                <a onClick={() => setRange('month')}>
                    本月
                </a>
                <a onClick={() => setRange('year')}>
                    本年
                </a>
            </div>
            <RangePicker
                value={dateRange}
                onChange={valueOnChange}
                style={{ width: 256 }}
            />
        </div>
    );
}


