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
            return (
                fuzzyPinyinMatch(folder, p.folder ?? '') &&
                fuzzyPinyinMatch(name, p.name) &&
                fuzzyPinyinMatch(address, p.address ?? '') &&
                fuzzyPinyinMatch(phone, p.phone ?? '')
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
    const { keyword, material, name, spec } = req.query
    const keywords = keyword?.split('\s+')

    let newProducts 
    if (!keywords) {
        newProducts = products.filter(p => {
            return (
                fuzzyPinyinMatch(material, p.material) &&
                fuzzyPinyinMatch(name, p.name) &&
                fuzzyPinyinMatch(spec, p.spec)
            )
        })
    } else {
        newProducts = products.filter(p => {
            let textToVerify = []
            for (const key of ['material', 'name', 'spec', 'unit']) {
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