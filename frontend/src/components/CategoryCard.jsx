import React from 'react'

const CategoryCard = ({name, image,onClick}) => {
  return (
    <div className='w-[180px] h-[180px] rounded-xl border-2 border-[#ff4d2d] shrink-0 overflow-hidden bg-white shadow-md transition-smooth-slow hover:shadow-2xl hover:-translate-y-2 hover-glow cursor-pointer relative group' onClick={onClick}>
      <img src={image} alt={name} className='w-full h-full object-cover transform transition-smooth-slower group-hover:scale-110 group-hover:rotate-2' />
      {/* categories */}
      <div className='absolute bottom-0 w-full left-0 bg-[#ffffff96] opacity-95 px-3 py-2 text-center shadow text-sm font-medium text-gray-800 backdrop-blur transition-smooth group-hover:bg-white group-hover:py-3'>
          {name}
      </div>
    </div>
  )
}

export default CategoryCard