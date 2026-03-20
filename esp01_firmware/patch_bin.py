import sys

def patch():
    with open('backup_original.bin', 'rb') as f:
        data = bytearray(f.read())

    # Get IP from terminal argument or default to 192.168.100.16
    ip = sys.argv[1] if len(sys.argv) > 1 else '192.168.100.16'
    
    new_url = f"http://{ip}:3000/api/esp".encode('utf-8')
    
    old_http = b"http://mux-cloud.com/Home/getdevicedata"
    old_https = b"https://mux-cloud.com/Home/getdevicedata"
    
    if len(new_url) > len(old_http):
        print(f"Error: New URL ({len(new_url)} chars) is longer than max allowed ({len(old_http)} chars).")
        return
        
    new_url_http = new_url.ljust(len(old_http), b'\x00')
    new_url_https = new_url.ljust(len(old_https), b'\x00')
    
    data = data.replace(old_http, new_url_http)
    data = data.replace(old_https, new_url_https)
    
    with open('backup_patched.bin', 'wb') as f:
        f.write(data)
        
    print(f"Successfully patched! New binary saved as 'backup_patched.bin' pointing to: {new_url.decode('utf-8')}")

if __name__ == "__main__":
    patch()
