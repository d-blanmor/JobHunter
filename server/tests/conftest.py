import sys
from pathlib import Path

# Ensure the server package root is on sys.path when pytest collects tests.
ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))
