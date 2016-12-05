import { ITrackedVersion, IPattern } from "./interfaces"
import { RegExPattern } from "./matchers/RegExPattern"
import { StringPattern } from "./matchers/StringPattern"

export function matcherBuilder(trackedVersion: ITrackedVersion, fileItem: string) : IPattern {
  if (fileItem.includes("##VERSION##")) {
    return new StringPattern(trackedVersion, fileItem)
  }

  return new RegExPattern(trackedVersion, fileItem)
}
