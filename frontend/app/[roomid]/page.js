"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import Editor from "../../components/Editor"
import WebSocketService from "../../utils/WebSocket"

export default function RoomPage({ params }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const username = searchParams.get("username")
  const { roomid } = useParams();
  const roomId = roomid; 
  console.log(roomid, username)
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
    console.log(delta)
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
    console.log(json)
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
          }
        } else {
          console.warn("Editor not ready yet, queuing data:", data)
          // Queue the message for later processing
          queuedMessages.current.push(data)
        }
      })

      return () => {
        WebSocketService.disconnect()
      }
    }
  }, [roomId, username])

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
        <Editor ref={editorRef} onChange={handleEditorChange} />
      </div>
    </div>
  )
}

