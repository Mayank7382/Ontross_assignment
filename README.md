# EzeeChatBot API

A production-ready Retrieval-Augmented Generation (RAG) chatbot backend. Upload any document — plain text or a URL — and instantly get a grounded chatbot that answers questions exclusively from that content.

---

## Quick Start

### 1. Prerequisites

- Python 3.11+
- An Anthropic API key (optional — the system runs in demo mode without one)
- Optionally, an OpenAI API key for neural embeddings (falls back to TF-IDF without one)

### 2. Install

```bash
git clone https://github.com/your-org/ezeechatbot
cd ezeechatbot
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure

```bash
cp .env.example .env
# Edit .env and add your keys
```

`.env.example`:
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...          # optional, for neural embeddings
```

### 4. Run

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Reference

### `POST /upload/text`

Index plain text or Markdown content.

```bash
curl -X POST http://localhost:8000/upload/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Acme Corp was founded in 1998 by Jane Doe...",
    "source_name": "acme_overview"
  }'
```

**Response:**
```json
{
  "bot_id": "bot_a3f9c12d84",
  "source": "acme_overview",
  "chunks_indexed": 12,
  "message": "Knowledge base ready. Use bot_id 'bot_a3f9c12d84' to start chatting."
}
```

---

### `POST /upload/url`

Fetch a URL, extract readable text, and index it.

```bash
curl -X POST http://localhost:8000/upload/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://en.wikipedia.org/wiki/Retrieval-augmented_generation"}'
```

---

### `POST /chat`

Ask a question grounded in the uploaded knowledge base.

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "bot_id": "bot_a3f9c12d84",
    "user_message": "When was Acme Corp founded?",
    "conversation_history": []
  }'
```

**Response:**
```json
{
  "bot_id": "bot_a3f9c12d84",
  "response": "Acme Corp was founded in 1998 by Jane Doe.",
  "grounded": true,
  "sources_used": 3,
  "latency_ms": 843.2
}
```

**Out-of-scope question (hallucination guard):**
```json
{
  "response": "I'm sorry, I couldn't find that information in the provided document.",
  "grounded": false,
  "sources_used": 0
}
```

---

### `POST /chat/stream`

Same as `/chat` but returns a Server-Sent Events stream for real-time display.

```javascript
const response = await fetch('http://localhost:8000/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ bot_id, user_message, conversation_history })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'meta') {
          console.log('Meta:', parsed); // latency, cost, grounded flag
        }
      } catch {
        process.stdout.write(data); // plain text delta
      }
    }
  }
}
```

---

### `GET /stats/{bot_id}`

Operational metrics for a bot.

```bash
curl http://localhost:8000/stats/bot_a3f9c12d84
```

**Response:**
```json
{
  "bot_id": "bot_a3f9c12d84",
  "total_messages": 47,
  "avg_latency_ms": 912.4,
  "estimated_cost_usd": 0.00284,
  "unanswered_questions": 3,
  "chunks_in_store": 18,
  "created_at": "2025-01-15T10:32:00Z"
}
```

---

## Architecture

```
POST /upload/text or /upload/url
        │
        ▼
  [fetcher.py]          (URL → clean text)
        │
        ▼
  [chunker.py]          (text → semantic chunks)
        │
        ▼
  [vector_store.py]     (chunks → embeddings → stored by bot_id)
        │
        └──→ returns bot_id

POST /chat
        │
        ▼
  [vector_store.py]     (query → cosine similarity → top-k chunks)
        │
        ▼
  [llm.py]              (chunks + history → grounded system prompt → LLM)
        │
        ▼
  [stats.py]            (record latency, tokens, unanswered flag)
        │
        ▼
  ChatResponse / SSE stream
```

### Multi-bot isolation

Each `POST /upload` creates a new `bot_id` backed by its own `BotStore` (independent chunk list + embedding matrix). Retrieval is always scoped to a single `bot_id` — there is no shared index and no cross-contamination between clients.

---

## Chunking Strategy — Rationale

### The problem with naive splitting

Splitting on every N characters is simple to implement but produces low-quality embeddings because:

1. **Broken sentences** — a chunk can begin mid-sentence, so the embedding represents a fragment without grammatical or semantic context.
2. **Broken concepts** — an argument or explanation that spans two sentences gets silently truncated at the chunk boundary, making the full answer unretrievable.
3. **No overlap** — a question whose answer straddles two chunks returns neither.

### Our approach: sliding-window sentence chunking

```
sentences = split_on_sentence_boundaries(text)
chunks    = sliding_window(sentences, size=5, overlap=1)
```

**Step 1 — Sentence boundary detection**  
We split on punctuation (`.`, `!`, `?`) followed by a capital letter, with special handling for paragraph breaks (`\n\n`) as natural topic boundaries. This avoids splitting after common abbreviations (`Mr.`, `U.S.A.`).

**Step 2 — Sliding window with overlap**  
We advance the window by `chunk_size − overlap` sentences at a time. The overlapping sentence ensures that answers spanning two adjacent chunks are retrievable from at least one of them.

**Step 3 — Metadata preservation**  
Each chunk stores its source name, original character offsets, and sentence window indices. This enables future citation, provenance tracking, and chunk-level debugging without re-parsing the original document.

**Why 5 sentences / 1 sentence overlap?**  
5 sentences is roughly 100–150 words — long enough to carry a complete thought, short enough that the embedding is focused rather than a diffuse average of unrelated facts. 1-sentence overlap is minimal but sufficient for the retrieval patterns we see in Q&A tasks.

**Trade-offs accepted:**  
This approach is ~3× more expensive to index than character splits (more chunks, more embedding calls) but produces meaningfully better retrieval precision. For production at scale, sentence chunking + neural embeddings is the industry standard for a reason.

---

## Hallucination Handling

The system prompt explicitly instructs the model:

> "If the answer is not in the `<context>`, respond with exactly: 'I'm sorry, I couldn't find that information in the provided document.' Do not fabricate facts."

We then check the response for this sentinel prefix programmatically (`is_unanswered()`). This approach has two advantages over post-hoc classification:

1. **No extra LLM call** — the detection is free (a string prefix check).
2. **Reliable signal** — the model is instructed to produce a canonical phrase, not a free-form expression of uncertainty, so we don't miss paraphrased refusals.

Unanswered questions are counted separately in `/stats` so product teams can identify knowledge-base gaps over time.

---

## Running Tests

```bash
pytest tests/ -v
```

Tests cover:
- Sentence splitter correctness (abbreviations, paragraphs)
- Chunk overlap and metadata integrity
- Hallucination sentinel detection
- Stats isolation between bots

---

## Project Structure

```
ezeechatbot/
├── app/
│   ├── main.py                  # FastAPI app, CORS, lifespan
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response models
│   ├── routers/
│   │   ├── upload.py            # POST /upload/text, POST /upload/url
│   │   ├── chat.py              # POST /chat, POST /chat/stream
│   │   └── stats.py             # GET /stats/{bot_id}
│   ├── services/
│   │   ├── chunker.py           # Semantic chunking logic
│   │   ├── vector_store.py      # In-memory embeddings + cosine retrieval
│   │   ├── llm.py               # Prompt building, streaming, cost estimation
│   │   └── stats.py             # Per-bot metrics tracking
│   └── utils/
│       └── fetcher.py           # URL fetching + HTML text extraction
├── tests/
│   └── test_core.py             # Unit tests for all core services
├── requirements.txt
└── README.md
```

---

## What I Would Do Differently With More Time

**1. Persistent storage**  
The current implementation is entirely in-memory — all bots and their embeddings are lost on restart. The natural next step is:
- Embeddings → [Qdrant](https://qdrant.tech/) or [Chroma](https://www.trychroma.com/) (both have excellent local-first modes)
- Stats → PostgreSQL or Redis with TTL
- The `VectorStore` interface is already designed to be swappable: `add_chunks()` and `retrieve()` are the only two methods a persistent backend needs to implement.

**2. Smarter chunking for structured documents**  
PDFs and HTML pages often have natural structure (headings, sections, tables) that our sentence splitter ignores. With more time I'd add a document-type-aware pre-pass:
- Markdown → split on `##` headings
- HTML → extract `<article>`, `<section>`, `<h1–h6>` boundaries before sentence-splitting
- PDF → use `pdfminer` to detect column layout and reading order

**3. Re-ranking**  
After cosine retrieval, a cross-encoder re-ranker (e.g. `cross-encoder/ms-marco-MiniLM-L-6-v2`) scores each chunk against the query more accurately than embedding similarity. This step is cheap (local model, no API call) and measurably improves retrieval precision. It would slot in as a post-processing step in `vector_store.retrieve()`.

**4. Authentication & rate limiting**  
Each `bot_id` is currently a public resource. In production, `bot_id` creation should require an API key, and `/chat` should be rate-limited per-key to prevent abuse and runaway LLM costs.

---

## Cost Reference

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|---|---|---|
| claude-opus-4 | $15.00 | $75.00 |
| text-embedding-3-small | $0.02 | — |

A typical Q&A exchange (5 chunks × 100 words context + 50-word answer) costs approximately **$0.0003** per message at claude-opus-4 pricing.
