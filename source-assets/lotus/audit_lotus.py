"""Read-only model audit. Run in Blender with lotus-original.blend loaded."""
import bpy, json, struct, math
from pathlib import Path
from mathutils import Matrix, Vector, Quaternion
from mathutils.bvhtree import BVHTree

HERE=Path(__file__).resolve().parent
GLB=HERE.parent.parent/'public'/'models'/'lotus.glb'
raw=GLB.read_bytes()
jlen,jtype=struct.unpack_from('<II',raw,12)
g=json.loads(raw[20:20+jlen])
blen,btype=struct.unpack_from('<II',raw,20+jlen)
binary=raw[28+jlen:28+jlen+blen]
nodes=g['nodes']
parents={c:i for i,n in enumerate(nodes) for c in n.get('children',[])}
def locmat(i,openness):
    n=nodes[i]
    if 'matrix' in n:return Matrix([n['matrix'][k:k+4] for k in range(0,16,4)]).transposed()
    q=n.get('rotation',[0,0,0,1])
    quat=Quaternion((q[3],q[0],q[1],q[2]))
    if n.get('name','').startswith('Lotus_Hinge_'):quat=Quaternion((0,0,1),-math.radians(76)*openness)
    return Matrix.Translation(Vector(n.get('translation',[0,0,0])))@quat.to_matrix().to_4x4()@Matrix.Diagonal(Vector(n.get('scale',[1,1,1])+[1]))
def worldmat(i,openness):
    m=locmat(i,openness)
    return worldmat(parents[i],openness)@m if i in parents else m
def positions(accessor):
    a=g['accessors'][accessor];v=g['bufferViews'][a['bufferView']]
    assert a['componentType']==5126 and a['type']=='VEC3'
    offset=v.get('byteOffset',0)+a.get('byteOffset',0)
    stride=v.get('byteStride',12)
    return [Vector(struct.unpack_from('<fff',binary,offset+k*stride)) for k in range(a['count'])]
poscache={}
for mesh in g['meshes']:
    for p in mesh['primitives']:
        a=p['attributes']['POSITION']
        if a not in poscache:poscache[a]=positions(a)
bounds=[]
for openness in (0,.52,1):
    coords=[]
    for i,n in enumerate(nodes):
        if 'mesh' not in n:continue
        mat=worldmat(i,openness)
        for p in g['meshes'][n['mesh']]['primitives']:
            coords.extend(mat@v for v in poscache[p['attributes']['POSITION']])
    bounds.append({'progress':openness,'min':[min(v[k] for v in coords) for k in range(3)],
        'max':[max(v[k] for v in coords) for k in range(3)],
        'size':[max(v[k] for v in coords)-min(v[k] for v in coords) for k in range(3)]})

shells=[bpy.data.objects[f'Lotus_Petal_{i}_Ceramic_Silver_Solid'] for i in range(5)]
hinges=[bpy.data.objects[f'Lotus_Hinge_{i}'] for i in range(5)]
states=[]
for mode in ('synchronous','forward_stagger','reverse_stagger'):
    for step in range(21):
        progress=step/20
        values=[]
        for i,h in enumerate(hinges):
            v=progress if mode=='synchronous' else max(0,min(1,progress*1.12-(i if mode=='forward_stagger' else 4-i)*.03))
            h.rotation_euler.y=math.radians(76)*v;values.append(v)
        bpy.context.view_layer.update()
        trees=[BVHTree.FromPolygons([o.matrix_world@v.co for v in o.data.vertices],
            [list(p.vertices) for p in o.data.polygons],all_triangles=False,epsilon=0) for o in shells]
        collisions=[]
        for i in range(5):
            for j in range(i+1,5):
                ol=trees[i].overlap(trees[j])
                if ol:collisions.append([i,j,len(ol)])
        states.append({'mode':mode,'progress':progress,'angles':values,'intersecting_pairs':collisions})
for h in hinges:h.rotation_euler.y=0
report={'glb_bytes':len(raw),'glTF_version':g['asset']['version'],'mesh_count':len(g['meshes']),
    'triangle_count':sum(g['accessors'][p['indices']]['count']//3 for m in g['meshes'] for p in m['primitives']),
    'materials':g['materials'],'images':len(g.get('images',[])),'animations':len(g.get('animations',[])),
    'hinges':[n for n in nodes if n.get('name','').startswith('Lotus_Hinge_')],
    'sockets':[n for n in nodes if n.get('name','').startswith('Lotus_Socket_')],
    'exported_bounds_y_up':bounds,'motion_sample_count':len(states),
    'intersecting_states':[s for s in states if s['intersecting_pairs']]}
(HERE/'export-audit.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'bounds_y_up':bounds,'triangles':report['triangle_count'],'intersecting_states':report['intersecting_states']}))
