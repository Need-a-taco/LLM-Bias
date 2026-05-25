"""Stacked horizontal bar charts for conclusions JSON (shared by each */v3/plot.py)."""

from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.transforms import blended_transform_factory
import pandas as pd
import seaborn as sns


# Font sizes are kept consistent with the companion distribution charts so the
# two visualizations in each row of the conclusions figure look uniform.
_AXIS_TITLE_FS = 24
_Y_TICK_FS = 22
_LEGEND_FS = 16
_N_LABEL_FS = 20
_SEGMENT_LABEL_FS = 22


def load_conclusions_json(path: Path) -> pd.DataFrame:
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    rows = []
    for name, counts in raw.items():
        yes = int(counts.get("yes", 0))
        no = int(counts.get("no", 0))
        total = yes + no
        p_yes = yes / total if total else 0.0
        p_no = no / total if total else 0.0
        rows.append(
            {
                "group": name,
                "yes": yes,
                "no": no,
                "total": total,
                "p_yes": p_yes,
                "p_no": p_no,
            }
        )
    return pd.DataFrame(rows)


def render_stacked_horizontal(
    json_path: Path,
    output_path: Path | list[Path] | tuple[Path, ...] | None,
    *,
    color_found: str = "#d62728",
    color_not: str = "#2ca02c",
    dpi: int = 150,
    sort_by: str = "total",
    category_order: list[str] | None = None,
    y_tick_pad: float | None = None,
) -> None:
    df = load_conclusions_json(json_path)
    if category_order is not None:
        order_map = {name: i for i, name in enumerate(category_order)}
        df["_ord"] = df["group"].map(lambda g: order_map.get(g, len(category_order)))
        df = (
            df.sort_values(["_ord", "group"]).drop(columns=["_ord"]).reset_index(drop=True)
        )
    elif sort_by == "p_yes":
        df = df.sort_values(["p_yes", "group"], ascending=[False, True]).reset_index(
            drop=True
        )
    else:
        # Default matches the distribution chart's frequency ordering
        # (count desc, then name asc as tiebreaker).
        df = df.sort_values(["total", "group"], ascending=[False, True]).reset_index(
            drop=True
        )

    sns.set_theme(style="whitegrid", context="notebook")
    # Per-row height is generous enough that the segment-count labels (22pt)
    # have comfortable vertical padding inside each bar even on tall charts
    # like Class (11 rows).
    fig_h = max(5.0, 0.95 * len(df))
    fig, ax = plt.subplots(figsize=(12, fig_h))

    y = list(range(len(df)))
    label_found = "Found bias against group"
    label_not = "Did not find bias against group"

    bar_height = 0.8

    ax.barh(
        y,
        df["p_yes"],
        height=bar_height,
        color=color_found,
        label=label_found,
        zorder=2,
    )
    ax.barh(
        y,
        df["p_no"],
        height=bar_height,
        left=df["p_yes"],
        color=color_not,
        label=label_not,
        zorder=2,
    )

    # White count labels centered inside each red / green segment.
    for i, row in df.iterrows():
        yes = int(row["yes"])
        no = int(row["no"])
        p_yes = float(row["p_yes"])
        p_no = float(row["p_no"])
        if yes > 0:
            ax.text(
                p_yes / 2.0,
                i,
                f"{yes}",
                va="center",
                ha="center",
                fontsize=_SEGMENT_LABEL_FS,
                color="white",
                zorder=3,
            )
        if no > 0:
            ax.text(
                p_yes + p_no / 2.0,
                i,
                f"{no}",
                va="center",
                ha="center",
                fontsize=_SEGMENT_LABEL_FS,
                color="white",
                zorder=3,
            )

    ax.set_yticks(y)
    ax.set_yticklabels(df["group"], fontsize=_Y_TICK_FS)
    if y_tick_pad is not None:
        ax.tick_params(axis="y", which="major", pad=y_tick_pad)
    ax.invert_yaxis()
    ax.set_xlim(0, 1)
    ax.set_xlabel("Percentages of Studies", labelpad=10, fontsize=_AXIS_TITLE_FS)
    ax.tick_params(axis="x", which="both", bottom=False, top=False, labelbottom=False)
    ax.spines["bottom"].set_visible(False)

    # y in data coords (row index); x in axes coords so labels sit past 100% without expanding xlim
    trans_n = blended_transform_factory(ax.transAxes, ax.transData)
    for i, total in enumerate(df["total"]):
        ax.text(
            1.01,
            i,
            f"n={int(total)}",
            va="center",
            ha="left",
            fontsize=_N_LABEL_FS,
            color="#222",
            transform=trans_n,
            clip_on=False,
        )

    # Above the axes so bars and n= labels stay clear (was overlapping top-right)
    ax.legend(
        loc="lower center",
        bbox_to_anchor=(0.5, 1.02),
        ncol=2,
        frameon=True,
        fontsize=_LEGEND_FS,
        columnspacing=1.2,
    )
    ax.grid(False, axis="x")
    ax.set_axisbelow(True)

    fig.tight_layout(rect=[0, 0.06, 0.82, 0.92])

    if output_path:
        paths = (
            [output_path]
            if isinstance(output_path, (str, Path))
            else list(output_path)
        )
        for p in paths:
            p = Path(p)
            p.parent.mkdir(parents=True, exist_ok=True)
            fig.savefig(p, dpi=dpi, bbox_inches="tight")
        plt.close(fig)
    else:
        plt.show()
