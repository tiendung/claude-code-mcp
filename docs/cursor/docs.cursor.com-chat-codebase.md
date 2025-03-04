# With Codebase

> Learn how Chat searches codebases using default search, embeddings, and advanced @Codebase queries.

## Default Codebase Chat

If a codebase isn't [indexed](/context/codebase-indexing), Chat will first attempt to compute a few search queries to
be used to search across your codebase. For better accuracy, it's recommended to use [embeddings search](#embeddings-search).

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/chat/no-embeddings.png" />
</Frame>

## Embeddings Search

With [codebase indexing](/context/codebase-indexing), Chat can accurately generate responses based on your codebase.

By pressing `Ctrl/⌘ + Enter` after typing a message, Chat scans through your indexed codebase to find pieces of relevant code. This is generally
good for quickly including code snippets to be taken into the context of the conversation. For more control over the codebase search and better accuracy,
you can use `@codebase`.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/chat/embeddings.png" />
</Frame>

## Advanced Codebase Search

Cursor codebase chat goes through a more detailed search when `@Codebase` is used.

See more about `@Codebase` [here](/context/@-symbols/@-codebase).
