const express = require('express')
const router = express.Router()
const _ = require('lodash')

const db = require('../db')
const { updatePartner, updateProductByInvoiceItems,
    getQuantitySign, isDateValid, getNextInvoiceId, formatInsert,
    INVOICE_TYPE_2_INT, 
} = require('./utils.js')


const prefix = 'CG'
const typeStr = 'purchaseOrder'
const typeInt = INVOICE_TYPE_2_INT[typeStr]


/*
    item: { material, name, spec, price, discount, quantity, originalAmount, amount, remark }
*/
router.post('/', async (req, res) => {
    // ---------- data ----------
    const partner = req.body.partner
    const date = req.body.date
    const amount = req.body.amount
    const prepayment = req.body.prepayment || '0'
    const payment = req.body.payment || '0'
    const items = req.body.items || []
    
    // ---------- validate ----------
    if (!partner || !date || !amount) {
        res.status(400).send('Insufficient data')
        return
    }
    if (!isDateValid(date)) {
        res.status(400).send('Wrong data format, use MMMM-YY-DD')
        return
    }

    // 1. insert partner
    await updatePartner('INSERT OR IGNORE', partner, '', '', '').catch(err => {
        console.error(err)
        res.status(500).send(err)
    })

    // 2. insert purchse order
    const orderId = await getNextInvoiceId(date, prefix).catch(err => {
        console.error(err)
        res.status(500).send(err)
    })
    const orderInsert = `INSERT INTO invoice (id, type, partner, date, amount, prepayment, payment) VALUES 
        ("${orderId}", ${typeInt}, "${partner}", "${date}", "${amount}", "${prepayment}", "${payment}")`
    await new Promise((resolve, reject) => {
        db.run(orderInsert, err => {
            if (err) { reject(err) }
            resolve()
        })
    }).catch(err => {
        console.error(err)
        res.status(500).send(err)
    })

    // 2. insert/update products, insert purchase order item
    if (items.length > 0) {
        const productDictArray = await updateProductByInvoiceItems(items, typeStr).catch(err => {
            console.error(err)
            res.status(500).send(err)
        })
        const orderItemDictArray = productDictArray.map(productDict => {
            return {
                productId: productDict.id,
                price: productDict.info.price,
                discount: productDict.info.discount,
                quantity: productDict.info.quantity,
                originalAmount: productDict.info.originalAmount,
                amount: productDict.info.amount,
                weight: productDict.info.weight,
                remark: productDict.info.remark,
                delivered: productDict.info.delivered,
                invoiceId: orderId
            }
        })
        const { query, flatData } = formatInsert('INSERT', 'invoiceItem', orderItemDictArray, [])
        await new Promise((resolve, reject) => { 
            db.run(query, flatData, err => {
                if (err) { reject(err) }
                resolve()
            })
        }).catch(err => {
            console.error(err)
            res.status(500).send(err)
        })
    }
    // 3. return
    res.end()
})

router.put('/id/:id', async (req, res) => {
    // data
    const orderId = req.params.id  // str
    const partner = req.body.partner
    const date = req.body.date
    const amount = req.body.amount
    const prepayment = req.body.prepayment || '0'
    const payment = req.body.payment || '0'
    const items = req.body.items || []

    if (!orderId || !partner || !date || !amount) {
        res.status(400).send('Insufficient data')
        return
    }
    if (!isDateValid(date)) {
        res.status(400).send('Wrong data format, use MMMM-YY-DD')
        return
    }

    // 1. update partner
    await updatePartner('INSERT OR IGNORE', partner, '', '', '').catch(err => {
        console.error(err)
        res.status(500).send(err)
    })
    
    // 2. update purchase order
    const updateOrder = `UPDATE invoice SET partner="${partner}", date="${date}", amount="${amount}", 
        prepayment="${prepayment}", payment="${payment}" WHERE id="${orderId}"`
    await new Promise((resolve, reject) => {
        db.run(updateOrder, err => {
            if (err) { reject(err) }
            resolve()
        })
    }).catch(err => {
        console.error(err)
        res.status(500).send(err)
    })

    // 3. update products & delete old items
    const updateProducts = `UPDATE product
        SET quantity=product.quantity${getQuantitySign(typeStr, true)}oi.quantity
        FROM invoiceItem AS oi
        WHERE oi.invoiceId="${orderId}" AND product.id=oi.productId`
    const deleteOldOrderItems = `DELETE FROM invoiceItem WHERE invoiceId="${orderId}"`
    await new Promise((resolve, reject) => {
        db.run(updateProducts, err => {
            if (err) { reject(err) }
            db.run(deleteOldOrderItems, err => {
                if (err) { reject(err) }
                resolve()
            })
        })
    }).catch(err => {
        console.error(err)
        res.status(500).send(err)
    })

    // 4. insert new product & invoice items
    if (items.length > 0) {
        const productDictArray = await updateProductByInvoiceItems(items, typeStr).catch(err => {
            console.error(err)
            res.status(500).send(err)
        })
        const orderItemDictArray = productDictArray.map(productDict => {
            return {
                productId: productDict.id,
                price: productDict.info.price,
                discount: productDict.info.discount,
                quantity: productDict.info.quantity,
                originalAmount: productDict.info.originalAmount,
                amount: productDict.info.amount,
                weight: productDict.info.weight,
                remark: productDict.info.remark,
                delivered: productDict.info.delivered,
                invoiceId: orderId
            }
        })
        const { query, flatData } = formatInsert('INSERT', 'invoiceItem', orderItemDictArray, [])
        await new Promise((resolve, reject) => { 
            db.run(query, flatData, err => {
                if (err) { reject(err) }
                resolve()
            })
        }).catch(err => {
            console.error(err)
            res.status(500).send(err)
        })
    }

    // 5. update refund & refund items if any
    const orderItemTable = `SELECT oi.productId, p.unit, CASE WHEN p.unit='千件' THEN 1000 ELSE 1 END AS unitRatio, oi.price AS newPrice, oi.discount AS newDiscount
        FROM invoiceItem AS oi, product AS p 
        WHERE oi.invoiceId="${orderId}" AND oi.productId=p.id`
    const updateRefundItems = `UPDATE invoiceItem 
        SET price=oi.newPrice, discount=oi.newDiscount,
            originalAmount=invoiceItem.quantity*oi.newPrice*oi.unitRatio,
            amount=invoiceItem.quantity*oi.newPrice*oi.unitRatio*oi.newDiscount/100
        FROM (${orderItemTable}) AS oi, invoiceRelation AS r
        WHERE invoiceItem.invoiceId=r.refundId AND "${orderId}"=r.orderId AND oi.productId=invoiceItem.productId`
    const updateRefund = `UPDATE invoice 
        SET amount=(SELECT SUM(amount) FROM invoiceItem AS ri WHERE ri.invoiceId=invoice.id)
        FROM invoiceRelation AS r
        WHERE r.orderId="${orderId}" AND r.refundId=invoice.id`

    db.run(updateRefundItems, err => {
        if (err) { 
            console.error(err)
            res.status(500).send(err)
            return
        }
        db.run(updateRefund, err => {
            if (err) { 
                console.error(err)
                res.status(500).send(err)
                return
            }
            res.end()
        })
    })
})

router.get('/', (req, res) => {
    const deliveredTable = `SELECT invoiceId, 
        CASE WHEN COUNT(*) = SUM(delivered) THEN '全部配送'
            WHEN SUM(delivered) = 0 THEN '未配送'
            ELSE '部分配送' END AS delivered
        FROM invoiceItem GROUP BY invoiceId`
    const query = `SELECT i.*, d.delivered, refundId 
        FROM invoice AS i
        LEFT JOIN invoiceRelation AS r ON i.id=r.orderId
        LEFT JOIN (${deliveredTable}) AS d ON d.invoiceId=i.id
        WHERE i.type=${typeInt}
        ORDER BY i.id DESC`
    db.all(query, (err, orders) => {
        if (err) {
            console.error(err)
            res.status(500).send()
            return
        }
        res.send(orders)
    })
})

router.get('/detailed', (req, res) => {
    const refundId = req.query.refundId || null  // include
    const selectOrder = `SELECT i.*, refundId 
        FROM invoice AS i LEFT JOIN invoiceRelation AS r ON i.id=r.orderId
        WHERE type=${typeInt} AND (refundId IS NULL OR refundId="${refundId}")`
    db.all(selectOrder, (err, orders) => {
        if (err) {
            console.error(err)
            res.status(500).send(err)
            return
        }
        const query = `SELECT i.id AS orderId,
            p.id AS productId, p.material, p.name, p.spec, p.unit, 
            ii.id AS orderItemId, ii.price, ii.quantity, ii.amount, ii.discount, ii.originalAmount, ii.remark, ii.delivered,
            ii.weight, ii.weight/ii.quantity AS unitWeight, ii.quantity AS maxQuantity
            FROM invoice AS i, invoiceItem AS ii, product AS p 
            WHERE i.id=ii.invoiceId AND p.id=ii.productId AND i.type=${typeInt}`
        db.all(query, (err, items) => {
            if (err) {
                console.error(err)
                res.status(500).send(err)
                return
            }
            for (const item of items) {
                const order = orders.find(order => order.id === item.orderId)
                if (order) {
                    if (order.items === undefined) {
                        order.items = [item]
                    } else {
                        order.items.push(item)
                    }
                }
            }
            res.send(orders)
        })
    })
})

router.get('/id/:id', (req, res) => {
    const orderId = req.params.id  // str
    if (!orderId) {
        res.status(400).send('Insufficient data')
        return
    }

    const selectOrder = `SELECT i.*, p.*, r.refundId 
        FROM invoice AS i, partner AS p
        LEFT JOIN invoiceRelation AS r ON i.id=r.orderId 
        WHERE id="${orderId}" AND partner=name`
    db.each(selectOrder, (err, order) => {
        if (err) {
            console.error(err)
            res.status(500).send(err)
            return
        }
        const refundId = order.refundId

        const selectItem = refundId ?
        `SELECT oi.id, oi.productId, oi.price, oi.discount, oi.quantity, oi.originalAmount, oi.amount, oi.weight, oi.remark, oi.delivered,
            p.material, p.name, p.spec, p.unit, p.quantity AS remainingQuantity,
            ri.quantity AS refundQuantity, ri.originalAmount AS refundOriginalAmount, ri.amount AS refundAmount
            FROM invoiceItem AS oi, product AS p 
            LEFT JOIN invoiceItem AS ri ON oi.productId=ri.productId AND ri.invoiceId="${refundId}"
            WHERE oi.invoiceId="${orderId}" AND p.id=oi.productId` :
        `SELECT oi.id, oi.productId, oi.price, oi.discount, oi.quantity, oi.originalAmount, oi.amount, oi.weight, oi.remark, oi.delivered,
            p.material, p.name, p.spec, p.unit, p.quantity AS remainingQuantity
            FROM invoiceItem AS oi, product AS p
            WHERE oi.invoiceId="${orderId}" AND p.id=oi.productId`
        db.all(selectItem, (err, items) => {
            if (err) {
                console.error(err)
                res.status(500).send(err)
                return
            }
            order.items = items
            res.send(order)
        })
    })
})

router.delete('/', (req, res) => {
    const ids = (req.body.ids || []).map(id => `"${id}"`).join(', ')

    // 1. update product quantity
    const orderQuan = `SELECT productId, SUM(quantity) AS quantity
        FROM invoiceItem
        WHERE invoiceId IN (${ids})
        GROUP BY productId`
    const refundQuan = `SELECT productId, SUM(quantity) AS quantity
        FROM invoiceItem AS ri, invoiceRelation AS r
        WHERE r.orderId IN (${ids}) AND r.refundId=ri.invoiceId
        GROUP BY productId`
    const updateProduct = `UPDATE product
        SET quantity=product.quantity${getQuantitySign(typeStr, true)}IFNULL(o.quantity,0)${getQuantitySign(typeStr, false)}IFNULL(r.quantity,0)
        FROM (${orderQuan}) AS o LEFT OUTER JOIN (${refundQuan}) AS r ON o.productId=r.productId
        WHERE o.productId=product.id`

    db.run(updateProduct, err => {
        if (err) {
            console.error(err)
            res.status(500).send(err)
            return
        }
        // 2. delete purchase order & purchase refund (if any)
        const deleteInvoice = `DELETE FROM invoice 
            WHERE id IN (${ids}) OR id IN (SELECT refundId AS id FROM invoiceRelation WHERE orderId IN (${ids}))`
        db.run(deleteInvoice, err => {
            if (err) {
                console.error(err)
                res.status(500).send(err)
                return
            }
            res.end()
        })
    })
})


module.exports = router