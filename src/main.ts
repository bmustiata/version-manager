import * as fs from "fs"
import * as glob from "glob"
import * as colors from "colors"

import { readSettingsFile } from './SettingsReader'

const versionsToProcess = readSettingsFile();

versionsToProcess.forEach((trackedVersion) => {
  Object.keys(trackedVersion.files).forEach((fileName) => {
    let versionPattern = trackedVersion.files[fileName]
    let resolvedNames = glob.sync(fileName)

    if (!resolvedNames || !resolvedNames.length) {
      console.error(colors.red(`Unable to find any files for glob ${fileName}.`))
      process.exit(2)
    }

    resolvedNames.forEach((resolvedName) => {
      console.log(`${colors.cyan(fileName)}: Patching ${colors.cyan(resolvedName)} ` + 
            `for ${colors.green(trackedVersion.name + '@' + trackedVersion.version)}`)

      let content = fs.readFileSync(fileName, "utf-8")
      let newContent = versionPattern.applyPattern(content)
    
      if (versionPattern.getMatchCount() != 1) {
        console.error(colors.red("Matches != 1."))
        process.exit(3)
      }

      fs.writeFileSync(resolvedName, newContent, "utf-8")
    })
  })
})

process.exit(0);

