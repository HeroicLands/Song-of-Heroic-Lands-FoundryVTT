"""
Load Obsidian-format markdown files, extracting YAML frontmatter
and converting Appearance/Dossier sections to HTML.
"""

import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import quote

import frontmatter
import markdown


@dataclass
class ObsidianCharacter:
    """Parsed Obsidian character file."""

    metadata: dict
    appearance_html: str
    dossier_html: str


def _preprocess_obsidian(
    text: str,
    image_path: str = "",
    anchor_path: str = "",
) -> str:
    """Convert Obsidian-specific syntax to standard markdown/HTML."""
    img_prefix = image_path.rstrip("/") + "/" if image_path else ""
    link_prefix = anchor_path.rstrip("/") + "/" if anchor_path else ""

    # Image embeds: ![[filename]] → ![](image_path/filename)
    text = re.sub(
        r"!\[\[([^\]|]+)\]\]",
        lambda m: f"![]({img_prefix}{quote(m.group(1))})",
        text,
    )

    # Wikilinks with alias: [[target|display]] → <a href="anchor_path/target">display</a>
    text = re.sub(
        r"\[\[([^\]|]+)\|([^\]]+)\]\]",
        lambda m: f'<a href="{link_prefix}{quote(m.group(1))}">{m.group(2)}</a>',
        text,
    )

    # Wikilinks without alias: [[target]] → <a href="anchor_path/target">target</a>
    text = re.sub(
        r"\[\[([^\]|]+)\]\]",
        lambda m: f'<a href="{link_prefix}{quote(m.group(1))}">{m.group(1)}</a>',
        text,
    )

    return text


def _split_sections(content: str) -> dict[str, str]:
    """Split markdown content by H1 headings into {heading: body} dict."""
    parts = re.split(r"^# (.+)$", content, flags=re.MULTILINE)
    sections = {}
    for i in range(1, len(parts), 2):
        sections[parts[i].strip()] = parts[i + 1].strip()
    return sections


def load(
    path: str | Path,
    image_path: str = "",
    anchor_path: str = "",
) -> ObsidianCharacter:
    """Load an Obsidian markdown file and return parsed character data.

    Args:
        path: Path to the Obsidian markdown file.
        image_path: URL path prefix for image embeds (![[...]]).
        anchor_path: URL path prefix for wikilink hrefs ([[...]]).

    Returns:
        ObsidianCharacter with metadata dict, appearance HTML, and dossier HTML.

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If the file is missing a required section.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    post = frontmatter.load(path)
    sections = _split_sections(post.content)

    if "Appearance" not in sections:
        raise ValueError(f"Missing '# Appearance' section in {path}")
    if "Dossier" not in sections:
        raise ValueError(f"Missing '# Dossier' section in {path}")

    md = markdown.Markdown()

    appearance_md = _preprocess_obsidian(sections["Appearance"], image_path, anchor_path)
    appearance_html = md.convert(appearance_md)

    md.reset()

    dossier_md = _preprocess_obsidian(sections["Dossier"], image_path, anchor_path)
    dossier_html = md.convert(dossier_md)

    return ObsidianCharacter(
        metadata=dict(post.metadata),
        appearance_html=appearance_html,
        dossier_html=dossier_html,
    )
