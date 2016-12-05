import * as fs from "fs"

import { readSettingsFile } from './SettingsReader'

const versionsToProcess = readSettingsFile();

versionsToProcess.forEach((trackedVersion) => {
  Object.keys(trackedVersion.files).forEach((fileName) => {
    let versionPattern = trackedVersion.files[fileName]
    let content = fs.readFileSync(fileName, "utf-8")

    let newContent = versionPattern.applyPattern(content)
    console.log(newContent)    
  })
})

process.exit(0);

