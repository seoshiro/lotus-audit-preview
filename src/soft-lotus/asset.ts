// Actual Tripo master, repaired in Blender and inspected throughout the site flow.
export const softLotusAsset: {
  state: 'awaiting-generation' | 'candidate' | 'accepted';
  url: string | null;
  mobileUrl: string | null;
  poster: string | null;
  sourceJobId: string | null;
} = {
  state: 'accepted',
  url: 'models/soft-lotus-candidate.glb',
  mobileUrl: 'models/soft-lotus-mobile.glb',
  poster: null,
  sourceJobId: '4ccf52ab-d439-444b-ad96-3011e8a11578',
};

export const softLotusContract = {
  petalNodes: ['Petal_perch', 'Petal_selvedge', 'Petal_forme', 'Petal_about', 'Petal_contact'],
  anchorNodes: ['Anchor_perch', 'Anchor_selvedge', 'Anchor_forme', 'Anchor_about', 'Anchor_contact'],
  morphTarget: 'Bloom',
  axis: 'Y-up',
  poseSamples: [0, 0.25, 0.5, 0.75, 1],
  desktopTriangleGuide: 80000,
  mobileTriangleGuide: 30000,
  compressedByteGuide: 3 * 1024 * 1024,
} as const;
