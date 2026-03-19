import anthropic

client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-opus-4-6",
    max_tokens=16000,
    thinking={"type": "adaptive"},
    messages=[{
        "role": "user",
        "content": "What is the meaning of life?"
    }]
) as stream:
    for event in stream:
        if event.type == "content_block_start":
            if event.content_block.type == "thinking":
                print("<thinking>")
            elif event.content_block.type == "text":
                print()

        elif event.type == "content_block_delta":
            if event.delta.type == "thinking_delta":
                print(event.delta.thinking, end="", flush=True)
            elif event.delta.type == "text_delta":
                print(event.delta.text, end="", flush=True)

        elif event.type == "content_block_stop":
            if hasattr(stream, "_current_block_type") and stream._current_block_type == "thinking":
                print("\n</thinking>")
