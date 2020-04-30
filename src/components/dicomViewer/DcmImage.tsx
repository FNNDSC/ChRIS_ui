import * as React from "react";
import { IFileBlob } from "../../api/models/file-viewer.model";
import * as dat from "dat.gui";
import * as THREE from "three";
import * as AMI from "ami.js";
import {
  orthographicCameraFactory,
  stackHelperFactory,
  trackballOrthoControlFactory,
} from "ami.js";
import "./amiViewer.scss";

type AllProps = {
  file: IFileBlob;
};

// Description: Will be replaced with a DCM Fyle viewer
class DcmImage extends React.Component<AllProps> {
  private _removeResizeEventListener?: () => void = undefined;
  // dynamicImagePixelData: string | ArrayBuffer | null = null;
  private containerRef: React.RefObject<HTMLInputElement>;
  constructor(props: AllProps) {
    super(props);
    this.containerRef = React.createRef();
  }
  componentDidMount() {
    const { file } = this.props;
    if (!!file.blob) {
      const url = window.URL.createObjectURL(new Blob([file.blob]));
      this.initAmi(url);
    }
  }

  render() {
    return (
      <div className="ami-viewer">
        <div id="my-gui-container" />
        <div ref={this.containerRef} id="container" />
      </div>
    );
  }

  // Description: Run AMI CODE ***** working to be abstracted out
  initAmi = (file: string) => {
    const container = this.containerRef.current;
    if (!!container) {
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      renderer.setClearColor(colors.black, 1);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const OrthograhicCamera = orthographicCameraFactory(THREE);
      const width = container.clientWidth,
        height = container.clientHeight;
      // type => ( left : number, right : number, top : number, bottom : number, near : number =  0.1, far : number = 2000 ) => void
      const camera = new OrthograhicCamera(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        0.1,
        2000
      );

      // Setup controls
      const TrackballOrthoControl = trackballOrthoControlFactory(THREE);
      const controls = new TrackballOrthoControl(camera, container);
      controls.staticMoving = true;
      controls.noRotate = true;
      camera.controls = controls;

      const onWindowResize = () => {
        camera.canvas = {
          width: container.offsetWidth,
          height: container.offsetHeight,
        };
        camera.fitBox(2);
        renderer.setSize(container.offsetWidth, container.offsetHeight);
      };
      // window.addEventListener("resize", onWindowResize, false);

      const loader = new AMI.VolumeLoader(container);
      loader
        .load(file)
        .then(() => {
          const series = loader.data[0].mergeSeries(loader.data);
          const stack = series[0].stack[0];
          loader.free();

          // const stackHelper = new AMI.StackHelper(stack);
          const StackHelper = stackHelperFactory(THREE);
          const stackHelper = new StackHelper(stack);
          stackHelper.bbox.visible = false;
          stackHelper.border.color = colors.black;
          scene.add(stackHelper);

          // Add the control box
          // gui(stackHelper);

          // center camera and interactor to center of bouding box
          const worldbb = stack.worldBoundingBox();
          const lpsDims = new THREE.Vector3(
            worldbb[1] - worldbb[0],
            worldbb[3] - worldbb[2],
            worldbb[5] - worldbb[4]
          );

          const box = {
            center: stack.worldCenter().clone(),
            halfDimensions: new THREE.Vector3(
              lpsDims.x + 10,
              lpsDims.y + 10,
              lpsDims.z + 10
            ),
          };

          // init and zoom
          const canvas = {
            width: container.clientWidth,
            height: container.clientHeight,
          };
          camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
          camera.box = box;
          camera.canvas = canvas;
          camera.update();
          camera.fitBox(2);

          // Bind event handler at the end
          window.addEventListener("resize", onWindowResize, false);
          this._removeResizeEventListener = () =>
            window.removeEventListener("resize", onWindowResize, false);
        })
        .catch((error: any) => {
          console.error(error);
        });

      // Render gui controls and scene
      const animate = () => {
        controls.update();
        renderer.render(scene, camera);

        requestAnimationFrame(() => {
          animate();
        });
      };

      animate();

      // Description: Builds the control box on the top right:
      //eslint-disable-next-line
      const gui = (stackHelper: any) => {
        const gui = new dat.GUI({
          autoPlace: false,
        });

        const customContainer = document.getElementById("my-gui-container");
        !!customContainer && customContainer.appendChild(gui.domElement);
        const camUtils = {
          invertRows: false,
          invertColumns: false,
          rotate45: false,
          rotate: 0,
          orientation: "default",
          convention: "radio",
        };

        // camera
        const cameraFolder = gui.addFolder("Camera");
        const invertRows = cameraFolder.add(camUtils, "invertRows");
        invertRows.onChange(() => {
          camera.invertRows();
        });

        const invertColumns = cameraFolder.add(camUtils, "invertColumns");
        invertColumns.onChange(() => {
          camera.invertColumns();
        });

        const rotate45 = cameraFolder.add(camUtils, "rotate45");
        rotate45.onChange(() => {
          camera.rotate();
        });

        cameraFolder.add(camera, "angle", 0, 360).step(1).listen();

        const orientationUpdate = cameraFolder.add(camUtils, "orientation", [
          "default",
          "axial",
          "coronal",
          "sagittal",
        ]);
        orientationUpdate.onChange((value: any) => {
          camera.orientation = value;
          camera.update();
          camera.fitBox(2);
          stackHelper.orientation = camera.stackOrientation;
        });

        const conventionUpdate = cameraFolder.add(camUtils, "convention", [
          "radio",
          "neuro",
        ]);
        conventionUpdate.onChange((value: any) => {
          camera.convention = value;
          camera.update();
          camera.fitBox(2);
        });

        cameraFolder.open();

        const stackFolder = gui.addFolder("Stack");
        stackFolder
          .add(stackHelper, "index", 0, stackHelper.stack.dimensionsIJK.z - 1)
          .step(1)
          .listen();
        stackFolder
          .add(stackHelper.slice, "interpolation", 0, 1)
          .step(1)
          .listen();
        stackFolder.open();
      };
    }
  };
  componentWillUnmount() {
    !!this._removeResizeEventListener && this._removeResizeEventListener();
  }
}

// Will move out!
const colors = {
  darkGrey: 0x353535,
  white: 0xffffff,
  black: 0x000000,
  red: 0xff0000,
};

export default DcmImage;
