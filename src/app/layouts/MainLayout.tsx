'use client';
import { PropsWithChildren } from 'react';
import Navbar from '../components/Navbar';

interface MainLayout extends PropsWithChildren {}

const MainLayout = ({ children }: MainLayout) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100vh',
      }}
    >
      <Navbar />
      {children}
    </div>
  );
};

export default MainLayout;
