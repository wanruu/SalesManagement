import React, { useEffect } from 'react'
import { Space, Button, Tooltip, Row, Card } from 'antd'
import { ExclamationCircleOutlined, SwapOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import SimpleSearch from './SimpleSearch'
import PartnerSearch from './PartnerSearch'
import ProductSearch from './ProductSearch'


const SearchManager = ({ pageKey, onSearch }) => {
    const mode = useSelector(state => state.page[pageKey].searchMode)
    const keyword = useSelector(state => state.page[pageKey].keywords)
    const searchForm = useSelector(state => state.page[pageKey].searchForm)
    const dispatch = useDispatch()

    useEffect(onSearch, [])


    const handleModeChange = () => {
        dispatch({ type: 'page/setSearchMode', menuKey: pageKey, searchMode: mode === 'simple' ? 'complex' : 'simple' })
    }

    const handleKeywordChange = (value) => {
        dispatch({ type: 'page/updateKeywords', menuKey: pageKey, payload: value })
    }

    const handleFormValuesChange = (values) => {
        dispatch({ type: 'page/updateSearchForm', menuKey: pageKey, payload: values })
    }
    const handleFormReset = () => {
        dispatch({ type: 'page/resetSearchForm', menuKey: pageKey })
    }

    const complexDict = {
        'partner': <PartnerSearch initialValues={searchForm} onSearch={onSearch} 
            onChange={handleFormValuesChange} onReset={handleFormReset} />,
        'product': <ProductSearch initialValues={searchForm} onSearch={onSearch}
            onChange={handleFormValuesChange} onReset={handleFormReset} />,
    }

    return (
        <Card title={
            <Row style={{ justifyContent: 'space-between' }}>
                <b style={{ fontSize: '12pt' }}>
                    {
                        mode == 'complex' ? '高级搜索' :
                        <>
                            智能搜索
                            <Tooltip title='支持姓名、文件位置、电话、地址（文字、拼音及首字母），以空格分开。' placement='right'>
                                <ExclamationCircleOutlined style={{ color: 'gray', marginLeft: '3px' }} />
                            </Tooltip>
                        </>
                    }
                </b>
                <Button size='small' type='text' style={{ color: 'gray', fontSize: '10pt' }} onClick={handleModeChange}>
                    <Space size={1} direction='horizontal'>
                        <SwapOutlined />
                        <span>切换模式</span>
                    </Space>
                </Button>
            </Row>
        }>
        {
            mode == 'simple' ?
            <SimpleSearch onSearch={onSearch} keyword={keyword} onKeywordChange={handleKeywordChange} /> :
            complexDict[pageKey]
        }
        </Card>
    )
}

export default SearchManager
