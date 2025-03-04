# Auto-import

> Auto-import feature in Tab helps add module imports automatically in TypeScript and Python projects

## Overview

In TypeScript and Python (beta) project, Tab can automatically import modules and functions from elsewhere in your project, without you having to manually type the import statement.

Just start using the method you want from an existing file, and Tab will automatically suggest the import statement for you. If you accept, the import statement will be added to your file without pulling you away from the code you are writing.

## Troubleshooting

If you are having issues with auto-import, please confirm you have the necessary extensions (e.g. a language server) for your project language, as this is required for auto-import to work.

You can confirm if this is working, by moving your cursor to a function or method that is not yet imported, and hit <kbd>⌘</kbd> + <kbd>.</kbd> or <kbd>Ctrl</kbd> + <kbd>.</kbd> to see if the import is suggested in the Quick Fix suggestions - if not, then the language server is not working.
