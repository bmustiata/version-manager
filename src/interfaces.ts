/**
 * A bunch of versions to be processed.
 */
export interface ITrackedVersionSet extends Array<ITrackedVersion> {
}


/**
 * A single tracked version, and its attached value.
 */
export interface ITrackedVersion {
  name: string
  version: string
  files: { [ name: string ] : IPattern }
}

/**
 * A pattern matches one or more entries in a file in
 * order to do version updates.
 */
export interface IPattern {
  applyPattern(input: string) : string
  getMatchCount() : number
}
