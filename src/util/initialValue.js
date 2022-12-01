const initialValue = [
  {
    type: "h1",
    children: [{ text: "Heading 1" }],
  },
  {
    type: "h2",
    children: [{ text: "Heading 2" }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
  {
    type: 'image',
    url: 'https://source.unsplash.com/kFrdX5IeQzI',
    alt: 'This is my image',
    children: [{ text: '' }]
  }
]

export default initialValue;
