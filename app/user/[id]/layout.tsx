// UserLayout.tsx
import React from 'react';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-md">
        <Header />
      </header>

      <main className="flex-grow container mx-auto py-8 px-4">
        {children}
      </main>

      <footer className="bg-gray-100 py-4 mt-8">
        <Footer />
      </footer>
    </div>
  );
};

export default UserLayout;