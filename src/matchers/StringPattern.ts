import { IPattern, ITrackedVersion } from "../interfaces"
import { RegExPattern } from "./RegExPattern"
import escapeStringRegexp = require("escape-string-regexp")

export class StringPattern implements IPattern {
  private _regexPattern : RegExPattern

  constructor(public trackedVersion: ITrackedVersion,
              private expression: string) {
    let escapedExpression = escapeStringRegexp(expression);
    let reTokens = escapedExpression.split("##VERSION##")

    this._regexPattern = new RegExPattern(trackedVersion, `(${reTokens[0]})(.*?)(${reTokens[1]})`)
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
