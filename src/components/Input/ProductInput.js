import React, { useState } from 'react'
import { AutoComplete } from 'antd'
import { suggestionService } from '../../services'


/*
    Required: property (material/name/spec)
 */
const ProductInput = (props) => {
    const { property, ...inputProps } = props
    const [options, setOptions] = useState([])

    const load = (keyword) => {
        setOptions([])
        if (keyword === '') { return }
        suggestionService.fetchProducts(property, keyword).then(response => {
            const _options = response.data.map(i => ({ label: i, value: i }))
            setOptions(_options)
        })
    }

    return <AutoComplete {...inputProps} onSearch={load} options={options} />
}


export default ProductInput