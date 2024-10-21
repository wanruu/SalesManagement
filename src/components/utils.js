import Decimal from 'decimal.js'


/**
 * Convert to a currency string.
 * @name Decimal#toCurrencyString
 * @function
 * @param {string} [currencySymbol] - `$`, `¥`, `HK$`, etc.
 * @returns {string}
 */
Decimal.prototype.toCurrencyString = function (currencySymbol='') {
    if (this.isNeg()) {
        return `-${currencySymbol}${this.abs().toLocaleString()}`
    }
    return `${currencySymbol}${this.toLocaleString()}`
}

