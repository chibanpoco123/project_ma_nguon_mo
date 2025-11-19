import requests
import json

# Dùng API VNAppMob để lấy danh sách tỉnh → quận/huyện
# API: https://api.vnappmob.com/api/v2/province/ và /district/{province_id}

BASE = "https://api.vnappmob.com/api/v2/province"

# 1. Lấy danh sách tỉnh
resp = requests.get(BASE)
provinces = resp.json().get("results", [])

data = []

for p in provinces:
    pid = p["province_id"]
    pname = p["province_name"]
    
    # 2. Lấy danh sách district cho mỗi tỉnh
    dr = requests.get(f"{BASE}/district/{pid}")
    districts = dr.json().get("results", [])
    district_names = [d["district_name"] for d in districts]
    
    data.append({
        "province_id": pid,
        "province_name": pname,
        "districts": district_names
    })

# 3. Ghi file JSON
with open("vn_provinces_districts.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Đã tạo file vn_provinces_districts.json với cấu trúc tỉnh → quận/huyện")

