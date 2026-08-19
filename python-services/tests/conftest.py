"""
Pytest configuration and PYTHONPATH setup.
"""

import sys
from pathlib import Path

# Add python-services root directory to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
