import React, { createContext, useEffect, useState } from "react";
import all_product_static from '../Components/Assets/all_product'

export const ShopContext=createContext(null);//
 
const  getDefaultCart = () => {//for add to cart logic
        let cart ={};
        for(let index =0; index <301; index++){
           cart[index] = 0;
        } 
    return cart;
}

const ShopContextProvider=(props)=>{//pass props

    const [cartItems , setCartItems] = useState(getDefaultCart());
     const [all_product, setAllProduct] = useState([]);

useEffect(() => {
  fetch('http://localhost:4000/allproducts')
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        setAllProduct(data);
      } else {
        setAllProduct(all_product_static); // ✅ correct
      }
    })
    .catch(() => setAllProduct(all_product_static));

    if(localStorage.getItem('auth-token')){
        fetch('http://localhost:4000/getcart',{
            method:'POST',
            headers:{
                Accept:'application/json',
                'auth-token':`${localStorage.getItem('auth-token')}`,
                'Content-Type':'application/json',
            },
            body:"",
        }).then((response)=>response.json())
         .then((data)=>setCartItems(data));
    }
}, []);


        //here we insert any data or infr that proivde in shop context as value ,using that we can acces thwees in any componeets
        //retrun this ,store data
    
        // console.log(cartItems);
        const addToCart = (itemId) => {
           setCartItems((prev)=>({...prev,[itemId] : prev[itemId]+1}));
           if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/addtocart',{
                method:'POST',
                headers:{
                    Accept:'application/json',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemID":itemId}),
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data));

           }
        //    console.log(cartItems);
        }

        const getTotalCartAmount = () =>{
            let totalAmount =0;
            for( const item in cartItems)
            {
                if(cartItems[item]>0){
                    let itemInfo = all_product.find((product)=>product.id===Number(item));
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
              
            }
              return totalAmount;
        }

        const getTotalCartItems = () => {
            let totalItem = 0;
            for(const item in cartItems) {
                 if(cartItems[item]>0){
                    totalItem += cartItems[item];
                 }
            } 
            return totalItem;
        }

        const removeFromCart = (itemId) => {
           setCartItems((prev)=>({...prev,[itemId] : prev[itemId]-1}))
           if(localStorage.getItem('auth-token')){
              fetch('http://localhost:4000/removefromcart',{
                method:'POST',
                headers:{
                    Accept:'application/json',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemID":itemId}),
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data));

           }
        }

        const contextValue = {getTotalCartItems, getTotalCartAmount,all_product,cartItems,addToCart,removeFromCart};

        return( 
            <ShopContext.Provider value={contextValue}> 
                {props.children}
            </ShopContext.Provider>
        )
}
export default ShopContextProvider;