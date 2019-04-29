import * as React from "react";
import FeedFileModel, { IFeedFile } from "../../api/models/feed-file.model";
import { getFileExtension } from "../../api/models/file-explorer.model";
import { IGalleryItem } from "../../api/models/gallery.model";
import * as dat from "dat.gui";
import * as THREE from "three";
import * as AMI from "ami.js";
import {
  orthographicCameraFactory,
  stackHelperFactory,
  trackballOrthoControlFactory
} from "ami.js";
import "./amiViewer.scss";
import { IGalleryState } from "../../store/gallery/types";

type AllProps = {
  galleryItem: IGalleryItem;
  galleryItems: IGalleryItem[];
} & IGalleryState;
interface IState {
  imageArray: string[];
  totalFiles: number;
  totalLoaded: number;
  totalParsed: number;
}
// Description: Will be replaced with a DCM Fyle viewer
class DcmImageSeries extends React.Component<AllProps, IState> {
  _isMounted = false;
  constructor(props: AllProps) {
    super(props);
    const imageArray = this._getUrlArray();
    this.state = {
      imageArray,
      totalFiles: imageArray.length,
      totalLoaded: 0,
      totalParsed: 0
    };
  }
  componentDidMount() {
    this._isMounted = true;
    this.initAmi();
  }

  // Only user dcm file - can add on to this
  _getUrlArray(): string[] {
    return this.props.galleryItems
      .filter((item: IGalleryItem) => {
        return getFileExtension(item.fileName).toLowerCase() === "dcm";
      })
      .map((item: IGalleryItem) => {
        return item.file_resource;
      });
  }

  render() {
    return (
      <React.Fragment>
        {this.state.totalParsed < this.state.totalFiles && (
          <div className="loader">
            {`${this.state.totalParsed} of ${this.state.totalFiles}  loaded`}
          </div>
        )}
        <div className="ami-viewer">
          <div id="container" />
        </div>
      </React.Fragment>
    );
  }

  // Description: Run AMI CODE ***** working to be abstracted out
  // Ami methods and props - working *****
  private _stackHelper: any;
  private _currentIndex: number = 0;
  private _playInterval: any = undefined;
  handleClick(index: number) {
    this._stackHelper.index = this._currentIndex = this._currentIndex + index; // working ***** Needs to stop on end or loop
  }
  handlePlay() {
    const _self = this;
    this._playInterval = setInterval(() => {
      _self._stackHelper.index = this._currentIndex++; // Needs to stop on end or loop
    }, 200);
  }
  handlePause() {
    clearInterval(this._playInterval);
  }
  // Description: Run AMI CODE ***** working to be abstracted out
  initAmi = () => {
    const { galleryItems } = this.props;
    const container = document.getElementById("container"); // console.log("initialize AMI", this.state, container);
    if (!!container) {
      const renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      renderer.setClearColor(colors.black, 1);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const OrthograhicCamera = orthographicCameraFactory(THREE);
      const width = container.clientWidth,
        height = container.clientHeight;
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
          height: container.offsetHeight
        };
        camera.fitBox(2);
        renderer.setSize(container.offsetWidth, container.offsetHeight);
      };
      window.addEventListener("resize", onWindowResize, false);

      // Deal with the loader
      this._loadUrls(galleryItems)
        .then((series: any) => {
          // merge series
          const mergedSeries = series[0].mergeSeries(series);
          const firstSeries = mergedSeries[0];
          return firstSeries;
        })
        .then((series: any) => {
          const stack = series.stack[0];

          // Init and configure the stackHelper:
          const StackHelper = stackHelperFactory(THREE);
          const stackHelper = new StackHelper(stack);
          stackHelper.bbox.visible = false;
          stackHelper.border.color = colors.black;
          stackHelper.index = this._currentIndex; // begin at index selected = ASSIGN HERE
          console.log(this._currentIndex);
          // Init the Scene:
          scene.add(stackHelper);

          // Add the control box
          // gui(stackHelper);
          this._stackHelper = stackHelper;

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
            )
          };

          // init and zoom
          const canvas = {
            width: container.clientWidth,
            height: container.clientHeight
          };
          camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
          camera.box = box;
          camera.canvas = canvas;
          camera.update();
          camera.fitBox(2);
        })
        .catch((error: any) => {
          console.error(error);
        });

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
          autoPlace: false
        });
        const customContainer = document.getElementById("my-gui-container");
        !!customContainer && customContainer.appendChild(gui.domElement);
        const stackFolder = gui.addFolder("Stack");
        stackFolder
          .add(stackHelper, "index", 0, stackHelper.stack.dimensionsIJK.z - 1)
          .step(1)
          .listen();
        stackFolder.open();
      };
    }
  };

  // Getting Images
  _loadUrls(galleryItems: IGalleryItem[]) {
    const loadSequences = new Array();
    galleryItems.forEach((_galleryItem: IGalleryItem) => {
      const url = _galleryItem.file_resource;
      // ONLY PUSH FILES THAT ARE READABLE - to be completed ***** working
      const isDicomFile =
        getFileExtension(_galleryItem.fileName).toLowerCase() === "dcm";
      isDicomFile && loadSequences.push(this._loadUrl(url));
    });
    return Promise.all(loadSequences);
  }

  _loadUrl(url: string) {
    const _self = this;
    const loader = new AMI.VolumeLoader();
    const fetcher = this._fetchUrl(url);
    return fetcher
      .then((arrayBuffer: any) => {
        const totalLoaded = this.state.totalLoaded + 1;
        _self._isMounted && this.setState({
          totalLoaded
        });
        return loader
          .parse({
            url,
            buffer: arrayBuffer
          })
          .then((response: any) => {
            const totalParsed = this.state.totalParsed + 1;
            _self._isMounted && this.setState({
              totalParsed
            });
            return response;
          });
      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  _fetchUrl(url: string) {
    return FeedFileModel.getFileArrayArray(url).then((response: any) => {
      return response.data;
    });
  }

  // Destroy Methods
  componentWillUnmount() {
    clearInterval(this._playInterval);
    this._isMounted = false;
  }
}

// Will move out!
const colors = {
  darkGrey: 0x353535,
  white: 0xffffff,
  black: 0x000000,
  red: 0xff0000
};

// const mapStateToProps = ({ gallery }: ApplicationState) => ({
//   galleryItem: gallery.galleryItem,
//   galleryItems: gallery.galleryItems
// });

// export default connect(
//   mapStateToProps,
//   null
// )(DcmImageSeries);
export default DcmImageSeries;
