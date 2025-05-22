import React from 'react';
import { Gift, Calendar, Users, Camera } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            About Our Event Platform
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            We're dedicated to making your special moments even more memorable with our comprehensive event management platform.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-2">
          <div className="flex flex-col items-start">
            <div className="rounded-lg p-2 bg-blue-100 text-blue-600">
              <Calendar size={24} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Event Management</h3>
            <p className="mt-2 text-gray-600">
              Create and manage events effortlessly with our intuitive tools. From weddings to corporate gatherings, we've got you covered.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <div className="rounded-lg p-2 bg-green-100 text-green-600">
              <Users size={24} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Guest List Management</h3>
            <p className="mt-2 text-gray-600">
              Keep track of your guests, send invitations, and manage RSVPs all in one place. Make sure no one is left out.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <div className="rounded-lg p-2 bg-purple-100 text-purple-600">
              <Gift size={24} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Gift Registry</h3>
            <p className="mt-2 text-gray-600">
              Create and manage your gift registry with ease. Let your guests know exactly what you'd love to receive.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <div className="rounded-lg p-2 bg-pink-100 text-pink-600">
              <Camera size={24} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Photo Gallery</h3>
            <p className="mt-2 text-gray-600">
              Share and collect memories with a beautiful photo gallery. Let everyone contribute their favorite moments.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Mission</h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
            We believe that every event tells a unique story. Our mission is to provide you with the tools and features you need to bring your vision to life, making event planning and management a delightful experience for everyone involved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;