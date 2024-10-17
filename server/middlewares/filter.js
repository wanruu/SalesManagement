const { pinyin } = require('pinyin-pro')


const fuzzyPinyinMatch = (keyword, data) => {
    return (
        !keyword ||
        data.includes(keyword) ||
        pinyin(data, { pattern: 'first', toneType: 'none', type: 'array' }).join('').includes(keyword) ||
        pinyin(data, { toneType: 'none', type: 'array' }).join('').includes(keyword)
    )
}


const filterPartners = (req, res, next) => {
    const partners = req.partners
    const { keyword, name, address, folder, phone } = req.query
    const keywords = keyword?.split('\s+')
    
    let newPartners 
    if (!keywords) {
        newPartners = partners.filter(p => {
            const pFolder = p.folder ?? ''
            const pAddress = p.address ?? ''
            const pPhone = p.phone ?? ''
            return (
                !folder ||
                pFolder.includes(folder) ||
                pinyin(pFolder, { pattern: 'first', toneType: 'none', type: 'array' }).join('').includes(folder) ||
                pinyin(pFolder, { toneType: 'none', type: 'array' }).join('').includes(folder)
            ) &&
            (
                !name ||
                p.name.includes(name) ||
                pinyin(p.name, { pattern: 'first', toneType: 'none', type: 'array' }).join('').includes(name) ||
                pinyin(p.name, { toneType: 'none', type: 'array' }).join('').includes(name)
            ) &&
            (
                !address ||
                pAddress.includes(address) ||
                pinyin(pAddress, { pattern: 'first', toneType: 'none', type: 'array' }).join('').includes(address) ||
                pinyin(pAddress, { toneType: 'none', type: 'array' }).join('').includes(address)
            ) &&
            (
                !phone ||
                pPhone.includes(phone) ||
                pinyin(pPhone, { pattern: 'first', toneType: 'none', type: 'array' }).join('').includes(phone) ||
                pinyin(pPhone, { toneType: 'none', type: 'array' }).join('').includes(phone)
            )
        })
    } else {
        newPartners = partners.filter(p => {
            let textToVerify = []
            for (const key of ['name', 'folder', 'phone', 'address']) {
                const value = p[key]
                if (value != null && value !== '') {
                    textToVerify = [
                        ...textToVerify, value,
                        pinyin(value, { pattern: 'first', toneType: 'none', type: 'array' }).join(''),
                        pinyin(value, { toneType: 'none', type: 'array' }).join(''),
                    ]
                }
            }
            for (const keyword of keywords) {
                const results = textToVerify.map(text => text.includes(keyword))
                if (results.filter(r => r).length === 0) {
                    return false
                }
            }
            return true
        })
    }
    res.send(newPartners)
}


const filterProducts = (req, res, next) => {
    const products = req.products
    const { keyword, material, name, spec, unit } = req.query
    const keywords = keyword?.split('\s+')

    let newProducts 
    if (!keywords) {
        newProducts = products.filter(p => {
            return (
                !material ||
                p.material.includes(material) ||
                pinyin(p.material, { pattern: 'first', toneType: 'none', type: 'array' }).join('').includes(material) ||
                pinyin(p.material, { toneType: 'none', type: 'array' }).join('').includes(material)
            ) &&
            (
                !name ||
                p.name.includes(name) ||
                pinyin(p.name, { pattern: 'first', toneType: 'none', type: 'array' }).join('').includes(name) ||
                pinyin(p.name, { toneType: 'none', type: 'array' }).join('').includes(name)
            ) &&
            (
                !spec ||
                p.spec.includes(spec) ||
                pinyin(p.spec, { pattern: 'first', toneType: 'none', type: 'array' }).join('').includes(spec) ||
                pinyin(p.spec, { toneType: 'none', type: 'array' }).join('').includes(spec)
            ) &&
            (
                !unit ||
                unit.includes(p.unit)
            )
        })
    } else {
        newProducts = products.filter(p => {
            let textToVerify = [p.unit]
            for (const key of ['material', 'name', 'spec']) {
                const value = p[key]
                if (value != null && value !== '') {
                    textToVerify = [
                        ...textToVerify, value,
                        pinyin(value, { pattern: 'first', toneType: 'none', type: 'array' }).join(''),
                        pinyin(value, { toneType: 'none', type: 'array' }).join(''),
                    ]
                }
            }
            for (const keyword of keywords) {
                const results = textToVerify.map(text => text.includes(keyword))
                if (results.filter(r => r).length === 0) {
                    return false
                }
            }
            return true
        })
    }
    res.send(newProducts)
}


const filterInvoices = (req, res, next) => {
    const invoices = req.invoices
    const { keyword, partnerName, delivered } = req.query
    const keywords = keyword?.split('\s+')

    let newInvoices
    if (!keywords) {
        newInvoices = invoices.filter(i => {
            return (
                fuzzyPinyinMatch(partnerName, i.partnerName) &&
                (
                    !delivered ||
                    delivered.includes(i.delivered)
                )
            )
        })
    } else {
        newInvoices = invoices.filter(i => {
            let textToVerify = [i.number, i.date]
            for (const key of ['partnerName']) {
                const value = i[key]
                if (value != null && value !== '') {
                    textToVerify = [
                        ...textToVerify, value,
                        pinyin(value, { pattern: 'first', toneType: 'none', type: 'array' }).join(''),
                        pinyin(value, { toneType: 'none', type: 'array' }).join(''),
                    ]
                }
            }
            for (const keyword of keywords) {
                const results = textToVerify.map(text => text.includes(keyword))
                if (results.filter(r => r).length === 0) {
                    return false
                }
            }
            return true
        })
    }
    res.send(newInvoices)
}


module.exports = { filterPartners, filterProducts, filterInvoices }