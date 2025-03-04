# AI Commit Message

> Learn how to generate Git commit messages automatically in Cursor using the sparkle icon or shortcuts

Cursor can help you generate meaningful commit messages for your changes with just a click. Here's how to use this feature:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/features/generate-commit-message.png" />
</Frame>

1. Stage the files you want to commit
2. Open the Git tab in the sidebar
3. Look for the sparkle (✨) icon next to the commit message input field
4. Click the sparkle icon to generate a commit message based on your staged changes

The generated commit message will be based on the changes in your staged files and your repository's git history. This means Cursor will analyze both your current changes and previous commit messages to generate a contextually appropriate message. Cursor learns from your commit history, which means if you use conventions like [Conventional Commits](https://www.conventionalcommits.org/), the generated messages will follow the same pattern.

## Shortcut

You can bind the generate commit message feature to a keyboard shortcut.

1. Go to Keyboard Shortcuts `⌘R ⌘S` or `⌘⇧P` and search for "Open Keyboard Shortcuts (JSON)"
2. Add the following to the file to bind to `⌘M`:
   ```json
   {
     "key": "cmd+m",
     "command": "cursor.generateGitCommitMessage"
   }
   ```
3. Save the file and you're done!

<Info>
  Currently, there isn't a way to customize or provide specific instructions for
  how commit messages should be generated. Cursor will automatically adapt to
  your existing commit message style.
</Info>
