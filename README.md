# ![ChRIS logo](https://github.com/FNNDSC/ChRIS_ultron_backEnd/blob/master/docs/assets/logo_chris.png) ChRIS_ui
UI for ChRIS.

![License][license-badge]
![Last Commit][last-commit-badge]


## Preconditions

### Install latest Docker. Currently tested platforms:
* ``Ubuntu 16.04+``
* ``MAC OS X 10.11+``

### Optionally get the backend services up so you can fully test the UI against actual data
* Install latest ``Docker Compose``
* On a Linux machine make sure to add your computer user to the ``docker`` group

Then open a terminal and fire the backend services up:
```bash
$ git clone https://github.com/FNNDSC/ChRIS_ultron_backEnd.git
$ cd ChRIS_ultron_backEnd
$ ./make.sh -U -I -i
```

You can later remove all the backend containers and release storage volumes with:
```bash
$ cd ChRIS_ultron_backEnd
$ sudo rm -r FS
$ ./unmake.sh
```


## Start UI development server

Open a new terminal and type:
```bash
$ git clone https://github.com/FNNDSC/ChRIS_ui.git
$ cd ChRIS_ui
$ docker run --rm -it -v $(pwd):/home/localuser -p 3000:3000 -u $(id -u):$(id -g) --name chris_ui fnndsc/chris_ui:dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


## Notes:
1. Add .env.local, .env.local, .env.development.local, .env.test.local, .env.production.local file at root to change any local settings

## Additional Notes from Create React App:
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Run the interactive tests

Open a new terminal and type:
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

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


[license-badge]: https://img.shields.io/github/license/fnndsc/chris_ui.svg
[last-commit-badge]: https://img.shields.io/github/last-commit/fnndsc/chris_ui.svg
