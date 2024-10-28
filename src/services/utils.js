import { trim } from 'lodash'


export const trimObject = (object) => {
    if (typeof object === 'string') {
        return trim(object)
    }
    if (Array.isArray(object)) {
        return object.map(item => trimObject(item))
    }
    if (object === null || object === undefined) {
        return object
    }
    if (typeof object === 'object') {
        return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, trimObject(value)]))
    }
    return object
}