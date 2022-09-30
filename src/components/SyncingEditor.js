// Import React dependencies.
import React, { useState, useRef, useEffect } from 'react';
// Import the Slate components and React plugin.
import { Transforms, createEditor} from 'slate'
import {
  Slate,
  Editable,
  useSlateStatic,
  useSelected,
  useFocused,
  withReact,
  ReactEditor,
} from 'slate-react'
import { withHistory } from 'slate-history'
//other dependencies
import imageExtensions from 'image-extensions'
import isUrl from 'is-url'
import { css } from '@emotion/css'
//local dependencies
import initialValue from '../util/initialValue';
import { Button, Icon, Toolbar } from './Components';
// request birdirectional connection between server and client
import { io } from 'socket.io-client';
const ENDPOINT = process.env.REACT_APP_ENDPOINT || 'http://localhost:4000';
const socket = io(ENDPOINT, {
  transports: ["websocket"], // use WebSocket first, if available
  path: "/ws/"
});


// Initial example provdided by slate.js for syncing editors
// https://github.com/ianstormtaylor/slate/blob/v0.47/examples/syncing-operations/index.js line 236

// Below code working on slate v0.47 only was modified to work with recent codebase & working with images
// https://github.com/alireza-chassebi/websocket-editor/blob/master/src/components/SyncingEditor.js

export const SyncingEditor = ({ groupId }) => {

  const [editor] = useState(() => withImages(withHistory(withReact(createEditor())))); 
  const [value, setValue] = useState(initialValue); //just for triggering re-rendering of Editor

  useEffect(() => {
    
    const getServerValue = async () => {
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
        },(response) => {
          //console.log(response); // "got it"
        });
      }
    } 
  }

  const Paragraph = ({ attributes, children }) => (
    <p {...attributes}>{children}</p>
  )
  
  const Image = ({ attributes, element, children }) => {
    const editor = useSlateStatic();
    const path = ReactEditor.findPath(editor, element);
  
    const selected = useSelected();
    const focused = useFocused();

    return (
      <div {...attributes}>
        {children}
        <div contentEditable={false} className={css`position: relative;`}>
          <img  src={element.url} 
                alt={element.alt} 
                className={css`
                  display: block;
                  max-width: 100%;
                  max-height: 20em;
                  box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
                `}
          />
          <Button
            active
            onClick={() => Transforms.removeNodes(editor, { at: path })}
            className={css`
              display: ${selected && focused ? 'inline' : 'none'};
              position: absolute;
              top: 0.5em;
              left: 0.5em;
              background-color: white;
            `}
          >
            <Icon>delete</Icon>
          </Button>
        </div>
      </div>
    )}
  
  const renderElement = (props) => {
    switch (props.element.type) {
      case "image":
        return <Image {...props} />;
      default:
        return <Paragraph {...props} />;
    }
  }

  return (
    <>
      <Slate editor={editor} value={value} onChange={onChange} >
        <Toolbar>
          <InsertImageButton />
        </Toolbar>
        <Editable renderElement={renderElement} placeholder="Enter some text"/>
      </Slate>
    </>
  );
};

//below are only images functions
const withImages = editor => {
  const { insertData, isVoid } = editor

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = data => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result
            insertImage(editor, url)
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

const insertImage = (editor, url) => {
  const text = { text: '' }
  const image= { type: 'image', url, children: [text] }
  Transforms.insertNodes(editor, image)
}

const isImageUrl = url => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return imageExtensions.includes(ext)
}

const InsertImageButton = () => {
  const editor = useSlateStatic()
  return (
    <Button
      onMouseDown={event => {
        event.preventDefault()
        const url = window.prompt('Enter the URL of the image:')
        if (url && !isImageUrl(url)) {
          alert('URL is not an image')
          return
        }
        url && insertImage(editor, url)
      }}
    >
      <Icon>image</Icon>
    </Button>
  )
}
