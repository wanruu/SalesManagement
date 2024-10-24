/**
 * @typedef {Object} Partner
 * @property {string} name
 * @property {string?} folder
 * @property {string?} address
 * @property {string?} phone
 */


/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string?} material
 * @property {string} name
 * @property {string} spec
 * @property {string} unit
 */


/**
 * @typedef {Object} BaseInvoiceItem
 * @property {number} id
 * @property {number} invoiceId
 * @property {number} productId
 * @property {number} quantity
 * @property {number} price
 * @property {number} originalAmount
 * @property {number} discount
 * @property {number} amount
 * @property {string?} remark
 * @property {boolean} delivered
 */


/**
 * @typedef {'salesOrder'|'salesRefund'|'purchaseOrder'|'purchaseRefund'} InvoiceType
 * @typedef {'salesOrder'|'purchaseOrder'} OrderType
 * @typedef {'salesRefund'|'purchaseRefund'} RefundType
 */


/**
 * @typedef {Object} BaseInvoice
 * @property {number} id
 * @property {string} number
 * @property {InvoiceType} type
 * @property {string} partnerName
 * @property {string} date
 * @property {number} prepayment
 * @property {number} payment
 * @property {number} amount
 * @property {number?} orderId
 */


/**
 * @typedef {BaseInvoice & {type: OrderType, orderId: null}} BaseOrder
 * @typedef {BaseInvoice & {type: RefundType, orderId: number}} BaseRefund
 */


export const Types = {}