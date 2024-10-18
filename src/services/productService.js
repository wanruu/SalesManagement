import apiClient from './api'


const productService = {
    fetchMany: async (params) => {
        try {
            const response = await apiClient.get('/products', { params: params })
            return response
        } catch (error) {
            throw error
        }
    },

    fetchById: async (id, params) => {
        try {
            const response = await apiClient.get(`/products/${id}`, { params: params })
            return response
        } catch (error) {
            throw error
        }
    },

    fetchByInfo: async ({ material, name, spec }, params) => {
        try {
            if (!name || !spec)
                return
            const url = material ? `/products/${material}/${name}/${spec}` : `/products/${name}/${spec}`
            const response = await apiClient.get(url, { params: params })
            return response
        } catch (error) {
            throw error
        }
    },

    create: async (product) => {
        try {
            const response = await apiClient.post('/products', product)
            return response
        } catch (error) {
            throw error
        }
    },

    update: async (id, product) => {
        try {
            const response = await apiClient.put(`/products/${id}`, product)
            return response
        } catch (error) {
            throw error
        }
    },

    delete: async (id) => {
        try {
            const response = await apiClient.delete(`/products/${id}`)
            return response
        } catch (error) {
            throw error
        }
    },

    deleteMany: async (products) => {
        try {
            const deletePromises = products.map(product =>
                apiClient.delete(`/products/${product.id}`)
            )
            const responses = await Promise.all(deletePromises)
            return responses
        } catch (error) {
            throw error
        }
    }
}

export default productService
