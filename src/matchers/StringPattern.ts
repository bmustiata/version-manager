import { IPattern, ITrackedVersion } from "../interfaces"
import { RegExPattern } from "./RegExPattern"
import escapeStringRegexp = require("escape-string-regexp")

export class StringPattern implements IPattern {
  private _regexPattern : RegExPattern

  public static RE = /^(.*?)(\^\^|##)VERSION(##|\$\$)(.*?)$/;

  constructor(public trackedVersion: ITrackedVersion,
              private expression: string) {
    const escapedExpression = escapeStringRegexp(expression);
    const m = StringPattern.RE.exec(expression)

    const regexpValue = `${m[2] == '^^' ? '^()' : `(${m[1]})`}` +
                        `(.*?)` + 
                        `${m[3] == '$$' ? '$' : `(${m[4]})`}`;

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
