import React from 'react';

export function MainContent({ children }) {
  return (
    <main className="col-span-1 lg:col-span-7">
      {children}
    </main>
  );
}