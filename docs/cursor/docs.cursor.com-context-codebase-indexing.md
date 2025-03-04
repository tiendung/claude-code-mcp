# Codebase Indexing

> Learn how to index your codebase in Cursor for more accurate AI assistance and search results

### Index your Codebase

For better and more accurate codebase answers, you can index your codebase. Behind the scenes, Cursor
computes embeddings for each file in your codebase, and will use these to improve the accuracy of your codebase answers.

Cursor maintains separate codebase indexes for each user. After you complete the initial indexing setup, Cursor will automatically index any new files added to your workspace to keep your personal codebase context current.

The status of your codebase indexing is under `Cursor Settings` > `Features` > `Codebase Indexing`.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/chat/codebase-indexing.png" />
</Frame>

### Advanced Settings

By default, Cursor will index all files in your codebase.

You can also expand the `Show Settings` section to access more advanced options.
Here, you can decide whether you want to enable automatic indexing for new repositories and configure the files
that Cursor will ignore during repository indexing.

Cursor uses the same package as VS Code to handle file ignoring, which means it respects all `.gitignore` files, including those in subdirectories. You can also create a `.cursorignore` file for user-specific ignore patterns, which you may want to add to your global `.gitignore` to avoid committing it to the repository.

If you have any large content files in your project that the AI definitely doesn't need to read, [ignoring those files](/context/ignore-files) could improve the accuracy of the answers.

### Working with large monorepos

When working with large monorepos containing hundreds of thousands of files, it's important to be strategic about what gets indexed.

* Use `.cursorignore` to let each developer configure which folders and paths they work on in the monorepo
* Add `.cursorignore` to your global `.gitignore`

This allows each developer to optimize indexing for their specific work areas within the monorepo.

## FAQ

### Where can I see all codebases I have indexed?

Currently, there is no way to see a list of all codebases you have indexed. You'll need to manually check each project's indexing status by opening the project in Cursor and checking the Codebase Indexing settings.

### How do I delete all codebases?

You can either delete your Cursor account from Settings to remove all indexed codebases, or manually delete individual codebases from the Codebase Indexing settings in each project. There's currently no way to delete all codebases at once without deleting your account.
