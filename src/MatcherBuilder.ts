import { ITrackedVersion, IPattern } from "./interfaces"
import { RegExPattern } from "./matchers/RegExPattern"
import { StringPattern } from "./matchers/StringPattern"
import { MavenPattern } from "./matchers/MavenPattern"
import { MatchCounter } from "./matchers/MatchCounter"
import { ArrayPattern } from "./matchers/ArrayPattern"

export function matcherBuilder(trackedVersion: ITrackedVersion, fileItem: any) : IPattern {
  if (fileItem instanceof Array) {
    return new ArrayPattern(
      trackedVersion, 
      fileItem.map((it) => matcherBuilder(trackedVersion, it)))
  }

  if (typeof fileItem['count'] != "undefined") {
    return new MatchCounter(
      trackedVersion,
      matcherBuilder(
          trackedVersion,
          fileItem.match || fileItem.expression),
      fileItem.count
    );
  }

  if (MavenPattern.RE.test(fileItem)) {
    return new MavenPattern(trackedVersion, fileItem)
  }

  if (StringPattern.RE.test(fileItem)) {
    return new StringPattern(trackedVersion, fileItem)
  }

  return new RegExPattern(trackedVersion, fileItem)
}
