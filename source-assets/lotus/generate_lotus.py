"""Original BEIBARS mechanical lotus. Blender 5.2, offline, no downloaded meshes.

Run: blender --background --python generate_lotus.py -- --draft
Run without --draft for final GLB, blend and closed/mid/open proof renders.
Model coordinates are Blender Z-up. GLB is Y-up; animate each exported
Lotus_Hinge_i around local Z by -1.32645 * opening (0 closed, 1 open).
"""
import bpy
import math
import json
import sys
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
MODEL = REPO / 'public' / 'models' / 'lotus.glb'
POSTER = REPO / 'public' / 'assets' / 'lotus-poster.png'
PROOFS = HERE / 'proofs'
DRAFT = '--draft' in sys.argv
PROOFS.mkdir(parents=True, exist_ok=True)
MODEL.parent.mkdir(parents=True, exist_ok=True)
POSTER.parent.mkdir(parents=True, exist_ok=True)
OPEN_ANGLE = math.radians(76)
PIVOT_R = 0.50
PIVOT_Z = 0.48
HEIGHT = 2.65
U_STEPS = 32
T_STEPS = 76
THICKNESS = 0.046

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for dat in list(bpy.data.materials):
    bpy.data.materials.remove(dat)

def linear(v):
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

def rgb(hexcode):
    return tuple(linear(int(hexcode[i:i+2], 16)/255) for i in (0,2,4)) + (1,)

def material(name, color, metallic, rough, coat=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = rgb(color)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = rgb(color)
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = rough
    p.inputs['Coat Weight'].default_value = coat
    p.inputs['Coat Roughness'].default_value = .23
    return m

ceramic = material('Pearl Ivory Ceramic | F4F1EA', 'F4F1EA', .025, .21, .32)
silver = material('Satin Silver Interior', 'B8B7B2', .94, .32, .05)
silver.node_tree.nodes.get('Principled BSDF').inputs['Anisotropic'].default_value = .35
rim_mat = material('Silver Edge', 'D5D1C9', .82, .25)
champagne = material('Champagne Hinge | BFA179', 'BFA179', .78, .35)
dark_metal = material('Graphite Pin Recess', '48463F', .73, .33)
core_mat = material('Satin Silver Core', 'CECBC4', .87, .36, .08)
asset_objects = []

def track(o, parent=None):
    if parent:
        o.parent = parent
    asset_objects.append(o)
    return o

def empty(name, parent=None, location=(0,0,0)):
    o = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(o)
    o.location = location
    return track(o, parent)

root = empty('Lotus_Root')
root['author'] = 'Original procedural mesh authored for BEIBARS'
root['license'] = 'Project-owned original asset; no third-party geometry'
root['petal_count'] = 5
root['closed_to_open_radians'] = OPEN_ANGLE

def finish(o, name, mat, parent, bevel=0):
    o.name = name
    o.data.materials.append(mat)
    for p in o.data.polygons:
        p.use_smooth = True
    if bevel:
        mod = o.modifiers.new('Machined edge radius', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod = o.modifiers.new('Balanced normals', 'WEIGHTED_NORMAL')
        mod.keep_sharp = True
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return track(o, parent)

def sphere(name, loc, scale, mat, parent):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=(0,0,0))
    o = bpy.context.object
    for v in o.data.vertices:
        v.co = Vector((v.co.x*scale[0], v.co.y*scale[1], v.co.z*scale[2])) + Vector(loc)
    return finish(o, name, mat, parent)

def cylinder(name, loc, radius, depth, mat, parent, axis='Z', vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=(0,0,0))
    o = bpy.context.object
    if axis == 'Y':
        for v in o.data.vertices:
            v.co = Vector((v.co.x, v.co.z, -v.co.y))
    for v in o.data.vertices:
        v.co += Vector(loc)
    return finish(o, name, mat, parent, .009)

def block(name, loc, scale, mat, parent, bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0,0,0))
    o = bpy.context.object
    for v in o.data.vertices:
        v.co = Vector((v.co.x*scale[0], v.co.y*scale[1], v.co.z*scale[2])) + Vector(loc)
    return finish(o, name, mat, parent, bevel)

def profile(t):
    # Fuller upper shoulders make the opened form a bowl rather than a blade.
    return .22*(1-t) + 1.04*max(0,math.sin(math.pi*t))**.78*(1-.18*t) + .045*t

def half_width(t):
    # Constant-width seam, including the small apex, prevents rim intersections.
    seam = max(.052, .052 / profile(t))
    available=max(.03, (2*math.pi/5-seam)*.5)
    neck=min(1.0,t/.09)
    neck=neck*neck*(3-2*neck)
    return min(available,.04+.565*neck)

def surface(t, u):
    ph = half_width(t)*u
    r = profile(t)
    # Lower continuation tucks beneath the hinge and hides the compact base.
    return Vector((r*math.cos(ph)-PIVOT_R, r*math.sin(ph), HEIGHT*t-.35*(1-t)**6))

def normal(t,u):
    e = .00001
    dt = surface(min(1,t+e),u)-surface(max(0,t-e),u)
    du = surface(t,min(1,u+e))-surface(t,max(-1,u-e))
    return du.cross(dt).normalized()

def create_petal(i, hinge):
    verts, normals, faces, mids = [], [], [], []
    stride = U_STEPS+1
    for a in range(T_STEPS+1):
        for b in range(U_STEPS+1):
            t,u = a/T_STEPS, -1+2*b/U_STEPS
            mids.append(surface(t,u))
            normals.append(normal(t,u))
    count = len(mids)
    for sign in (1,-1):
        verts.extend(tuple(p + n*THICKNESS*.5*sign) for p,n in zip(mids,normals))
    mats = []
    for a in range(T_STEPS):
        for b in range(U_STEPS):
            q = a*stride+b
            face = (q,q+1,q+stride+1,q+stride)
            faces.append(face); mats.append(0)
            faces.append(tuple(v+count for v in reversed(face))); mats.append(1)
    boundary = list(range(stride))
    boundary += [a*stride+U_STEPS for a in range(1,T_STEPS+1)]
    boundary += [T_STEPS*stride+b for b in range(U_STEPS-1,-1,-1)]
    boundary += [a*stride for a in range(T_STEPS-1,0,-1)]
    # A true half-round rim connects outside and inside, no open border edges.
    loops = [boundary]
    for k in range(1,6):
        theta = math.pi*k/6
        loop = []
        for j,q in enumerate(boundary):
            tangent = (mids[boundary[(j+1)%len(boundary)]] - mids[boundary[(j-1)%len(boundary)]]).normalized()
            outward = tangent.cross(normals[q]).normalized()
            pos = mids[q] + THICKNESS*.5*(normals[q]*math.cos(theta)+outward*math.sin(theta))
            loop.append(len(verts)); verts.append(tuple(pos))
        loops.append(loop)
    loops.append([q+count for q in boundary])
    for k in range(6):
        for j in range(len(boundary)):
            j2=(j+1)%len(boundary)
            faces.append((loops[k][j],loops[k+1][j],loops[k+1][j2],loops[k][j2])); mats.append(2)
    mesh=bpy.data.meshes.new('Original_Teardrop_Shell_5mm')
    mesh.from_pydata(verts,[],faces)
    mesh.materials.clear()
    for m in (ceramic,silver,rim_mat): mesh.materials.append(m)
    mesh.update()
    o=bpy.data.objects.new(f'Lotus_Petal_{i}_Ceramic_Silver_Solid',mesh)
    bpy.context.collection.objects.link(o)
    for p,m in zip(mesh.polygons,mats):
        p.material_index=m; p.use_smooth=True
    uv=mesh.uv_layers.new(name='PetalUV')
    for poly in mesh.polygons:
        for li in poly.loop_indices:
            vi=mesh.loops[li].vertex_index % count
            uv.data[li].uv=(vi%stride/U_STEPS,vi//stride/T_STEPS)
    o['rigid_petal']=i
    o['thickness']=THICKNESS
    return track(o,hinge)

hinges=[]
for i in range(5):
    socket=empty(f'Lotus_Socket_{i}',root)
    socket.rotation_euler.z=-math.pi/2+i*2*math.pi/5
    hinge=empty(f'Lotus_Hinge_{i}',socket,(PIVOT_R,0,PIVOT_Z))
    hinge['glTF_rotation_axis']='local Z negative'
    hinge['open_angle']=OPEN_ANGLE
    hinges.append(hinge)
    create_petal(i,hinge)
    # Two small stationary cheeks; central barrel and heel move with the shell.
    for j,side in enumerate((-1,1)):
        block(f'Lotus_Bracket_{i}_{j}',(PIVOT_R-.07,side*.105,PIVOT_Z+.02),(.10,.045,.09),champagne,socket,.015)
        cylinder(f'Lotus_PinCap_{i}_{j}',(PIVOT_R,side*.135,PIVOT_Z),.035,.018,champagne,socket,'Y',32)
        cylinder(f'Lotus_PinInset_{i}_{j}',(PIVOT_R,side*.147,PIVOT_Z),.016,.005,dark_metal,socket,'Y',24)
    cylinder(f'Lotus_MovingPin_{i}',(0,0,0),.040,.17,champagne,hinge,'Y',40)
    block(f'Lotus_Heel_{i}',(-.025,0,.10),(.11,.13,.13),champagne,hinge,.019)

cylinder('Lotus_Base', (0,0,.128), .265,.15,champagne,root)
cylinder('Lotus_Base_Silver_Lip', (0,0,.212), .278,.026,rim_mat,root)
cylinder('Lotus_Base_Graphite_Foot', (0,0,.045), .235,.035,dark_metal,root)
sphere('Lotus_Core', (0,0,.665), (.385,.385,.385),core_mat,root)

scene=bpy.context.scene
bpy.context.preferences.filepaths.save_version=0
scene.render.engine='CYCLES'
scene.cycles.samples=40
scene.cycles.use_denoising=True
scene.cycles.seed=7
scene.render.resolution_x=840 if DRAFT else 1200
scene.render.resolution_y=840 if DRAFT else 1200
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA'
scene.view_settings.view_transform='AgX'
scene.view_settings.exposure=.25
scene.world.use_nodes=True
scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value=(.08,.08,.075,1)
scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.26

def area(name,loc,power,size,color,target=(0,0,1.2),shape='DISK',size_y=None):
    d=bpy.data.lights.new(name,'AREA'); d.energy=power; d.shape=shape; d.size=size; d.color=color
    if size_y and hasattr(d,'size_y'): d.size_y=size_y
    o=bpy.data.objects.new(name,d); bpy.context.collection.objects.link(o);o.location=loc
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
    return o

area('Large warm key',(-3.7,-4.5,6),650,4.5,(1.0,.94,.84))
area('Vertical cool softbox',(4,-1,4.8),550,3.0,(.87,.93,1.0),shape='RECTANGLE',size_y=5)
area('Rear contour',(-1,4,5.4),850,3.2,(1.0,.97,.89))
area('Front silk',(-.5,-6,2.7),110,2.8,(1,1,1))

floor_mat=material('Proof Floor','F4F1EA',0,.62)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,0))
floor=bpy.context.object;floor.name='Proof floor (not exported)';floor.data.materials.append(floor_mat)
camera_data=bpy.data.cameras.new('Proof Camera')
camera=bpy.data.objects.new('Proof Camera',camera_data);bpy.context.collection.objects.link(camera)
scene.camera=camera;camera_data.type='ORTHO'

def state(openness):
    for h in hinges: h.rotation_euler.y=OPEN_ANGLE*openness
    bpy.context.view_layer.update()

def render(name,openness,cam,look,scale,transparent=False):
    state(openness)
    camera.location=cam;camera.rotation_euler=(Vector(look)-camera.location).to_track_quat('-Z','Y').to_euler()
    camera_data.ortho_scale=scale
    scene.render.film_transparent=transparent
    floor.hide_render=transparent
    scene.render.filepath=str(name)
    bpy.ops.render.render(write_still=True)

if '--check' in sys.argv:
    from mathutils.bvhtree import BVHTree
    shells=[o for o in asset_objects if o.name.startswith('Lotus_Petal_')]
    collisions=[]
    for step in range(21):
        state(step/20)
        trees=[]
        for o in shells:
            trees.append(BVHTree.FromPolygons([o.matrix_world@v.co for v in o.data.vertices],
                [list(p.vertices) for p in o.data.polygons],all_triangles=False,epsilon=0))
        pairs=[]
        for i in range(5):
            for j in range(i+1,5):
                overlap=trees[i].overlap(trees[j])
                if overlap:pairs.append([i,j,len(overlap)])
        allcoords=[o.matrix_world@v.co for o in shells for v in o.data.vertices]
        localcoords=[o.parent.parent.matrix_world.inverted()@o.matrix_world@v.co for o in shells for v in o.data.vertices]
        collisions.append({'progress':step/20,'pairs':pairs,'min_z':min(v.z for v in allcoords),
            'max_socket_angle_degrees':max(abs(math.degrees(math.atan2(v.y,v.x))) for v in localcoords),
            'min_socket_radial_x':min(v.x for v in localcoords)})
    (HERE/'collision-checks.json').write_text(json.dumps(collisions,indent=2))
    print(json.dumps(collisions))
    sys.exit(0)

if DRAFT:
    render(PROOFS/'corrected-closed.png',0,(.6,-9,3.7),(0,0,1.52),3.9)
    render(PROOFS/'corrected-open.png',1,(5.8,-9.0,8.0),(0,0,.9),7.0)
else:
    # Save and export only the authored model in the closed rest configuration.
    state(0)
    bpy.ops.object.select_all(action='DESELECT')
    for o in asset_objects:o.select_set(True)
    bpy.context.view_layer.objects.active=root
    bpy.ops.export_scene.gltf(filepath=str(MODEL),export_format='GLB',use_selection=True,
        export_yup=True,export_apply=True,export_animations=False,export_extras=True,
        export_texcoords=True,export_normals=True,export_tangents=False,export_materials='EXPORT')
    # Check assembled watertight topology and bounds at 21 rigid motion samples.
    import bmesh
    shells=[o for o in asset_objects if o.name.startswith('Lotus_Petal_')]
    topology=[]
    for o in shells:
        bm=bmesh.new();bm.from_mesh(o.data)
        topology.append({'name':o.name,'vertices':len(bm.verts),'faces':len(bm.faces),
            'boundary_edges':sum(e.is_boundary for e in bm.edges),'nonmanifold_edges':sum(not e.is_manifold for e in bm.edges)})
        bm.free()
    bounds=[]
    for step in range(21):
        state(step/20)
        coords=[o.matrix_world@v.co for o in shells for v in o.data.vertices]
        bounds.append({'progress':step/20,'min_z':min(v.z for v in coords),'max_z':max(v.z for v in coords),
            'max_radius':max(math.hypot(v.x,v.y) for v in coords)})
    state(0)
    (HERE/'geometry-checks.json').write_text(json.dumps({'topology':topology,'motion_bounds':bounds,'glb_bytes':MODEL.stat().st_size},indent=2))
    camera.location=(.6,-9,3.7);camera.rotation_euler=(Vector((0,0,1.52))-camera.location).to_track_quat('-Z','Y').to_euler();camera_data.ortho_scale=3.9
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'lotus-original.blend'),compress=True)
    render(PROOFS/'closed.png',0,(.6,-9,3.7),(0,0,1.52),3.9)
    render(PROOFS/'mid.png',.52,(5.6,-8.5,6.0),(0,0,1.15),5.75)
    render(PROOFS/'open.png',1,(5.8,-9.0,8.0),(0,0,.9),7.0)
    render(POSTER,0,(.6,-9,3.7),(0,0,1.52),3.9,True)
    render(REPO/'public'/'assets'/'lotus-open.png',1,(5.8,-9.0,8.0),(0,0,.9),7.0,True)
print('LOTUS_BUILD_COMPLETE', 'draft' if DRAFT else str(MODEL))
