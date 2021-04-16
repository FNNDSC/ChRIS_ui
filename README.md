# ![ChRIS logo](https://github.com/FNNDSC/ChRIS_ultron_backEnd/blob/master/docs/assets/logo_chris.png) ChRIS_ui

This repository contains the reference UI for ChRIS, allowing users to create and interact with dynamic containerized workflows. The ChRIS UI is written primarily in [TypeScript](https://www.typescriptlang.org/) and [React](https://reactjs.org/), and uses the [PatternFly](https://github.com/patternfly/patternfly) React pattern library.

![Homepage](https://github.com/FNNDSC/CHRIS_docs/blob/fb98b793ff785f4ebb24ce30bcf02cf243b64803/images/mpc/Feed-Detail-Screencapture-PACS-selected.png)

![License][license-badge]
![Last Commit][last-commit-badge]
![Code Size][code-size]


## Preconditions

### Install latest Docker. Currently tested platforms:

- Ubuntu 18.04+ (typically 20.04+, and Pop!_OS)
- Arch Linux
- macOS 11.X+ (Big Sur)

### Optionally get the backend services up so you can fully test the UI against actual data

* Install latest [``Docker Compose``](https://docs.docker.com/compose/)
* On a Linux machine make sure to add your computer user to the ``docker`` group

Then open a terminal and fire the backend services up by following these steps:

```bash
git clone https://github.com/FNNDSC/miniChRIS.git
cd miniChRIS
./minichris.sh
```

See [FNNDSC/miniChRIS](https://github.com/FNNDSC/miniChRIS) for details.

<details>
<summary>
<strong>
Alternatively, start the backend in development mode:
</strong>
</summary>

### Get the backend running from ChRIS_ultron_backEnd

```bash
$ git clone https://github.com/FNNDSC/ChRIS_ultron_backEnd.git
$ cd ChRIS_ultron_backEnd
$ ./make.sh -U -I -i
```

### Tearing down the ChRIS backend

You can later remove all the backend containers and release storage volumes with:
```bash
$ cd ChRIS_ultron_backEnd
$ sudo rm -r FS
$ ./unmake.sh
```



</details>



## Start UI development server

You can follow any of those steps to start UI development server

### Using ``node`` and ``yarn`` package manager directly on the metal

Open a new terminal on your system and follow these steps:
```bash
$ git clone https://github.com/FNNDSC/ChRIS_ui.git
$ cd ChRIS_ui
$ npm i
$ npm start
```

More details can be found on the
[wiki](https://github.com/FNNDSC/ChRIS_ui/wiki/Development-and-deployment-directly-on-the-metal).

### Using ``docker``

Open a new terminal on your system and follow these steps:
```bash
$ git clone https://github.com/FNNDSC/ChRIS_ui.git
$ cd ChRIS_ui
$ docker build -t fnndsc/chris_ui:dev -f Dockerfile_dev .
$ docker run --rm -it -v $PWD:/home/localuser -p 3000:3000 -u $(id -u):$(id -g) --userns=host --name chris_ui fnndsc/chris_ui:dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Configuring the backend URL

If your backend is running somewhere other than `http://localhost:8000/api/v1/`, then copy the `.env` file to one of the locations below:

- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`

Point `REACT_APP_CHRIS_UI_URL` to your local backend instance.

## Build the ChRIS UI app for production

```bash
$ cd ChRIS_ui
$ docker build -t local/chris_ui .
```
It correctly bundles React in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

## Deploy and serve the ChRIS UI app

```bash
$ docker run --name chris_ui -p <desired port>:3000 -d local/chris_ui
```

## Learn More

Interested in contributing? https://chrisproject.org/join-us

You can learn more in the
[Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the
[React documentation](https://reactjs.org/).


[license-badge]: https://img.shields.io/github/license/fnndsc/chris_ui.svg
[last-commit-badge]: https://img.shields.io/github/last-commit/fnndsc/chris_ui.svg
[repo-link]: https://github.com/FNNDSC/ChRIS_ui
[code-size]: https://img.shields.io/github/languages/code-size/FNNDSC/ChRIS_ui
