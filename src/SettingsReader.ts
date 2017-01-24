import * as colors from "colors"
import * as path from "path"
import * as fs from "fs"

import { ITrackedVersionSet, ITrackedVersion } from "./interfaces"
import { matcherBuilder } from "./MatcherBuilder"
import { parseVersion } from "./ParseVersion"


/**
 * readSettingsFile - Read the settings file.
 * @return {ITrackedVersionSet}
 */
export function readSettingsFile(settingsFile: string) : ITrackedVersionSet {
  if (!settingsFileExists(settingsFile)) {
    reportMissingSettingsFile(settingsFile);
    process.exit(1);
  }

  const settings = JSON.parse(fs.readFileSync(settingsFile, "utf-8"));

  return Object.keys(settings)
    .map((key) => {
      let trackedEntry = settings[key]

      trackedEntry.name = key
      trackedEntry.version = parseVersion(trackedEntry.version)

      Object.keys(trackedEntry.files).forEach((file) => {
        trackedEntry.files[file] = matcherBuilder(trackedEntry, trackedEntry.files[file])
      })

      return <ITrackedVersion> trackedEntry
    });
}

function settingsFileExists(settingsFile: string) {
  return fs.existsSync(settingsFile);
}

function reportMissingSettingsFile(settingsFile: string) {
  console.log(colors.red(settingsFile + " configuration file is missing."));
}
