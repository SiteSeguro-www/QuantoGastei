import os
import struct
import zlib
import math

os.makedirs('/public', exist_ok=True)

def create_png(width, height, pixel_fn, filename):
    raw_rows = []
    for y in range(height):
        row = bytearray([0]) # filter type 0: None
        for x in range(width):
            r, g, b, a = pixel_fn(x, y, width, height)
            row.extend((r, g, b, a))
        raw_rows.append(bytes(row))
    
    raw_data = b''.join(raw_rows)
    compressed_data = zlib.compress(raw_data, 9)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc))
    
    # IDAT
    idat_crc = zlib.crc32(b'IDAT' + compressed_data)
    png.extend(struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('>I', idat_crc))
    
    # IEND
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc))
    
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height})")

def standard_icon_pixel(x, y, w, h, is_maskable=False):
    # Normalized coords -1 to 1
    nx = (x - w / 2) / (w / 2)
    ny = (y - h / 2) / (h / 2)
    dist = math.sqrt(nx * nx + ny * ny)

    # For maskable, background is full bleed dark #090a0f with emerald subtle glow
    # For standard, rounded rectangle with r ~ 0.28
    if not is_maskable:
        # Rounded corner distance
        corner_r = 0.25
        qx = abs(nx) - (1.0 - corner_r)
        qy = abs(ny) - (1.0 - corner_r)
        outside_x = max(qx, 0.0)
        outside_y = max(qy, 0.0)
        corner_dist = math.sqrt(outside_x * outside_x + outside_y * outside_y)
        if (qx > 0 and qy > 0 and corner_dist > corner_r) or abs(nx) > 0.98 or abs(ny) > 0.98:
            return 0, 0, 0, 0 # transparent

    # Background gradient: Dark obsidian #090A0F to deep navy #101726
    t = (nx + ny + 2) / 4.0
    bg_r = int(9 + t * (16 - 9))
    bg_g = int(10 + t * (23 - 10))
    bg_b = int(15 + t * (38 - 15))

    # Safe zone scale: maskable has 20% outer padding
    scale = 0.65 if is_maskable else 0.82
    sx = nx / scale
    sy = ny / scale
    sdist = math.sqrt(sx * sx + sy * sy)

    # Outer decorative glow ring
    if 0.88 <= sdist <= 0.96:
        # Emerald glow
        return 16, 185, 129, 220

    # Inner emblem: circular badge with vibrant emerald/teal gradient
    if sdist < 0.85:
        # Radial / diagonal gradient from emerald (#10B981) to teal (#14B8A6)
        diag = (sx - sy + 1.2) / 2.4
        badge_r = int(16 * (1 - diag) + 20 * diag)
        badge_g = int(185 * (1 - diag) + 184 * diag)
        badge_b = int(129 * (1 - diag) + 166 * diag)

        # Center symbol: Currency $ / R$ geometric lines
        # Draw central vertical bar
        if abs(sx) < 0.12 and abs(sy) < 0.6:
            # Gold or white accent
            return 255, 255, 255, 255
        
        # Upper horizontal curve / bar
        if -0.38 <= sy <= -0.24 and -0.35 <= sx <= 0.35:
            return 255, 255, 255, 255

        # Middle horizontal bar
        if -0.07 <= sy <= 0.07 and -0.32 <= sx <= 0.32:
            return 255, 255, 255, 255

        # Lower horizontal curve / bar
        if 0.24 <= sy <= 0.38 and -0.35 <= sx <= 0.35:
            return 255, 255, 255, 255
        
        # Left upper vertical segment
        if -0.35 <= sy <= 0.0 and -0.35 <= sx <= -0.23:
            return 255, 255, 255, 255

        # Right lower vertical segment
        if 0.0 <= sy <= 0.35 and 0.23 <= sx <= 0.35:
            return 255, 255, 255, 255

        return badge_r, badge_g, badge_b, 255

    return bg_r, bg_g, bg_b, 255

# Generate 192x192
create_png(192, 192, lambda x, y, w, h: standard_icon_pixel(x, y, w, h, False), '/public/pwa-192x192.png')

# Generate 512x512
create_png(512, 512, lambda x, y, w, h: standard_icon_pixel(x, y, w, h, False), '/public/pwa-512x512.png')

# Generate maskable 512x512
create_png(512, 512, lambda x, y, w, h: standard_icon_pixel(x, y, w, h, True), '/public/pwa-maskable-512x512.png')

# Generate 180x180 for iOS Apple Touch Icon
create_png(180, 180, lambda x, y, w, h: standard_icon_pixel(x, y, w, h, False), '/public/apple-touch-icon.png')

# Generate 32x32 for favicon.ico
create_png(32, 32, lambda x, y, w, h: standard_icon_pixel(x, y, w, h, False), '/public/favicon-32x32.png')

print("All PNG icons created successfully.")
