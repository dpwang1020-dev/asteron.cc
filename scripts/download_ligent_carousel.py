#!/usr/bin/env python3
"""从 LIGENT 首页抓取轮播图到 images/carousel/"""

import os
import requests

BASE = "https://www.ligent.com"
BANNERS = [
    ("banner1.jpg", BASE + "/public/files/image/index_banner1.jpg"),
    ("banner2.jpg", BASE + "/public/files/image/index_banner2.jpg"),
    ("banner3.jpg", BASE + "/public/files/image/index_banner3.jpg"),
]
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(script_dir, "..", "images", "carousel")
    os.makedirs(out_dir, exist_ok=True)
    for name, url in BANNERS:
        path = os.path.join(out_dir, name)
        if os.path.exists(path):
            print(f"Skip (exists): {name}")
            continue
        try:
            r = requests.get(url, headers=HEADERS, timeout=20)
            r.raise_for_status()
            with open(path, "wb") as f:
                f.write(r.content)
            print(f"Downloaded: {name}")
        except Exception as e:
            print(f"Failed {name}: {e}")


if __name__ == "__main__":
    main()
