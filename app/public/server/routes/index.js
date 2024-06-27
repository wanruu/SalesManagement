const salesOrderRouter = require('./salesOrderRoute')
const salesRefundRouter = require('./salesRefundRoute')
const purchaseOrderRouter = require('./purchaseOrderRoute')
const purchaseRefundRouter = require('./purchaseRefundRoute')
const productRouter = require('./productRoute')
const partnerRouter = require('./partnerRoute')
const promptRouter = require('./promptRoute')


const routes = (app) => {
    app.use('/product', productRouter)
    app.use('/partner', partnerRouter)
    app.use('/salesOrder', salesOrderRouter)
    app.use('/salesRefund', salesRefundRouter)
    app.use('/purchaseOrder', purchaseOrderRouter)
    app.use('/purchaseRefund', purchaseRefundRouter)
    app.use('/prompt', promptRouter)
}

module.exports = routes