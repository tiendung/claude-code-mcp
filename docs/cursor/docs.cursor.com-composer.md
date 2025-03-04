# Composer

> Unified AI interface that combines Ask, Edit, and Agent modes to help write, edit, and understand code directly in your editor

Cursor's unified AI interface combines different capabilities in one seamless experience. Use `⌘I` to open it, and `⌘N` to create a new conversation. Switch between modes using the mode picker in the input box.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/composer/empty-composer-0.46.png" alt="Unified AI Interface" />
</Frame>

## Modes

The interface offers three modes that you can select from the mode picker:

<CardGroup cols={3}>
  <Card title="Ask" icon="comments">
    Ask questions about your code, get explanations, and discover your codebase. (⌘L)
  </Card>

  <Card title="Edit" icon="pen-to-square">
    Make single-turn edits to your code with precision and clarity.
  </Card>

  <Card title="Agent" icon="head-side-gear" href="/agent">
    Access tools and reasoning capabilities for complex tasks. Default mode. (⌘I)
  </Card>
</CardGroup>

You can switch between modes during a conversation using the mode picker or `⌘.` shortcut. This flexibility lets you adapt to your current needs - from asking questions to making changes to using advanced tools.

## Context

You can use [@-symbols](/context/@-symbols/basic) to include relevant context in your prompts. The interface will automatically suggest relevant context based on your query.

### Autocontext (Beta)

Cursor can automatically include relevant code in your conversations using embeddings and a custom model. Instead of manually selecting context with @-symbols, it analyzes your prompt and includes the most relevant code from your codebase. Enable this feature in Settings > Features > Autocontext.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/context/@-symbols-basics.png" alt="@ Symbol Context Menu" />
</Frame>

## Generating & Applying Changes

When code changes are suggested:

* Review them in the diff view
* Accept or reject changes with the buttons provided
* Use checkpoints to undo if needed

## Checkpoints

For every iteration a checkpoint is created. You can return to any previous version by clicking on `checkout` near that checkpoint. This is handy if you don't like the current changes and want to revert to an earlier state.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/composer/checkpoints.png" alt="Checkpoints" />
</Frame>

## History

Access previous conversations through the history. Open it from the history icon to the right of Cursor Tab. You'll see a list of past conversations which you can revisit, rename, or remove.

Open with `⌘+⌥+L` or `Ctrl+Alt+L` when the interface is focused.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/composer/history.png" alt="History Icon" />
</Frame>

## Layout

* **Pane**: A sidebar with the interface on the left and your code editor on the right.
* **Editor**: A single editor window, similar to viewing code normally. You can move it around, split it, or even place it in a separate window.
* **Floating**: A draggable window that you can position where you like

You can change this from the menu > Open as \[layout]

## Iterate on lints

The interface attempts to fix linting issues in generated code for most programming languages. If lint errors are detected, it will try to fix them automatically when this feature is enabled. Currently, only one iteration is supported.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/composer/iterate-on-lint.png" alt="Iterate on Lint Fix" />
</Frame>

<Note>
  Some languages (like Rust) require files to be saved before lint errors
  appear, which may limit this feature's effectiveness in all languages.
</Note>

## FAQ

### What's the difference between the modes?

**Ask mode** helps you understand and explore code. Use it to ask questions, get explanations, and learn about your codebase.

**Edit mode** focuses on making single-turn edits to your code. It provides a workspace where you can make precise changes to your files.

**Agent mode** (default) combines both capabilities with additional tools and reasoning abilities for handling complex tasks.

### How are long conversations handled?

For long conversations, Cursor summarizes earlier messages with smaller models like `cursor-small` and `gpt-4o-mini` to keep responses fast and relevant.

This approach helps ensure that even extended conversations remain responsive and coherent, without losing track of key details from earlier exchanges.

### Can I access my conversation history on another computer?

Conversation history is stored locally on your computer and is not stored on Cursor's servers or tied to your Cursor account.

This means if you switch to a different computer, you won't have access to your previous history. You can only access your history on the computer where it was originally created.
