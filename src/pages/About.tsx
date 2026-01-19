import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Award, Star, Trophy, Medal } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-2 bg-gradient-to-b from-chirag-pink/10 to-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-playfair">
              About <span className="header-gradient">Chirag Sharma</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              The story of passion, artistry, and the journey to becoming one of the most sought-after makeup artists.
            </p>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="py-16 md:py-14 bg-white">
        <div className="container-custom px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-playfair mb-6">
                My Journey
              </h2>

              <div className="space-y-5 text-sm sm:text-base">
                <p className="text-gray-600 leading-relaxed">
                  I started my beauty journey over <span className="font-semibold text-gray-800">15 years ago</span> with a simple love for colors and transformation. What began as a hobby soon evolved into a passion I couldn't ignore.
                </p>

                <p className="text-gray-600 leading-relaxed">
                  After formal training at the prestigious <span className="font-medium text-gray-800">London School of Makeup</span>, I worked with industry leaders and celebrities—refining my skills and developing a signature style that blends classic techniques with modern trends.
                </p>

                <p className="text-gray-600 leading-relaxed">
                  Today, I specialize in bridal, editorial, and creative makeup artistry, along with intricate henna designs. My approach is deeply personal—I believe makeup should enhance natural beauty and reflect individual style.
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2 flex justify-center px-4">
              <div className="relative w-full max-w-sm lg:max-w-md">
                <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-chirag-pink to-chirag-peach opacity-20 blur-xl"></div>
                <img 
                  src="/photos/chiragicon2.JPG" 
                  alt="Chirag Sharma" 
                  className="relative z-10 rounded-2xl shadow-2xl w-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-20 bg-chirag-pink/5">
        <div className="container-custom px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-12 text-center font-playfair">Professional Journey</h2>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line - Hidden on mobile, visible on md+ */}
            <div className="hidden md:block absolute left-1/2 top-0 h-full w-0.5 bg-chirag-pink/30 transform -translate-x-1/2"></div>
            
            {/* Mobile timeline line - Left aligned */}
            <div className="md:hidden absolute left-4 top-0 h-full w-0.5 bg-chirag-pink/30"></div>
            
            {/* Timeline items */}
            <div className="space-y-8 md:space-y-12">
              {/* Item 1 */}
              <div className="relative flex items-start md:items-center">
                {/* Mobile dot */}
                <div className="md:hidden absolute left-0 top-2 w-8 h-8 rounded-full bg-chirag-pink flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                
                {/* Desktop layout */}
                <div className="md:w-1/2 md:pr-8 lg:pr-12 md:text-right ml-12 md:ml-0">
                  <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 font-playfair">Educational Background</h3>
                    <p className="text-sm sm:text-base text-gray-600">Graduated from London School of Makeup with distinction.</p>
                    <div className="text-chirag-pink font-medium mt-2 text-sm sm:text-base">2012</div>
                  </div>
                </div>
                
                {/* Desktop dot */}
                <div className="hidden md:block absolute left-1/2 top-8 w-8 h-8 rounded-full bg-chirag-pink transform -translate-x-1/2 flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                
                <div className="hidden md:block md:w-1/2 md:pl-8 lg:pl-12"></div>
              </div>
              
              {/* Item 2 */}
              <div className="relative flex items-start md:items-center">
                {/* Mobile dot */}
                <div className="md:hidden absolute left-0 top-2 w-8 h-8 rounded-full bg-chirag-peach flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                
                {/* Desktop layout */}
                <div className="hidden md:block md:w-1/2 md:pr-8 lg:pr-12"></div>
                
                {/* Desktop dot */}
                <div className="hidden md:block absolute left-1/2 top-8 w-8 h-8 rounded-full bg-chirag-peach transform -translate-x-1/2 flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                
                <div className="md:w-1/2 md:pl-8 lg:pl-12 ml-12 md:ml-0">
                  <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 font-playfair">First Celebrity Client</h3>
                    <p className="text-sm sm:text-base text-gray-600">Worked with top Bollywood celebrities for major film promotions.</p>
                    <div className="text-chirag-gold font-medium mt-2 text-sm sm:text-base">2015</div>
                  </div>
                </div>
              </div>
              
              {/* Item 3 */}
              <div className="relative flex items-start md:items-center">
                {/* Mobile dot */}
                <div className="md:hidden absolute left-0 top-2 w-8 h-8 rounded-full bg-chirag-pink flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                
                {/* Desktop layout */}
                <div className="md:w-1/2 md:pr-8 lg:pr-12 md:text-right ml-12 md:ml-0">
                  <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 font-playfair">Fashion Week Debut</h3>
                    <p className="text-sm sm:text-base text-gray-600">Led makeup team for major designers at India Fashion Week.</p>
                    <div className="text-chirag-pink font-medium mt-2 text-sm sm:text-base">2018</div>
                  </div>
                </div>
                
                {/* Desktop dot */}
                <div className="hidden md:block absolute left-1/2 top-8 w-8 h-8 rounded-full bg-chirag-pink transform -translate-x-1/2 flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                
                <div className="hidden md:block md:w-1/2 md:pl-8 lg:pl-12"></div>
              </div>
              
              {/* Item 4 */}
              <div className="relative flex items-start md:items-center">
                {/* Mobile dot */}
                <div className="md:hidden absolute left-0 top-2 w-8 h-8 rounded-full bg-chirag-peach flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                
                {/* Desktop layout */}
                <div className="hidden md:block md:w-1/2 md:pr-8 lg:pr-12"></div>
                
                {/* Desktop dot */}
                <div className="hidden md:block absolute left-1/2 top-8 w-8 h-8 rounded-full bg-chirag-peach transform -translate-x-1/2 flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                
                <div className="md:w-1/2 md:pl-8 lg:pl-12 ml-12 md:ml-0">
                  <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 font-playfair">International Recognition</h3>
                    <p className="text-sm sm:text-base text-gray-600">Featured in Vogue and Elle for innovative makeup techniques.</p>
                    <div className="text-chirag-gold font-medium mt-2 text-sm sm:text-base">2021</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-chirag-pink/5">
        <div className="container-custom px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center font-playfair">
            Awards & <span className="header-gradient">Recognition</span>
          </h2>
          
          <p className="text-center text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-12 px-4">
            My dedication to the craft of makeup artistry has been recognized by industry leaders and prestigious organizations worldwide.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Award 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-chirag-gold/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-chirag-gold/5 rounded-full group-hover:scale-150 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-chirag-gold/20 to-chirag-peach/20 flex items-center justify-center">
                    <Trophy size={28} className="text-chirag-gold sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 font-playfair text-center">Best Bridal Makeup Artist</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 text-center">
                  Recognized for exceptional bridal makeup artistry and client satisfaction.
                </p>
                <div className="text-chirag-gray italic text-center text-xs sm:text-sm">Wedding Artistry Awards, 2020</div>
                
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <Star size={14} className="text-chirag-gold mt-0.5 mr-2 flex-shrink-0" />
                      <span>Excellence in traditional bridal looks</span>
                    </li>
                    <li className="flex items-start">
                      <Star size={14} className="text-chirag-gold mt-0.5 mr-2 flex-shrink-0" />
                      <span>Highest client satisfaction rating</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Award 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-chirag-pink/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-chirag-pink/5 rounded-full group-hover:scale-150 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-chirag-pink/20 to-chirag-peach/20 flex items-center justify-center">
                    <Award size={28} className="text-chirag-pink sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 font-playfair text-center">Innovation in Makeup</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 text-center">
                  Awarded for pioneering new techniques in editorial makeup design.
                </p>
                <div className="text-chirag-gray italic text-center text-xs sm:text-sm">Beauty Innovation Summit, 2021</div>
                
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <Star size={14} className="text-chirag-pink mt-0.5 mr-2 flex-shrink-0" />
                      <span>Revolutionary color theory application</span>
                    </li>
                    <li className="flex items-start">
                      <Star size={14} className="text-chirag-pink mt-0.5 mr-2 flex-shrink-0" />
                      <span>Creative direction excellence</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Award 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-chirag-purple/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group md:col-span-2 lg:col-span-1 md:max-w-md md:mx-auto lg:max-w-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-chirag-purple/5 rounded-full group-hover:scale-150 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-chirag-purple/20 to-chirag-peach/20 flex items-center justify-center">
                    <Medal size={28} className="text-chirag-purple sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 font-playfair text-center">Master Henna Artist</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 text-center">
                  Recognized for intricate henna designs and cultural preservation.
                </p>
                <div className="text-chirag-gray italic text-center text-xs sm:text-sm">Cultural Arts Foundation, 2022</div>
                
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <Star size={14} className="text-chirag-purple mt-0.5 mr-2 flex-shrink-0" />
                      <span>Preservation of traditional techniques</span>
                    </li>
                    <li className="flex items-start">
                      <Star size={14} className="text-chirag-purple mt-0.5 mr-2 flex-shrink-0" />
                      <span>Innovation in contemporary designs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Featured In Section */}
          <div className="mt-12 md:mt-16">
            <h3 className="text-xl sm:text-2xl font-semibold mb-8 sm:mb-10 text-center font-playfair">Featured In</h3>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 px-4">
              <div className="text-gray-400 font-serif text-lg sm:text-xl md:text-2xl hover:text-chirag-pink transition-colors cursor-pointer">VOGUE</div>
              <div className="text-gray-400 font-serif text-lg sm:text-xl md:text-2xl hover:text-chirag-pink transition-colors cursor-pointer">ELLE</div>
              <div className="text-gray-400 font-serif text-lg sm:text-xl md:text-2xl hover:text-chirag-pink transition-colors cursor-pointer">Harper's BAZAAR</div>
              <div className="text-gray-400 font-serif text-lg sm:text-xl md:text-2xl hover:text-chirag-pink transition-colors cursor-pointer">Cosmopolitan</div>
              <div className="text-gray-400 font-serif text-lg sm:text-xl md:text-2xl hover:text-chirag-pink transition-colors cursor-pointer">Brides</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;