import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../carousel'
import { Button } from '../button'


const Category =[

    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Scientist",
    "DevOps Enginer",
    "Machine Learning Engineer",
    "Artifitial Intelligence Engineer",
    "Cybersecurity Engineer",
    "Product Manager",
    "UI/UX Designer"

]

const Categories = () => {
  return (
    <div>
      <h1 className='text-3xl font-bold text-center text-blue-600 my-5'>
        Categories
        </h1>
        <p className='text-center text-gray-600'>Explore Our Extensive Job Market</p>
        
      
      <Carousel className="w-full max-w-xl mx-auto my-20">
        <CarouselContent>
          
         {Category.map((category,index)=>(
  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 gap-2">
    <Button>{category}</Button>
  </CarouselItem>
))}
        </CarouselContent>
        <CarouselPrevious/>
        <CarouselNext/>
      </Carousel>
    </div>
  )
}

export default Categories
