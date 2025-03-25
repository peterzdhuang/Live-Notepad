import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import 'quill/dist/quill.snow.css';

const Editor = ({ onChange, onSelectionChange }, ref) => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const pendingDeltasRef = useRef([]); // Queue for pending updates

  // Keep onChange up-to-date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize Quill and apply any pending deltas
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

        // Handle text changes from user input
        quillRef.current.on('text-change', (delta, oldDelta, source) => {
          if (source === 'user') {
            onChangeRef.current(delta);
          }
        });

        quillRef.current.on('selection-change', (range, oldRange, source) => {
          if (onSelectionChange) {
            onSelectionChange(range);
          }
        })

        // Apply all queued deltas once Quill is initialized
        pendingDeltasRef.current.forEach((delta) => {
          quillRef.current.updateContents(delta);
        });
        pendingDeltasRef.current = []; // Clear the queue after applying
      });
    }
  }, []);

  // Expose setContents method via ref
  useImperativeHandle(ref, () => ({
    setContents: (json) => {
      console.log(json);
      const position = json.position; // Number of characters to retain (0 if at start)
      const type = json.type;         // "insert" or "delete"
      const character = json.character; // String to insert or number of chars to delete (as a string)
      let delta = {};

      // Construct the delta based on the operation type
      if (type === 'insert') {
        console.log(type, position, character);
        if (position === 0) {
          // Insert at the beginning
          delta = { ops: [{ insert: character }] };
        } else {
          // Retain up to position, then insert
          delta = { ops: [{ retain: position }, { insert: character }] };
        }
      } else if (type === 'delete') {
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
        throw new Error('Invalid type: ' + type);
      }
      console.log(delta);

      // Apply or queue the delta
      if (quillRef.current) {
        quillRef.current.updateContents(delta);
      } else {
        console.warn('Quill is not initialized yet, queuing delta');
        pendingDeltasRef.current.push(delta); // Add to queue if Quill isn't ready
      }
    }, 

    getCursorPosition: () => {
      if (!quillRef.current) return null;
      const range = quillRef.current.getSelection();
      if (!range) return null;
      
      return {
        index: range.index,
        bounds: quillRef.current.getBounds(range.index),
        length: range.length
      };
    },

    getBounds: (index) => {
      if (!quillRef.current) return null;
      return quillRef.current.getBounds(index);
    },
    getText: () => {
      if (!quillRef.current) return '';
      return quillRef.current.getText();
    }
  }));

  return <div ref={editorRef} style={{ height: '400px' }} />;
};

export default forwardRef(Editor);