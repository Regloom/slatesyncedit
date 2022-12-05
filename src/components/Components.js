import React from 'react';
import {
  useSlateStatic,
  useSelected,
  useFocused,
  ReactEditor,
  useSlate
} from 'slate-react'
import {
  Editor, 
  Transforms, 
  Element as SlateElement
} from 'slate'
import imageExtensions from 'image-extensions'
import isUrl from 'is-url'
import { cx, css } from '@emotion/css'

// export const Button = ({ className, active, ...props }) => {
//     const style = {
//       cursor: 'pointer',
//       color: active ? 'black' : '#ccc',
//       margin: '0 10px',
//     };
//     return <span {...props} className={className} style={style} />;
// };

const Button = React.forwardRef( ({ className, active, reversed, ...props}, ref) => (      
    <span {...props} ref={ref}
        className={cx(
          className,
          css`
            cursor: pointer;
            color: ${reversed
              ? active
                ? 'white'
                : '#aaa'
              : active
              ? 'black'
              : '#ccc'};
          `
        )}
    />
))

const Icon = React.forwardRef( ({ className, ...props }, ref) => (
      <span
        {...props}
        ref={ref}
        className={cx(
          'material-icons',
          className,
          css`
            font-size: 18px;
            vertical-align: text-bottom;
          `
        )}
      />
))

const Menu = React.forwardRef( ({ className, ...props }, ref) => (
      <div
        {...props}
        ref={ref}
        className={cx(
          className,
          css`
            & > * {
              display: inline-block;
            }
            & > * + * {
              margin-left: 15px;
            }
          `
        )}
      />
))
// isImageUrl & insertImage funcs used by InsertImageButton & WithImages
const isImageUrl = url => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return imageExtensions.includes(ext)
}

const insertImage = (editor, url) => {
  const text = { text: '' }
  const image= { type: 'image', url, children: [text] }
  Transforms.insertNodes(editor, image)
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

// Mark Buttons
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

// Block buttons (h1-h3)
const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  )

  return !!match
}

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  )
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  })
  let newProperties;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
  }
  Transforms.setNodes(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}
const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
      )}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

// Toolbar 
export const Toolbar = React.forwardRef( ({ className, ...props }, ref) => (
      <Menu
        {...props}
        ref={ref}
        className={cx(
          className,
          css`
            position: relative;
            padding: 1px 18px 17px;
            margin: 0 -20px;
            border-bottom: 2px solid #eee;
            margin-bottom: 20px;
          `
        )}> 
        {/* Mark styles */}
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
        {/* Block styles */}
        <BlockButton format="h1" icon="looks_one" />
        <BlockButton format="h2" icon="looks_two" />
        <BlockButton format="h3" icon="looks_3" />
        {/* Image button*/}
        <InsertImageButton />
      </Menu>
))

export const Paragraph = ({ attributes, children }) => (
  <p {...attributes}>{children}</p>
)

export const StyledText = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong {...attributes}>{children}</strong>;
  }

  if (leaf.code) {
    children = <code {...attributes}>{children}</code>;
  }

  if (leaf.italic) {
    children = <em {...attributes}>{children}</em>;
  }

  if (leaf.underline) {
    children = <u {...attributes}>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
}

export const Image = ({ attributes, element, children }) => {
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

export const withImages = editor => {
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

