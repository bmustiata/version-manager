import { IPattern, ITrackedVersion } from "../interfaces"
import { RegExPattern } from "./RegExPattern"

export class StringPattern implements IPattern {
  private _regexPattern : RegExPattern

  constructor(public trackedVersion: ITrackedVersion,
              private expression: string) {
    let reTokens = expression.split("##VERSION##")

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
