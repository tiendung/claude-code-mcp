# @Docs

> Learn how to use, add, and manage custom documentation as context in Cursor using @Docs

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/context/@docs.png" />
</Frame>

Cursor comes with a set of third party docs crawled, indexed, and ready to be used as context. You can access them by using the `@Docs` symbol. You can find a list of our default pre-scraped docs [here](https://raw.githubusercontent.com/getcursor/crawler/main/docs.jsonl).

## Add Custom Docs

If you want to crawl and index custom docs that are not already provided, you can do so by `@Docs` > `Add new doc`.
The following modal will appear after you've pasted in the URL of your desired doc:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/context/@docs-add.png" />
</Frame>

Cursor will then index and learn the doc, and you will be able to use it as context like any other doc. Make sure to add a trailing slash to the URL if you want to index all subpages and subdirectories

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/context/@docs-learning.png" />
</Frame>

## Manage Custom Docs

Under `Cursor Settings` > `Features` > `Docs`, you will see the docs you have added.
You can edit, delete, or add new docs here.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/context/@docs-manage.png" />
</Frame>
