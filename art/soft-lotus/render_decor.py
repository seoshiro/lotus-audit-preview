"""One tiny transparent sprite from the existing adapted Tripo petal."""
import bpy
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(root/'soft-lotus-editable.blend'))
scene=bpy.context.scene
petal=bpy.data.objects['Petal_selvedge']
petal.data.shape_keys.key_blocks['Bloom'].value=1
for obj in scene.objects:
    if obj.type=='MESH':obj.hide_render=obj!=petal
scene.render.film_transparent=True
scene.render.resolution_x=160;scene.render.resolution_y=200
scene.cycles.samples=24
scene.render.image_settings.color_mode='RGBA'
scene.camera.data.ortho_scale=4.1
scene.camera.location=(1,-4.8,6)
scene.camera.rotation_euler=(Vector((0,-1.7,.7))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=str(root.parent.parent/'public/models/decor-petal.png')
bpy.ops.render.render(write_still=True)
