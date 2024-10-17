import apiClient from './api'


const invoiceService = {
    fetchMany: async (type, params) => {
        try {
            const response = await apiClient.get(`/${type}s`, { params: params })
            return response
        } catch (error) {
            throw error
        }
    },

    fetch: async (type, id) => {
        try {
            const response = await apiClient.get(`/${type}s/${id}`)
            return response
        } catch (error) {
            throw error
        }
    },

    create: async (type, invoice) => {
        try {
            const response = await apiClient.post(`/${type}s`, invoice)
            return response
        } catch (error) {
            throw error
        }
    },

    update: async (type, id, invoice) => {
        try {
            const response = await apiClient.put(`/${type}s/${id}`, invoice)
            return response
        } catch (error) {
            throw error
        }
    },

    delete: async (type, id) => {
        try {
            const response = await apiClient.delete(`/${type}s/${id}`)
            return response
        } catch (error) {
            throw error
        }
    },

    deleteMany: async (invoices) => {
        try {
            const deletePromises = invoices.map(invoice =>
                apiClient.delete(`/${invoice.type}s/${invoice.id}`)
            )
            const responses = await Promise.all(deletePromises)
            return responses
        } catch (error) {
            throw error
        }
    }
}


export default invoiceService
