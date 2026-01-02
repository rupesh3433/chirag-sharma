
import React, { useState } from 'react';
import { toast } from "sonner";
import { Send, Gift, Star, Mail, Check, ArrowRight } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("You've successfully joined our beauty community!");
      setEmail('');
      setIsSubmitting(false);
      setIsSubscribed(true);
      
      // Reset the success state after 5 seconds
      setTimeout(() => setIsSubscribed(false), 5000);
    }, 1000);
  };

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-white to-chirag-pink/5">
      {/* Background with improved contrast */}
      <div className="absolute inset-0 bg-white/90"></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-chirag-pink/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-chirag-peach/20 blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-20 h-20 rounded-full bg-chirag-purple/20 blur-xl"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-10 md:p-14 rounded-2xl shadow-xl relative overflow-hidden border border-chirag-pink/20">
            {/* Top decorative bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-chirag-pink to-chirag-peach"></div>
            
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold font-playfair relative inline-block">
                Join Our <span className="text-chirag-pink">Beauty Community</span>
              </h2>
              
              <div className="flex justify-center my-6">
                <div className="w-20 h-1 bg-gradient-to-r from-chirag-pink to-chirag-peach rounded-full"></div>
              </div>
              
              <p className="text-gray-700 mb-8 max-w-xl mx-auto">
                Subscribe to receive exclusive beauty tips, tutorials, behind-the-scenes content, and special offers straight to your inbox.
              </p>

              <div className="flex justify-center mb-6">
                <Mail size={24} className="text-chirag-darkPurple" />
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="relative z-10 mb-12">
              <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
                <div className="flex-grow relative">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full p-4 pr-10 border border-chirag-pink/30 rounded-lg focus:ring-2 focus:ring-chirag-pink focus:border-transparent transition-all duration-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting || isSubscribed}
                  />
                  <ArrowRight size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-chirag-pink" />
                </div>
                <button 
                  type="submit" 
                  className={`button-primary whitespace-nowrap relative overflow-hidden group md:px-10 ${isSubscribed ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  disabled={isSubmitting || isSubscribed}
                >
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-chirag-peach to-chirag-pink group-hover:w-full transition-all duration-500"></span>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subscribing...
                      </span>
                    ) : isSubscribed ? (
                      <span className="flex items-center gap-2">
                        <Check size={18} />
                        Subscribed!
                      </span>
                    ) : (
                      <span>Subscribe Now</span>
                    )}
                  </span>
                </button>
              </div>

              {isSubscribed && (
                <div className="mt-4 text-center text-green-600 text-sm animate-fade-in">
                  Thank you for subscribing! Watch your inbox for beauty tips and exclusive offers.
                </div>
              )}
            </form>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-chirag-pink/10 p-4 rounded-lg flex items-center gap-3 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-chirag-pink/20">
                <div className="w-10 h-10 rounded-full bg-chirag-pink/20 flex items-center justify-center">
                  <Gift size={20} className="text-chirag-darkPurple" />
                </div>
                <div>
                  <h4 className="font-medium text-chirag-darkPurple text-sm">Exclusive Offers</h4>
                  <p className="text-gray-600 text-xs">Special deals and discounts</p>
                </div>
              </div>
              
              <div className="bg-chirag-peach/10 p-4 rounded-lg flex items-center gap-3 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-chirag-peach/20">
                <div className="w-10 h-10 rounded-full bg-chirag-peach/20 flex items-center justify-center">
                  <Star size={20} className="text-chirag-darkPurple" />
                </div>
                <div>
                  <h4 className="font-medium text-chirag-darkPurple text-sm">Makeup Tips</h4>
                  <p className="text-gray-600 text-xs">Professional beauty advice</p>
                </div>
              </div>
              
              <div className="bg-chirag-purple/10 p-4 rounded-lg flex items-center gap-3 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-chirag-purple/20">
                <div className="w-10 h-10 rounded-full bg-chirag-purple/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-chirag-darkPurple">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M12 18v-6" />
                    <path d="M8 15h8" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-chirag-darkPurple text-sm">Tutorials</h4>
                  <p className="text-gray-600 text-xs">Step-by-step guides</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-8 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
