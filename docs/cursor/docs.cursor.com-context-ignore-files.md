# Ignore Files

> Learn how to use .cursorignore and .cursorindexingignore to control file access and indexing in Cursor

## Overview

Cursor provides two different ignore files to control how files are handled:

* `.cursorignore`: Makes a best-effort attempt to exclude files from both AI features and indexing
* `.cursorindexingignore`: Controls only which files are indexed for search and context (same as the old `.cursorignore`)

<Note>
  As of 0.46, `.cursorignore` attempts to exclude files from both AI access and indexing (similar to the previously unreleased `.cursorban`). For indexing-only control like the old `.cursorignore`, use `.cursorindexingignore`.
</Note>

## `.cursorignore`

The `.cursorignore` file makes a best-effort attempt to exclude files from both AI features and indexing. This is useful for:

* Attempting to exclude sensitive files from AI access and indexing
* Excluding configuration files with secrets
* Limiting access to proprietary code

Files listed in `.cursorignore` will be excluded from Cursor's AI features in a best-effort way:

* Not included in tab and chat requests
* Not included in context for AI features
* Not indexed for search or context features
* Not available through @-symbols or other context tools

## `.cursorindexingignore`

<Tip>
  `.cursorindexingignore` files automatically inherits all patterns from your `.gitignore` files
</Tip>

The `.cursorindexingignore` file only controls which files are indexed for search and context features. This provides the same indexing control as the old `.cursorignore`. Use this file when you want to:

* Exclude large generated files from indexing
* Skip indexing of binary files
* Control which parts of your codebase are searchable
* Optimize indexing performance

Important: Files in `.cursorindexingignore` can still be manually included as context or accessed by AI features - they just won't be automatically indexed or included in search results.

## File Format

Both files use the same syntax as `.gitignore`. Here are some examples:

### Basic Patterns

```sh
# Ignore all files in the `dist` directory
dist/

# Ignore all `.log` files
*.log

# Ignore specific file `config.json`
config.json
```

### Advanced Patterns

Include only `*.py` files in the `app` directory:

```sh
# ignore everything
*
# do not ignore app
!app/
# do not ignore directories inside app
!app/*/
!app/**/*/
# don't ignore python files
!*.py
```

## Files Ignored by Default

In addition to the files designated in your `.gitignore`, `.cursorignore` and `.cursorindexignore` files, Cursor also ignores the following by default:

```sh
package-lock.json
pnpm-lock.yaml
yarn.lock
composer.lock
Gemfile.lock
bun.lockb
.env*
.git/
.svn/
.hg/
*.lock
*.bak
*.tmp
*.bin
*.exe
*.dll
*.so
*.lockb
*.qwoff
*.isl
*.csv
*.pdf
*.doc
*.doc
*.xls
*.xlsx
*.ppt
*.pptx
*.odt
*.ods
*.odp
*.odg
*.odf
*.sxw
*.sxc
*.sxi
*.sxd
*.sdc
*.jpg
*.jpeg
*.png
*.gif
*.bmp
*.tif
*.mp3
*.wav
*.wma
*.ogg
*.flac
*.aac
*.mp4
*.mov
*.wmv
*.flv
*.avi
*.zip
*.tar
*.gz
*.7z
*.rar
*.tgz
*.dmg
*.iso
*.cue
*.mdf
*.mds
*.vcd
*.toast
*.img
*.apk
*.msi
*.cab
*.tar.gz
*.tar.xz
*.tar.bz2
*.tar.lzma
*.tar.Z
*.tar.sz
*.lzma
*.ttf
*.otf
*.pak
*.woff
*.woff2
*.eot
*.webp
*.vsix
*.rmeta
*.rlib
*.parquet
*.svg
.egg-info/
.venv/
node_modules/
__pycache__/
.next/
.nuxt/
.cache/
.sass-cache/
.gradle/
.DS_Store/
.ipynb_checkpoints/
.pytest_cache/
.mypy_cache/
.tox/
.git/
.hg/
.svn/
.bzr/
.lock-wscript/
.Python/
.jupyter/
.history/
.yarn/
.yarn-cache/
.eslintcache/
.parcel-cache/
.cache-loader/
.nyc_output/
.node_repl_history/
.pnp.js/
.pnp/
```

## Troubleshooting

The ignore file syntax follows `.gitignore` exactly. If you encounter issues:

1. Replace "cursorignore" with "gitignore" in your search queries
2. Check [Stack Overflow](https://stackoverflow.com/questions/tagged/gitignore) for similar patterns
3. Test patterns with `git check-ignore -v [file]` to understand matching

Common gotchas:

* Patterns are matched relative to the ignore file location
* Later patterns override earlier ones
* Directory patterns need a trailing slash
* Negation patterns (`!`) must negate a previous pattern
