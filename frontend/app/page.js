'use client'
import React, { useEffect, useState, useRef } from 'react';
import Editor from '../components/Editor';
import WebSocketService from '../utils/WebSocket';

const Home = () => {
  const [roomId] = useState('room1'); // Hardcoded room ID
  const [username] = useState("username");
  const editorRef = useRef(null);

  const queuedMessages = useRef([]);
  const handleEditorChange = (delta) => { 
    console.log(delta)
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
      if (editorRef.current && editorRef.current.setContents) {
        // First process any queued messages
        queuedMessages.current.forEach((queuedData) => {
          if (queuedData.type === 'init') {
            editorRef.current.setContents(queuedData.content);
          } else if (queuedData.type === 'op') {
            editorRef.current.setContents(queuedData.operation);
          }
        });
        queuedMessages.current = [];

        // Process the current incoming data
        if (data.type === 'init') {
          const delta = {"position" : 0, "type" : "insert", "character" : data.content}; 
          editorRef.current.setContents(delta);
        } else if (data.type === 'op') {
          editorRef.current.setContents(data.operation);
        }
      } else {
        console.warn('Editor not ready yet, queuing data:', data);
        // Queue the message for later processing
        queuedMessages.current.push(data);
      }
    });

  return () => {
    WebSocketService.disconnect();
  };
}, [roomId]);



  // Right now the issue is that it applies twice to the same guy
  // also the content tracking is just completely wrong

  return (
    <div>
      <h1>Google Docs Clone</h1>
      <Editor ref={editorRef} onChange={handleEditorChange} />
    </div>
  );
};

export default Home;