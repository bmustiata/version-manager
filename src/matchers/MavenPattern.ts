import { IPattern, ITrackedVersion } from "../interfaces"
import { RegExPattern } from "./RegExPattern"
import escapeStringRegexp = require("escape-string-regexp")

export class MavenPattern implements IPattern {
  private _regexPattern : RegExPattern

  public static RE = /^maven\:(.*?)\:(.*?)$/;

  constructor(public trackedVersion: ITrackedVersion,
              private expression: string) {
    const m = MavenPattern.RE.exec(expression)

    const regexpValue = `(<groupId>${escapeStringRegexp(m[1])}</groupId>\\s*` +
                        `<artifactId>${escapeStringRegexp(m[2])}</artifactId>\\s*` + 
                        `<version>)(.*?)(</version>)`;

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