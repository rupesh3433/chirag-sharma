
import React from 'react';

const FeaturedIn = () => {
  const featuredLogos = [
    { name: 'Vogue', logo: '/lovable-uploads/8766880b-b284-4b1a-b97a-dbf696824fd2.png' },
    { name: 'Elle', logo: '/lovable-uploads/5921e8d5-482b-4cdc-8ccd-d943e6d1154d.png' },
    { name: "Harper's Bazaar", logo: '/lovable-uploads/60624a80-5435-4782-95ab-c9a25b17c861.png' },
    { name: 'Cosmopolitan', logo: '/lovable-uploads/1912c46a-9ed9-4583-9b2c-eb32a180a4a5.png' },
    { name: 'Brides', logo: '/lovable-uploads/e4f5bfa8-98a1-4038-8b34-ff4c80d22c77.png' },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-chirag-pink/5">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-playfair relative inline-block">
            <span className="text-chirag-darkPurple">Featured In</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-chirag-pink to-chirag-peach rounded-full mx-auto mt-4"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Chirag's exceptional artistry has been recognized in these leading publications
          </p>
        </div>

        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-20 h-20 rounded-full bg-chirag-pink/10 blur-xl -z-10"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 rounded-full bg-chirag-peach/10 blur-xl -z-10"></div>
          
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-md border border-chirag-pink/10">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {featuredLogos.map((logo, index) => (
                <div 
                  key={index} 
                  className="group relative flex items-center justify-center p-4 transition-transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-chirag-pink/5 to-chirag-peach/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img 
                    src={logo.logo} 
                    alt={logo.name} 
                    className="h-16 object-contain relative z-10" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity mt-2 text-chirag-darkPurple text-sm font-medium">
                    {logo.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedIn;
