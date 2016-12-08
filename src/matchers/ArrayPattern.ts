import { IPattern, ITrackedVersion } from "../interfaces"

export class ArrayPattern implements IPattern {
    constructor(public trackedVersion: ITrackedVersion,
                private delegatePatterns : Array<IPattern>) {
    }

    applyPattern(input: string) : string {
        return this.delegatePatterns
            .reduce((input, pattern) => pattern.applyPattern(input), input)
    }

    getMatchCount() : number {
        return this.delegatePatterns
            .map(it => it.getMatchCount())
            .reduce((x, y) => x + y, 0)
    }
    
    getExpectedCount() : number {
        return 1
    }
}