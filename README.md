# version-manager 1.1.1

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
      "README.*": "^(germanium )(.*?)()$",
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

It is a RegExp that has three groups, and it will have the 
second group replaced to the matched version.

### ##VERSION## File Matcher

This will constrcut a RegExp from the given text, with the 
 ##VERSION## being the second group. No care is taken for
characters that are valid RegExp characters.

## Notes

The version will be expanded using the shell if it contains a '$' or a '`',
so you can have a version such as:

```json
"description": {
  "version": "Build at $(date) on $(uname -n)"
}
```

Files are actually `glob` patterns, so you can match `**/*.js` for example.
