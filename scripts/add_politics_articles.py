"""Build the bilingual political research articles and register them across the site.

Reuses the page builder and registration steps from ``add_claude_articles.py``.
Re-running is idempotent.

    python scripts/add_politics_articles.py
    python scripts/build_catalog_static.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import add_claude_articles  # noqa: E402
from politics_articles_content import ARTICLES  # noqa: E402

NEW_TOOLS = {
    'pandas': {'name': 'pandas', 'asset': 'pandas.svg', 'aliases': ['pandas']},
    'numpy': {'name': 'NumPy', 'asset': 'numpy.svg', 'aliases': ['NumPy']},
    'scipy': {'name': 'SciPy', 'asset': 'scipy.svg', 'aliases': ['SciPy']},
    'scikit-learn': {'name': 'scikit-learn', 'asset': 'scikit-learn.svg', 'aliases': ['scikit-learn', 'sklearn']},
    'plotly': {'name': 'Plotly', 'asset': 'plotly.svg', 'aliases': ['Plotly']},
    'networkx': {'name': 'NetworkX', 'asset': 'networkx.svg', 'aliases': ['NetworkX']},
    'pysentimiento': {'name': 'pysentimiento', 'asset': 'pysentimiento.svg', 'aliases': ['pysentimiento', 'RoBERTuito']},
    'hugging-face': {'name': 'Hugging Face', 'asset': 'hugging-face.svg', 'aliases': ['Hugging Face', 'Transformers']},
    'pytorch': {'name': 'PyTorch', 'asset': 'pytorch.svg', 'aliases': ['PyTorch']},
    'youtube': {'name': 'YouTube Data API', 'asset': 'youtube.svg', 'aliases': ['YouTube', 'YouTube Data API']},
    'google-news': {'name': 'Google News', 'asset': 'google-news.svg', 'aliases': ['Google News']},
    'google-trends': {'name': 'Google Trends', 'asset': 'google-trends.svg', 'aliases': ['Google Trends']},
    'gdelt': {'name': 'GDELT', 'asset': 'gdelt.svg', 'aliases': ['GDELT', 'GDELT Project']},
    'wikipedia': {'name': 'Wikipedia', 'asset': 'wikipedia.svg', 'aliases': ['Wikipedia', 'Wikimedia']},
    'bluesky': {'name': 'Bluesky', 'asset': 'bluesky.svg', 'aliases': ['Bluesky']},
    'mastodon': {'name': 'Mastodon', 'asset': 'mastodon.svg', 'aliases': ['Mastodon']},
    'reddit': {'name': 'Reddit', 'asset': 'reddit.svg', 'aliases': ['Reddit']},
}

if __name__ == '__main__':
    add_claude_articles.main(ARTICLES, NEW_TOOLS)
