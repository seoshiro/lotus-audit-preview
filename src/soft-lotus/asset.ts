// Final asset remains deliberately unset until the approved Higgsfield/Tripo
// result has been imported, inspected in this site and accepted.
export const softLotusAsset: {
  state: 'awaiting-generation' | 'candidate' | 'accepted';
  url: string | null;
  poster: string | null;
  sourceJobId: string | null;
} = {
  state: 'awaiting-generation',
  url: null,
  poster: null,
  sourceJobId: null,
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
