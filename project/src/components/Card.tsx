import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, id }) => {
  return (
    <div id={id} onClick={onClick} className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};
