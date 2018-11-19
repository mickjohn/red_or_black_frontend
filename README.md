# Red or Black game frontend
This is the web frontend of the [red or black game](https://github.com/mickjohn/red_or_black). Connects to the websocket game server and allows a user to play the game.

## Getting started
This will show you how to get this project up and running.

### Prerequisites
You need to have npm installed. You can get npm [here](https://www.npmjs.com/get-npm). You might also need to install gulp-cli with npm to build the project.
```
npm install -g gulp-cli
```

### Building the project
Build the project with
```
npm install
gulp
```

There should now be a `dist` directory containing the hmtl, css & javascript files.

There is also a Dockerfile that builds and nginx image ready to serve from the `dist` directory.
After you've run `gulp` run 
```
docker build -t red_or_black_web .
```
to build the docker image.

## Licence
This project is licensed under the MIT Licence - see the LICENCE.txt file for details
