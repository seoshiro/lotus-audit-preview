import * as THREE from 'three';

/** Fit a conservative model envelope into the actual free reading column. */
export function createReadingLayout() {
  const center = new THREE.Vector3(), point = new THREE.Vector3(), target = new THREE.Vector3();
  const direction = new THREE.Vector3(), position = new THREE.Vector3(), rotatedCenter = new THREE.Vector3();
  const rotation = new THREE.Quaternion(), matrix = new THREE.Matrix4(), size = new THREE.Vector3();
  const screen = new THREE.Box2(), pixel = new THREE.Vector2();
  const rayToPaper = (camera: THREE.PerspectiveCamera, x: number, y: number, width: number, height: number, output: THREE.Vector3) => {
    direction.set(x / width * 2 - 1, 1 - y / height * 2, .5).unproject(camera).sub(camera.position);
    return output.copy(camera.position).addScaledVector(direction, -camera.position.z / direction.z);
  };
  function project(corners: THREE.Vector3[], camera: THREE.PerspectiveCamera, transform: THREE.Matrix4, width: number, height: number) {
    screen.makeEmpty();
    for (const corner of corners) {
      point.copy(corner).applyMatrix4(transform).project(camera);
      screen.expandByPoint(pixel.set((point.x * .5 + .5) * width, (-point.y * .5 + .5) * height));
    }
    return screen;
  }
  return {
    fit(corners: THREE.Vector3[], camera: THREE.PerspectiveCamera, turn: number, width: number, height: number, panelWidth: number) {
      const column = Math.max(1, width - panelWidth);
      const margin = THREE.MathUtils.clamp(column * .09, 14, 38);
      const availableWidth = Math.max(20, column - margin * 2);
      const targetX = column / 2, targetY = height * .48;
      center.set(0, 0, 0); corners.forEach(corner => center.add(corner)); center.multiplyScalar(1 / corners.length);
      rotation.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, turn);
      rotatedCenter.copy(center).applyQuaternion(rotation);
      rayToPaper(camera, targetX, targetY, width, height, target);
      position.copy(target).sub(rotatedCenter);
      matrix.compose(position, rotation, size.setScalar(1));
      project(corners, camera, matrix, width, height);
      const scale = Math.min(.8, availableWidth / (screen.max.x - screen.min.x), height * .55 / (screen.max.y - screen.min.y)) * .92;
      position.copy(target).addScaledVector(rotatedCenter, -scale);
      matrix.compose(position, rotation, size.setScalar(scale));
      project(corners, camera, matrix, width, height);
      // Correct perspective asymmetry without changing the model's proportions.
      rayToPaper(camera, (screen.min.x + screen.max.x) / 2, (screen.min.y + screen.max.y) / 2, width, height, point);
      position.add(target.sub(point));
      matrix.compose(position, rotation, size.setScalar(scale));
      project(corners, camera, matrix, width, height);
      return { position, scale, captionY: screen.max.y + 24, column };
    },
    project,
  };
}
