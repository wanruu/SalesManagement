const { pinyin } = require('pinyin-pro')


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


module.exports = { filterPartners }