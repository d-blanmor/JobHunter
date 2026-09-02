Summary of changes
- Implemented a local embedding + vector-store wrapper
  - File updated: d:\workbench\JobHunter\server\app\vector_store.py
  - Adds VectorStoreService (sentence-transformers + ChromaDB) and a small VectorService wrapper compatible with prior usage.
  - Methods:
    - add_documents(chunks: List[Chunk]) — compute embeddings locally and upsert into Chroma.
    - search_relevant_chunks(query: str, top_k: int) -> List[Chunk]
- Integrations changed to retrieve context from vector store
  - File updated: d:\workbench\JobHunter\server\app\integrations.py
  - Import added: from app.vector_store import VectorStoreService
  - Behavior: when addKnowledge is True, the code now:
    - queries the vector store with (request + payload) and retrieves the top-3 relevant chunks,
    - if there are results those chunks are concatenated into a short context and prepended to the user prompt,
    - if the vector store is empty or an error occurs, it falls back to the existing file-based knowledge (__getKnowledge).

Why this matches your requirements
- Only job spec and professional profile are needed as context: we index those items into Chroma and retrieve only the most relevant snippets at request time.
- This avoids sending the whole job/profile text into the LLM prompt and keeps token usage small.
- Everything runs locally (no external embedding API calls) for privacy and cost control.

What to install
Run on your server environment (Windows):
- pip install sentence-transformers chromadb
(If you use a specific Python runtime or venv, run install in that environment.)

Notes about runtime & ops
- SentenceTransformer default model: all-MiniLM-L6-v2 (lightweight and good for small corpora). Change the name when instantiating VectorStoreService(...) if you want a different model.
- ChromaDB persistence directory: defaults to ./chroma_db (relative to working dir). You can pass a different persist_directory when creating VectorStoreService.
- For small datasets (job specs + profiles), CPU-only inference is fine. For high throughput, consider batching or a GPU host.

How to index your job spec / profile (example)
- Create chunks (for small documents, one chunk per doc is fine). Example snippet:

from app.vector_store import VectorService
vs = VectorService(persist_directory="./chroma_db")  # matches the integration default
vs.add_job_embedding("job-123", "Senior Python engineer — responsibilities: ...")

- Or, using the lower-level service if you want more metadata and chunking:

from app.vector_store import VectorStoreService, Chunk
svc = VectorStoreService(persist_directory="./chroma_db")
chunks = [
    Chunk(text="Full job spec or chunk1 text", metadata={"id":"job-123","type":"job","source":"jobs_table"}),
    Chunk(text="Professional profile text", metadata={"id":"profile-456","type":"profile","owner":"user@example.com"}),
]
svc.add_documents(chunks)

Querying (internally done in generate flow)
- The integrations code now does something equivalent to:

svc = VectorStoreService()
chunks = svc.search_relevant_chunks(request + " " + payload, top_k=3)
context = "\n\n".join([c.text for c in chunks])
prompt = f"Relevant context:\n{context}\n\n{request}\n\n{payload}"

- This keeps the LLM prompt short while providing focused retrieval context.

Tuning & recommendations
- Chunking: if job descriptions are long, chunk them (200–500 tokens) and index each chunk with metadata linking to the job id. That gives better precision.
- top_k: start with 2–5. Lower the value if you still hit token limits.
- Precompute embeddings at create/update time for jobs and profiles, not on the fly.
- Persist directory: set an absolute path (Windows-style) if you want storage in a specific location (e.g., C:\data\chroma_db).
- Monitoring: watch memory/CPU during initial indexing; sentence-transformers uses CPU memory to compute embeddings.

Next steps I can take for you (pick one)
- Add a small endpoint (FastAPI) that indexes job specs/profiles on creation/update (recommended).
- Add a background/indexing job to precompute and populate the vector DB for existing entries.
- Tune prompt composition (summaries + retrieved chunks + system prompt) and implement chunking helper functions.
- Add a small README snippet describing how to install dependencies and how to index content.

- POST /v1/external/ollama/index-context
  - Generic body:
    {
      "text": "Full profile text or job description text",
      "entity_type": "profile",
      "entity_id": "profile-123",
      "label": "Candidate profile"
    }
- POST /v1/external/ollama/index-profile
  - Same as above, but forces entity_type = "profile"
- POST /v1/external/ollama/index-jobspec/{job_spec_id}
  - Builds the text from the job spec fields (Position, Company, Description, Analysis, Profile, Notes) and stores it in the vector DB

Flow
- Local sentence-transformers model generates vectors
- Chroma stores them persistently on disk
- Later retrieval uses only the most relevant chunks instead of sending the full job/profile into the Ollama prompt

Example
- Index a profile:
  POST /v1/external/ollama/index-profile
  {
    "text": "Senior Python engineer with ...",
    "entity_id": "profile-42",
    "label": "Dan profile"
  }

- Index a job spec:
  POST /v1/external/ollama/index-jobspec/12

Validation
- Pylance syntax checks reported no errors in the changed files.

One note
- The vector-store dependency is lazy-loaded, so the app does not crash during import if sentence-transformers is not installed yet. It will fail only when the actual indexing/retrieval call is used.

If you want, the next step is wiring this automatically whenever a JobSpec or profile is created/updated, so indexing happens without manual calls.