# @Codebase

> Learn how Chat processes codebase queries using gathering, reranking, reasoning, and generation steps

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/chat/@codebase.png" />
</Frame>

Through `@Codebase`, Chat goes through these steps until it finds the most important pieces of code to use.

* Gathering: scanning through your codebase for important files / code chunks
* Reranking: reordering the context items based on relevancy to the query
* Reasoning: thinking through a plan of using the context
* Generating: coming up with a response

Another way of submitting an advanced codebase query is to click on the dropdown next to the `Ctrl/⌘ + Enter` button and select `reranker` for the search behavior.
This is only available when `@Codebase` isn't used, otherwise `@Codebase` takes precedence.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/chat/codebase-dropdown.png" />
</Frame>
