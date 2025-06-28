
import React from 'react';
import { Layout } from '../components/Layout';
import { HeroSection } from '../components/HeroSection';
import { AuthDebugger } from '../components/AuthDebugger';

const HowToPlay = () => {
  console.log('HowToPlay component rendered at:', new Date().toISOString());
  
  return (
    <Layout>
      <HeroSection />
      <AuthDebugger />
    </Layout>
  );
};

export default HowToPlay;
