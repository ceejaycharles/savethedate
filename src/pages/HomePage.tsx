import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Gift, 
  Users, 
  CreditCard, 
  Image, 
  Mail, 
  ArrowRight, 
  Star 
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const HomePage = () => {
  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section className="relative bg-gradient-to-br from-primary-900 to-primary-700 text-white">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-lg">
              Make Your Special Day Unforgettable
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/90 text-balance">
              Create beautiful invitations, manage your guest list, and collect gifts for your special occasions - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button variant="accent" size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20 text-white">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need in One Platform</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              SaveTheDate makes planning your special event easy and delightful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-8">
                <div className="rounded-full bg-primary-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Beautiful Invitations</h3>
                <p className="text-gray-600">
                  Create stunning digital invitations with our customizable templates for any event type.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-8">
                <div className="rounded-full bg-secondary-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Guest Management</h3>
                <p className="text-gray-600">
                  Easily manage your guest list, track RSVPs, and communicate with your attendees.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-8">
                <div className="rounded-full bg-accent-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Gift className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gift Registry</h3>
                <p className="text-gray-600">
                  Create a personalized gift registry and let your guests contribute with secure Paystack payments.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-8">
                <div className="rounded-full bg-success-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-success-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Invitation Delivery</h3>
                <p className="text-gray-600">
                  Send your invitations via email or generate shareable links for WhatsApp and social media.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-8">
                <div className="rounded-full bg-warning-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Image className="h-6 w-6 text-warning-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Photo Gallery</h3>
                <p className="text-gray-600">
                  Create and share beautiful photo galleries with your guests before and after your event.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-8">
                <div className="rounded-full bg-error-100 w-12 h-12 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-error-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
                <p className="text-gray-600">
                  Process gift payments securely with Paystack, Nigeria's trusted payment provider.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Event types section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect for Every Celebration</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No matter what you're celebrating, SaveTheDate helps you make it special
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Event type cards */}
            <div className="relative overflow-hidden rounded-lg group">
              <img 
                src="https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Wedding" 
                className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <h3 className="text-white font-medium p-4">Weddings</h3>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg group">
              <img 
                src="https://images.pexels.com/photos/3068509/pexels-photo-3068509.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Birthday" 
                className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <h3 className="text-white font-medium p-4">Birthdays</h3>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg group">
              <img 
                src="https://images.pexels.com/photos/3321797/pexels-photo-3321797.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Baby Shower" 
                className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <h3 className="text-white font-medium p-4">Baby Showers</h3>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg group">
              <img 
                src="https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Anniversary" 
                className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <h3 className="text-white font-medium p-4">Anniversaries</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied users who have planned successful events with SaveTheDate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="bg-gray-50 border-none">
              <CardContent className="pt-8">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 text-accent-500 fill-accent-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "SaveTheDate made our wedding planning so much easier. The gift registry was a game-changer, and our guests loved the digital invitations!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span className="text-primary-700 font-medium">JO</span>
                  </div>
                  <div>
                    <h4 className="font-medium">John & Olivia</h4>
                    <p className="text-sm text-gray-500">Lagos, Nigeria</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="bg-gray-50 border-none">
              <CardContent className="pt-8">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 text-accent-500 fill-accent-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "I used SaveTheDate for my daughter's 1st birthday. The RSVP tracking was excellent, and collecting gifts was smooth with Paystack integration."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center mr-3">
                    <span className="text-secondary-700 font-medium">SA</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Sarah A.</h4>
                    <p className="text-sm text-gray-500">Abuja, Nigeria</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="bg-gray-50 border-none">
              <CardContent className="pt-8">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 text-accent-500 fill-accent-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "The photo gallery feature was perfect for our anniversary. We could share memories with those who couldn't attend. Highly recommend!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center mr-3">
                    <span className="text-accent-700 font-medium">DK</span>
                  </div>
                  <div>
                    <h4 className="font-medium">David K.</h4>
                    <p className="text-sm text-gray-500">Port Harcourt, Nigeria</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your Special Event?</h2>
          <p className="text-xl mb-8 text-white/80 max-w-2xl mx-auto">
            Join thousands of Nigerians who trust SaveTheDate for their important life celebrations
          </p>
          <Link to="/register">
            <Button variant="accent" size="lg">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;