import { IPattern, ITrackedVersion } from "../interfaces"

export class MatchCounter implements IPattern {
    constructor(public trackedVersion: ITrackedVersion,
                private delegatePattern : IPattern,
                private expectedCount : number) {
    }

    applyPattern(input: string) : string {
        return this.delegatePattern.applyPattern(input)     
    }

    getMatchCount() : number {
        if (this.expectedCount < 0) {
            return this.expectedCount
        }

        return this.delegatePattern.getMatchCount()
    }

    getExpectedCount() : number {
        return this.expectedCount
    }
}