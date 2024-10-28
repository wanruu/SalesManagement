import apiClient from './api'
import { trimObject } from './utils'


const partnerService = {
    fetchMany: async (params) => {
        try {
            const response = await apiClient.get('/partners', { params: params })
            return response
        } catch (error) {
            throw error
        }
    },

    fetch: async (name) => {
        try {
            const response = await apiClient.get(`/partners/${name}`)
            return response
        } catch (error) {
            throw error
        }
    },

    create: async (partner) => {
        try {
            const newPartner = trimObject(partner)
            const response = await apiClient.post('/partners', newPartner)
            return response
        } catch (error) {
            throw error
        }
    },

    update: async (name, partner) => {
        try {
            const newPartner = trimObject(partner)
            const response = await apiClient.put(`/partners/${name}`, newPartner)
            return response
        } catch (error) {
            throw error
        }
    },

    delete: async (name) => {
        try {
            const response = await apiClient.delete(`/partners/${name}`)
            return response
        } catch (error) {
            throw error
        }
    },

    deleteMany: async (partners) => {
        try {
            const deletePromises = partners.map(partner =>
                apiClient.delete(`/partners/${partner.name}`)
            )
            const responses = await Promise.all(deletePromises)
            return responses
        } catch (error) {
            throw error
        }
    }
}

export default partnerService
