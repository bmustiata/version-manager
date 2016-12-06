import * as child_process from "child_process"

/**
 * Parse the given version string.
 */
export function parseVersion(version: string) : string {
    // if we don't need to execute anything, just go
    // and return the current version.
    if (! version.includes('`') && ! version.includes("$")) {
        return version
    }

    return child_process.execSync(`echo -n "${version}"`, {encoding: "utf8"})
}
