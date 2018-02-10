

export function getParameterValues(valuesList: Array<String>) : { [name: string] : string} {
    const result = {}

    if (!valuesList) {
        return result;
    }

    valuesList.forEach(value => {
        const tokens = value.split("=", 2)
        result[tokens[0]] = tokens[1]
    })

    return result
}
