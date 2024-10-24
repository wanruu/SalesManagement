import React from 'react'
import { Row, Space, Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import Decimal from 'decimal.js'


/**
 * Convert to a currency string.
 * @name Decimal#toCurrencyString
 * @function
 * @param {string} [currencySymbol] - `$`, `¥`, `HK$`, etc.
 * @returns {string}
 */
Decimal.prototype.toCurrencyString = function (currencySymbol = '') {
    if (this.isNeg()) {
        return `-${currencySymbol}${this.abs().toLocaleString()}`
    }
    return `${currencySymbol}${this.toLocaleString()}`
}


/**
 * A label with a colored circle.
 * @component
 * @param {Object} props 
 * @param {number} props.radius
 * @param {string} props.color
 * @param {string} props.label
 * @returns {React.JSX.Element}
 */
export const CircleLabel = (props) => {
    const { radius = 5, color, label } = props
    return <Row align='middle'>
        <Space>
            <svg width={radius * 2} height={radius * 2}>
                <circle cx={radius} cy={radius} r={radius} fill={color} />
            </svg>
            {label}
        </Space>
    </Row>
}


/**
 * A question icon with tooltip.
 * @param {Object} props 
 * @param {React.JSX.Element} props.title
 * @returns {React.JSX.Element}
 */
export const QuestionTooltip = (props) => {
    const { title } = props
    return <Tooltip title={title}>
        <QuestionCircleOutlined style={{ color: 'gray', cursor: 'help' }} />
    </Tooltip>
}
