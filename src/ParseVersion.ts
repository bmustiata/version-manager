import * as child_process from "child_process"
import * as path from "path"
import * as fs from "fs"
import { readSettingsFile } from "./SettingsReader"
import { ITrackedVersionSet } from "./interfaces"

// cache the settings files.
const settingFiles : {[name: string]: ITrackedVersionSet} = {}

function parseParentPath(version: string, cwd: string, overridenSettings: { [name: string] : string}) : string {
    const items = /^parent:(.+)@(.+?)$/.exec(version)

    if (!items) {
        throw new Error(`The version must be in the 'parent:path@propertyname' ` +
                        `format, got instead: '${version}'.`)
    }

    const parentVersionsFilePath = items[1]
    const propertyName = items[2]

    let fullPath = path.resolve(path.join(cwd, items[1]))

    if (!fs.existsSync(fullPath)) {
        throw new Error(`Unable to find referenced file: ${fullPath}`)
    }

    if (fs.statSync(fullPath).isDirectory()) {
        fullPath = path.join(fullPath, "versions.json")
    }

    if (!settingFiles[fullPath]) {
        settingFiles[fullPath] = readSettingsFile(fullPath, overridenSettings)
    }

    const propertyValue = settingFiles[fullPath]
                        .find(it => it.name == propertyName)

    if (!propertyValue) {
        const availableProperties = settingFiles[fullPath]
                .map(it => `${it.name}@${it.version}`)
                .join(", ");

        throw new Error(`Property '${propertyName}' is not defined in ${fullPath}`
            + ` settings file. Available properties are: ${availableProperties}.`)
    }

    return propertyValue.version
}

function parseVersionWithPath(version: string, cwd: string, overridenSettings: { [name: string] : string}) : string {
    // from here, the path becomes important, since the process execution
    // and the parent: referening depends on where the currently parsed
    // versions.json file is being parsed from.
    const oldPath = process.cwd()

    if (typeof version !== "string") {
        throw new Error(`Got version a ${version} of type ${typeof version}, in ${cwd}.`)
    }

    try {
        process.chdir(cwd)

        // check if this is not an external json file, in the
        // format: parent:../path/to/versions.json:property_name
        // or    : parent:../path/to:property_name
        if (version.startsWith('parent:')) {
            return parseParentPath(version, cwd, overridenSettings);
        }

        // if we don't need to execute anything, just go
        // and return the current version.
        if (version.indexOf('`') == -1 && version.indexOf("$") == -1) {
            return version
        }

        return child_process.execSync(`echo -n "${version}"`, {encoding: "utf8"})
    } finally {
        process.chdir(oldPath)
    }
}

/**
 * Parse the given version string.
 */
export function parseVersion(version: string, overridenSettings: { [name: string] : string}) : string {
    return parseVersionWithPath(version, process.cwd(), overridenSettings);
}
