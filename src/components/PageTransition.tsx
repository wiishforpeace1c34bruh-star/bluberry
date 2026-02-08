import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey: string;
}

export function PageTransition({ children, transitionKey }: PageTransitionProps) {
  return (
    <div
      key={transitionKey}
      className="animate-fade-in-blur h-full"
      style={{ animationDuration: '0.4s' }}
    >
      {children}
    </div>
  );
}
