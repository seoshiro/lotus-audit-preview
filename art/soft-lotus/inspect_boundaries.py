import bpy,bmesh,json
from pathlib import Path
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(Path(__file__).parent/'source/tripo-4ccf52ab-original.glb'),merge_vertices=True)
o=next(o for o in bpy.context.scene.objects if o.type=='MESH')
b=bmesh.new();b.from_mesh(o.data)
for e in b.edges:
    if not e.is_manifold:
        print('EDGE',len(e.link_faces),e.calc_length(),[(v.index,list(v.co),len(v.link_edges)) for v in e.verts])
