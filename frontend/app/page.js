'use client'
import React, { useEffect, useState } from 'react';
import Editor from '../components/Editor';
import WebSocketService from '../utils/WebSocket';

const Home = () => {
  const [roomId] = useState('room1'); // Hardcoded room ID
  const [username] = useState("username");

  const handleEditorChange = (delta) => {
    WebSocketService.send({ type: 'op', operation: delta });
  };

  useEffect(() => {
    WebSocketService.connect(roomId, (data) => {
      if (data.type === 'init') {
        Editor.setContents(data.content); // Load initial content
      } else if (data.type === 'op') {
        Editor.setContents(data.operation); // Apply real-time updates
      }
    });
  }, [roomId]);


  return (
    <div>
      <h1>Google Docs Clone</h1>
      <Editor onChange={handleEditorChange} />
    </div>
  );
};

export default Home;