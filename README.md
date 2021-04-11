# ![ChRIS logo](https://github.com/FNNDSC/ChRIS_ultron_backEnd/blob/master/docs/assets/logo_chris.png) ChRIS_ui

This repository contains the reference UI for ChRIS, allowing users to create and interact with dynamic containerized workflows. The ChRIS UI is written primarily in [TypeScript](https://www.typescriptlang.org/) and [React](https://reactjs.org/), and uses the [PatternFly](https://github.com/patternfly/patternfly) React pattern library.

![Homepage](src/assets/images/home.png?raw=true)

![License][license-badge]
![Last Commit][last-commit-badge]
[![Stars][stars-badge]][repo-link]
[![Forks][forks-badge]][repo-link]
![Code Size][code-size]


## Preconditions

### Install latest Docker. Currently tested platforms:
* ``Ubuntu 18.04+ (typically 20.04+)``
* ``macOS 11.X+ (Big Sur)``

### Optionally get the backend services up so you can fully test the UI against actual data
* Install latest [``Docker Compose``](https://docs.docker.com/compose/)
* On a Linux machine make sure to add your computer user to the ``docker`` group

Then open a terminal and fire the backend services up by following these steps:
```bash
$ git clone https://github.com/FNNDSC/ChRIS_ultron_backEnd.git
$ cd ChRIS_ultron_backEnd
$ ./make.sh -U -I -i
```
### Tearing down the ChRIS backend:
You can later remove all the backend containers and release storage volumes with:
```bash
$ cd ChRIS_ultron_backEnd
$ sudo rm -r FS
$ ./unmake.sh
```

## Start UI development server

You can follow any of those steps to start UI development server

### Using ``node`` and ``yarn`` package manager directly on the metal

Open a new terminal on your system and follow these steps:
```bash
$ git clone https://github.com/FNNDSC/ChRIS_ui.git
$ cd ChRIS_ui
$ yarn install
$ yarn start
```
### Using ``docker``

Open a new terminal on your system and follow these steps:
```bash
$ git clone https://github.com/FNNDSC/ChRIS_ui.git
$ cd ChRIS_ui
$ docker run --rm -it -v $(pwd):/home/localuser -p 3000:3000 -u $(id -u):$(id -g) --name chris_ui fnndsc/chris_ui:dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


## Notes:
Add .env.local, .env.local, .env.development.local, .env.test.local, .env.production.local file at root to change any local settings

## Additional Notes from Create React App:
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Run the interactive tests

### Using ``node`` and ``yarn`` package manager directly on the metal

Open a new terminal on your system and follow these steps:
```bash
$ yarn test
```

### Using `docker`

Open a new terminal on your system and follow these steps:
```bash
$ docker exec -it chris_ui npm test
```
Launches the test runner in the interactive watch mode.<br>

The unit test scripts are under `./__tests__` folder and tested functions are under `./src/store`.
The tested functions are all the actions and reducers of feed, message, plugin, ui, and user.

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.


## Build the ChRIS UI app for production

```bash
$ cd ChRIS_ui
$ docker build -t local/chris_ui .
```
It correctly bundles React in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!


## Deploy and serve the ChRIS UI app

```bash
$ docker run --name chris_ui -p <desired port>:3000 -d local/chris_ui
```


## Development and deployment of the ChRIS UI directly on the metal

Consult the Wiki [here](https://github.com/FNNDSC/ChRIS_ui/wiki).


## Learn More

If you are interested in contributing or joining us, Check [here](http://chrisproject.org/join-us).

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


[license-badge]: https://img.shields.io/github/license/fnndsc/chris_ui.svg
[last-commit-badge]: https://img.shields.io/github/last-commit/fnndsc/chris_ui.svg
[repo-link]: https://github.com/FNNDSC/ChRIS_ui
[stars-badge]: https://img.shields.io/github/stars/FNNDSC/ChRIS_ui
[forks-badge]: https://img.shields.io/github/forks/FNNDSC/ChRIS_ui
[code-size]: https://img.shields.io/github/languages/code-size/FNNDSC/ChRIS_ui
