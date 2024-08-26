#!/usr/bin/env node
// Purpose: download sample DICOM files and upload them to Orthanc.

import * as childProcess from "node:child_process";
import * as os from "node:os";
import * as path from "node:path";

const UTILS_IMAGE = "ghcr.io/fnndsc/utils:fc56615";

function main() {
  runUtils("testing/sample_dicoms", ["make", "neuro"]);
  runUtils("testing", [
    "./miniChRIS/scripts/upload2orthanc.sh",
    "./sample_dicoms/data",
  ]);
}

main();

/**
 * Run a command using docker in the utils image.
 *
 * @param workDir {string} relative working directory
 * @param args {string[]} command to run
 */
function runUtils(workDir, args) {
  const { uid, gid } = os.userInfo();
  childProcess.execFileSync(
    "docker",
    [
      "run",
      "--rm",
      ...getTtyArgs(),
      "--net=host",
      "-u",
      `${uid}:${gid}`,
      "-v",
      `${getHere()}:/ChRIS_ui`,
      "-w",
      path.join("/ChRIS_ui", workDir),
      UTILS_IMAGE,
      ...args,
    ],
    { stdio: "inherit" },
  );
}

/**
 * @returns {string} the directory of the NPM project
 */
function getHere() {
  return childProcess
    .execFileSync("npm", ["prefix"], { encoding: "utf-8" })
    .trim();
}

/**
 * @returns {string[]} tty-related flags to use for `docker run`
 */
function getTtyArgs() {
  return process.env.GITHUB_CI ? [] : ["-t"];
}
