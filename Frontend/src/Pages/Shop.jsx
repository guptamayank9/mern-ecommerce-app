import React from 'react'//Home page
import Hero from '../Components/Hero/Hero'
import Popular from '../Components/Popular/Popular'
import Offers from '../Components/Offers/Offers'
import NewCollections from '../Components/NewCollections/NewCollections'
import NewLetter from '../Components/NewsLetter/NewLetter'
import Footer from '../Components/Footer/Footer'
const Shop = () => {
  return (

    <div>
      <Hero/>
      <Popular/>
      <Offers/>
      <NewCollections/>
      <NewLetter/>
      
    </div>
  )
}

export default Shop

