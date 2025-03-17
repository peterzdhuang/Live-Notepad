'use client'
import React, { useEffect, useState } from 'react';
import Editor from '../components/Editor';
import WebSocketService from '../utils/WebSocket';

const Home = () => {
  const [roomId] = useState('room1'); // Hardcoded room ID
  const [username] = useState("username");

  const handleEditorChange = (delta) => { 
    var json = {};
    if (delta["ops"][1] === undefined) {
      json["position"] = 0
      if ("delete" in delta["ops"][0]) {
        json["type"] = "delete"
        json["character"] = String(delta["ops"][0]["delete"]);
      } else {
        json["type"] = "insert"
        json["character"] = delta["ops"][0]["insert"]
      }
    } else if ("delete" in delta["ops"][1]) {
      // Starting at pos delete x number of positions
      json["position"] = delta["ops"][0]["retain"];
      json["type"] = "delete"
      json["character"] = String(delta["ops"][1]["delete"]);
    } else {
      //starting at pos insert x
      json["position"] = delta["ops"][0]["retain"]
      json["type"] = "insert"
      json["character"] = delta["ops"][1]["insert"]
    }
    WebSocketService.send(json);
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