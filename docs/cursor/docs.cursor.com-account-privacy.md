# Privacy

> A guide to Cursor's privacy settings, data handling, and code indexing with Privacy Mode option

For a comphrehensive privacy overview, read our [privacy page](https://www.cursor.com/privacy)

## FAQ

### What is Privacy Mode?

With `Privacy Mode` enabled, none of your code will ever be stored by us or any third-party. Otherwise, we may collect prompts, code snippets and telemetry data to improve Cursor. You can [read more about Privacy Mode here](https://cursor.com/privacy). Privacy mode is enforced for Business plans

You can enable `Privacy Mode` at onboarding or under `Cursor Settings` > `General` > `Privacy Mode`.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/get-started/privacy-mode.png" alt="Privacy Mode" />
</Frame>

### Are requests always routed through the Cursor backend?

Yes! Even if you use your API key, your requests will still go through our backend. That's where we do our final prompt building.

### Does indexing the codebase require storing code?

It does not! If you choose to index your codebase, Cursor will upload your codebase in small chunks to our server to compute embeddings, but all plaintext code ceases to exist after the life of the request.

The embeddings and metadata about your codebase (hashes, obfuscated file names) are stored in our database, but none of your code is.

You can read more about this on our [security page](https://cursor.com/security).
