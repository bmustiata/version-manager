import { ITrackedVersion, IPattern } from "./interfaces"
import { RegExPattern } from "./matchers/RegExPattern"

export function matcherBuilder(trackedVersion: ITrackedVersion, fileItem: any) : IPattern {
  return new RegExPattern(trackedVersion, fileItem);
}
