
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Award, Star, Trophy, Medal } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-chirag-pink/10 to-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
              About <span className="header-gradient">Chirag Sharma</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              The story of passion, artistry, and the journey to becoming one of the most sought-after makeup artists.
            </p>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold mb-6 font-playfair">My Journey</h2>
              <p className="text-gray-600 mb-4">
                I started my beauty journey over 15 years ago with a simple love for colors and transformation. What began as a hobby quickly evolved into a passion that I couldn't ignore.
              </p>
              <p className="text-gray-600 mb-4">
                After formal training at the prestigious London School of Makeup, I worked with industry leaders and celebrities, honing my craft and developing my signature style that blends classic techniques with contemporary trends.
              </p>
              <p className="text-gray-600">
                Today, I specialize in bridal, editorial, and creative makeup artistry alongside intricate henna designs. My approach is personal and collaborative—I believe that makeup should enhance your natural beauty and reflect your individual style.
              </p>
            </div>
            
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-xl bg-gradient-to-br from-chirag-pink to-chirag-peach opacity-20 blur-lg"></div>
                <img 
                  src="lovable-uploads/454407527_852067043529780_6854912164227611155_n.jpg" 
                  alt="Chirag Sharma" 
                  className="rounded-xl shadow-xl w-full max-w-md object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-chirag-pink/5">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-12 text-center font-playfair">Professional Journey</h2>
          
          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 top-0 h-full w-1 bg-chirag-pink/30 transform md:translate-x-[-50%]"></div>
            
            {/* Timeline items */}
            <div className="space-y-12">
              {/* Item 1 */}
              <div className="relative flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12 md:text-right">
                  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-xl font-semibold mb-2 font-playfair">Educational Background</h3>
                    <p className="text-gray-600">Graduated from London School of Makeup with distinction.</p>
                    <div className="text-chirag-pink font-medium mt-2">2012</div>
                  </div>
                </div>
                <div className="absolute left-0 md:left-1/2 top-8 w-8 h-8 rounded-full bg-chirag-pink transform md:translate-x-[-50%] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white"></div>
                </div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>
              
              {/* Item 2 */}
              <div className="relative flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12"></div>
                <div className="absolute left-0 md:left-1/2 top-8 w-8 h-8 rounded-full bg-chirag-peach transform md:translate-x-[-50%] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white"></div>
                </div>
                <div className="md:w-1/2 mb-8 md:mb-0 md:pl-12">
                  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-xl font-semibold mb-2 font-playfair">First Celebrity Client</h3>
                    <p className="text-gray-600">Worked with top Bollywood celebrities for major film promotions.</p>
                    <div className="text-chirag-gold font-medium mt-2">2015</div>
                  </div>
                </div>
              </div>
              
              {/* Item 3 */}
              <div className="relative flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12 md:text-right">
                  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-xl font-semibold mb-2 font-playfair">Fashion Week Debut</h3>
                    <p className="text-gray-600">Led makeup team for major designers at India Fashion Week.</p>
                    <div className="text-chirag-pink font-medium mt-2">2018</div>
                  </div>
                </div>
                <div className="absolute left-0 md:left-1/2 top-8 w-8 h-8 rounded-full bg-chirag-pink transform md:translate-x-[-50%] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white"></div>
                </div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>
              
              {/* Item 4 */}
              <div className="relative flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12"></div>
                <div className="absolute left-0 md:left-1/2 top-8 w-8 h-8 rounded-full bg-chirag-peach transform md:translate-x-[-50%] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white"></div>
                </div>
                <div className="md:w-1/2 mb-8 md:mb-0 md:pl-12">
                  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-xl font-semibold mb-2 font-playfair">International Recognition</h3>
                    <p className="text-gray-600">Featured in Vogue and Elle for innovative makeup techniques.</p>
                    <div className="text-chirag-gold font-medium mt-2">2021</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section - Enhanced */}
      <section className="py-16 bg-gradient-to-b from-white to-chirag-pink/5">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-6 text-center font-playfair">
            Awards & <span className="header-gradient">Recognition</span>
          </h2>
          
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            My dedication to the craft of makeup artistry has been recognized by industry leaders and prestigious organizations worldwide.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Award 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-chirag-gold/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-chirag-gold/5 rounded-full group-hover:scale-150 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-chirag-gold/20 to-chirag-peach/20 flex items-center justify-center">
                    <Trophy size={30} className="text-chirag-gold" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 font-playfair text-center">Best Bridal Makeup Artist</h3>
                <p className="text-gray-600 mb-4 text-center">
                  Recognized for exceptional bridal makeup artistry and client satisfaction.
                </p>
                <div className="text-chirag-gray italic text-center">Wedding Artistry Awards, 2020</div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ul className="text-sm text-gray-600">
                    <li className="flex items-start mb-2">
                      <Star size={16} className="text-chirag-gold mt-1 mr-2 flex-shrink-0" />
                      <span>Excellence in traditional bridal looks</span>
                    </li>
                    <li className="flex items-start">
                      <Star size={16} className="text-chirag-gold mt-1 mr-2 flex-shrink-0" />
                      <span>Highest client satisfaction rating</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Award 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-chirag-pink/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-chirag-pink/5 rounded-full group-hover:scale-150 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-chirag-pink/20 to-chirag-peach/20 flex items-center justify-center">
                    <Award size={30} className="text-chirag-pink" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 font-playfair text-center">Innovation in Makeup</h3>
                <p className="text-gray-600 mb-4 text-center">
                  Awarded for pioneering new techniques in editorial makeup design.
                </p>
                <div className="text-chirag-gray italic text-center">Beauty Innovation Summit, 2021</div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ul className="text-sm text-gray-600">
                    <li className="flex items-start mb-2">
                      <Star size={16} className="text-chirag-pink mt-1 mr-2 flex-shrink-0" />
                      <span>Revolutionary color theory application</span>
                    </li>
                    <li className="flex items-start">
                      <Star size={16} className="text-chirag-pink mt-1 mr-2 flex-shrink-0" />
                      <span>Creative direction excellence</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Award 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-chirag-purple/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-chirag-purple/5 rounded-full group-hover:scale-150 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-chirag-purple/20 to-chirag-peach/20 flex items-center justify-center">
                    <Medal size={30} className="text-chirag-purple" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 font-playfair text-center">Master Henna Artist</h3>
                <p className="text-gray-600 mb-4 text-center">
                  Recognized for intricate henna designs and cultural preservation.
                </p>
                <div className="text-chirag-gray italic text-center">Cultural Arts Foundation, 2022</div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ul className="text-sm text-gray-600">
                    <li className="flex items-start mb-2">
                      <Star size={16} className="text-chirag-purple mt-1 mr-2 flex-shrink-0" />
                      <span>Preservation of traditional techniques</span>
                    </li>
                    <li className="flex items-start">
                      <Star size={16} className="text-chirag-purple mt-1 mr-2 flex-shrink-0" />
                      <span>Innovation in contemporary designs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Featured In Section */}
          <div className="mt-16">
            <h3 className="text-2xl font-semibold mb-10 text-center font-playfair">Featured In</h3>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="text-gray-400 font-serif text-xl md:text-2xl hover:text-chirag-pink transition-colors">VOGUE</div>
              <div className="text-gray-400 font-serif text-xl md:text-2xl hover:text-chirag-pink transition-colors">ELLE</div>
              <div className="text-gray-400 font-serif text-xl md:text-2xl hover:text-chirag-pink transition-colors">Harper's BAZAAR</div>
              <div className="text-gray-400 font-serif text-xl md:text-2xl hover:text-chirag-pink transition-colors">Cosmopolitan</div>
              <div className="text-gray-400 font-serif text-xl md:text-2xl hover:text-chirag-pink transition-colors">Brides</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
