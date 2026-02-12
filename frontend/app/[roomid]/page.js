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
  const { roomid } = useParams()
  const roomId = roomid
  const [remoteCursors, setRemoteCursors] = useState({})
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

  // New export function
  const handleExportTxt = () => {
    // Get the current content from the editor
    const content = editorRef.current.getText()

    // Create a Blob with the content
    const blob = new Blob([content], { type: "text/plain" })

    // Create a download link
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)

    // Generate filename with room ID and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    link.download = `notepad-${roomId}-${timestamp}.txt`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const handleEditorChange = (delta) => {
    var json = {}
    if (delta["ops"][1] === undefined) {
      json["position"] = 0
      if ("delete" in delta["ops"][0]) {
        json["type"] = "delete"
        json["length"] = delta["ops"][0]["delete"]

        handleSelectionChange({ index: 0, length: 1 })
      } else {
        json["type"] = "insert"
        json["character"] = delta["ops"][0]["insert"]

        handleSelectionChange({ index: 1, length: 1 })
      }
    } else if ("delete" in delta["ops"][1]) {
      // Starting at pos delete x number of positions
      json["position"] = delta["ops"][0]["retain"]
      json["type"] = "delete"
      json["length"] = delta["ops"][1]["delete"]
      handleSelectionChange({ index: json["position"] + 1, length: 1 })
    } else {
      //starting at pos insert x
      json["position"] = delta["ops"][0]["retain"]
      json["type"] = "insert"
      json["character"] = delta["ops"][1]["insert"]
      handleSelectionChange({ index: json["position"] + 1, length: 1 })
    }

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
            editorRef.current.setContents(data.operation)
          } else if (data.type === "cursor") {
            var data = data["cursor"]
            setRemoteCursors((prev) => ({
              ...prev,
              [data.uuid]: {
                index: data.index,
                length: data.length,
                username: data.username,
                colour: data.colour,
                lastUpdated: Date.now(),
              },
            }))
          }
        } else {
          console.warn("Editor not ready yet, queuing data:", data)
          // Queue the message for later processing
          queuedMessages.current.push(data)
        }
      })

      return () => {
        WebSocketService.disconnect()
        setRemoteCursors({})
      }
    }
  }, [roomId, username])

  useEffect(() => {
    const interval = setInterval(() => {
      setRemoteCursors((prev) => {
        const now = Date.now()
        const updated = Object.fromEntries(Object.entries(prev).filter(([_, cursor]) => now - cursor.lastUpdated < 5000)) // Keep active ones
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const [cursorBounds, setCursorBounds] = useState([])

  useEffect(() => {
    if (!editorRef.current) return
    const updated = Object.entries(remoteCursors).map(([uuid, cursor]) => ({
      uuid,
      cursor,
      bounds: editorRef.current.getBounds(cursor.index, cursor.length),
    }))
    setCursorBounds(updated)
  }, [remoteCursors, editorRef])

  const handleSelectionChange = (range) => {
    if (!cursorTimeout.current) {
      cursorTimeout.current = setTimeout(() => {
        WebSocketService.send({
          type: "cursor",
          index: range.index,
          length: range.length,
          colour: userColor.current,
        })

        cursorTimeout.current = null
      }, 100)
    }
  }

  // If no username, show loading or redirect
  if (!username) {
    return <div>Redirecting...</div>
  }

  return (
    <div className="document-page">
      <header className="document-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackToSelection}>
            ←
          </button>
          <div className="document-title">
            <h1>Live Notepad</h1>
            <p>Room: {roomId}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="action-button" onClick={handleExportTxt}>
            Export
          </button>
          <button className="action-button" onClick={handleCopyRoomId}>
            {isCopied ? "Copied!" : "Copy Room ID"}
          </button>
          <div className="user-info">
            <p>{username}</p>
            <span className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>
      </header>

      <main className="document-editor">
        <div className="editor-container">
          <Editor ref={editorRef} onChange={handleEditorChange} onSelectionChange={handleSelectionChange} />

          {cursorBounds.map(({ uuid, cursor, bounds }) => (
            <RemoteCursor key={uuid} cursor={cursor} bounds={bounds} />
          ))}
        </div>
      </main>
    </div>
  )
}