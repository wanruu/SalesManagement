import React, { useEffect } from 'react'
import { Space, Button, Row, Card } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import SimpleSearch from './SimpleSearch'
import PartnerSearch from './PartnerSearch'
import ProductSearch from './ProductSearch'
import InvoiceSearch from './InvoiceSearch'
import { QuestionTooltip } from '../utils'


const SearchManager = (props) => {
    const { pageKey, onSearch, simpleSearchHelp } = props

    // redux
    const mode = useSelector(state => state.page[pageKey].search.mode)
    const form = useSelector(state => state.page[pageKey].search.form)
    const dispatch = useDispatch()
    const handleModeChange = () => {
        dispatch({ type: 'page/updateSearchMode', payload: { pageKey: pageKey, mode: mode === 'simple' ? 'complex' : 'simple' } })
    }
    const handleFormChange = (values) => {
        dispatch({ type: 'page/updateSearchForm', payload: { pageKey: pageKey, form: values } })
    }


    useEffect(onSearch, [])


    const complexProps = {
        initialValues: form,
        onSearch: onSearch,
        onChange: handleFormChange,
    }
    const complexDict = {
        partner: <PartnerSearch {...complexProps} />,
        product: <ProductSearch {...complexProps} />,
        salesOrder: <InvoiceSearch {...complexProps} type={pageKey} />,
        salesRefund: <InvoiceSearch {...complexProps} type={pageKey} />,
        purchaseOrder: <InvoiceSearch {...complexProps} type={pageKey} />,
        purchaseRefund: <InvoiceSearch {...complexProps} type={pageKey} />,
    }
    const titleDict = {
        complex: '高级搜索',
        simple: <Space>智能搜索{simpleSearchHelp ? <QuestionTooltip title={simpleSearchHelp} /> : null}</Space>,
    }

    return (
        <Card title={
            <Row style={{ justifyContent: 'space-between' }}>
                <b style={{ fontSize: '12pt' }}>
                    {titleDict[mode]}
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
                    <SimpleSearch onSearch={onSearch} keyword={form.keyword}
                        onKeywordChange={value => handleFormChange({ keyword: value })} /> :
                    complexDict[pageKey]
            }
        </Card>
    )
}

export default SearchManager
