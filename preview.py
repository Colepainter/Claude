import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000
    },
    messages=[{
        "role": "user",
        "content": "What is the meaning of life?"
    }],
    betas=["interleaved-thinking-2025-05-14"]
)

for block in response.content:
    if block.type == "thinking":
        print(f"<thinking>\n{block.thinking}\n</thinking>")
    elif block.type == "text":
        print(block.text)
