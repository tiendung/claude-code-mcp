# Preferences

> Learn how to customize Chat, Composer, Terminal, and Editor features in Cursor's settings menu

You can set preferences for certain features from Cursor Settings

<Note>
  Preferences are stored locally and are not synchronized across different machines
</Note>

## Chat & Composer

### Agent Stickiness

If enabled, your selection between normal and Agent mode will persist across new Composer conversations.

<Frame>
  <img
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/base/background.jpeg"
    style={{
    aspectRatio: "4/3",
    width: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  }}
  />

  <video
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/cursor-settings/features/chat/agent-stickiness.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{
    borderRadius: "5px",
    position: "absolute",
    top: "17.5%",
    width: "90%",
  }}
  />
</Frame>

<br />

### Auto-Scroll to Bottom

Automatically scrolls to the bottom of the Composer pane when a new message is generated.

<Frame>
  <img
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/base/background.jpeg"
    style={{
    aspectRatio: "4/3",
    width: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  }}
  />

  <video
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/cursor-settings/features/chat/auto-scroll.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{
    borderRadius: "5px",
    position: "absolute",
    top: "17.5%",
    width: "90%",
  }}
  />
</Frame>

<br />

#### Auto-Apply to Files Outside Context

Allows Composer to automatically apply changes to files outside your current context.

<Frame>
  <img
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/base/background.jpeg"
    style={{
    aspectRatio: "4/3",
    width: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  }}
  />

  <video
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/cursor-settings/features/chat/out-of-context.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{
    borderRadius: "5px",
    position: "absolute",
    top: "17.5%",
    width: "90%",
  }}
  />
</Frame>

<br />

#### Collapse Input Box Pills in Pane or Editor

Collapses pills in the Composer pane or the editor input box to save space.

<Frame>
  <img
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/base/background.jpeg"
    style={{
    aspectRatio: "4/3",
    width: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  }}
  />

  <video
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/cursor-settings/features/chat/collapse-pills.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{
    borderRadius: "5px",
    position: "absolute",
    top: "17.5%",
    width: "90%",
  }}
  />
</Frame>

<br />

#### Render Pills Instead of Blocks

Collapses Composer code blocks into pills instead of rendering them as code blocks.

<Frame>
  <img
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/base/background.jpeg"
    style={{
    aspectRatio: "4/3",
    width: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  }}
  />

  <video
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/cursor-settings/features/chat/render-pills.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{
    borderRadius: "5px",
    position: "absolute",
    top: "17.5%",
    width: "90%",
  }}
  />
</Frame>

<br />

#### Iterate on Lints

If there are linter errors, Composer will try to fix them iteratively.

<Frame>
  <img
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/base/background.jpeg"
    style={{
    aspectRatio: "4/3",
    width: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  }}
  />

  <video
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/cursor-settings/features/chat/iterate-on-lints.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{
    borderRadius: "5px",
    position: "absolute",
    top: "17.5%",
    width: "90%",
  }}
  />
</Frame>

<br />

### Codebase Indexing

#### Index New Files by Default

When enabled, new files will be indexed automatically by default. If disabled, you can still index your folders by pressing the "Compute Index" button.

Indexes are auto-generated only for folders with fewer than 10,000 files.

#### Git Graph Relationships

When enabled, Cursor will index your git history to understand relationships between files.

Code and commit messages are stored locally, while metadata about commits (SHA’s, number of changes, and obfuscated filenames) is stored in the cloud.

### Editor

#### Chat/Edit Tooltip

If enabled, shows a chat/edit tooltip near highlighted code in your editor.

<Frame>
  <img
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/base/background.jpeg"
    style={{
    aspectRatio: "4/3",
    width: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  }}
  />

  <video
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/cursor-settings/features/editor/show-chat-edit-tooltip.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{
    borderRadius: "5px",
    position: "absolute",
    top: "17.5%",
    width: "90%",
  }}
  />
</Frame>

<br />

#### Auto Parse Links

If enabled, Cursor automatically parses links and adds them to the context.

<Frame>
  <img
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/base/background.jpeg"
    style={{
    aspectRatio: "4/3",
    width: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  }}
  />

  <video
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/cursor-settings/features/editor/editor-links.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{
    borderRadius: "5px",
    position: "absolute",
    top: "17.5%",
    width: "90%",
  }}
  />
</Frame>

<br />

#### Auto-Select for `Ctrl/Cmd + K`

If enabled, Cursor automatically selects regions for inline code editing.

<Frame>
  <img
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/base/background.jpeg"
    style={{
    aspectRatio: "4/3",
    width: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  }}
  />

  <video
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/cursor-settings/features/editor/auto-select-inline.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{
    borderRadius: "5px",
    position: "absolute",
    top: "17.5%",
    width: "90%",
  }}
  />
</Frame>

<br />

#### Themed Diffs

If enabled, Cursor uses themed background colors for inline diffs in your editor.

<Frame>
  <img
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/base/background.jpeg"
    style={{
    aspectRatio: "4/3",
    width: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  }}
  />

  <video
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/cursor-settings/features/editor/themed-diff.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{
    borderRadius: "5px",
    position: "absolute",
    top: "17.5%",
    width: "90%",
  }}
  />
</Frame>

### Terminal

#### Show Terminal Hover Hint

If enabled, shows a hover hint in the terminal with the command to 'Add to Chat' or 'Debug with AI'.

<Frame>
  <img
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/base/background.jpeg"
    style={{
    aspectRatio: "4/3",
    width: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  }}
  />

  <video
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/cursor-settings/features/terminal/terminal-debug.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{
    borderRadius: "5px",
    position: "absolute",
    top: "17.5%",
    width: "90%",
  }}
  />
</Frame>

<br />

#### Use Preview Box

If enabled, Cursor uses a preview box in the terminal to show the output of `Ctrl/Cmd + K`. If disabled, responses stream directly into the terminal.

<Frame>
  <img
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/base/background.jpeg"
    style={{
    aspectRatio: "4/3",
    width: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  }}
  />

  <video
    src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/cursor-settings/features/terminal/terminal-cmd-k.mp4"
    autoPlay
    loop
    muted
    playsInline
    style={{
    borderRadius: "5px",
    position: "absolute",
    top: "17.5%",
    width: "90%",
  }}
  />
</Frame>
