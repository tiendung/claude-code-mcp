# Model Context Protocol

> Learn how to add and use custom MCP tools with the Agent in Cursor's Composer feature

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) is an open protocol that allows you to provide custom tools to agentic LLMs in Cursor.

<Warning>
  MCP tools may not work with all models. MCP tools are only available to the
  Agent in Composer.
</Warning>

Cursor implements an MCP client, which supports an arbitrary number of MCP servers.
Cursor's MCP client supports the `stdio` and `sse` transports.

## Adding an MCP Server to Cursor

To add an MCP server to Cursor, go to `Cursor Settings` > `Features` > `MCP` and click on the `+ Add New MCP Server` button.

This will open a modal with a form to fill out. Select the transport under `Type`, and fill out a nickname for the server (`Name`) either the command to run or the URL of the server, depending on the transport.

For example, this is how you would configure the [MCP quickstart weather server](https://github.com/modelcontextprotocol/quickstart-resources/tree/main/weather-server-typescript), assuming it has already been built and placed at ` ~/mcp-quickstart/weather-server-typescript/build/index.js`. The entire command string in this case is `node ~/mcp-quickstart/weather-server-typescript/build/index.js`.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/advanced/mcp-add-stdio.png" />
</Frame>

And this is how you would configure the [MCP sample tool](https://github.com/modelcontextprotocol/python-sdk/tree/main/examples/servers/simple-tool), assuming it is running locally on port `8765`.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/advanced/mcp-add-sse.png" />
</Frame>

<Warning>
  For SSE servers, the URL should be the URL of the SSE endpoint, e.g. `http://example.com:8000/sse`.

  For stdio servers, the command should be a valid shell command that can be run from the terminal.
  If you require environment variables to be set, we recommend you write a small wrapper script that sets the environment variables and then runs the server.
</Warning>

After adding the server, it should appear in the list of MCP servers. You may have to manually press the refresh button in the top right corner of the MCP server in order to populate the tool list. Here is what the tool list would look like after loading a (modified version of) the weather and sample servers.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/advanced/mcp-connected.png" />
</Frame>

### Managing MCP servers

MCP servers can be edited or deleted from the MCP settings page.

### Project-specific MCP Configuration

You can configure project-specific MCP servers using `.cursor/mcp.json`. The file follows this format:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Desktop",
        "/Users/username/Downloads"
      ]
    }
  }
}
```

## Using MCP Tools in Agent

The Composer Agent will **automatically** use any MCP tools that are listed under `Available Tools` on the MCP settings page if it determines them to be relevant.
To prompt tool usage intentionally, simply tell the agent to use the tool, referring to it either by name or by description.

### Tool Approval

By default, when Agent wants to use an MCP tool, it will display a message asking for your approval:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/advanced/mcp-mars-request.png" />
</Frame>

The user can expand the message to see the tool call arguments.

#### Yolo Mode

You can enable Yolo mode to allow Agent to automatically run MCP tools without requiring approval, similar to how terminal commands are executed. Read more about Yolo mode and how to enable it [here](/agent#yolo-mode).

### Tool Response

When a tool is used Cursor will display the response in the chat.
This image shows the response from the sample tool, as well as expanded views of the tool call arguments and the tool call response.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/advanced/mcp-mars-response.png" />
</Frame>
