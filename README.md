# version-manager 1.2.0

Updates versions across mulltiple files.

## Install

```sh
npm install -g version-manager
```


## Usage

You need a `versions.json`, where you can specify for what you're tracking the versions, and what files to be updated using glob patterns:

```json
{
  "germanium" : {
    "version": "1.10.3",
    "files": {
      "README.*": "^(germanium )(.*?)$",
      "setup.py": "version='##VERSION##',",
      "doc/usage/index.adoc": "^(= Germanium v)(.*?)()$",
      "germanium/version.py": "current = \"##VERSION##\""
    }
  }
}
```

## File Matchers

There are currently only two file matchers:

### RegExp File Matcher

It is a RegExp that has two or three groups, and it will have the 
second group replaced to the matched version.

### ##VERSION## File Matcher

This will constrcut a RegExp from the given text, with 
the ##VERSION## being the second group. No care is taken for
characters that are valid RegExp characters.

## Matcher Constraints

In order to make sure that the expressions are not replacing
in too many places, constraints can be added to limit, or extend
the matches.

Matcher constraints are always active, and in case no constraint
is specified then the maximum replacement count is set to 1. 

### Match Count

```json
"product" : {
  "version": "1.0",
  "files": {
    "README.md": {
      "match": "^(= Germanium v)(.*?)$",
      "count": 1
    }
  }
}
```

The count can be also `0` for no matches, or negative to indicate
any number of matches is allowed.

## Multiple Matchers

In a single file, we can have multiple matchers as well, for
example:

```json
"product" : {
  "version": "1.0",
  "files": {
    "README.md": [
      "^(= Germanium v)(.*?)$",
      "(Germanium )(\\d+\\.\\d+)()"
    ]
  }
}
```

Of course, constraints can be applied for both the full set of
matchers:

```json
"product" : {
  "version": "1.0",
  "files": {
    "README.md": {
      "match": [
        "^(= Germanium v)(.*?)$",
        "(Germanium )(\\d+\\.\\d+)()"
      ],
      "count": 3
    }
  }
}
```

or even individual expressions: 
 
```json
"product" : {
  "version": "1.0",
  "files": {
    "README.md": {
      "match": [
        "^(= Germanium v)(.*?)$",
        {
          "match": "(Germanium )(\\d+\\.\\d+)()",
          "count": 2
        }
      ],
      "count": 3
    }
  }
}
```

## Notes

1. The version will be expanded using the shell if it contains a '$' or a '`',
so you can have a version such as:

```json
"description": {
  "version": "Build at $(date) on $(uname -n)"
}
```

2. Files are actually `glob` patterns, so you can match `**/*.js` for example.
