import apiClient from './api'


const suggestionService = {
    fetchPartners: async (keyword) => {
        try {
            const response = await apiClient.get('/suggestions/partners/names', { params: { keyword: keyword } })
            return response
        } catch (error) {
            throw error
        }
    },
    fetchProducts: async (field, keyword) => {
        try {
            const response = await apiClient.get(`/suggestions/products/${field}s`, { params: { keyword: keyword } })
            return response
        } catch (error) {
            throw error
        }
    },
}


export default suggestionService
