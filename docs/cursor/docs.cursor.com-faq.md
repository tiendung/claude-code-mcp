# FAQ

> Frequently asked questions about Cursor's features, language support, models, and usage

<AccordionGroup>
  <Accordion title="What programming languages does Cursor support?">
    While Cursor works with any programming language, it excels with Python and JavaScript/TypeScript due to extensive model training data. It also performs well with Swift, C, and Rust. You can enhance support for any language by adding relevant documentation to your project.
  </Accordion>

  <Accordion title="How do you keep the AI models up-to-date with latest documentation?">
    Cursor leverages powerful foundational models like Claude 3.5 and GPT-4. For the most current library information, you can use our [@web](/context/@-symbols/@-web) search feature. Since core language concepts rarely change dramatically, the models maintain their effectiveness over time.
  </Accordion>

  <Accordion title="What is the purpose of the MCP server?">
    The MCP server serves as a bridge for bringing external context into Cursor. It enables connections to services like Google Drive and Notion, helping you incorporate documentation and requirements from these sources into your workflow.
  </Accordion>

  <Accordion title="Are there size limitations for project indexing?">
    Projects are limited to 10,000 files by default, though this can be adjusted if needed. To optimize indexing performance, you can use `.cursorignore` to exclude unnecessary files from the indexing process.
  </Accordion>

  <Accordion title="How do I share context between multiple repositories?">
    Currently, the simplest method is to place related repositories in the same directory and launch Cursor from there. We're actively developing improved support for managing multiple project folders.
  </Accordion>

  <Accordion title="How do Cursor updates work?">
    Cursor is frequently updated with new features and improvements. You can find the latest changes and updates in our changelog at [cursor.com/changelog](https://cursor.com/changelog). We regularly release updates to enhance your experience and add new capabilities.
  </Accordion>

  <Accordion title="Why haven't I received the latest release yet?">
    We roll out new releases gradually over multiple days to ensure stability. If you haven't received an update yet, you can expect it to show up soon. You can also manually check for updates by opening the Command Palette (Cmd/Ctrl + Shift + P) and typing "Attempt Update".
  </Accordion>
</AccordionGroup>

<AccordionGroup>
  <Accordion title="How can I delete my data?">
    You can delete your account and all associated data by going to your [Dashboard](https://cursor.com/settings) and clicking the "Delete Account" button
  </Accordion>
</AccordionGroup>

**Additional resources**

* [Common Issues](/troubleshooting/common-issues) - Solutions to frequently encountered problems
* [Keyboard Shortcuts](/kbd) - Complete list of keybindings and shortcuts
