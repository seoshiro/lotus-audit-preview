"""Adapt the approved Tripo master petal into a five-petal soft-bloom candidate.

The master surface is imported, repaired and deformed, never replaced by a
procedural petal mesh. Run with Blender 5.2 --background --python this_file.
"""
import bpy, bmesh, math, json, hashlib, sys
from pathlib import Path
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
SOURCE = HERE / 'source' / 'tripo-4ccf52ab-original.glb'
MOBILE = '--mobile' in sys.argv
OUT = REPO / 'public' / 'models' / ('soft-lotus-mobile.glb' if MOBILE else 'soft-lotus-candidate.glb')
PROOFS = HERE / 'proofs'; PROOFS.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(SOURCE), merge_vertices=True)
master = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
bpy.context.view_layer.objects.active = master
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bm = bmesh.new(); bm.from_mesh(master.data)
unseen = set(bm.verts); groups = []
while unseen:
    vertex = unseen.pop(); group = {vertex}; pending = [vertex]
    while pending:
        vertex = pending.pop()
        for edge in vertex.link_edges:
            other = edge.other_vert(vertex)
            if other in unseen: unseen.remove(other); group.add(other); pending.append(other)
    groups.append(group)
largest = max(groups, key=len)
removed = [v for group in groups if group is not largest for v in group]
if removed: bmesh.ops.delete(bm, geom=removed, context='VERTS')
# One tiny duplicated seam in the Tripo source cannot form a valid edge loop.
# Replace only its 0.7%-wide local patch, preserving the rest of the master.
seam_center=Vector((.1789,.1822,-.2065))
seam=[v for v in bm.verts if (v.co-seam_center).length<.0035]
bmesh.ops.delete(bm,geom=seam,context='VERTS')
boundary = [e for e in bm.edges if e.is_boundary]
if boundary: bmesh.ops.holes_fill(bm, edges=boundary, sides=0)
print('REMAINING_BOUNDARIES', [[list(v.co) for v in e.verts] for e in bm.edges if e.is_boundary])
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
bm.to_mesh(master.data); bm.free(); master.data.update()
profile_points=[v.co.copy() for v in master.data.vertices]
if MOBILE:
    modifier=master.modifiers.new('Mobile surface reduction','DECIMATE');modifier.ratio=.36;modifier.use_collapse_triangulate=True
    bpy.context.view_layer.objects.active=master
    bpy.ops.object.modifier_apply(modifier=modifier.name)
source_points = [v.co.copy() for v in master.data.vertices]

def clamp(x, a=0, b=1): return min(b, max(a, x))
def smooth(a,b,x):
    s = clamp((x-a)/(b-a)); return s*s*(3-2*s)
def linear(v): return v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4
def color(hexcode): return tuple(linear(int(hexcode[i:i+2],16)/255) for i in (0,2,4))
MILK, PINK, SAGE = color('F4F0E7'), color('CD8B91'), color('BBC2A3')

# The imported Blender axis runs from the blunt base (-Y) to the raised tip (+Y).
profiles = []
for i in range(101):
    t=i/100; local=[p for p in profile_points if abs(p.y+.5-t)<.018]
    inner=sorted(p.z for p in local if abs(p.x)<.055)
    profiles.append((max([abs(p.x) for p in local] or [.02]), inner[len(inner)//2] if inner else -.3+.64*t))
for _ in range(3):
    profiles=[profiles[0]]+[(sum(profiles[j][0] for j in (i-1,i,i+1))/3,sum(profiles[j][1] for j in (i-1,i,i+1))/3) for i in range(1,100)]+[profiles[-1]]
def profile(t):
    u=clamp(t)*100; i=min(99,int(u)); f=u-i
    return tuple(profiles[i][k]*(1-f)+profiles[i+1][k]*f for k in range(2))

petal_mat = bpy.data.materials.new('Soft ivory petal with blush edge'); petal_mat.use_nodes=True
shader = petal_mat.node_tree.nodes.get('Principled BSDF')
shader.inputs['Roughness'].default_value=.87
shader.inputs['Metallic'].default_value=0
shader.inputs['Coat Weight'].default_value=0
shader.inputs['Specular IOR Level'].default_value=.2
vertex = petal_mat.node_tree.nodes.new('ShaderNodeVertexColor'); vertex.layer_name='PetalColor'
petal_mat.node_tree.links.new(vertex.outputs['Color'],shader.inputs['Base Color'])

root = bpy.data.objects.new('Soft_Lotus_Tripo',None); bpy.context.collection.objects.link(root)
root['source_job_id']='4ccf52ab-d439-444b-ad96-3011e8a11578'
root['source_sha256']=hashlib.sha256(SOURCE.read_bytes()).hexdigest()
root['source_model']='Tripo H3.1; one generated master petal'
root['local_edits']='Remove detached fragment; close boundary; base taper; five variations; soft bloom shape key; vertex color'
root['acceptance']='candidate: requires in-site review'
parts=[root]; petals=[]
# Viewed from -Y: PERCH left front, SELVEDGE front, FORME right front.
specs=[('perch',-72,1.02,.99),('selvedge',0,1.0,1.03),('forme',72,.98,.98),('about',216,.96,1.01),('contact',144,1.01,.97)]
for index,(name,angle,width_var,length_var) in enumerate(specs):
    mesh=master.data.copy(); obj=bpy.data.objects.new('Petal_'+name,mesh); bpy.context.collection.objects.link(obj)
    obj.parent=root; mesh.materials.clear(); mesh.materials.append(petal_mat)
    rotate=Matrix.Rotation(math.radians(angle),4,'Z')
    closed=[]; opened=[]; focused=[]; colors=[]
    for p in source_points:
        t=clamp(p.y+.5); half,center_z=profile(t)
        u=clamp(p.x/max(half,.015),-1,1)
        # Keep the actual source's concavity and edge, with a tapered shared base.
        r=.22+3.35*t*length_var
        # Smooth the width cap so the silhouette stays rounded, not wedge-like.
        natural=3.7*width_var
        limit=r*math.tan(math.radians(35))*.98/max(half,.015)
        breadth=(natural**-6+limit**-6)**(-1/6)
        x=p.x*breadth
        z=.25+.8*math.sin(math.pi*t*.5)+1.8*(p.z+.3-.64*t)
        z+=.035*math.sin(math.pi*t)*math.sin(index*1.7+u*1.2)
        opened.append(rotate@Vector((x,-r,z)))
        # Bend the same surface into a bud. This changes curvature across the
        # petal instead of rotating it as a rigid hinged shell.
        theta=u*math.radians(37.5)
        radius=.18*(1-t)+1.03*max(0,math.sin(math.pi*t))**.84+.035*t
        radius+=(p.z-center_z)*.16+u*.035*math.sin(math.pi*t)
        closed.append(rotate@Vector((math.sin(theta)*radius,-math.cos(theta)*radius,.02+3.15*t+.018*index*t)))
        focused.append(closed[-1]+rotate@Vector((x*.07,-.46*t,.16*math.sin(math.pi*t*.7))))
        vein=.035*(.5+.5*math.cos(u*25+t*4))**12*math.sin(math.pi*t)
        pink=clamp(.53*smooth(.64,1,t)+.32*abs(u)**5+vein)
        sage=.19*(1-t)**3
        colors.append(tuple(MILK[k]*(1-pink-sage)+PINK[k]*pink+SAGE[k]*sage for k in range(3))+(1,))
    for v,point in zip(mesh.vertices,closed): v.co=point
    mesh.update()
    obj.shape_key_add(name='Basis'); key=obj.shape_key_add(name='Bloom')
    for v,point in zip(key.data,opened): v.co=point
    focus=obj.shape_key_add(name='Focus')
    for v,point in zip(focus.data,focused): v.co=point
    color_layer=mesh.color_attributes.new(name='PetalColor',type='FLOAT_COLOR',domain='POINT')
    for v,c in zip(color_layer.data,colors): v.color=c
    for p in mesh.polygons: p.use_smooth=True
    if mesh.has_custom_normals: mesh.normals_split_custom_set([(0,0,0)]*len(mesh.loops))
    obj['semantic_id']=name; obj['source_geometry']='approved Tripo master petal'
    petals.append(obj); parts.append(obj)
    anchor=bpy.data.objects.new('Anchor_'+name,None); bpy.context.collection.objects.link(anchor); anchor.parent=root
    anchor.location=rotate@Vector((0,-2.35*length_var,.9 if name in ('perch','selvedge','forme') else 1.04))
    closed_anchor=rotate@Vector((0,-.98,1.95))
    anchor['closed_position_yup']=[closed_anchor.x,closed_anchor.z,-closed_anchor.y]
    anchor['selection_turn_degrees']=-38-angle
    parts.append(anchor)
bpy.data.objects.remove(master,do_unlink=True)

def plain(name,hexcode,rough=.68):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color(hexcode),1);p.inputs['Roughness'].default_value=rough
    return m
center_mat=plain('Quiet sage center','C7CCAD'); stamen_mat=plain('Cream stamens','EAE0BE')
center_parts=[]
def sphere(name,loc,scale,material,segments=16,rings=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc)
    o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(material)
    for p in o.data.polygons:p.use_smooth=True
    center_parts.append(o);return o
sphere('Organic center',(0,0,.39),(.34,.34,.19),center_mat,24,12)
for i in range(18):
    angle=i*math.tau/18; r=.2+.06*math.sin(i*2.7)
    base=Vector((r*math.cos(angle)*.7,r*math.sin(angle)*.7,.41))
    tip=Vector((r*math.cos(angle)*1.55,r*math.sin(angle)*1.55,.74+.1*math.sin(i*2.1)))
    curve=bpy.data.curves.new('Stamen stem','CURVE');curve.dimensions='3D';curve.bevel_depth=.012;curve.bevel_resolution=1;curve.resolution_u=3
    spline=curve.splines.new('BEZIER');spline.bezier_points.add(2)
    for point,co in zip(spline.bezier_points,[base,(base+tip)*.5+Vector((0,0,.04)),tip]):
        point.co=co;point.handle_left_type='AUTO';point.handle_right_type='AUTO'
    o=bpy.data.objects.new('Stamen stem',curve);bpy.context.collection.objects.link(o);o.data.materials.append(stamen_mat)
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    for other in bpy.context.selected_objects:
        if other!=o:other.select_set(False)
    bpy.ops.object.convert(target='MESH');center_parts.append(bpy.context.object)
    sphere('Stamen tip',tip,(.035,.035,.05),stamen_mat,10,6)
bpy.ops.object.select_all(action='DESELECT')
for o in center_parts:o.select_set(True)
bpy.context.view_layer.objects.active=center_parts[0];bpy.ops.object.join()
center=bpy.context.object;center.name='Organic_Center';center.parent=root;parts.append(center)

def pose(value):
    for o in petals:o.data.shape_keys.key_blocks['Bloom'].value=value
    bpy.context.view_layer.update()

# Inspect the actual adapted meshes, including intermediate morph positions.
audit={'source_job_id':root['source_job_id'],'source_sha256':root['source_sha256'],'removed_loose_vertices':len(removed),'repaired_boundary_edges':len(boundary),'topology':[],'poses':[],'focus_poses':[]}
for o in petals:
    b=bmesh.new();b.from_mesh(o.data)
    audit['topology'].append({'name':o.name,'vertices':len(o.data.vertices),'triangles':sum(len(p.vertices)-2 for p in o.data.polygons),'boundary_edges':sum(e.is_boundary for e in b.edges),'nonmanifold_edges':sum(not e.is_manifold for e in b.edges)})
    b.free()
for value in [i/20 for i in range(21)]:
    pose(value);trees=[];allcoords=[]
    for o in petals:
        basis=o.data.shape_keys.key_blocks['Basis'];target=o.data.shape_keys.key_blocks['Bloom']
        coords=[a.co.lerp(b.co,value) for a,b in zip(basis.data,target.data)]
        allcoords+=coords
        trees.append(BVHTree.FromPolygons(coords,[list(p.vertices) for p in o.data.polygons],all_triangles=False))
    overlaps=[]
    for i in range(5):
        for j in range(i+1,5):
            hits=trees[i].overlap(trees[j])
            if hits:overlaps.append({'pair':[specs[i][0],specs[j][0]],'triangle_pairs':len(hits)})
    audit['poses'].append({'bloom':value,'min_z':min(p.z for p in allcoords),'max_z':max(p.z for p in allcoords),'intersections':overlaps})
for active in range(5):
    for focus_value in (0,.25,.5,.75,1):
        trees=[]
        for i,o in enumerate(petals):
            basis=o.data.shape_keys.key_blocks['Basis'];target=o.data.shape_keys.key_blocks['Bloom'];focus=o.data.shape_keys.key_blocks['Focus']
            coords=[b.co+(c.co-a.co)*(focus_value if i==active else 0) for a,b,c in zip(basis.data,target.data,focus.data)]
            trees.append(BVHTree.FromPolygons(coords,[list(p.vertices) for p in o.data.polygons],all_triangles=False))
        hits=[{'pair':[specs[i][0],specs[j][0]],'triangle_pairs':len(trees[i].overlap(trees[j]))} for i in range(5) for j in range(i+1,5) if trees[i].overlap(trees[j])]
        audit['focus_poses'].append({'active':specs[active][0],'focus':focus_value,'intersections':hits})
pose(0)
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=root
OUT.parent.mkdir(exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(OUT),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_extras=True,export_morph=True,export_morph_normal=True,export_meshopt_compression_enable=True,export_meshopt_extension='EXT_meshopt_compression')
audit['glb_bytes']=OUT.stat().st_size
(HERE/('mobile-audit.json' if MOBILE else 'candidate-audit.json')).write_text(json.dumps(audit,indent=2),encoding='utf-8')

scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=960;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
scene.world=bpy.data.worlds.new('Warm studio');scene.world.use_nodes=True
scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value=(.7,.68,.63,1)
scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.4
floor_mat=plain('Warm studio ground','F4F0E8',.9)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,0));floor=bpy.context.object;floor.name='Proof floor';floor.data.materials.append(floor_mat)
for name,loc,power,size in [('Soft key',(-4,-5,8),750,6),('Fill',(5,-1,5),350,5),('Rear',(0,5,5),400,4)]:
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,.8))-o.location).to_track_quat('-Z','Y').to_euler()
cam=bpy.data.objects.new('Proof camera',bpy.data.cameras.new('Proof camera'));scene.collection.objects.link(cam);scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=9
cam.location=(0,-9.5,7);cam.rotation_euler=(Vector((0,0,.9))-cam.location).to_track_quat('-Z','Y').to_euler()
bpy.context.preferences.filepaths.save_version=0
if not MOBILE: bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'soft-lotus-editable.blend'),compress=True)
for value in (() if '--no-render' in sys.argv or MOBILE else (0,.25,.5,.75,1)):
    pose(value);scene.render.filepath=str(PROOFS/f'candidate-{int(value*100):03}.png');bpy.ops.render.render(write_still=True)
print('SOFT_LOTUS_CANDIDATE',json.dumps({'glb_bytes':audit['glb_bytes'],'intersection_samples':sum(bool(p['intersections']) for p in audit['poses']),'topology':audit['topology']}))
