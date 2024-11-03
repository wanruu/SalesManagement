import { createSlice } from '@reduxjs/toolkit'

const SLICE_NAME = 'globalInfo'

const initialState = (() => ({
    messages: [],
    notifications: [],
    // errors: [],  
}))()


/**
 * @typedef {Object} MessageObj
 * @property {string} type - 'info' | 'warning' | 'error' | 'success'
 * @property {string} content - message content
 * @property {number} duration - message duration
 * @property {string} key - message key
 */

/**
 * @typedef {Object} NotificationObj
 * @property {string} type - 'info' | 'warning' | 'error' | 'success'
 * @property {string} content - notification content
 * @property {string} title - notification title
 * @property {number} duration - notification duration
 * @property {string} key - notification key
 */

// /**
//  * @typedef {Object} ErrorObj
//  * @property {string} type - 'warning' | 'fatal'
//  * @property {string} content - error content
//  * @property {number} code - error code
//  * @property {string} key - error key
//  * @property {Function} callback - Callback used after error solved
//  */ 

const globalInfoSlice = createSlice({
    name: SLICE_NAME,
    initialState: initialState,
    reducers: {
        /**
         * 
         * @param {*} state 
         * @param {Object} action 
         * @param {MessageObj} action.payload
         */
        addMessage(state, action) {
            state.messages = [...state.messages, action.payload]
        },
        /**
         * 
         * @param {*} state
         * @param {Object} action
         * @param {NotificationObj} action.payload
         */
        addNotification(state, action) {
            state.notifications = [...state.notifications, action.payload]
        },
        // addError(state, action) {
        //     const { error } = action.payload
        //     state.errors.push(error)
        // }
        clearMessages(state) {
            state.messages = []
        },
        clearNotifications(state) {
            state.notifications = []
        }
    }
})


export const { 
    addMessage, 
    addNotification, 
    clearMessages, 
    clearNotifications
} = globalInfoSlice.actions

export default globalInfoSlice.reducer