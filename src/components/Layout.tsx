
import React from 'react';
import { MobileLayout } from './MobileLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <MobileLayout>{children}</MobileLayout>;
};
