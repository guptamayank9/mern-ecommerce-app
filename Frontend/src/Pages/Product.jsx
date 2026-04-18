import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext';
import { useParams } from 'react-router';
import Breadcrums from '../Components/Breadcrums/Breadcrums';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox';
import RelatedProduct from '../Components/RelatedProducts/RelatedProduct';

const Product = () => {
  const {all_product} =useContext(ShopContext);
  const {productId} = useParams();//to get the productid

  const product = all_product.find((e)=>e.id===Number(productId));



  return (
    <div>
        <Breadcrums product = {product}/>
        <ProductDisplay product={product}/>
        <DescriptionBox/>
        <RelatedProduct/>
    </div>
  )
}

export default Product
