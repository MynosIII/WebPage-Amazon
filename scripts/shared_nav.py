"""Render the single navigation badge used by every generated page."""

from __future__ import annotations

import html


def render_global_nav(lang: str, switch_href: str) -> str:
    es = lang == "es"
    # Same information architecture as the marketplace header on the homepage.
    items = (
        [("Inicio", "/"), ("Explorar trabajo", "/catalog.html?section=all"), ("Sobre mí", "/about.html"),
         ("CV", "/cv-es.html"), ("Contacto", "/contact.html")]
        if es else
        [("Home", "/index.html?lang=en"), ("Explore work", "/catalog.html?section=all&lang=en"),
         ("About", "/about.html?lang=en"), ("CV", "/cv-en.html"), ("Contact", "/contact.html?lang=en")]
    )
    links = "".join(f'<li><a href="{html.escape(href)}">{html.escape(label)}</a></li>' for label, href in items)
    nav_label = "Navegación principal" if es else "Main navigation"
    menu_label = "Abrir menú" if es else "Open menu"
    locale = "EN" if es else "ES"
    hreflang = "en" if es else "es"
    switch_label = "View in English" if es else "Ver en español"
    return (
        '<header class="global-nav" data-global-nav>\n'
        '  <div class="global-nav__badge">\n'
        f'    <a class="global-nav__logo" href="{"/" if es else "/index.html?lang=en"}">Matías Gaglio.</a>\n'
        f'    <button class="global-nav__toggle" type="button" aria-controls="global-menu" aria-expanded="false" aria-label="{menu_label}" data-global-nav-toggle><span></span><span></span><span></span></button>\n'
        f'    <nav class="global-nav__menu" id="global-menu" aria-label="{nav_label}" data-global-nav-menu><ul>{links}<li class="global-nav__locale"><a href="{switch_href}" hreflang="{hreflang}" aria-label="{switch_label}">{locale}</a></li></ul></nav>\n'
        '  </div>\n'
        '</header>\n'
    )
