// Import React dependencies.
import React, { useState, useRef, useEffect } from 'react';
// Import the Slate components and React plugin.
import { createEditor} from 'slate'
import { Slate, Editable, withReact, DefaultElement} from 'slate-react'
import { withHistory } from 'slate-history'

//local dependencies
import initialValue from '../util/initialValue';
import { Toolbar, Paragraph, Image, withImages, StyledText } from './Components';

// request birdirectional connection between server and client
import { io } from 'socket.io-client';

//const ENDPOINT = process.env.REACT_APP_ENDPOINT || 'http://localhost:4000';
const ENDPOINT = (window.origin === 'http://localhost:3000' ? 'http://localhost:4000' : window.origin);
// console.log(`Endpoint is: ${ENDPOINT}`)

const socket = io(ENDPOINT, {
  transports: ["websocket"], // use WebSocket first, if available
  path: "/ws/"
});

// Initial example provdided by slate.js for syncing editors
// https://github.com/ianstormtaylor/slate/blob/v0.47/examples/syncing-operations/index.js line 236

// Below code working on slate v0.47 only was modified to work with recent codebase & working with images
// https://github.com/alireza-chassebi/websocket-editor/blob/master/src/components/SyncingEditor.js

// Interesting article
// https://www.smashingmagazine.com/2021/05/building-wysiwyg-editor-javascript-slatejs/

export const SyncingEditor = ({ groupId }) => {

  const [editor] = useState(() => withImages(withHistory(withReact(createEditor()))));
  //const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(initialValue); //just for triggering re-rendering of Editor

  useEffect(() => {
    const getServerValue = async () => { //done for fancy ASYNC syntax!
      const response = await fetch(`${ENDPOINT}/api/groups/${groupId}`);
      const newValue = await response.json();
      editor.children = newValue; //a new way to set editor content 
      setValue(newValue);//just to trigger re-rendering!
    } 
    getServerValue(); //editor content from server

    const eventName = `new-remote-operations-${groupId}`;
    // listen for new-remote-operations event from server and apply changes to other editors in the group
    socket.on(eventName, ({ changedEditorId, newValue }) => {
      if (id.current !== changedEditorId) {
        // needed to prevent onChange event from emitting another operations event when applyOperation is called
        remote.current = true;
        // copy changes from changed editor
        editor.children = newValue; //a new way to set editor content 
        setValue(newValue); //just to trigger re-rendering! 
        remote.current = false;
      }
    });
    return () => socket.off(eventName);

  }, [editor,groupId]);

  const id = useRef(`${Date.now()}`);
  const remote = useRef(false);

  const onChange = (value)=>{
    const isAstChange = editor.operations.some(
      op => 'set_selection' !== op.type
    )

    if (isAstChange) { //content changed!
      setValue(value);
      //emit event to server
      if (!remote.current) {
        socket.emit('new-operations',{
          changedEditorId: id.current,
          newValue: value,
          groupId: groupId
        }
        ,(response) => {
          //console.log(response); // "got it"
        });
      }
    } 
  }
  
  const renderElement = (props) => {
    switch (props.element.type) {
      case "paragraph":
        return <Paragraph {...props} />;
      case "h1":
        return <h1 {...props.attributes}>{props.children}</h1>;
      case "h2":
        return <h2 {...props.attributes}>{props.children}</h2>;
      case "h3":
        return <h3 {...props.attributes}>{props.children}</h3>;
      case "image":
        return <Image {...props} />;
      default:
        // return <Paragraph {...props} />;
        // For the default case, we delegate to Slate's default rendering. 
        return <DefaultElement {...props} />;
    }
  }

  const renderLeaf = (props) => {
    return <StyledText {...props} />;
  }

  return (
    <>
      <Slate editor={editor} value={value} onChange={onChange} >
        <Toolbar />
        <Editable renderElement={renderElement} renderLeaf={renderLeaf} placeholder="Enter some text"/>
      </Slate>
    </>
  );
};