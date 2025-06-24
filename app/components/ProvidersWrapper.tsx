// app/components/ProvidersWrapper.tsx
"use client"; // This directive is ESSENTIAL here

import React from 'react';
import { AlertProvider } from '../context/AlertContext'; // Adjust the path if necessary

interface ProvidersWrapperProps {
  children: React.ReactNode;
}

export default function ProvidersWrapper({ children }: ProvidersWrapperProps) {
  return (
    <AlertProvider>
      {children}
    </AlertProvider>
  );
}