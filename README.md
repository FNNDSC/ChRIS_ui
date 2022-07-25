# ![ChRIS logo](https://github.com/FNNDSC/ChRIS_ultron_backEnd/blob/master/docs/assets/logo_chris.png) ChRIS_ui

![License][license-badge]
![Last Commit][last-commit-badge]
![Code Size][code-size]

This repository contains the reference UI for ChRIS, allowing users to create and interact with dynamic containerized workflows. The ChRIS UI is written primarily in [TypeScript](https://www.typescriptlang.org/) and [React](https://reactjs.org/), and uses the [PatternFly](https://github.com/patternfly/patternfly) React pattern library.

![Screenshot](screenshot.png)

## Try it now!

| URL                           | Description     |
|-------------------------------|-----------------|
| https://app.chrisproject.org  | Stable          |
| https://next.chrisproject.org | Latest (master) |

## Quickstart

First, get the [ChRIS backend](https://github.com/FNNDSC/ChRIS_ultron_backEnd)
running. Assuming the backend is on `http://localhost:8000/api/v1/`:

```shell
docker run --rm -d --name chris_ui -p 3000:3000 -e REACT_APP_CHRIS_UI_URL=http://localhost:8000/api/v1/ ghcr.io/fnndsc/chris_ui:latest
```

The *ChRIS_ui* is now running on http://localhost:3000/

## Development

### [0] Preconditions

1. **Install latest Docker for your platform.**
    
    Currently tested platforms
    - Ubuntu 18.04+ (typically 20.04+, and Pop!_OS)
    - Fedora 32+
    - Arch Linux
    - macOS 11.X+ (Big Sur)

2. **Get the backend services up so you can fully test the UI against actual data.**
    * Install latest [``Docker Compose``](https://docs.docker.com/compose/)
    * On a Linux machine make sure to add your computer user to the ``docker`` group

3. **Open a terminal and start the backend services.**
    ```bash
    git clone https://github.com/FNNDSC/miniChRIS.git
    cd miniChRIS
    ./minichris.sh
    ```

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

See [FNNDSC/miniChRIS](https://github.com/FNNDSC/miniChRIS) for details.

### [1] Configuring the backend URL

For development, it is recommended that you create either a `.env.local`
or `.env.development.local` environment variables file in the root of the project.
Copy the existing `.env` file to this new file. Changes to these files will be ignored by git.

**There are four (4) major environment variables that need to be set.**

- Point `REACT_APP_CHRIS_UI_URL` to your local backend instance. By default (or if you copied the `.env` file) this is set to `http://localhost:8000/api/v1/`.

- Point `REACT_APP_PFDCM_URL` to the URL of a running PFDCM instance. By default this is set to `http://localhost:4005/`.

- Set `REACT_APP_PFDCM_CUBEKEY` and `REACT_APP_PFDCM_SWIFTKEY` to the aliases (or keys) given to CUBE and Swift while setting up PFDCM. By default these are both `local`. If you're unsure what to use, you can list CUBE and Swift keys using the PFDCM API, or ask for these keys.

For details on how to set up PFDCM, refer to the [PFDCM readme](https://github.com/FNNDSC/pfdcm).

### [2] Start UI development server
You can follow any of these steps to start UI development server

* #### Using ``node`` and ``yarn`` package manager directly on the metal

    Open a new terminal on your system and follow these steps:
    ```bash
    $ git clone https://github.com/FNNDSC/ChRIS_ui.git
    $ cd ChRIS_ui
    $ npm i
    $ npm run dev
    ```

    More details can be found in the
    [wiki](https://github.com/FNNDSC/ChRIS_ui/wiki/Development-and-deployment-directly-on-the-metal).

* #### Using ``docker``

    Open a new terminal on your system and follow these steps:
    ```bash
    $ git clone https://github.com/FNNDSC/ChRIS_ui.git
    $ cd ChRIS_ui
    $ docker build -t fnndsc/chris_ui:dev -f Dockerfile_dev .
    $ docker run --rm -it -v $PWD:/home/localuser -p 3000:3000 -u $(id -u):$(id -g) --userns=host --name chris_ui fnndsc/chris_ui:dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


## Build the ChRIS UI app for production

[Source-to-image](https://github.com/openshift/source-to-image#readme)
can be used to build this project.

```shell
s2i build https://github.com/FNNDSC/ChRIS_ui quay.io/fedora/nodejs-16 s2ichrisui
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


### E2E TESTS ARE RAN USING CYPRESS

## Prerequisites:
- ChRIS_ultron_backend is running on `http://localhost:8000/api/v1/`
- ChRIS_ui is running on `http://localhost:3000/`
- You have Cypress installed using `npm install`
```
- To run: 
`$ npm run cypress:open`
```
This will open cypress in an interactive UI. 
To run cypress in the terminal as a headless browser use: 
```
`npm run cypress:run`
```

Running Cypress inside a container is not currently supported



