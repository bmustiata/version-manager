import * as colors from "colors"
import * as path from "path"
import * as fs from "fs"

import { ITrackedVersionSet, ITrackedVersion } from "./interfaces"
import { matcherBuilder } from "./MatcherBuilder"

const settingsFile = path.join(process.cwd(), "versions.json");


/**
 * readSettingsFile - Read the settings file.
 * @return {Object}
 */
export function readSettingsFile() : ITrackedVersionSet {
  if (!settingsFileExists()) {
    reportMissingSettingsFile();
    process.exit(1);
  }

  const settings = JSON.parse(fs.readFileSync(settingsFile, "utf-8"));

  return Object.keys(settings)
    .map((key) => {
      let trackedEntry = settings[key]

      trackedEntry.name = key
      Object.keys(trackedEntry.files).forEach((file) => {
        trackedEntry.files[file] = matcherBuilder(trackedEntry, trackedEntry.files[file])
      })

      return <ITrackedVersion> trackedEntry
    });
}

function settingsFileExists() {
  return fs.existsSync(settingsFile);
}

function reportMissingSettingsFile() {
  console.log(colors.red(settingsFile + " configuration file is missing."));
}
