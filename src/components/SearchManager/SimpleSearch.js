import React from 'react'
import { Space, Input, Button } from 'antd'


/**
 * @component
 * @param {Object} props 
 * @param {string} [props.keyword] - 输入框的初始值
 * @param {function} [props.onKeywordChange] - 输入框内容变化时的回调函数
 * @param {function} [props.onSearch] - 搜索按钮点击时的回调函数
 */
const SimpleSearch = (props) => {
    const { keyword = '', onKeywordChange, onSearch } = props

    const handleInputChange = (event) => {
        onKeywordChange?.(event.target.value)
    }

    return (
        <Space.Compact style={{ width: '100%' }}>
            <Input placeholder='输入关键词' allowClear value={keyword}
                onPressEnter={_ => onSearch?.()} onChange={handleInputChange} />
            <Button onClick={_ => onSearch?.()} type='primary'>搜索</Button>
        </Space.Compact>
    )
}


export default SimpleSearch