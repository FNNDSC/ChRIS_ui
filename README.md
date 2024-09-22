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

There are two modes of development:

- "local": runs the _ChRIS_ backend locally. Requires Docker, and uses more disk space + slower startup time.
- "public": use the global, public testing server. This is the easier option, especially for non-Linux OS.
 
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

### 1. Dependencies

You need Node version 20 or 21.

```shell
git clone https://github.com/FNNDSC/ChRIS_ui.git
cd ChRIS_ui
npm ci
```

#### Local Development Dependencies

No extra dependencies are required when using the "public" server.

If you intend on developing with the "local" server, you will need **Docker** and Docker Compose
to run the backend and helper scripts.

### 2. Run the development server

Either using the "public" server:

```shell
npm run dev:public
```

Or, start a local backend and run the "local" server:

```shell
npm run dev:local
```

## Container Image

_ChRIS\_ui_ can run on Docker, Podman, Kubernetes, etc.

Simple usage:

```shell
docker run --rm -it -e CHRIS_UI_URL="http://$(hostname):8000/api/v1/" -e PFDCM_URL="http://$(hostname):4005/" -p 8080:80 ghcr.io/fnndsc/chris_ui:staging
```

For more information, see https://chrisproject.org/docs/run/chris_ui

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

End-to-end tests are located under `tests/`.

The end-to-end testing framework, Playwright, requires some system dependencies.
On first run, you will be prompted to install these dependencies.

```shell
npm run test:e2e  # run tests using "public" backend

npm run test:e2e:local  # run tests using "local" backend
```

For more information, consult the wiki:
https://github.com/FNNDSC/ChRIS_ui/wiki/E2E-Testing-with-Playwright

<!-- Image Links -->

[license-badge]: https://img.shields.io/github/license/fnndsc/chris_ui.svg
[last-commit-badge]: https://img.shields.io/github/last-commit/fnndsc/chris_ui.svg
[repo-link]: https://github.com/FNNDSC/ChRIS_ui
[code-size]: https://img.shields.io/github/languages/code-size/FNNDSC/ChRIS_ui
