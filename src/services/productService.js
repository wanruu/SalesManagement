import apiClient from './api'


const productService = {
    fetchMany: async () => {
        try {
            const response = await apiClient.get('/products')
            return response
        } catch (error) {
            throw error
        }
    },

    fetchById: async (id) => {
        try {
            const response = await apiClient.get(`/products/${id}`)
            return response
        } catch (error) {
            throw error
        }
    },

    fetchByInfo: async ({ material, name, spec }) => {
        try {
            if (!name || !spec)
                return
            const url = material ? `/products/${material}/${name}/${spec}` : `/products/${name}/${spec}`
            const response = await apiClient.get(url)
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
