from PIL import Image, ImageChops
import os

root_dir = r"K:\kulyeah\sems6\ML\FP P2\scholarship-recom"
bg_path = os.path.join(root_dir, "Gemini_Generated_Image_e4so7ye4so7ye4so.png")
favicon_path = os.path.join(root_dir, "frontend", "public", "favicon.png")
logo_path = os.path.join(root_dir, "frontend", "public", "logo.png")

print(f"Opening: {bg_path}")
img_bg = Image.open(bg_path).convert("RGB")

# Assuming the top-left pixel is the background color
bg_color = img_bg.getpixel((0, 0))
bg = Image.new(img_bg.mode, img_bg.size, bg_color)
diff = ImageChops.difference(img_bg, bg)
diff = ImageChops.add(diff, diff, 2.0, -100)
bbox = diff.getbbox()

print(f"Bounding box: {bbox}")

if bbox:
    left, upper, right, lower = bbox
    width = right - left
    height = lower - upper
    
    # Calculate center of the actual logo
    center_x = (left + right) // 2
    center_y = (upper + lower) // 2
    
    # Create a square crop with 5% padding around the largest dimension
    half_size = int((max(width, height) / 2) * 1.05)
    
    sq_left = max(0, center_x - half_size)
    sq_upper = max(0, center_y - half_size)
    sq_right = min(img_bg.width, center_x + half_size)
    sq_lower = min(img_bg.height, center_y + half_size)
    
    final_img = img_bg.crop((sq_left, sq_upper, sq_right, sq_lower))
    
    # Save as PNG
    final_img.save(favicon_path)
    final_img.save(logo_path)
    print(f"Cropped successfully. Original size: {img_bg.size}, New size: {final_img.size}")
else:
    print("Could not find bounding box (maybe image is solid color)")
