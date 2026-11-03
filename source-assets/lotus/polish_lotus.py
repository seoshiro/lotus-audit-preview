"""Material/light correction after first proof review; no geometry changes.
Blender --background lotus-original.blend --python polish_lotus.py -- --preview
Omit --preview to save/export and replace final proofs/posters.
"""
import bpy, math, sys
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
REPO=HERE.parent.parent
scene=bpy.context.scene
bpy.context.preferences.filepaths.save_version=0
def linear(v):return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
color=tuple(linear(int('B8B7B2'[i:i+2],16)/255) for i in (0,2,4))+(1,)
m=bpy.data.materials['Satin Silver Interior']
p=m.node_tree.nodes.get('Principled BSDF')
p.inputs['Base Color'].default_value=color
p.inputs['Metallic'].default_value=.94
p.inputs['Roughness'].default_value=.32
m.diffuse_color=color
scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value=(.08,.08,.075,1)
scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.26
scene.view_settings.exposure=.25
scene.cycles.samples=40
scene.render.resolution_x=840 if '--preview' in sys.argv else 1200
scene.render.resolution_y=scene.render.resolution_x
camera=scene.camera
floor=bpy.data.objects['Proof floor (not exported)']
hinges=[bpy.data.objects[f'Lotus_Hinge_{i}'] for i in range(5)]
def state(progress):
    for h in hinges:h.rotation_euler.y=math.radians(76)*progress
    bpy.context.view_layer.update()
def render(path,progress,cam,look,scale,transparent=False):
    state(progress)
    camera.location=cam
    camera.rotation_euler=(Vector(look)-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.ortho_scale=scale
    floor.hide_render=transparent
    scene.render.film_transparent=transparent
    scene.render.filepath=str(path)
    bpy.ops.render.render(write_still=True)
if '--preview' in sys.argv:
    render(HERE/'proofs'/'silver-light-check.png',1,(5.8,-9,8),(0,0,.9),7)
else:
    state(0)
    bpy.ops.object.select_all(action='DESELECT')
    root=bpy.data.objects['Lotus_Root']
    root.select_set(True)
    for o in root.children_recursive:o.select_set(True)
    bpy.context.view_layer.objects.active=root
    bpy.ops.export_scene.gltf(filepath=str(REPO/'public'/'models'/'lotus.glb'),export_format='GLB',use_selection=True,
        export_yup=True,export_apply=True,export_animations=False,export_extras=True,
        export_texcoords=True,export_normals=True,export_tangents=False,export_materials='EXPORT')
    camera.location=(.6,-9,3.7);camera.rotation_euler=(Vector((0,0,1.52))-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.ortho_scale=3.9
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'lotus-original.blend'),compress=True)
    render(HERE/'proofs'/'closed.png',0,(.6,-9,3.7),(0,0,1.52),3.9)
    render(HERE/'proofs'/'mid.png',.52,(5.6,-8.5,6),(0,0,1.15),5.75)
    render(HERE/'proofs'/'open.png',1,(5.8,-9,8),(0,0,.9),7)
    render(REPO/'public'/'assets'/'lotus-poster.png',0,(.6,-9,3.7),(0,0,1.52),3.9,True)
    render(REPO/'public'/'assets'/'lotus-open.png',1,(5.8,-9,8),(0,0,.9),7,True)
