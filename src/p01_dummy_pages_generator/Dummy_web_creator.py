# generator.py

import os
import random
import shutil
from pathlib import Path


# =============================
# 1. LOAD TEMPLATES
# =============================
def load_templates(templates_path):
    sections = {"LOREM": [], "BASE": [], "TAIL": [], "FONTS": []}
    current = None

    with open(templates_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            if line.startswith("[") and line.endswith("]"):
                name = line[1:-1].upper()
                if name in sections:
                    current = name
                continue

            if current:
                sections[current].append(line)

    return sections["LOREM"], sections["BASE"], sections["TAIL"], sections["FONTS"]


# =============================
# 2. LOAD CSS
# =============================
def load_css(css_path):
    if not os.path.exists(css_path):
        return ""
    with open(css_path, "r", encoding="utf-8") as f:
        return "<style>\n" + f.read() + "\n</style>\n"


# =============================
# 3. FONT CONFIGURATION
# =============================
def get_font_configuration(font_templates, use_varied_fonts=True):
    """Select a font configuration. If not using varied fonts, return Poppins."""
    if not use_varied_fonts:
        # Use Poppins when font variety is disabled
        return "'Poppins', sans-serif", "'Poppins', sans-serif", "clean"
    
    if font_templates:
        font_config = random.choice(font_templates)
        parts = font_config.split("|")
        
        if len(parts) >= 2:
            primary_font = parts[0].strip()
            secondary_font = parts[1].strip()
            font_style = parts[2].strip() if len(parts) >= 3 else "classic"
        else:
            primary_font = font_config.strip()
            secondary_font = "Arial, sans-serif"
            font_style = "classic"
    else:
        # Default font combinations
        font_combinations = [
            ("Georgia, serif", "Arial, sans-serif", "classic"),
            ("'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", "'Open Sans', sans-serif", "modern"),
            ("'Times New Roman', Times, serif", "Verdana, Geneva, sans-serif", "traditional"),
            ("'Arial', sans-serif", "'Helvetica Neue', sans-serif", "clean"),
            ("'Courier New', monospace", "'Lucida Console', monospace", "tech"),
            ("'Palatino Linotype', 'Book Antiqua', Palatino, serif", "Garamond, serif", "elegant")
        ]
        primary_font, secondary_font, font_style = random.choice(font_combinations)
    
    return primary_font, secondary_font, font_style


def generate_font_css(primary_font, secondary_font, font_style, use_varied_fonts=True):
    """Generate CSS for fonts."""
    if not use_varied_fonts:
        # Poppins-only CSS
        return """
        /* Poppins font configuration */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
            font-family: 'Poppins', sans-serif;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            font-weight: 400;
            line-height: 1.6;
            letter-spacing: 0.01em;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
        }
        
        h1 {
            font-size: 2.4rem;
            line-height: 1.2;
            margin-bottom: 1.5rem;
        }
        
        h2 {
            font-size: 1.8rem;
            margin: 1.5rem 0 1rem 0;
        }
        
        .tagline {
            font-family: 'Poppins', sans-serif;
            font-size: 0.9rem;
            font-weight: 500;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            opacity: 0.8;
        }
        
        .author {
            font-family: 'Poppins', sans-serif;
            font-style: italic;
            font-weight: 300;
            font-size: 0.95rem;
            margin-bottom: 2rem;
            color: #555;
        }
        
        b, strong {
            font-weight: 600;
        }
        """
    
    # Base font sizes based on style
    style_configs = {
        "modern": {
            "h1": "2.8rem",
            "h2": "2.2rem",
            "p": "1.1rem",
            "line_height": "1.6",
            "letter_spacing": "0.01em"
        },
        "classic": {
            "h1": "2.5rem",
            "h2": "1.8rem",
            "p": "1rem",
            "line_height": "1.5",
            "letter_spacing": "normal"
        },
        "traditional": {
            "h1": "2.2rem",
            "h2": "1.6rem",
            "p": "0.95rem",
            "line_height": "1.4",
            "letter_spacing": "normal"
        },
        "clean": {
            "h1": "2.4rem",
            "h2": "1.9rem",
            "p": "1.05rem",
            "line_height": "1.7",
            "letter_spacing": "0.02em"
        },
        "tech": {
            "h1": "2.6rem",
            "h2": "2rem",
            "p": "1rem",
            "line_height": "1.4",
            "letter_spacing": "0.03em"
        },
        "elegant": {
            "h1": "2.7rem",
            "h2": "1.7rem",
            "p": "0.9rem",
            "line_height": "1.8",
            "letter_spacing": "0.01em"
        }
    }
    
    config = style_configs.get(font_style, style_configs["classic"])
    
    font_css = f"""
    /* Font Configuration: {font_style} style */
    * {{
        font-family: {secondary_font};
    }}
    
    body {{
        font-family: {secondary_font};
        font-size: {config['p']};
        line-height: {config['line_height']};
        letter-spacing: {config['letter_spacing']};
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }}
    
    h1, h2, h3, h4, h5, h6 {{
        font-family: {primary_font};
        font-weight: 700;
    }}
    
    h1 {{
        font-size: {config['h1']};
        margin-bottom: 1.5rem;
        line-height: 1.2;
    }}
    
    h2 {{
        font-size: {config['h2']};
        margin: 1.5rem 0 1rem 0;
    }}
    
    .tagline {{
        font-family: {secondary_font};
        font-size: 0.9rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        font-weight: 600;
        opacity: 0.8;
    }}
    
    .author {{
        font-family: {secondary_font};
        font-style: italic;
        font-size: 0.95rem;
        margin-bottom: 2rem;
        color: #555;
    }}
    """
    
    return font_css


# =============================
# 4. RANDOM PARAGRAPH
# =============================
def random_paragraph(lorem):
    return " ".join(random.sample(lorem, k=random.randint(2, 4)))


# =============================
# 5. PICK RANDOM IMAGE
# =============================
def pick_random_image(image_dir):
    if not os.path.exists(image_dir):
        return None

    files = [f for f in os.listdir(image_dir)
             if f.lower().endswith((".jpg", ".jpeg", ".png"))]

    return random.choice(files) if files else None


# =============================
# 6. TITLE GENERATION
# =============================
def generate_dynamic_title(keyword, index, base_templates, tail_templates):
    base = random.choice(base_templates)
    tail = random.choice(tail_templates)

    if "#" in tail:
        tail = tail.format(index)

    return f"{base.format(keyword=keyword)} — {tail}"


# =============================
# 7. BUILD HTML
# =============================
# =============================
# 7. BUILD HTML
# =============================
def build_dummy_html(title, keyword, css, image_dir, lorem, font_css, use_varied_fonts=True):
    html = "<html><head>"
    html += css
    
    # Add Google Fonts
    if use_varied_fonts:
        # Only add varied Google Fonts when needed
        if "'Open Sans'" in font_css or "'Roboto'" in font_css or "'Lato'" in font_css or "'Montserrat'" in font_css or "'Playfair Display'" in font_css:
            html += "<link rel='preconnect' href='https://fonts.googleapis.com'>"
            html += "<link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>"
            fonts_to_load = []
            
            if "'Open Sans'" in font_css:
                fonts_to_load.append("Open+Sans:400,600,700")
            if "'Roboto'" in font_css:
                fonts_to_load.append("Roboto:400,700")
            if "'Lato'" in font_css:
                fonts_to_load.append("Lato:400,700")
            if "'Montserrat'" in font_css:
                fonts_to_load.append("Montserrat:700")
            if "'Playfair Display'" in font_css:
                fonts_to_load.append("Playfair+Display:700")
            
            if fonts_to_load:
                html += f"<link href='https://fonts.googleapis.com/css2?family={'&family='.join(fonts_to_load)}&display=swap' rel='stylesheet'>"
    else:
        # Always load Poppins when font variety is disabled
        html += "<link rel='preconnect' href='https://fonts.googleapis.com'>"
        html += "<link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>"
        html += "<link href='https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap' rel='stylesheet'>"
    
    html += "<style>\n"
    html += font_css
    html += "</style>\n"
    html += "</head><body>"
    html += f"<div class='tagline'>The Daily Post — your dummy-pages-generated news used for entertainment</div>"

    html += f"<h1>{title}</h1>"
    html += f"<div class='author'>Written by AI • Keyword: <b>{keyword}</b></div>"

    img_file = pick_random_image(image_dir)
    if img_file:
        html += f'<img class="inline" src="../images/{img_file}" alt="img">'

    # Paragraphs
    for _ in range(random.randint(4, 7)):
        html += f"<p>{random_paragraph(lorem)}</p>"

    html += "</body></html>"
    return html


# --------------------------------------------------
# MAIN GENERATOR — THIS IS THE ONE YOU USE
# --------------------------------------------------
def generate_all_pages(
    keyword,
    num_pages,
    pages_dir,          # storage/users/<id>/pages/
    images_dir,         # storage/users/<id>/images/
    shared_image_dir,   # src/.../unsplash_images
    template_file,
    css_file,
    use_varied_fonts=True  # NEW PARAMETER: Font variety toggle
):

    pages_dir = Path(pages_dir)
    images_dir = Path(images_dir)
    shared_image_dir = Path(shared_image_dir)

    pages_dir.mkdir(parents=True, exist_ok=True)
    images_dir.mkdir(parents=True, exist_ok=True)

    # Copy stock images → storage/users/<id>/images/
    for img in os.listdir(shared_image_dir):
        if img.lower().endswith((".jpg", ".jpeg", ".png")):
            shutil.copy(shared_image_dir / img, images_dir / img)

    # Load templates + CSS
    lorem, base, tail, fonts = load_templates(template_file)
    css = load_css(css_file)

    generated_files = []

    for i in range(1, num_pages + 1):
        # Get font configuration
        primary_font, secondary_font, font_style = get_font_configuration(
            fonts, 
            use_varied_fonts=use_varied_fonts
        )
        
        # Generate font-specific CSS
        font_css = generate_font_css(
            primary_font, 
            secondary_font, 
            font_style,
            use_varied_fonts=use_varied_fonts
        )
        
        # Generate title and HTML
        title = generate_dynamic_title(keyword, i, base, tail)
        html = build_dummy_html(
            title, keyword, css, images_dir, lorem, font_css,
            use_varied_fonts=use_varied_fonts
        )

        outfile = pages_dir / f"page_{i}.html"
        outfile.write_text(html, encoding="utf-8")
        generated_files.append(str(outfile))
        
        if use_varied_fonts:
            print(f"Generated page {i}: {title} | Fonts: {primary_font.split(',')[0]} + {secondary_font.split(',')[0]} | Style: {font_style}")
        else:
            print(f"Generated page {i}: {title} | Using default fonts")

    return generated_files