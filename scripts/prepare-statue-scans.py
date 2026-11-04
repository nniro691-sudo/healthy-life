"""Keep the source scan geometry and useful normal/AO textures; replace paint with gold.
Source URLs, author and original licenses are retained in each GLB's asset.extras.
Run with source GLBs as arguments; see public/assets/models/CREDITS.md.
"""
import json, struct, sys
from pathlib import Path

for source in sys.argv[1:]:
    data = Path(source).read_bytes()
    size = struct.unpack_from('<I', data, 12)[0]
    doc = json.loads(data[20:20 + size])
    binary = data[28 + size:]
    used = set()
    for material in doc['materials']:
        normal, ao = material.get('normalTexture'), material.get('occlusionTexture')
        material.clear()
        material.update(name='Gold leaf adaptation', doubleSided=True,
                        pbrMetallicRoughness={'baseColorFactor': [.485, .254, .037, 1],
                                             'metallicFactor': .78, 'roughnessFactor': .43})
        for key, info in [('normalTexture', normal), ('occlusionTexture', ao)]:
            if info:
                material[key] = info
                used.add(info['index'])
    texture_ids = sorted(used)
    textures = [doc['textures'][i] for i in texture_ids]
    image_ids = sorted({t['source'] for t in textures})
    images = [doc['images'][i] for i in image_ids]
    for material in doc['materials']:
        for key in ['normalTexture', 'occlusionTexture']:
            if key in material:
                material[key]['index'] = texture_ids.index(material[key]['index'])
    for texture in textures:
        texture['source'] = image_ids.index(texture['source'])
    removed = {im['bufferView'] for i, im in enumerate(doc.get('images', [])) if i not in image_ids}
    views, remap, chunks, offset = [], {}, [], 0
    for i, view in enumerate(doc['bufferViews']):
        if i in removed:
            continue
        raw = binary[view.get('byteOffset', 0):view.get('byteOffset', 0) + view['byteLength']]
        remap[i] = len(views)
        views.append({**view, 'byteOffset': offset})
        padded = raw + b'\0' * (-len(raw) % 4)
        chunks.append(padded)
        offset += len(padded)
    for accessor in doc['accessors']:
        accessor['bufferView'] = remap[accessor['bufferView']]
    for image in images:
        image['bufferView'] = remap[image['bufferView']]
    doc.update(bufferViews=views, textures=textures, images=images, buffers=[{'byteLength': offset}])
    doc.pop('extensionsUsed', None)
    if not textures:
        doc.pop('extensionsRequired', None)
    doc['asset']['extras']['adaptation'] = 'Gold-leaf material; original geometry, baked normal and occlusion textures preserved. Original photo paint textures removed.'
    js = json.dumps(doc, separators=(',', ':')).encode()
    js += b' ' * (-len(js) % 4)
    payload = b''.join(chunks)
    out = struct.pack('<III', 0x46546c67, 2, 28 + len(js) + len(payload)) + struct.pack('<II', len(js), 0x4e4f534a) + js + struct.pack('<II', len(payload), 0x004e4942) + payload
    target = Path('public/assets/models') / Path(source).name
    target.write_bytes(out)
    print(target, len(data), '->', len(out))
