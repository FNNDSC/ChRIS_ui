# ![ChRIS logo](https://github.com/FNNDSC/ChRIS_ultron_backEnd/blob/master/docs/assets/logo_chris.png) ChRIS_ui

![License][license-badge]
![Last Commit][last-commit-badge]
![Code Size][code-size]
[![codecov](https://codecov.io/gh/FNNDSC/ChRIS_ui/graph/badge.svg?token=J9PCSEQ5E5)](https://codecov.io/gh/FNNDSC/ChRIS_ui)

This repository contains the reference UI for ChRIS, allowing users to create and interact with dynamic containerized workflows. The ChRIS UI is written primarily in [TypeScript](https://www.typescriptlang.org/) and [React](https://reactjs.org/), and uses the [PatternFly](https://github.com/patternfly/patternfly) React pattern library.

![Screenshot from 2023-12-05 09-22-38](https://github.com/FNNDSC/ChRIS_ui/assets/15992276/a8314bfe-e6e2-4e9c-b1c6-f7fb99e4c882)

**Try it now!** --> https://app.chrisproject.org

## Quickstart

```shell
git clone https://github.com/FNNDSC/ChRIS_ui.git
cd ChRIS_ui
npm ci
npm run dev:public
```

## Development

We support development on **Linux** only.

#### 0. Have the [_ChRIS_ backend](https://github.com/FNNDSC/ChRIS_ultron_backEnd) running (Optional)

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

If your backend is accessible from a host other than localhost, e.g. you are using a cloud or remote development
server, run `cp .env .env.development.local` then edit `.env.development.local` with your backend API URL.

#### 1. Install Dependencies

You need Node version 20 or 21.

```shell
git clone https://github.com/FNNDSC/ChRIS_ui.git
cd ChRIS_ui
npm i
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


#### 2. Run the development server

If you are running and have configured a backend in step 0, run

```shell
npm run dev
```

Otherwise, you can use our public testing backend instance. Run

```shell
npm run dev:public
```

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

> [!IMPORTANT]
> End-to-end (E2E) tests are configured to run against our public testing backend instance, which is prepopulated with data.

E2E tests are located under `tests/`.

Playwright requires some system dependencies. On first run, you will be prompted to install these dependencies.
With Playwright installed, run

```shell
npm run test:e2e
```

For more information, consult the wiki:
https://github.com/FNNDSC/ChRIS_ui/wiki/E2E-Testing-with-Playwright

<!-- Image Links -->

[license-badge]: https://img.shields.io/github/license/fnndsc/chris_ui.svg
[last-commit-badge]: https://img.shields.io/github/last-commit/fnndsc/chris_ui.svg
[repo-link]: https://github.com/FNNDSC/ChRIS_ui
[code-size]: https://img.shields.io/github/languages/code-size/FNNDSC/ChRIS_ui
