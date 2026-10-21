/**
 * Example diagrams for the Mermaid viewer
 */

export const MERMAID_EXAMPLES = [
    {
        value: 'flowchart',
        label: 'Flowchart',
        code: `flowchart TD
    A([Start]) --> B{Is the user signed in?}
    B -- Yes --> C[Load dashboard]
    B -- No --> D[Show login page]
    D --> E[Submit credentials]
    E --> F{Valid?}
    F -- Yes --> C
    F -- No --> G[Show error]
    G --> D
    C --> H([Done])`,
    },
    {
        value: 'sequence',
        label: 'Sequence diagram',
        code: `sequenceDiagram
    autonumber
    actor User
    participant App as Web App
    participant API
    participant DB as Database

    User->>App: Click "Save"
    App->>API: POST /documents
    API->>DB: INSERT document
    DB-->>API: id = 42
    API-->>App: 201 Created
    App-->>User: Show "Saved" toast

    Note over App,API: Requests are retried once on failure`,
    },
    {
        value: 'class',
        label: 'Class diagram',
        code: `classDiagram
    class Document {
        +String id
        +String title
        +render() String
        +export(format) Blob
    }
    class MarkdownDocument {
        +parse() Node[]
    }
    class HtmlDocument {
        +String css
        +String js
    }
    Document <|-- MarkdownDocument
    Document <|-- HtmlDocument
    Document "1" o-- "*" Revision : has
    class Revision {
        +Date createdAt
        +String content
    }`,
    },
    {
        value: 'state',
        label: 'State diagram',
        code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Editing : type
    Editing --> Rendering : pause
    Rendering --> Editing : keep typing
    Rendering --> Ready : success
    Rendering --> Error : syntax error
    Error --> Editing : fix
    Ready --> Editing : type
    Ready --> [*]`,
    },
    {
        value: 'er',
        label: 'Entity relationship',
        code: `erDiagram
    USER ||--o{ DOCUMENT : owns
    DOCUMENT ||--|{ REVISION : has
    DOCUMENT }o--o{ TAG : tagged
    USER {
        int id PK
        string email
        string name
    }
    DOCUMENT {
        int id PK
        string title
        string format
    }
    REVISION {
        int id PK
        datetime createdAt
    }`,
    },
    {
        value: 'gantt',
        label: 'Gantt chart',
        code: `gantt
    title Release plan
    dateFormat YYYY-MM-DD
    section Design
    Wireframes        :done,    des1, 2026-01-05, 5d
    Visual design     :active,  des2, after des1, 7d
    section Build
    Core editor       :         dev1, after des2, 10d
    Export & sharing  :         dev2, after dev1, 6d
    section Launch
    Testing           :         qa1,  after dev2, 5d
    Release           :milestone, after qa1, 0d`,
    },
    {
        value: 'pie',
        label: 'Pie chart',
        code: `pie showData
    title Documents by format
    "Markdown" : 52
    "HTML" : 28
    "JSON" : 14
    "Mermaid" : 6`,
    },
    {
        value: 'mindmap',
        label: 'Mind map',
        code: `mindmap
  root((Docklify))
    Formats
      Markdown
      HTML
      JSON
      Mermaid
    Export
      HTML
      PDF
      SVG
      PNG
    AI
      Fix syntax
      Generate diagrams`,
    },
    {
        value: 'journey',
        label: 'User journey',
        code: `journey
    title Writing a document
    section Draft
      Open the editor: 5: Me
      Write content: 4: Me
    section Review
      Preview output: 5: Me
      Fix mistakes: 3: Me, AI
    section Share
      Export to PDF: 5: Me`,
    },
    {
        value: 'git',
        label: 'Git graph',
        code: `gitGraph
    commit id: "init"
    branch feature
    checkout feature
    commit id: "add viewer"
    commit id: "add export"
    checkout main
    commit id: "hotfix"
    merge feature tag: "v1.1"
    commit id: "release"`,
    },
];

export const DEFAULT_MERMAID = MERMAID_EXAMPLES[0].code;
