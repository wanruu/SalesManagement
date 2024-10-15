import React, { useState } from 'react'
import { AutoComplete } from 'antd'
import { suggestionService } from '../../services'


const PartnerInput = (props) => {
    const [options, setOptions] = useState([])

    const load = (keyword) => {
        setOptions([])
        if (keyword === '') { return }
        suggestionService.fetchPartners(keyword).then(res => {
            const _options = res.data.map(i => ({ label: i, value: i }))
            setOptions(_options)
        })
    }

    return <AutoComplete options={options} {...props} onSearch={load} />
}


export default PartnerInput