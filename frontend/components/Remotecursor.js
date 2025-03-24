import React from 'react';
import { motion } from 'framer-motion';

const RemoteCursor = ({ cursor }) => {
  if (!cursor) return null;
  // This is printing out null sometimes
  console.log(cursor);
  return (
    <motion.div 
      className="remote-cursor-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'absolute',
        left: `${cursor.x}`,
        top: `${cursor.y}`,
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      {/* Cursor Line */}
      <div 
        className="cursor-line"
        style={{
          width: '10px',
          height: `${cursor.height}px`,
          backgroundColor: cursor.colour,
          position: 'relative',
          left: 0,
          top: 0,
          boxShadow: `0 0 5px ${cursor.colour}`,
          animation: 'cursor-blink 1.2s infinite'
        }}
      />

      {/* Cursor Label */}
      <motion.div 
        className="cursor-label"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
        style={{
          position: 'absolute',
          left: `1px`,
          top: `1px`,
          backgroundColor: cursor.colour,
          color: 'white',
          padding: '4px 10px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: 500,
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
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
