import URDFLoader, { URDFRobot } from 'urdf-loader';

import { XacroLoader } from 'xacro-parser';

import { PageConfig } from '@jupyterlab/coreutils';

import { LoadingManager } from 'three';

import { loadMeshCb } from './meshloader';

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
 * XacroLoaderWithPath: a XacroLoader with a workingPath property
 *
 * Note: XacroLoader already has a workingPath property because it is derived
 * from XacroParser, but it is not possible to modify directly. Thus,
 * workingPath is overwritten with this class.
 */
class XacroLoaderWithPath extends XacroLoader {
  workingPath = '';
  rospackCommands = {};

  constructor() {
    super();
    this.rospackCommands = {
      find: (pkg: string) => {
        return this.workingPath + '/' + pkg;
      },
      optenv: (env: string, defaultVal: string) => {
        return defaultVal;
      }
    };
  }
}

/**
 * URDFLoadingManager: a loading manager for URDF files
 */
export class URDFLoadingManager extends LoadingManager {
  private _urdfLoader: URDFLoader;
  private _xacroLoader: XacroLoaderWithPath;
  private _workingPath = '';
  private _robotString = '';
  private _robotModel = {} as URDFRobot;
  private _isReady = false;

  /**
   * Creates the manager and initializes the URDF and XACRO loaders
   */
  constructor() {
    super();
    this._urdfLoader = new URDFLoader(this);
    this._urdfLoader.loadMeshCb = loadMeshCb.bind(this._urdfLoader);
    this._xacroLoader = new XacroLoaderWithPath();
    this.setWorkingPath();
  }

  /**
   * Sets the path where the loaders will search for robot description files
   *
   * @param workingPath - The path to the robot files
   */
  setWorkingPath(workingPath = ''): void {
    // To match '/this/format/path'
    workingPath = workingPath[0] !== '/' ? '/' + workingPath : workingPath;
    workingPath =
      workingPath[workingPath.length - 1] === '/'
        ? workingPath.slice(0, -1)
        : workingPath;

    console.debug('[Manager]: Modify URL with prefix ', workingPath);
    this._workingPath = workingPath;

    this.setURLModifier((url: string) => {
      if (url.startsWith(this._workingPath)) {
        console.debug('[Loader]:', url);
        return PageConfig.getBaseUrl() + 'files' + url;
      } else {
        const modifiedURL = 'files' + this._workingPath + url;
        console.debug('[Loader]:', modifiedURL);
        return PageConfig.getBaseUrl() + modifiedURL;
      }
    });

    this._xacroLoader.workingPath =
      PageConfig.getBaseUrl() + 'files' + this._workingPath;
    console.debug(
      '[Xacro]: Modify URL with prefix',
      this._xacroLoader.workingPath
    );
  }

  /**
   * Creates a robot model from a given URDF
   *
   * @param robotString - The robot description in the URDF file
   */
  setRobot(robotString = ''): void {
    this._robotString = robotString || this._robotString;
    if (this.hasXMLError(this._robotString)) {
      return;
    }

    if (robotString.includes('xacro')) {
      this._xacroLoader.parse(
        this._robotString,
        (xml: XMLDocument) => {
          this._robotModel = this._urdfLoader.parse(xml);
          this._robotModel.rotation.x = -Math.PI / 2;
        },
        (err: Error) => this.onError(err.message)
      );
    } else {
      this._robotModel = this._urdfLoader.parse(this._robotString);
      this._robotModel.rotation.x = -Math.PI / 2;
    }
  }

  /**
   * Check XML syntax error
   */
  hasXMLError(xmlStr: string): boolean {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'application/xml');
    const errorNode = doc.querySelector('parsererror div');
    if (errorNode) {
      this.onError('XML syntax error:\n' + errorNode?.textContent);
    } else {
      // Clear error message
      this.onError('');
    }
    return !!errorNode;
  }

  /**
   * Resets the robot model
   */
  dispose(): void {
    this._robotModel = {} as URDFRobot;
  }

  /**
   * Retrieves the robot model
   */
  get robotModel() {
    return this._robotModel;
  }

  /**
   * Retrieves the working path
   */
  get workingPath() {
    return this._workingPath;
  }

  /**
   * Checks if the robot model has finished loading
   */
  get isReady() {
    this._isReady = !(Object.keys(this._robotModel).length === 0);
    return this._isReady;
  }
}
