import { Button } from "@patternfly/react-core";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

const CreatePipeline = () => {
  const history = useHistory();
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    axios
      .post(
        `https://store.outreachy.chrisproject.org/api/v1/pipelines/`,
        {
          "template": {
            "data": [
              {
                "name": "name",
                "value": "Fetal Brain Reconstruction Pipeline v2.0.0"
              },
              {
                "name": "authors",
                "value": "Jane Doe <Jane.Doe@gmail.com>"
              },
              {
                "name": "Category",
                "value": "MRI"
              },
              {
                "name": "description",
                "value": "Fetal brain reconstruction pipeline developed by Kiho's group at the FNNDSC. Features machine-learning based brain masking and quality assessment."
              },
              {
                "name": "locked",
                "value": false
              },
              {
                "name": "plugin_tree",
                "value": [
                  {
                    "plugin_name": "pl-fetal-brain-mask",
                    "plugin_version": "1.2.1",
                    "previous_index": null
                  },
                  {
                    "plugin_name": "pl-ANTs_N4BiasFieldCorrection",
                    "plugin_version": "0.2.7.1",
                    "previous_index": 0,
                    "plugin_parameter_defaults": [
                      {
                        "name": "inputPathFilter",
                        "default": "extracted/0.0/*.nii"
                      }
                    ]
                  },
                  {
                    "plugin_name": "pl-fetal-brain-assessment",
                    "plugin_version": "1.3.0",
                    "previous_index": 1
                  },
                  {
                    "plugin_name": "pl-irtk-reconstruction",
                    "plugin_version": "1.0.3",
                    "previous_index": 2
                  }
                ]
              }
            ]
          }
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Token " + window.sessionStorage.getItem("CHRIS_TOKEN")
          },
        }
      )
      .then((res) => {
        console.log("Post request made", res);
      })
      .catch((errors) => {
        console.error(errors);
      });
  }, [clicked]);

  return (
    <div>
      <Button
        isLarge
        style={{ borderRadius: "4px" }}
        variant="primary"
        // onClick={() => history.push("/pipelines")}
        onClick={() => setClicked(true)}
      >
        Create Pipeline
      </Button>
    </div>
  );
};

export default CreatePipeline;
