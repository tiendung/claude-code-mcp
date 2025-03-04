# Models

> Switch between AI models in Cursor using Chat, Composer, Tab, or Agent with different pricing tiers

With Composer, ⌘ K, and Terminal Ctrl/⌘ K, you can easily switch between different models of your choice.

## Available models

<Note>
  Premium models count against your monthly request quota based on your
  subscription plan. Once you exceed your quota, additional requests can be
  purchased by enabling usage based pricing.
</Note>

Pro and Business plans get 500 requests/month included, and can be extended by enabling usage based pricing.

<div className="full-width-table">
  | Model                                                                                    | Provider  | Premium | Agent | Pricing | Note                                  |
  | :--------------------------------------------------------------------------------------- | :-------- | :-----: | :---: | :------ | :------------------------------------ |
  | [`claude-3.7-sonnet`](https://www.anthropic.com/claude/sonnet)                           | Anthropic |    ✓    |   ✓   | \$0.04  |                                       |
  | [`claude-3.7-sonnet-thinking`](https://www.anthropic.com/claude/sonnet)                  | Anthropic |    ✓    |   ✓   | \$0.04  |                                       |
  | [`claude-3.5-sonnet`](https://www.anthropic.com/claude/sonnet)                           | Anthropic |    ✓    |   ✓   | \$0.04  |                                       |
  | [`claude-3.5-haiku`](https://www.anthropic.com/claude/haiku)                             | Anthropic |    ✓    |       | \$0.01  | Counts as 1/3 fast request            |
  | [`claude-3-opus`](https://www.anthropic.com/news/claude-3-family)                        | Anthropic |    ✓    |       | \$0.10  | 10 requests/day included on paid plan |
  | `cursor-small`                                                                           | Cursor    |         |       | Free    |                                       |
  | [`deepseek-v3`](https://www.deepseek.com/)                                               | Fireworks |         |  Soon | Free    |                                       |
  | [`deepseek-r1`](https://www.deepseek.com/)                                               | Fireworks |    ✓    |  Soon | \$0.04  |                                       |
  | [`gpt-4o`](https://openai.com/index/hello-gpt-4o/)                                       | OpenAI    |    ✓    |   ✓   | \$0.04  |                                       |
  | [`gpt-4o-mini`](https://openai.com/gpt-4o-mini)                                          | OpenAI    |    ✓    |       |         | Free plan gets 500 requests/day       |
  | [`gpt-4.5-preview`](https://openai.com/index/introducing-gpt-4-5/)                       | OpenAI    |         |       | \$2.00  |                                       |
  | [`o1`](https://openai.com/index/learning-to-reason-with-llms/)                           | OpenAI    |         |       | \$0.40  |                                       |
  | [`o1-mini`](https://openai.com/index/openai-o1-mini-advancing-cost-efficient-reasoning/) | OpenAI    |         |       | \$0.10  | 10 requests/day included on paid plan |
  | [`o3-mini-high`](https://openai.com/index/openai-o3-mini/)                               | OpenAI    |    ✓    |   ✓   | \$0.01  | Counts as 1/3 fast request            |
  | [`grok-2`](https://x.ai/blog/grok-1212)                                                  | xAI       |    ✓    |       | \$0.04  |                                       |
</div>

You can add additional models under `Cursor Settings` > `Models`. All models are hosted on US-based infrastructure.

## Model dropdown

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/advanced/model-toggle.png" />
</Frame>

Underneath the AI input box, you will see a dropdown that allows you to select the model you want to use. The following models are available:

## Context windows

In Chat and Composer, we use a 40,000 token context window by default. For Cmd-K, we limit to around 10,000 tokens to balance TTFT and quality. Agent starts at 60,000 tokens and supports up to 120,000 tokens. For longer conversations, we automatically summarize the context to preserve token space. Note that these threshold are changed from time to time to optimize the experience.
