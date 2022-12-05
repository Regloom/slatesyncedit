const express = require('express');
const app = express();
const http = require('http').createServer(app);

const { Server } = require("socket.io");
const io = new Server(http, {
  path: "/ws/"
});

const path = require('path');

let initialEditorValue = [
  {
    type: "h1",
    children: [{ text: "Heading 1" }],
  },
  {
    type: "h2",
    children: [{ text: "Heading 2" }],
  },
  {
    type: "paragraph",
    children: [
      { text: "Paragraph inside a sample document.\n" },
      { text: "Bold text.\n", bold: true, code: true },
      { text: "Italic text.\n", italic: true },
      { text: "Bold and underlined text.\n", bold: true, underline: true },
      { text: "Variable\n", code: true },
    ],
  },
  {
    type: 'image',
    url: 'https://source.unsplash.com/kFrdX5IeQzI',
    alt: 'This is my image',
    children: [{ text: '' }]
  }
];

// could potentially add persistence since too many concurrent users would deplete the RAM and make the app crash
let groupData = {};
// since there is no persistence clear groupData every 6 hours
const clearDataInterval = 60000 * 60 * 6;

setInterval(() => {
  groupData = {};
}, clearDataInterval);

// websockets
io.on('connection', (socket) => {
  // listen for new-operations event emitted from an editor
  socket.on('new-operations', (data, callback) => {
    // console.log('data:', data);
    // callback("got it");
    groupData[data.groupId] = data.newValue;
    // emit new-remote-operations to all editors in specific group
    io.emit(`new-remote-operations-${data.groupId}`, data);
  });
  socket.on('disconnect', () => {
    //console.log('user disconnected');
  });
});

let environment = process.env.NODE_ENV || 'development';

// cors middleware needed in development
if (environment === 'development') {
  const cors = require('cors');
  app.use(
    cors({
      origin: 'http://localhost:3000',
    })
  );
}

app.get('/api/groups/:id', (req, res) => {
  const { id } = req.params;
  if (!(id in groupData)) groupData[id] = initialEditorValue;
  res.send(groupData[id]);
});

if (environment === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));

  app.get('/*', (_, res) => {
    try {
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    } catch (error) {
      res.send(error.message);
    }
  });
}

const PORT = process.env.PORT || 4000;

http.listen(PORT);
