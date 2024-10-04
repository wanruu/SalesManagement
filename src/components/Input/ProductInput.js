import React, { useState } from 'react'
import { AutoComplete } from 'antd'

import suggestionService from '../../services/suggestionService'


const ProductInput = ({ value, field, onChange, size, status, style, disabled }) => {
    const [options, setOptions] = useState([])

    const load = (keyword) => {
        setOptions([])
        // if (keyword === '') { return }
        // suggestionService.fetchPartners(keyword).then(response => {
        //     const _options = response.data.map(i => ({ label: i, value: i }))
        //     setOptions(_options)
        // })
    }

    return <AutoComplete size={size || 'small'} value={value} 
        status={status} options={options}
        style={style || {}} 
        onChange={onChange}
        onSearch={load}
        disabled={disabled || false}
    />
}


export default ProductInput