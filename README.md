# Websocket Editor
Websocket editor is website that allows teams to edit the same rich text editor simultaneously.

This project was bootstrapped with [websocket-editor](https://github.com/alireza-chassebi/websocket-editor).
Original code is working with slate v0.47. 
Here is an updated version which works with recent codebase, has support for images drag/drop & copy/paste.

## Local development
To run app locally first start server and then open client React app(s).

### Server-side (express + socket.io)
To start server:
1. navigate to `server` folder
2. run `node server.js` or `npm start`

### Client-side (React + Slate)
In the project directory, you can run:

#### `npm start`
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

#### `npm run build`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Development with docker
Brefore you begin, ensure you have met the following requirements:
- You have [Docker](https://www.docker.com/) installed

### To run the development app, do the following:
1. navigate to the projects root directory
2. setup and run containers `docker-compose up`
3. go to localhost:3000 in your browser

### To run the production app, do the following:
1. navigate to the projects root directory
2. build app docker image `docker build -t prodimage .`
3. create docker container and start the container
```
  docker run --name prodApp -e NODE_ENV=production -p 4000:4000 prodimage
```
4. go to localhost:4000 in your browser

### Teardown of Websocket Editor
To teardown the development app, do the following:
1. navigate to the projects root directory
2. stop and remove containers
```
  docker-compose down
```

To teardown the production app do the following:
1. navigate to the projects root directory
2. stop and remove containers
```
  docker rm -f prodApp
```