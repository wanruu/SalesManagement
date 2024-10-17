import React from 'react'
import { Space, Input, Button } from 'antd'


const SimpleSearch = ({ keyword, onKeywordChange, onSearch }) => {
    const handleInputKeyDown = (event) => {
        if (event.key === 'Enter') {
            onSearch?.()
        }
    }

    const handleInputChange = (event) => {
        onKeywordChange?.(event.target.value)
    }

    return (
        <Space.Compact style={{ width: '100%' }}>
            <Input placeholder='输入关键词' allowClear value={keyword??''}
                onKeyDown={handleInputKeyDown} onChange={handleInputChange} />
            <Button onClick={_ => onSearch?.()} type='primary'>搜索</Button>
        </Space.Compact>
    )
}


export default SimpleSearch