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
    app.use('/v1/products', productRouter)
    app.use('/v1/partners', partnerRouter)
    app.use('/v1/salesOrders', salesOrderRouter)
    app.use('/v1/salesRefunds', salesRefundRouter)
    app.use('/v1/purchaseOrders', purchaseOrderRouter)
    app.use('/v1/purchaseRefunds', purchaseRefundRouter)
    app.use('/v1/suggestions', suggestionRouter)
    app.use('/v1/statistics', statisticRouter)
    app.use('/v1/tests', testRouter)
}

module.exports = routes