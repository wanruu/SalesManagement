import React, { useEffect, useState } from 'react'
import ProductTable from './ProductTable'
import { productService } from '../../services'


const ProductManager = ({ product: initProduct }) => {
    const [product, setProduct] = useState({})
    
    const load = () => {
        productService.fetchById(initProduct.id).then(res => {
            setProduct(res.data)
        }).catch(err => {
            setProduct({})
        })
    }

    useEffect(load, [initProduct.id])

    return<ProductTable product={product} />
}

export default ProductManager