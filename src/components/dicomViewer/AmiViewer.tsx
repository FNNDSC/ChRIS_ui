import * as React from "react";
import { Link } from "react-router-dom";
import { HomeIcon } from "@patternfly/react-icons";
import FeedFileModel, { IFeedFile } from "../../api/models/feed-file.model";
import { IFileState, getFileExtension } from "../../api/models/file-explorer";
import * as dat from "dat.gui";
import * as THREE from "three";
import * as AMI from "ami.js";
import {
  orthographicCameraFactory,
  stackHelperFactory,
  trackballOrthoControlFactory
} from "ami.js";
import "./amiViewer.scss";

type AllProps = {
  files: IFeedFile[];
};

// Description: Will be replaced with a DCM Fyle viewer
class AmiViewer extends React.Component<AllProps, IFileState> {
  dynamicImagePixelData: string | ArrayBuffer | null = null;
  constructor(props: AllProps) {
    super(props);
    const { files } = this.props;

    const tempUrl =
      "http://fnndsc.childrens.harvard.edu:8001/api/v1/plugins/instances/files/101/0101-1.3.12.2.1107.5.2.32.35201.2013101416341221810103029.dcm";
    this.fetchData(tempUrl);
  }
  state = {
    blob: undefined,
    blobName: "",
    blobText: null,
    fileType: ""
  };

  // Description: Fetch blob and read it into state to display preview
  fetchData(file_resource: string) {
    const file = "https://cdn.rawgit.com/FNNDSC/data/master/nifti/adi_brain/adi_brain.nii.gz";
    const tempUrl =
      "http://fnndsc.childrens.harvard.edu:8001/api/v1/plugins/instances/files/101/0101-1.3.12.2.1107.5.2.32.35201.2013101416341221810103029.dcm";
    FeedFileModel.getFileBlob(file_resource).then((result: any) => {
      const _self = this;
      const fileType = getFileExtension(
        "0001-1.3.12.2.1107.5.2.32.35201.2013101416335447259100817.dcm"
      );
      this.setState({ blob: result.data, blobName: "temp", fileType });
      if (!!result.data) {
        const reader = new FileReader();
        reader.addEventListener(
          "load",
          () => {
            _self.setState({ blobText: reader.result });
            const url = window.URL.createObjectURL(new Blob([result.data]));
            (!!this.state.blob) && this.runAMICode(url);
          },
          false
        );
        reader.readAsDataURL(result.data); // reader.readAsDataURL(file);
      }
    });
  }

  render() {
    return (
      <div className="ami-viewer">
        <h1 className="pf-u-mb-lg">
          <Link to={`/`} className="pf-u-mr-lg">
            <HomeIcon />
          </Link>
          Ami Viewer: {this.props.files.length} files
        </h1>
        <div id="my-gui-container"></div>
        <div id="container" />
      </div>
    );
  }

  // Description: Run AMI CODE ***** working to be abstracted out
  runAMICode = (file: string) => {
    const container = document.getElementById("container"); // console.log("initialize AMI", this.state, container);
    if (!!container) {
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
      // console.log("renderer: ", renderer);
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      renderer.setClearColor(colors.black, 1);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const OrthograhicCamera = orthographicCameraFactory(THREE);
      const camera = new OrthograhicCamera(
        container.clientWidth / -2,
        container.clientWidth / 2,
        container.clientHeight / 2,
        container.clientHeight / -2,
        0.1,
        10000
      );

      // Setup controls
      const TrackballOrthoControl = trackballOrthoControlFactory(THREE);
      const controls = new TrackballOrthoControl(camera, container);
      // const controls = new AMI.TrackballOrthoControl(camera, container);
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
      window.addEventListener("resize", onWindowResize, false);
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
          stackHelper.border.color = colors.white;
          scene.add(stackHelper);

          // Add the control box
          gui(stackHelper);

          // center camera and interactor to center of bouding box
          const worldbb = stack.worldBoundingBox();
          const lpsDims = new THREE.Vector3(
            worldbb[1] - worldbb[0],
            worldbb[3] - worldbb[2],
            worldbb[5] - worldbb[4]
          );

          const box = {
            center: stack.worldCenter().clone(),
            halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10),
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
        }).catch((error: any) => {
          window.console.log("oops... something went wrong...");
          window.console.log(error);
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

        cameraFolder
          .add(camera, "angle", 0, 360)
          .step(1)
          .listen();

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

        const conventionUpdate = cameraFolder.add(camUtils, "convention", ["radio", "neuro"]);
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
  }
}
// Will move out!
const colors = {
  darkGrey: 0x353535,
  white: 0xffffff,
  black: 0x000000,
  red: 0xff0000
};


export default AmiViewer;
