import React, { useState } from 'react'
import InvoiceManager from './InvoiceManager'


const ExistingInvoiceManager = (props) => {
    const { invoice, onSave, onCancel } = props
    const { type } = invoice ?? {}

    const [mode, setMode] = useState('view')
    return (
        <InvoiceManager type={type}
            invoice={invoice}
            mode={mode} onModeChange={setMode}
            onSave={onSave}
            onFormChange={() => {}}
            onCancel={onCancel} />
    )
}


export default ExistingInvoiceManager