# RealTimeMD


# Core Features
    Web based real time mark down editor
    No account, no signups
    Create links for people to share
    Real-Time Collaboration
    Live cursor positions
    Character-by-character sync
    Conflict resolution




# Architecture

Data structure of the rooms
Limit sizes to 2? For now


sequenceDiagram
    participant Client
    participant Server
    Client->>Server: HTTP GET /ws (Upgrade header)
    Server->>Client: 101 Switching Protocols
    loop Message Handling
        Client->>Server: WebSocket Message
        Server->>Server: processMessage()
        Server->>Other Clients: Broadcast
    end
    Client->>Server: Close connection
    Server->>Server: Cleanup client



Bugs right now:

So when a client disconnects, the client doesnt get remove from the 
list

Also when a new client joins, the things written already doesnt get 
sent