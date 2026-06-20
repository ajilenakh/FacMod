from PIL import Image
import os

DIR = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(DIR, 'logo.png')

sizes = [16, 48, 128]

img = Image.open(src).convert("RGBA")

for dim in sizes:
    # create square transparent canvas
    canvas = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))

    # resize while keeping aspect ratio
    img_copy = img.copy()
    img_copy.thumbnail((dim, dim), Image.LANCZOS)

    # center it
    x = (dim - img_copy.width) // 2
    y = (dim - img_copy.height) // 2
    canvas.paste(img_copy, (x, y), img_copy)

    name = f'icon{dim}.png'
    canvas.save(os.path.join(DIR, name), "PNG")

    print(f"{name} ({dim}x{dim})")