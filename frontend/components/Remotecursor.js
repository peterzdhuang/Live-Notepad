import React from 'react';

const RemoteCursor = ({ cursor, bounds }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: bounds.left + 19,
        top: bounds.top + 61,
      }}
    >
      {/* Cursor Line */}
      <div
        style={{
          position: 'absolute',
          width: '2px',
          height: `${bounds.height}px`, // Match text height if needed
          backgroundColor: cursor.colour || 'blue',
          boxShadow: `0 0 5px ${cursor.colour || 'blue'}`,
          opacity: 0.5,
        }}
      />

      {/* Cursor Label */}
      <div
        style={{
          position: 'absolute',
          left: '10px',
          top: `${bounds.height + 5}px`, // Label shows below the cursor
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
          opacity: 0.5,
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
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        {cursor.username}
      </div>
    </div>
  );
};

export default RemoteCursor;
