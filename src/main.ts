import * as fs from "fs"
import * as glob from "glob"
import * as colors from "colors"
import * as path from "path"
import * as nomnom from "nomnom"

import { readSettingsFile } from './SettingsReader'
import { getParameterValues } from './OptionsSet'
import { IPattern } from "./interfaces"

const argv = nomnom.option('version', {
  abbr: 'v',
  help: 'Display the version of a single tracked version.'
}).option('all', {
  abbr: 'a',
  flag: true,
  help: 'Display all the tracked versions and their values.'
}).option('set', {
  abbr: 's',
  list: true,
  help: 'Set values overriding what\'s in the yml files.'
}).parse();

const defaultSettingsFile = path.resolve(path.join(process.cwd(), "versions.json"))
const overrideParameters = getParameterValues(argv.set)
const versionsToProcess = readSettingsFile(defaultSettingsFile, overrideParameters);

if (argv.version) {
  let trackedVersion = versionsToProcess.find(it => it.name == argv.version)
  if (!trackedVersion) {
    console.error(`Tracked version '${argv.version}' does not exist. Available are: ${versionsToProcess.map(it => `'${it.name}'`).join(", ")}.`)
    process.exit(1)
  }

  console.log(trackedVersion.version);
  process.exit(0);
}

if (argv.all) {
  versionsToProcess.forEach(it => {
    console.log(`${it.name} => ${it.version}`)
  });

  process.exit(0);
}

const filesToProcess : { [name: string] : Array<IPattern> } = {}

let changedFiles: boolean = false

versionsToProcess.forEach((trackedVersion) => {
  Object.keys(trackedVersion.files).forEach((fileName) => {
    let versionPattern = trackedVersion.files[fileName]
    let resolvedNames = glob.sync(fileName)

    if (!resolvedNames || !resolvedNames.length) {
      console.error(colors.red(`Unable to find any files for glob ${fileName}.`))
      process.exit(2)
    }

    // first we collect all the files that we need to process
    // into one nice map, with all the patterns that are going
    // to run over those files.
    resolvedNames.forEach((resolvedName) => {
      let filePatterns = filesToProcess[resolvedName] || []
      filePatterns.push(versionPattern)
      filesToProcess[resolvedName] = filePatterns
    })
  })
})

Object.keys(filesToProcess).forEach((resolvedName) => {
  let content = fs.readFileSync(resolvedName, "utf-8")
  let newContent = content
    
  console.log(`Patching ${colors.cyan(resolvedName)}:`)

  filesToProcess[resolvedName].forEach((versionPattern) => {
    let trackedVersion = versionPattern.trackedVersion
    console.log(` * ${colors.green(trackedVersion.name + '@' + trackedVersion.version)}`)

    newContent = versionPattern.applyPattern(newContent)

    if (versionPattern.getMatchCount() != versionPattern.getExpectedCount()) {
      console.error(
        colors.red(
          `Got ${versionPattern.getMatchCount()} matches ` +
          `instead of ${versionPattern.getExpectedCount()}.`))
      process.exit(3)
    }
  })

  if (content == newContent) {
    console.log(colors.cyan(`Content for ${resolvedName} is not changed. Won't patch it.`))
    return;
  }

  changedFiles = true;

  fs.writeFileSync(resolvedName, newContent, "utf-8")
  console.log(colors.yellow(`Updated ${resolvedName}`))
})

process.exit(changedFiles? 200 : 0);
