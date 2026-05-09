"""Shared Yes/No pie chart (stacked label + % + count) and SVG export."""

from pathlib import Path

import matplotlib.pyplot as plt
import seaborn as sns

COLOR_YES = "#fb923c"
COLOR_NO = "royalblue"


def plot_yes_no_pie(
    yes_count: int,
    no_count: int,
    output_svg: Path | str,
    *,
    nudge_yes_dy: float = 0.032,
    show: bool = True,
) -> None:
    sns.set_theme(style="white")
    total = yes_count + no_count

    def make_autopct(names):
        it = iter(names)

        def autopct(pct):
            label = next(it)
            n = int(round(pct / 100 * total))
            return f"{label}\n{pct:.1f}%\n(n={n})"

        return autopct

    fig, ax = plt.subplots(figsize=(6, 6))
    _, _, autotexts = ax.pie(
        [yes_count, no_count],
        autopct=make_autopct(["Yes", "No"]),
        colors=[COLOR_YES, COLOR_NO],
        wedgeprops=dict(edgecolor="black", linewidth=1.5),
        startangle=90,
        pctdistance=1.18,
    )
    plt.setp(autotexts, fontsize=14, fontweight="bold", ha="center", va="center")
    x0, y0 = autotexts[0].get_position()
    autotexts[0].set_position((x0, y0 + nudge_yes_dy))
    plt.tight_layout()

    out = Path(output_svg)
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, format="svg", bbox_inches="tight")
    if show:
        plt.show()
