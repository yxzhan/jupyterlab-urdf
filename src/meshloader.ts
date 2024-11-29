import { LoadingManager, LoaderUtils, Mesh, MeshPhongMaterial } from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

/**
 * A custom mesh loader
 *
 * This function extends the defaultMeshLoader to support OBJ files and materials.
 * Original function:
 * https://github.com/gkjohnson/urdf-loaders/blob/master/javascript/src/URDFLoader.js#L641
 *
 */
export function loadMeshCb(
  path: string,
  manager: LoadingManager,
  done: any
): void {
  if (/\.stl$/i.test(path)) {
    const loader = new STLLoader(manager);
    loader.load(path, geom => {
      const mesh = new Mesh(geom, new MeshPhongMaterial());
      done(mesh);
    });
  } else if (/\.dae$/i.test(path)) {
    const loader = new ColladaLoader(manager);
    loader.load(path, dae => done(dae.scene));
  } else if (/\.obj$/i.test(path)) {
    const loader = new OBJLoader(manager);

    loader.load(path, (obj: any) => {
      if (obj.materialLibraries.length && !loader.materials) {
        // Load the material
        const baseUri = LoaderUtils.extractUrlBase(path);
        return new MTLLoader(manager)
          .setPath(baseUri)
          .load(obj.materialLibraries[0], materials => {
            loader.setMaterials(materials);
            loader.load(path, obj => done(obj));
          });
      } else {
        return done(obj);
      }
    });
  } else {
    console.warn(
      `URDFLoader: Could not load model at ${path}.\nNo loader available`
    );
  }
}
