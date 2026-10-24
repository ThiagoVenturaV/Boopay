import os
import sys
from PIL import Image, ImageFilter
import numpy as np

def process_stand():
    brain_dir = r"C:\Users\thiag\.gemini\antigravity\brain\24cd7909-2011-45fd-bd8d-1f8794e1e639"
    raw_path = os.path.join(brain_dir, "raw_laptop_stand.jpg")
    output_target = r"c:\Users\thiag\Downloads\Squad 45 - KeyCore Tech Hub\boopay-time\web\public\products\laptop-stand.png"
    artifact_target = os.path.join(brain_dir, "laptop-stand.png")

    if not os.path.exists(raw_path):
        print("raw_path does not exist:", raw_path)
        return

    import rembg
    print("Loading image...")
    img = Image.open(raw_path).convert("RGB")
    W, H = img.size

    # The wire is in the top-left corner. We can paint the top-left corner where wire is located with white/floor before rembg,
    # or blank it out.
    # Looking at raw_laptop_stand.jpg:
    # Stand left-most point: left arm tip is around x=850, y=360
    # The wire is at x < 650 and y < 1300
    arr = np.array(img)
    # Clear wire area (replace with floor color around x=700, y=700)
    floor_color = np.median(arr[100:300, 600:800], axis=(0, 1)).astype(np.uint8)
    for y in range(0, int(H * 0.35)):
        for x in range(0, int(W * 0.22)):
            arr[y, x] = floor_color

    cleaned_input = Image.fromarray(arr)
    print("Running rembg...")
    rgba = rembg.remove(cleaned_input)

    # Convert to numpy to inspect alpha channel
    rgba_arr = np.array(rgba)
    alpha = rgba_arr[:, :, 3]

    # Zero out any residual disconnected pixels in the top-left area if any
    alpha[:int(H * 0.30), :int(W * 0.22)] = 0
    rgba_arr[:, :, 3] = alpha

    # Find bounding box of non-zero alpha
    y_indices, x_indices = np.where(alpha > 20)
    if len(y_indices) == 0:
        print("No foreground found!")
        return

    min_x, max_x = np.min(x_indices), np.max(x_indices)
    min_y, max_y = np.min(y_indices), np.max(y_indices)
    
    # Add small margin
    margin = 40
    min_x = max(0, min_x - margin)
    min_y = max(0, min_y - margin)
    max_x = min(W, max_x + margin)
    max_y = min(H, max_y + margin)

    cropped = Image.fromarray(rgba_arr[min_y:max_y, min_x:max_x])
    c_w, c_h = cropped.size

    # Fit into 820x820 square inside 1024x1024 canvas
    target_canvas_size = 1024
    max_inner = 800
    scale = min(max_inner / c_w, max_inner / c_h)
    new_w = int(c_w * scale)
    new_h = int(c_h * scale)

    resized_product = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Create 1024x1024 pure white canvas
    final_canvas = Image.new("RGBA", (target_canvas_size, target_canvas_size), (255, 255, 255, 255))

    pos_x = (target_canvas_size - new_w) // 2
    pos_y = (target_canvas_size - new_h) // 2

    # Create subtle ambient contact shadow
    prod_alpha = resized_product.split()[3]
    shadow_mask = prod_alpha.filter(ImageFilter.GaussianBlur(18))
    shadow_arr = np.array(shadow_mask)
    shadow_img = Image.new("RGBA", (new_w, new_h), (0, 0, 0, 0))
    shadow_pixels = np.zeros((new_h, new_w, 4), dtype=np.uint8)
    shadow_pixels[:, :, 0] = 30
    shadow_pixels[:, :, 1] = 40
    shadow_pixels[:, :, 2] = 50
    shadow_pixels[:, :, 3] = (shadow_arr * 0.25).astype(np.uint8)
    shadow_img = Image.fromarray(shadow_pixels)

    # Paste shadow slightly offset downwards
    final_canvas.paste(shadow_img, (pos_x, pos_y + 14), shadow_img)

    # Paste product
    final_canvas.paste(resized_product, (pos_x, pos_y), resized_product)

    # Convert to RGB (pure white background)
    rgb_output = final_canvas.convert("RGB")
    rgb_output.save(output_target, "PNG", quality=100)
    rgb_output.save(artifact_target, "PNG", quality=100)

    print("Success! Saved standalone stand image to:", output_target)
    print("And artifact target:", artifact_target)

if __name__ == "__main__":
    process_stand()
