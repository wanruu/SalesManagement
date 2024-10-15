import React, { useEffect, useState } from 'react'
import ProductTable from './ProductTable'
import { productService } from '../../services'


const ProductManager = ({ product: initProduct }) => {
    const [product, setProduct] = useState(initProduct)
    const load = () => {
        productService.fetchById(product.id).then(res => {
            setProduct(res.data)
            console.log(res.data)
        }).catch(err => {

        })
    }
    useEffect(load, [])
    return <ProductTable product={product} />
}

export default ProductManager