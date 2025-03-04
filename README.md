# RealTimeMD



    
    Document Management

        Create/edit/delete documents

        Generate shareable links
    go
    Copy

    type Document struct {
        ID       string
        Content  string
        Password string // Optional
        Users    map[string]bool // Connected users
    }

    Real-Time Collaboration

        Live cursor positions

        Character-by-character sync

        Conflict resolution

    Markdown Preview

        Split-screen view (editor + rendered HTML)

