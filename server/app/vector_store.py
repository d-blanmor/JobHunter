# server/vector_store.py
import chromadb
from typing import Any, Dict, List

from pydantic import BaseModel

from app.config import ollama_vector_store, ollama_embedding_model

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover - dependency is optional until used
    SentenceTransformer = None


class Chunk(BaseModel):
    text: str
    metadata: Dict[str, Any] = {}


class VectorStoreService:
    def __init__(self, persist_directory: str = ollama_vector_store(), embedding_model_name: str = ollama_embedding_model()):
        if SentenceTransformer is None:
            raise RuntimeError("sentence-transformers is not installed. Run: pip install sentence-transformers")

        self.client = chromadb.PersistentClient(path=persist_directory)
        self.collection_name = "job_profiles"
        self.embedding_model_name = embedding_model_name
        self._embedder = SentenceTransformer(self.embedding_model_name)

        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def _embed_texts(self, texts: List[str]) -> List[List[float]]:
        embs = self._embedder.encode(texts, convert_to_numpy=True)
        return embs.tolist()

    def add_documents(self, chunks: List[Chunk]):
        """Add or replace document chunks in the vector store."""
        if not chunks:
            return

        ids = []
        documents = []
        metadatas = []
        for c in chunks:
            ids.append(c.metadata.get("id", "doc"))
            documents.append(c.text)
            metadatas.append(c.metadata)

        embeddings = self._embed_texts(documents)
        self.collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
            embeddings=embeddings,
        )

    def search_relevant_chunks(self, query: str, top_k: int = 5) -> List[Chunk]:
        """Return the top matching chunks for the query."""
        if not query or query.strip() == "":
            return []

        q_emb = self._embed_texts([query])[0]
        results = self.collection.query(
            query_embeddings=[q_emb],
            n_results=top_k,
            include=["documents", "metadatas", "ids", "distances"],
        )

        ids_list = results.get("ids", [[]])[0]
        docs_list = results.get("documents", [[]])[0]
        metas_list = results.get("metadatas", [[]])[0]

        found: List[Chunk] = []
        for i in range(len(ids_list)):
            doc = docs_list[i] if i < len(docs_list) else ""
            meta = metas_list[i] if i < len(metas_list) else {}
            found.append(Chunk(text=doc, metadata=meta))
        return found


class VectorService:
    """Backward-compatible wrapper used elsewhere in the codebase."""
    def __init__(self, persist_directory: str = ollama_vector_store(), embedding_model_name: str = ollama_embedding_model()):
        self._svc = VectorStoreService(persist_directory=persist_directory, embedding_model_name=embedding_model_name)

    def add_job_embedding(self, job_id: str, text: str):
        chunk = Chunk(text=text, metadata={"id": job_id})
        self._svc.add_documents([chunk])

    def search_jobs(self, query: str, top_k: int = 5) -> List[Dict]:
        chunks = self._svc.search_relevant_chunks(query, top_k=top_k)
        return [
            {"job_id": c.metadata.get("id"), "matched_text": c.text}
            for c in chunks
        ]
