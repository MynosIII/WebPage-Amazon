"""Public origin of the portfolio, shared by every generator.

Set the SITE_URL environment variable (for example on Vercel) to move the
site to another domain without editing any generated page.
"""

from __future__ import annotations

import os

DEFAULT_SITE_URL = "https://matiasgaglio.com"
SITE_URL = os.environ.get("SITE_URL", DEFAULT_SITE_URL).rstrip("/")
