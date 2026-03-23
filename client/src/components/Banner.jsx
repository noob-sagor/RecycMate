import React from 'react';
import heroImg from '../assets/hero.png';

const Banner = () => {
  return (
    <div className="hero min-h-screen bg-base-200 lg:px-12">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img
          src={heroImg}
          className="max-w-sm md:max-w-md lg:max-w-xl rounded-lg shadow-2xl"
          alt="E-waste management" />
        <div className="text-center lg:text-left">
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-800 leading-tight">
            Manage Your E-Waste with <span className="text-green-600">RecycMate</span>
          </h1>
          <p className="py-6 text-lg lg:text-xl text-gray-600">
            Join the mission to create a greener planet. Schedule pickups for your old electronics, 
            track your recycling progress, and earn "Green Points" for your contributions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button className="btn btn-success text-white px-8 btn-lg">Request a Pickup</button>
            <button className="btn btn-outline btn-success px-8 btn-lg">How It Works</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
