import * as THREE from 'three';

import { ViewportGizmo, GizmoOptions } from 'three-viewport-gizmo';

/**
 *   THREE.js          ROS URDF
 *      Y                Z
 *      |                |   Y
 *      |                | ／
 *      .-----X          .-----X
 *    ／
 *   Z
 */

/**
 * A viewport helper visualizes URDF coordinate system.
 */
export class URDFViewportHelper extends ViewportGizmo {
  /**
   * Construct a new ViewportGizmo(https://github.com/Fennec-hub/three-viewport-gizmo)
   * instance with customized options for swapping Y and Z axis and inverting Y-axis directorion.
   *
   * @param camera - The camera to be controlled by this ViewportGizmo
   * @param renderer - The WebGL renderer used to render the scene
   */
  constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    // Initialize after jupyter widget attach to DOM.
    if (renderer.domElement.parentElement === null) {
      return;
    }
    /**
     * Options to customize the ViewportGizmo.
     */
    const options: GizmoOptions = {
      container: renderer.domElement.parentElement as HTMLElement,
      placement: 'bottom-left',
      nx: {
        label: '-X',
        line: true,
        scale: 0.6
      },
      y: {
        label: 'Z',
        color: '#2c8fff',
        scale: 0.6
      },
      ny: {
        label: '-Z',
        line: true,
        color: '#2c8fff',
        scale: 0.6
      },
      z: {
        label: '-Y',
        color: '#8adb00',
        scale: 0.6
      },
      nz: {
        label: 'Y',
        line: true,
        color: '#8adb00',
        scale: 0.6
      }
    };
    super(camera, renderer, options);
  }
}
