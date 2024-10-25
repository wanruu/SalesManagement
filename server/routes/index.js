const salesOrderRouter = require('./salesOrderRoute')
const salesRefundRouter = require('./salesRefundRoute')
const purchaseOrderRouter = require('./purchaseOrderRoute')
const purchaseRefundRouter = require('./purchaseRefundRoute')
const productRouter = require('./productRoute')
const partnerRouter = require('./partnerRoute')
const suggestionRouter = require('./suggestionRoute')
const statisticRouter = require('./statisticRoute')
const testRouter = require('./testRoute')


const routes = (app) => {
    app.use('/products', productRouter)
    app.use('/partners', partnerRouter)
    app.use('/salesOrders', salesOrderRouter)
    app.use('/salesRefunds', salesRefundRouter)
    app.use('/purchaseOrders', purchaseOrderRouter)
    app.use('/purchaseRefunds', purchaseRefundRouter)
    app.use('/suggestions', suggestionRouter)
    app.use('/statistics', statisticRouter)
    app.use('/tests', testRouter)
}

module.exports = routes