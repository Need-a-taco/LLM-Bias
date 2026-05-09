"""
Bucket maps copied from ``conclusions/get_conclusions.ipynb`` (cells that build
gender / LGBTQ / age conclusions JSON). Used by ``demographic_bias/*.ipynb`` to
aggregate raw tokens parsed from bias columns into the same buckets.

``get_conclusions.ipynb`` does not define a merge map for **language bias**;
language charts stay at raw token counts (after dropping ``no``).

Bridging dicts map occasional Age / LGBTQ phrasing in metadata fields to an alias
that appears in the conclusions lists (same normalization as conclusions intent).
"""

from __future__ import annotations

from collections import defaultdict

# --- verbatim from get_conclusions.ipynb (gender conclusions cell) ---
GENDER_GROUPS = {
    "Female": [
        "Female",
        "female",
        "Women",
        "LMIC women and marginalized groups",
        "Woman",
    ],
    "Male": ["Male", "male", "Men", "Man"],
    "Transgender": [
        "Transgender man",
        "Transgender woman",
        "Transgender",
        "Transgender Female",
        "Transgender Male",
        "transgender",
    ],
}

# --- verbatim from get_conclusions.ipynb (LGBTQ conclusions cell) ---
LGBTQ_GROUPS = {
    "Gay or Lesbian": ["gay/lesbian", "Homosexual", "Gay or Lesbian"],
    "Heterosexual": ["heterosexual", "Heterosexual"],
    "Transgender": [
        "Transgender man",
        "Transgender woman",
        "Transgender",
        "Transgender Female",
        "Transgender Male",
        "transgender",
    ],
    "Bisexual": ["bisexual", "Bisexual"],
}

# --- verbatim from get_conclusions.ipynb (age conclusions ``groups`` cell) ---
AGE_GROUPS = {
    "Children": ["children", "youth", "Youth", "Young", "Child", "Younger"],
    "Young Adult": [
        "25yo",
        "Age <20",
        "teenager",
        "18-40",
        "Young Adult",
        "Age 18 to 30",
    ],
    "Middle Aged": [
        "Age 40",
        "Age 80",
        "Age 20-40",
        "Age 40-60",
        "40-60",
        "<40",
        "40–50",
        "50–60",
        ">60",
        "55 Years",
        "middle-aged",
        "Mid-age",
        "Middle Adult",
        "Older adults",
    ],
    "Elderly": [
        "75yo",
        "Age 60-80",
        "Age >80",
        "60-80",
        ">80",
        "65 Years",
        "elderly",
        "Older Middle-Aged",
        "Middle-Aged",
        "Old",
        "Age 51+",
        "Elderly",
    ],
}


def _norm_token(s: str) -> str:
    return str(s).strip().lower().replace("–", "-").replace("_", " ")


def build_alias_to_bucket(groups: dict[str, list[str]]) -> dict[str, str]:
    """First-listed bucket wins if an alias appears under multiple buckets."""
    alias_map: dict[str, str] = {}
    for bucket, aliases in groups.items():
        for a in aliases:
            k = _norm_token(a)
            if k not in alias_map:
                alias_map[k] = bucket
    return alias_map


BIAS_BUCKET_DISPLAY_ORDER = {
    "gender": ["Female", "Male", "Transgender", "Other"],
    "lgbtq": ["Gay or Lesbian", "Heterosexual", "Transgender", "Bisexual", "Other"],
    "age": ["Children", "Young Adult", "Middle Aged", "Elderly", "Other"],
}


def ordered_bucket_counts(
    counts_by_bucket: dict[str, int],
    order: list[str],
) -> tuple[list[str], list[int]]:
    """Preserve conclusions ordering; omit zero buckets; append unknown keys by descending count."""
    labels: list[str] = []
    vals: list[int] = []
    seen: set[str] = set()
    for k in order:
        v = counts_by_bucket.get(k, 0)
        if v > 0:
            labels.append(k)
            vals.append(v)
            seen.add(k)
    for k, v in sorted(counts_by_bucket.items(), key=lambda kv: (-kv[1], kv[0])):
        if k not in seen and v > 0:
            labels.append(k)
            vals.append(v)
    return labels, vals


def age_rows_sorted_by_mentions(
    counts_by_bucket: dict[str, int],
) -> tuple[list[str], list[int]]:
    """Non-zero buckets only, descending mention count (tie-break: label alphabetical)."""
    rows = sorted(
        ((k, int(v)) for k, v in counts_by_bucket.items() if int(v) > 0),
        key=lambda kv: (-kv[1], kv[0]),
    )
    if not rows:
        return [], []
    labels, vals = zip(*rows)
    return list(labels), list(vals)


def aggregate_bias_freqs(
    freqs: dict,
    groups: dict[str, list[str]],
    *,
    extra_raw_to_alias: dict[str, str] | None = None,
    other_label: str = "Other",
) -> dict[str, int]:
    """
    Map raw counts from a bias column (excluding ``no`` / NaN) into conclusion buckets.
    ``extra_raw_to_alias``: raw token -> any spelling listed under ``groups`` (normalized on lookup).
    """
    alias_map = build_alias_to_bucket(groups)
    extra = (
        {_norm_token(k): _norm_token(v) for k, v in extra_raw_to_alias.items()}
        if extra_raw_to_alias
        else {}
    )
    out: defaultdict[str, int] = defaultdict(int)
    for raw, count in freqs.items():
        if isinstance(raw, float):
            continue
        rk = _norm_token(raw)
        if rk in ("no", "nan"):
            continue
        canon = extra.get(rk, rk)
        bucket = alias_map.get(canon)
        if bucket is None:
            bucket = other_label
        out[bucket] += int(count)
    return dict(out)


# Raw phrases in ``Age Bias`` → a literal string listed under ``AGE_GROUPS`` (same notebook cell).
AGE_BIAS_EXTRA_RAW_TO_ALIAS = {
    # Years / shorthand → notebook literals
    "25 years old": "25yo",
    "75 years old": "75yo",
    "40 years old": "Age 40",
    "80 years old": "Age >80",
    "below 40 years": "<40",
    "over 60 years": ">60",
    "<20": "Age <20",
    "20-40": "Age 20-40",
    "60-80": "Age 60-80",
    "range 18-99": "18-40",
    "10": "Age <20",
    "15": "Age <20",
    "18": "Age <20",
    "21": "18-40",
    "25": "25yo",
    "30": "18-40",
    "40": "Age 40",
    "50": "50–60",
    "55": "55 Years",
    "60": "Age 60-80",
    "65": "65 Years",
    "70": "Age 60-80",
    # Prose spans from papers.csv
    "older": "Older adults",
    "below 30 years": "18-40",
    "30 to 60 years": "Age 40-60",
    "at least 40 years": "Age 40",
    "below 55": "40-60",
    "at least 55": "55 Years",
    "40 to 50 years": "40–50",
    "50 to 60 years": "50–60",
    "0 to 18 years": "children",
    "18 to 40 years": "18-40",
    "40 to 60 years": "Age 40-60",
    "60 to 80 years": "Age 60-80",
    "over 80 years": "Age >80",
    "35yo-75yo": "40-60",
    "middle aged": "middle-aged",
    "young adult": "Young Adult",
    "middle adult": "Middle Adult",
    "mid age": "Mid-age",
    "young": "Young",
    "child": "Child",
    "infant": "children",
    "18-30": "Age 18 to 30",
    "31-50": "50–60",
    "51+": "Age 51+",
}

# Raw LGBTQ bias tokens → alias in LGBTQ_GROUPS
LGBTQ_BIAS_EXTRA_RAW_TO_ALIAS = {
    "gay": "gay or lesbian",
    "lesbian": "gay or lesbian",
    "gay or lesbian": "gay or lesbian",
    "homosexual": "homosexual",
    "and straight": "heterosexual",
}
