import React from 'react';
import { motion } from 'framer-motion';

const RemoteCursor = ({ cursor }) => {
  if (!cursor) return null;
  
  return (
    <motion.div
      animate={{ left: cursor.x, top: cursor.y }}
      initial={{ opacity: 0.6}}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{ position: 'absolute' }}
    >
      {/* Cursor Line */}
      <motion.div
        style={{
          position: 'absolute',
          width: '2px',
          height: '15px',
          top: '60px',
          left: '27px',
          backgroundColor: cursor.colour || 'blue',
          boxShadow: `0 0 5px ${cursor.colour || 'blue'}`,
          animation: 'cursor-blink 1.2s infinite',
          opacity : 0.5
        }}
      />
      
      {/* Cursor Label */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
        style={{
          position: 'absolute',
          top: '85px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: cursor.colour || 'blue',
          color: 'white',
          padding: '4px 10px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: 500,
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
          gap: '4px',
          opacity : 0.5
        }}
      >
        {/* Small user icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          opacity={0.5}
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        {cursor.username}
      </motion.div>
    </motion.div>
  );
};

export default RemoteCursor;