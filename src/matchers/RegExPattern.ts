import { ITrackedVersion, IPattern } from "../interfaces"

export class RegExPattern implements IPattern {
  private RE: RegExp
  private matchCount : number = 0

  constructor(public trackedVersion: ITrackedVersion,
              private expression: string) {
    this.RE = new RegExp(expression, "gm")
  }

  applyPattern(input: string) : string {
    let match : RegExpExecArray
    let foundMatches: Array<RegExpExecArray> = []

    while (match = this.RE.exec(input)) {
      this.matchCount++
      this.RE.lastIndex = match.index + match[0].length

      foundMatches.push(match)
    }

    // this tracks the original input, since the matches are done
    // aginst the unmodified string.
    let originalIndex = 0
    let originalInput = input

    let result = ""

    foundMatches.forEach((match) => {
      result += originalInput.substring(originalIndex, match.index) +
                match[1] +
                this.trackedVersion.version +
               (match[3] ? match[3] : "");
      originalIndex = match.index + match[0].length
    })

    result += originalInput.substring(originalIndex, originalInput.length)

    return result
  }

  getMatchCount() : number {
    return this.matchCount
  }

  getExpectedCount() : number {
    return 1
  }
}
