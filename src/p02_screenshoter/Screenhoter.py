# src/p01_dummy_pages_generator/snapshot_processor.py

import asyncio
import math
from pathlib import Path
from playwright.async_api import async_playwright
import nest_asyncio

nest_asyncio.apply()


CAMERA_WIDTH = 420
CAMERA_HEIGHT = 800


# -------------------------------------------------
# Highlight Keyword
# -------------------------------------------------
async def highlight_keyword_in_h1(page, keyword):
    js = f"""
    (() => {{
        const kw = "{keyword}".toLowerCase();
        let count = 0;

        document.querySelectorAll("h1").forEach(h1 => {{
            const text = h1.textContent;
            const lower = text.toLowerCase();
            const idx = lower.indexOf(kw);
            if (idx === -1) return;

            const before = text.slice(0, idx);
            const match  = text.slice(idx, idx + kw.length);
            const after  = text.slice(idx + kw.length);

            const newH1 = document.createElement("h1");

            // Blur before
            for (let c of before) {{
                const span = document.createElement("span");
                span.textContent = c;
                span.style.filter = "blur(4px)";
                newH1.appendChild(span);
            }}

            // Highlight
            const mark = document.createElement("mark");
            mark.textContent = match;
            mark.setAttribute("data-auto", "true");
            mark.style.background = "yellow";
            mark.style.color = "black";
            mark.style.fontWeight = "bold";
            newH1.appendChild(mark);

            // Blur after
            for (let c of after) {{
                const span = document.createElement("span");
                span.textContent = c;
                span.style.filter = "blur(4px)";
                newH1.appendChild(span);
            }}

            h1.replaceWith(newH1);
            count++;
        }});

        return count;
    }})();
    """
    return await page.evaluate(js)


# -------------------------------------------------
# Process Single Page
# -------------------------------------------------
async def process_page(page, file_path: Path, keyword: str, output_dir: Path):

    print(f"Processing: {file_path.name}")

    url = file_path.resolve().as_uri()
    await page.goto(url)

    found = await highlight_keyword_in_h1(page, keyword)
    if found == 0:
        print(f"  No <h1> containing keyword → skipped")
        return None

    print(f"  Highlighted {found} <h1>")

    # Locate highlight bounding box
    element = await page.query_selector("h1 mark[data-auto]")
    if not element:
        print("  Cannot locate highlighted mark")
        return None

    box = await element.bounding_box()
    if not box:
        print("  Cannot read bounding box")
        return None

    # Blur everything except highlighted area
    await page.evaluate("""
        document.querySelectorAll('body *').forEach(el => {
            if (!el.querySelector("mark[data-auto]") &&
                !el.matches("mark[data-auto]")) {
                el.style.filter = "blur(6px)";
            }
        });
    """)

    center_x = box["x"] + box["width"] / 2
    center_y = box["y"] + box["height"] / 2

    clip = {
        "x": max(0, math.floor(center_x - CAMERA_WIDTH / 2)),
        "y": max(0, math.floor(center_y - CAMERA_HEIGHT / 2)),
        "width": CAMERA_WIDTH,
        "height": CAMERA_HEIGHT
    }

    # Save output
    output_dir.mkdir(parents=True, exist_ok=True)
    save_path = output_dir / f"{file_path.stem}_{keyword}.png"

    await page.screenshot(path=str(save_path), clip=clip)
    print("  Saved →", save_path)

    return str(save_path)


# -------------------------------------------------
# Main Function (YOU CALL THIS)
# -------------------------------------------------
async def run_snapshot_processing(pages_dir: str, output_dir: str, keyword: str):
    """
    pages_dir: folder containing .html pages
    output_dir: folder to save screenshots
    keyword: highlight keyword
    """

    pages_dir = Path(pages_dir)
    output_dir = Path(output_dir)

    html_files = list(pages_dir.glob("*.html"))
    if not html_files:
        print("No HTML files found for snapshot processing.")
        return []

    results = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        context = await browser.new_context(
            viewport={"width": 1680, "height": 3200},
            device_scale_factor=3
        )

        page = await context.new_page()

        for html in html_files:
            result = await process_page(page, html, keyword, output_dir)
            if result:
                results.append(result)

        await browser.close()

    return results