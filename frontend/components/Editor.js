import React, { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css'; // CSS can stay as is; Next.js handles it

const Editor = ({ onChange }) => {
  // Ref to hold the Quill instance
  const quillRef = useRef(null);
  // Ref to hold the DOM element for the editor
  const editorRef = useRef(null);
  // Ref to keep the latest onChange function
  const onChangeRef = useRef(onChange);

  // Update onChangeRef whenever onChange prop changes
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize Quill only on the client-side
  useEffect(() => {
    // Check if running on the client and refs are ready
    if (typeof window !== 'undefined' && editorRef.current && !quillRef.current) {
      // Dynamically import Quill to avoid SSR
      import('quill').then((QuillModule) => {
        const Quill = QuillModule.default;
        // Initialize Quill with the DOM element
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
        // Set up text-change listener
        quillRef.current.on('text-change', (delta, oldDelta, source) => {
          if (source === 'user') {
            onChangeRef.current(delta);
          }
        });
      });
    }
  }, []); // Empty dependency array: run only once on mount

  // Optional: Expose a method to set editor contents
  const setContents = (delta) => {
    if (quillRef.current) {
      quillRef.current.updateContents(delta);
    }
  };

  useEffect(() => {
    if (quillRef.current) {
      window.setEditorContents = setContents;
    }
  }, []); // Run once when Quill is ready

  // Render the editor container
  return <div ref={editorRef} style={{ height: '400px' }} />;
};

export default Editor;