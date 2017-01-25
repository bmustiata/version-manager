import { IPattern, ITrackedVersion } from "../interfaces"
import { RegExPattern } from "./RegExPattern"
import escapeStringRegexp = require("escape-string-regexp")

export class StringPattern implements IPattern {
  private _regexPattern : RegExPattern

  public static RE = /^(.*?)(\^\^|##|\*\*)VERSION(##|\*\*|\$\$)(.*?)$/;

  constructor(public trackedVersion: ITrackedVersion,
              private expression: string) {
    const m = StringPattern.RE.exec(expression)

    if (m[2] == '##' || m[3] == '##') {
      console.warn(`Version matched using expression '${expression}' ` +
              `still uses the old '##' notation for delimiting the `  +
              `version. This is not supported anymore since # denotes ` +
              `a comment in YAML. Use '**' instead.`)
    }

    const regexpValue = `${m[2] == '^^' ? '^()' : `(${escapeStringRegexp(m[1])})`}` +
                        `(.*?)` + 
                        `${m[3] == '$$' ? '$' : `(${escapeStringRegexp(m[4])})`}`;

    this._regexPattern = new RegExPattern(trackedVersion, regexpValue)
  }

  applyPattern(input: string) : string {
    return this._regexPattern.applyPattern(input)
  }

  getMatchCount() : number {
    return this._regexPattern.getMatchCount()
  }

  getExpectedCount() : number {
    return 1
  }
}
