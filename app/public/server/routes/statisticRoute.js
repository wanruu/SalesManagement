const express = require('express')
const router = express.Router()

const db = require('../db')

const { INVOICE_TYPE_2_INT } = require('./utils.js')

router.get('/range', (req, res) => {
    const query = `SELECT MIN(date) AS minDate, MAX(date) AS maxDate FROM invoice`
    db.each(query, (err, row) => {
        if (err) {
            console.error(err)
            res.status(500).send(err)
            return
        }
        res.send(row)
    })
})


router.get('/abstract/sales', (req, res) => {
    const query1 = `SELECT SUM(amount) AS income
    FROM invoice
    WHERE type=${INVOICE_TYPE_2_INT.salesOrder} AND date<=${req.query.startDate} AND date>=${req.query.endDate}`

    
})

module.exports = router