# ![ChRIS logo](https://github.com/FNNDSC/ChRIS_ultron_backEnd/blob/master/docs/assets/logo_chris.png) ChRIS_ui

![License][license-badge]
![Last Commit][last-commit-badge]
![Code Size][code-size]
[![codecov](https://codecov.io/gh/FNNDSC/ChRIS_ui/graph/badge.svg?token=J9PCSEQ5E5)](https://codecov.io/gh/FNNDSC/ChRIS_ui)

This repository contains the reference UI for ChRIS, allowing users to create and interact with dynamic containerized workflows. The ChRIS UI is written primarily in [TypeScript](https://www.typescriptlang.org/) and [React](https://reactjs.org/), and uses the [PatternFly](https://github.com/patternfly/patternfly) React pattern library.

![Screenshot from 2023-12-05 09-22-38](https://github.com/FNNDSC/ChRIS_ui/assets/15992276/a8314bfe-e6e2-4e9c-b1c6-f7fb99e4c882)

**Try it now!** --> https://app.chrisproject.org

## Quickstart

First, get the [ChRIS backend](https://github.com/FNNDSC/ChRIS_ultron_backEnd)
running. Assuming the backend is on `http://localhost:8000/api/v1/`:

```shell
docker run --rm -d --name chris_ui -p 3000:5173 -e REACT_APP_CHRIS_UI_URL=http://localhost:8000/api/v1/ ghcr.io/fnndsc/chris_ui:latest
```

The *ChRIS_ui* is now running on http://localhost:3000/

## Development

We support development on **Linux** only.


#### 1. Have the [_ChRIS_ backend](https://github.com/FNNDSC/ChRIS_ultron_backEnd) running.

For local development, use [Docker Compose](https://docs.docker.com/compose/) and [miniChRIS-docker](https://github.com/FNNDSC/miniChRIS-docker). Open a terminal and run

```shell
git clone https://github.com/FNNDSC/miniChRIS-docker.git
cd miniChRIS-docker
./minichris.sh
```

<details>
<summary>
  <strong>
    Alternatively, start the backend in development mode (click to expand)
  </strong>
</summary>

##### Get the backend running from ChRIS_ultron_backEnd

```bash
$ git clone https://github.com/FNNDSC/ChRIS_ultron_backEnd.git
$ cd ChRIS_ultron_backEnd
$ ./make.sh -U -I -i
```

##### Tearing down the ChRIS backend

You can later remove all the backend containers and release storage volumes with:

```bash
$ cd ChRIS_ultron_backEnd
$ sudo rm -r FS
$ ./unmake.sh
```

</details>

#### 2. Configuring the backend URL

For development, it is recommended that you create either a `.env.local`
or `.env.development.local` environment variables file in the root of the project.
Copy the existing `.env` file to this new file. Changes to these files will be ignored by git.

**There are four (4) major environment variables that need to be set.**

- Point `VITE_CHRIS_UI_URL` to your local backend instance. By default (or if you copied the `.env` file) this is set to `http://localhost:8000/api/v1/`.

- Point `VITE_PFDCM_URL` to the URL of a running PFDCM instance. By default this is set to `http://localhost:4005/`.

- Set `VITE_PFDCM_CUBEKEY` and `VITE_PFDCM_SWIFTKEY` to the aliases (or keys) given to CUBE and Swift while setting up PFDCM. By default these are both `local`. If you're unsure what to use, you can list CUBE and Swift keys using the PFDCM API, or ask for these keys.

For details on how to set up PFDCM, refer to the [PFDCM readme](https://github.com/FNNDSC/pfdcm).

#### 3. Start UI development server

You can follow any of these steps to start UI development server

```shell
git clone https://github.com/FNNDSC/ChRIS_ui.git
cd ChRIS_ui
npm i
npm run dev
```

<details>
<summary>
<strong>
Alternatively, using Docker (click to expand)
</strong>
</summary>

These instructions are no longer supported.

Open a new terminal on your system and follow these steps:

```bash
git clone https://github.com/FNNDSC/ChRIS_ui.git
cd ChRIS_ui
docker build -t localhost/fnndsc/chris_ui:dev -f Dockerfile_dev .
docker run --rm -it -v $PWD:/home/localuser -p 3000:3000 -u $(id -u):$(id -g) --userns=host --name chris_ui localhost/fnndsc/chris_ui:dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

</details>

## Build for production

[Source-to-image](https://github.com/openshift/source-to-image#readme)
must be used to build this project for deployment.

```shell
s2i build https://github.com/FNNDSC/ChRIS_ui quay.io/fedora/nodejs-20 s2ichrisui
```

## Analytics

[Ackee](https://ackee.electerious.com/) can be used for website analytics.
Set the environment variables `VITE_ACKEE_SERVER` and `VITE_ACKEE_DOMAIN_ID`
to send analytics to an Ackee instance.

## Testing

_ChRIS_ui_ does unit tests using [vitest](https://vitest.dev/) and end-to-end (E2E) tests using [Playwright](https://playwright.dev).

### Unit Tests

Unit tests are defined in `*.test.ts` files inside `src`.

It is recommended to leave this command running while developing _ChRIS_ui_.

```shell
npm test
```

### End-to-End Tests

E2E tests are located under `tests/`. Tests specific to http://fetalmri.org are found under `tests/fetalmri.org`.

Playwright requires some system dependencies. On first run, you will be prompted to install these dependencies.
With Playwright installed, run

```shell
npm run test:e2e
```

Or, use a GUI to run tests one-by-one:

```shell
npm run test:ui
```

### Writing Tests

E2E tests can be recorded from user interactions. See https://playwright.dev/docs/codegen-intro

First, start the development server:

```shell
npm run dev
```

In another terminal, open the website and start recording tests:

```shell
npm run test:codegen
```

<!-- Image Links -->

[license-badge]: https://img.shields.io/github/license/fnndsc/chris_ui.svg
[last-commit-badge]: https://img.shields.io/github/last-commit/fnndsc/chris_ui.svg
[repo-link]: https://github.com/FNNDSC/ChRIS_ui
[code-size]: https://img.shields.io/github/languages/code-size/FNNDSC/ChRIS_ui

