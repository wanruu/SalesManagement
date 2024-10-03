const PartnerController = require('./partnerController')
const ProductController = require('./productController')
const SuggestionController = require('./suggestionController')
const StatisticController = require('./statisticController')
const TestController = require('./testController')
const OrderController = require('./orderController')
const RefundController = require('./refundController')

const partnerController = new PartnerController()
const productController = new ProductController()
const suggestionController = new SuggestionController()
const statisticController = new StatisticController()
const testController = new TestController()

const salesOrderController = new OrderController('salesOrder')
const salesRefundController = new RefundController('salesRefund')
const purchaseOrderController = new OrderController('purchaseOrder')
const purchaseRefundController = new RefundController('purchaseRefund')


module.exports = {
    partnerController,
    productController,
    suggestionController,
    statisticController,
    salesOrderController,
    salesRefundController,
    purchaseOrderController,
    purchaseRefundController,
    testController,
}