# Custom API Keys

> Learn how to use your own API keys in Cursor for OpenAI, Anthropic, Google, and Azure LLM providers

Cursor lets you input your own API keys for various LLM providers to send as many AI messages as you want at your own cost. When a Customer API key is used, we will use that when calling the LLM providers.

To use your own API key, go to `Cursor Settings` > `Models` and enter your API keys. Then, click on the "Verify" button. Once your key is validated, your API key will be enabled.

<Warning>
  Some Cursor features like Tab Completion
  require specialized models and won't work with custom API keys. Custom API
  keys only work for features that use standard models from providers like
  OpenAI, Anthropic, and Google.
</Warning>

## OpenAI API Keys

You can get your own API key from the [OpenAI platform](https://platform.openai.com/account/api-keys).

<Warning>
  OpenAI's reasoning models (o1, o1-mini, o3-mini) require special configuration and are not currently supported with custom API keys.
</Warning>

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/misc/openai-api.png" />
</Frame>

## Anthropic API Keys

Similar to OpenAI, you can also set your own Anthropic API key so that you will be using claude-based models at your own cost.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/misc/anthropic-api.png" />
</Frame>

## Google API Keys

For Google API keys, you can set your own API key so that you will be using Google models such as `gemini-1.5-flash-500k` at your own cost.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/misc/google-api.png" />
</Frame>

## Azure Integration

Finally, you can also set your own Azure API key so that you will be using Azure OpenAI models at your own cost.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/misc/azure-api.png" />
</Frame>

## FAQ

### Will my API key be stored or leave my device?

Your API key will not be stored, but it will be sent up to our server with every request. All requests are routed through our backend where we do the final prompt building.

### What custom LLM providers are supported?

Cursor only supports API providers that are compatible with the OpenAI API format (like OpenRouter). We do not provide support for custom local LLM setups or other API formats. If you're having issues with a custom API setup that isn't from our supported providers, we unfortunately cannot provide technical support.
