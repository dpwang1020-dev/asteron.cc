#!/usr/bin/env python3
"""从 LIGENT 网站下载 Solution 页使用的产品/系列图片到 images/products/"""

import os
import requests

# Family 名称 -> LIGENT 图片 URL（从各 Solution 页面获取）
IMAGES = {
    # AI Clusters / Data Center Connectivity
    "1-6t": "https://www.ligent.com/uploads/allimg/20250328/f1072e99f955f9f3ebc090011600338e.png",
    "800g-200g": "https://www.ligent.com/uploads/allimg/20250714/b72930137cd0551fcf50d52e7e3932f9.png",
    "800g-100g": "https://www.ligent.com/uploads/allimg/20250328/a8fb2e14193147adad01df2c875e2421.png",
    "400g-100g": "https://www.ligent.com/uploads/allimg/20250714/261a255a52baf62f3792b32577a5bb38.png",
    "200g": "https://www.ligent.com/uploads/allimg/20250711/f3586549b42c660523b96ee4f6d1c019.png",
    "100g": "https://www.ligent.com/uploads/allimg/20250711/357b3539097a2246bb9b2385dc35b975.png",
    "800g-zr": "https://www.ligent.com/uploads/allimg/20250328/9d186c7df4bc243550921e27f240a98e.png",
    "400g-zr": "https://www.ligent.com/uploads/allimg/20250328/1140fe10d154fa3cd443c244edd42440.png",
    # Storage | Server HPC
    "storage-64g": "https://www.ligent.com/uploads/allimg/20250328/969a786a34497dd72132787e672b528a.png",
    "storage-32g": "https://www.ligent.com/uploads/allimg/20250711/03cc954ff5a98be5b92d297af5d1e984.png",
    "storage-16g": "https://www.ligent.com/uploads/allimg/20250711/7227105c451e3322727067e24c85e33f.png",
    # Wireless Fronthaul
    "wireless-100g": "https://www.ligent.com/uploads/allimg/20250708/2ab7862501cc76a6f2132d8aa994793b.png",
    "wireless-50g": "https://www.ligent.com/uploads/allimg/20250711/79f5235f577fb9c0b46abde242a2112f.png",
    "wireless-25g": "https://www.ligent.com/uploads/allimg/20250711/459a55f07885deb540dbbc3da3736acc.png",
    # Metro Long Haul
    "metro-800g-200g": "https://www.ligent.com/uploads/allimg/20250328/070fabe7043232ef15a156d40e973186.png",
    "metro-800g-100g": "https://www.ligent.com/uploads/allimg/20250711/5f168b88c40e1ea0836b3194cd48ec31.png",
    "metro-400g": "https://www.ligent.com/uploads/allimg/20250711/4cc31f56dff6c1d4e3480d0c809b7388.png",
    "metro-200g": "https://www.ligent.com/uploads/allimg/20250711/1bd4889d235d10ade5c748c0a6d6af2a.png",
    "metro-100g": "https://www.ligent.com/uploads/allimg/20250711/dedffeeed0be2707f86d9ccca7c5e863.png",
    "metro-10g": "https://www.ligent.com/uploads/allimg/20250711/bcd624460b4bfa564f7a4b2f6b6f6249.png",
    # Fiber to the Home Access
    "fiber-50gpon": "https://www.ligent.com/uploads/allimg/20250826/66c86e5e85e7503f5bbc28cfbe072fb6.png",
    "fiber-25gpon": "https://www.ligent.com/uploads/allimg/20250328/e4ae34b4d26ca01e5277fe8d7fc714a3.png",
    "fiber-10gpon": "https://www.ligent.com/uploads/allimg/20250328/0aebd93a999d1f3b484f5e40926adef4.png",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(base, "images", "products")
    os.makedirs(out_dir, exist_ok=True)
    for name, url in IMAGES.items():
        path = os.path.join(out_dir, f"{name}.png")
        if os.path.exists(path):
            print(f"Skip (exists): {name}.png")
            continue
        try:
            r = requests.get(url, headers=HEADERS, timeout=15)
            r.raise_for_status()
            with open(path, "wb") as f:
                f.write(r.content)
            print(f"Downloaded: {name}.png")
        except Exception as e:
            print(f"Failed {name}: {e}")

if __name__ == "__main__":
    main()
