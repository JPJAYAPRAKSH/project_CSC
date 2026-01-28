import requests
import json

try:
    r = requests.get('http://localhost:8000/api/courses/')
    print(f"Status Code: {r.status_code}")
    data = r.json()
    if isinstance(data, dict):
        print(f"Count: {data.get('count')}")
        print(f"First course: {data.get('results')[0]['name'] if data.get('results') else 'None'}")
    else:
        print(f"Count: {len(data)}")
        print(f"First course: {data[0]['name'] if data else 'None'}")
except Exception as e:
    print(f"Error: {e}")
