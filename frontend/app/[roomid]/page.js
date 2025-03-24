"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import Editor from "../../components/Editor"
import WebSocketService from "../../utils/WebSocket"
import RemoteCursor from "../../components/Remotecursor"
export default function RoomPage({ params }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const username = searchParams.get("username")
  const { roomid } = useParams();
  const roomId = roomid;
  const [remoteCursors, setRemoteCursors] = useState({})
  const [localCursor, setLocalCursor] = useState(null)
  const cursorTimeout = useRef(null)
  const userColor = useRef(`hsl(${Math.random() * 360}, 70%, 60%)`)
 
  // Redirect to home if no username is provided
  useEffect(() => {
    if (!username) {
      router.push("/")
    }
  }, [username, router])

  // State for editor
  const editorRef = useRef(null)
  const queuedMessages = useRef([])
  const [isConnected, setIsConnected] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleEditorChange = (delta) => {
    var json = {}
    if (delta["ops"][1] === undefined) {
      json["position"] = 0
      if ("delete" in delta["ops"][0]) {
        json["type"] = "delete"
        json["character"] = String(delta["ops"][0]["delete"])
      } else {
        json["type"] = "insert"
        json["character"] = delta["ops"][0]["insert"]
      }
    } else if ("delete" in delta["ops"][1]) {
      // Starting at pos delete x number of positions
      json["position"] = delta["ops"][0]["retain"]
      json["type"] = "delete"
      json["character"] = String(delta["ops"][1]["delete"])
    } else {
      //starting at pos insert x
      json["position"] = delta["ops"][0]["retain"]
      json["type"] = "insert"
      json["character"] = delta["ops"][1]["insert"]
    }
    console.log(editorRef.current.getCursorPosition());

    WebSocketService.send(json)
  }

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleBackToSelection = () => {
    WebSocketService.disconnect()
    router.push("/")
  }

  useEffect(() => {
    if (roomId) {
      WebSocketService.connect(roomId, username, (data) => {
        setIsConnected(true)
        
        if (data.type == 'cursor') {
          setRemoteCursors(prev => ({
            ...prev, 
            [data["cursor"].username] : {
              x : data["cursor"].x,
              y : data["cursor"].y, 
              height : data["cursor"].height, 
              username : data["cursor"].username,
              colour : data["cursor"].colour,
              lastUpdate : Date.now()
            }
          }));
        }
        if (editorRef.current && editorRef.current.setContents) {
          // First process any queued messages
          queuedMessages.current.forEach((queuedData) => {
            if (queuedData.type === "init") {
              editorRef.current.setContents(queuedData.content)
            } else if (queuedData.type === "op") {
              editorRef.current.setContents(queuedData.operation)
            }
          })
          queuedMessages.current = []

          // Process the current incoming data
          if (data.type === "init") {
            const delta = { position: 0, type: "insert", character: data.content }
            editorRef.current.setContents(delta)
          } else if (data.type === "op") {
            console.log(data.operation)
            editorRef.current.setContents(data.operation)
          } else if (data.type === "cursor") {
            console.log("123");

            console.log(data.cursor);
            setRemoteCursors(prev => ({
              ...prev,
              [data.userId]: {
                x : data.x,
                y : data.y, 
                height : data.height,
                username: data.username,
                colour: data.colour,
                lastUpdated: Date.now()
              }
              }))
            
              console.log(remoteCursors[data.userId])
          }
        } else {
          console.warn("Editor not ready yet, queuing data:", data)
          // Queue the message for later processing
          queuedMessages.current.push(data)
        }
      })

      return () => {
        WebSocketService.disconnect()
        setRemoteCursors({});
      }
    }
  }, [roomId, username])



  useEffect(() => {
    const interval = setInterval(() => {
      setRemoteCursors(prev => {
        const now = Date.now();
        const updated = Object.fromEntries(
          Object.entries(prev).filter(([_, cursor]) => now - cursor.lastUpdated < 5000) // Keep active ones
        );
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  
  const handleSelectionChange = (range) => {
    const bounds = editorRef.current.getBounds(range.index);
    const cursorPosition = {
      x: bounds.left,
      y: bounds.top,
      height: bounds.height,
      index: range.index
    };

    console.log(cursorPosition)
    if (!cursorTimeout.current) {
      cursorTimeout.current = setTimeout(() => {

        console.log(cursorPosition);
        WebSocketService.send({
          type : 'cursor',
          ...cursorPosition, 
          colour : userColor.current
        });
      
        cursorTimeout.current = null;
      }, 100);
    }

  };

  // If no username, show loading or redirect
  if (!username) {
    return <div>Redirecting...</div>
  }
  return (
    <div className="editor-page">
      <div className="editor-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackToSelection}>
            ← Back
          </button>
          <h1>Google Docs Clone</h1>
        </div>
        <div className="room-info">
          <div className="room-id-container">
            <span>Room ID: {roomId}</span>
            <button className="copy-button" onClick={handleCopyRoomId}>
              {isCopied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="user-info">
            <span>User: {username}</span>
            <span className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>
      <div className="editor-container">
        <Editor 
          ref={editorRef} 
          onChange={handleEditorChange} 
          onSelectionChange={handleSelectionChange}
        />
        
        {Object.entries(remoteCursors).map(([userId, cursor]) => (
          <RemoteCursor key={userId} cursor={cursor} />
        ))}
      </div>
    </div>
  )
}

