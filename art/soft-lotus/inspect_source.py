"""Read and render the one approved Tripo result; never changes its GLB bytes."""
import bpy, bmesh, json, hashlib
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent
SOURCE = HERE / 'source' / 'tripo-4ccf52ab-original.glb'
PROOFS = HERE / 'proofs'
PROOFS.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(SOURCE), merge_vertices=True)
objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
report = {'source': SOURCE.name, 'bytes': SOURCE.stat().st_size,
          'sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'objects': []}
for obj in objects:
    bm = bmesh.new(); bm.from_mesh(obj.data)
    unseen = set(bm.verts); components = []
    while unseen:
        first = unseen.pop(); group = {first}; todo = [first]
        while todo:
            vertex = todo.pop()
            for edge in vertex.link_edges:
                other = edge.other_vert(vertex)
                if other in unseen:
                    unseen.remove(other); group.add(other); todo.append(other)
        components.append(len(group))
    coords = [obj.matrix_world @ v.co for v in obj.data.vertices]
    report['objects'].append({'name': obj.name, 'vertices': len(obj.data.vertices),
       'triangles': sum(len(p.vertices) - 2 for p in obj.data.polygons),
       'dimensions': list(obj.dimensions), 'bounds': [[min(v[i] for v in coords), max(v[i] for v in coords)] for i in range(3)],
       'boundary_edges': sum(e.is_boundary for e in bm.edges),
       'nonmanifold_edges': sum(not e.is_manifold for e in bm.edges),
       'components_vertices': sorted(components, reverse=True),
       'volume': bm.calc_volume(signed=True), 'uv_layers': len(obj.data.uv_layers)})
    bm.free()
    mat = bpy.data.materials.new('Neutral inspection clay'); mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (0.72, 0.66, 0.57, 1)
    shader.inputs['Roughness'].default_value = .65
    obj.data.materials.clear(); obj.data.materials.append(mat)
    for p in obj.data.polygons: p.use_smooth = True

scene = bpy.context.scene
scene.render.engine = 'CYCLES'; scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.render.resolution_x = 640; scene.render.resolution_y = 640; scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world = bpy.data.worlds.new('Inspection world'); scene.world.use_nodes = True
scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value = (.35,.35,.35,1)
scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value = .6
scene.view_settings.view_transform = 'AgX'
for name, loc, energy, size in [('Key',(-2,-3,4),200,3), ('Fill',(3,1,2),120,2)]:
    light = bpy.data.lights.new(name, 'AREA'); light.energy = energy; light.shape = 'DISK'; light.size = size
    node = bpy.data.objects.new(name,light); scene.collection.objects.link(node); node.location = loc
    node.rotation_euler = (-node.location).to_track_quat('-Z','Y').to_euler()
camera = bpy.data.objects.new('Inspection camera', bpy.data.cameras.new('Inspection camera'))
scene.collection.objects.link(camera); scene.camera = camera; camera.data.type = 'ORTHO'; camera.data.ortho_scale = 1.45
views = {'oblique': (2,-3,2), 'front': (0,-3,0.2), 'side': (3,0,0), 'top': (0,0,3)}
for name, loc in views.items():
    camera.location = loc; camera.rotation_euler = (-Vector(loc)).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath = str(PROOFS / f'source-{name}.png')
    bpy.ops.render.render(write_still=True)
(HERE / 'source-audit.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('TRIPO_SOURCE_AUDIT', json.dumps(report))
