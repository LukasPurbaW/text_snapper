# install_playwright.py
import asyncio
from playwright.async_api import async_playwright

async def install_browsers():
    async with async_playwright() as p:
        await p.chromium.launch()
        print("Playwright browsers installed!")

if __name__ == "__main__":
    asyncio.run(install_browsers())