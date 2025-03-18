import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import 'quill/dist/quill.snow.css';

const Editor = ({ onChange }, ref) => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);

  // Keep onChange up-to-date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize Quill
  useEffect(() => {
    if (typeof window !== 'undefined' && editorRef.current && !quillRef.current) {
      import('quill').then((QuillModule) => {
        const Quill = QuillModule.default;
        quillRef.current = new Quill(editorRef.current, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ header: [1, 2, false] }],
              ['bold', 'italic', 'underline'],
              ['image', 'code-block'],
            ],
          },
        });
        quillRef.current.on('text-change', (delta, oldDelta, source) => {
          if (source === 'user') {
            onChangeRef.current(delta);
          }
        });
      });
    }
  }, []);

  // Expose setContents method via ref
  useImperativeHandle(ref, () => ({
    setContents: (json) => {
      if (quillRef.current) {
        const position = json.position; // Number of characters to retain (0 if at start)
        const type = json.type;         // "insert" or "delete"
        const character = json.character; // String to insert or number of chars to delete (as a string)
        var delta = {}
        if (type === "insert") {
          if (position === 0) {
            // Insert at the beginning
            delta = { ops: [{ insert: character }] };
            
          } else {
            // Retain up to position, then insert
            delta = { ops: [{ retain: position }, { insert: character }] };
          }
        } else if (type === "delete") {
          const deleteCount = parseInt(character, 10); // Convert string "number" to integer
          if (position === 0) {
            // Delete from the beginning
            delta = { ops: [{ delete: deleteCount }] };
          } else {
            // Retain up to position, then delete
            delta = { ops: [{ retain: position }, { delete: deleteCount }] };
          }
        } else {
          // Handle invalid type
          throw new Error("Invalid type: " + type);
        }
        console.log(delta);
        quillRef.current.updateContents(delta);
      } else {
        console.warn('Quill is not initialized yet');
      }
    },
  }));

  return <div ref={editorRef} style={{ height: '400px' }} />;
};

export default forwardRef(Editor);