"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [roomId, setRoomId] = useState("")
  const [activeTab, setActiveTab] = useState("create") // 'join' or 'create'
  const [error, setError] = useState("")

  const handleJoinRoom = (e) => {
    e.preventDefault()
    if (!username.trim()) {
      setError("Username is required")
      return
    }
    if (!roomId.trim()) {
      setError("Room ID is required")
      return
    }

    // Navigate to the room with the username as a query parameter
    router.push(`/${roomId}?username=${encodeURIComponent(username)}`)
  }

  const handleCreateRoom = (e) => {
    e.preventDefault()
    if (!username.trim()) {
      setError("Username is required")
      return
    }

    // Generate a random room ID
    const newRoomId = Math.random().toString(36).substring(2, 8)

    // Navigate to the new room with the username as a query parameter
    router.push(`/${newRoomId}?username=${encodeURIComponent(username)}`)
  }

  return (
    <div className="room-selection-container">
      <div className="room-selection-card">
        <h1 className="room-selection-title">Note Share</h1>

        <div className="tabs">
        
          <button className={`tab ${activeTab === "create" ? "active" : ""}`} onClick={() => setActiveTab("create")}>
            Create Room
          </button>
          <button className={`tab ${activeTab === "join" ? "active" : ""}`} onClick={() => setActiveTab("join")}>
            Join Room
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {activeTab === "join" ? (
          <form onSubmit={handleJoinRoom} className="room-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="roomId">Room ID</label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
              />
            </div>

            <button type="submit" className="submit-button">
              Join Room
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateRoom} className="room-form">
            <div className="form-group">
              <label htmlFor="create-username">Username</label>
              <input
                type="text"
                id="create-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>

            <button type="submit" className="submit-button create">
              Create New Room
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

