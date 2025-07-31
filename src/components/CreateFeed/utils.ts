import type {
  Pipeline,
  PluginInstance,
  PluginMeta,
  Tag,
} from "@fnndsc/chrisapi";
import type { EventDataNode } from "rc-tree/lib/interface";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource, fetchResources } from "../../api/common";
import { fetchFolders } from "../NewLibrary";
import type { ChRISFeed, DataBreadcrumb } from "./types/feed";

import constants from "../../datasets/constants";

import type {
  NodeInfo,
  PipelineDefaultParameters,
  Piping,
} from "../../api/types";

export const computeWorkflowNodesInfo = (
  pipings: Piping[],
  params: PipelineDefaultParameters[],
): NodeInfo[] => {
  const theRet = pipings.map((each): NodeInfo => {
    return {
      piping_id: each.id,
      previous_piping_id: each.previous_id,
      compute_resource_name: "host",
      title: each.title,
    };
  });

  console.info(
    "utils.computeWorkflowNodesInfo: pipings:",
    pipings,
    "theRet:",
    theRet,
  );
  return theRet;
};

export const getFullFeedName = (
  analysisPrefix: string,
  chrisFeed: ChRISFeed,
) => {
  return `${analysisPrefix}${constants.ANALYSIS_CONCAT_CHAR}${chrisFeed.name}`;
};

export const displayFeedName = (analysisName: string, prefix = ""): string => {
  if (analysisName.length <= constants.MAX_DISPLAYNAME_LENGTH) {
    return analysisName;
  }

  // ensure prefix
  const analysisNameList = analysisName.split(constants.ANALYSIS_CONCAT_CHAR);
  const thePrefix = prefix ? prefix : analysisNameList[0];

  // remainAnalysis
  let remainAnalysisName = analysisName.substring(thePrefix.length);
  if (remainAnalysisName.length === 0) {
    return thePrefix;
  }

  if (remainAnalysisName[0] === constants.ANALYSIS_CONCAT_CHAR) {
    remainAnalysisName = remainAnalysisName.substring(1);
  }

  // remain-analysis
  const remainAnalysisNameList = remainAnalysisName.split(
    constants.ANALYSIS_CONCAT_CHAR,
  );
  remainAnalysisNameList.reverse();
  const remainLength =
    constants.MAX_DISPLAYNAME_LENGTH -
    prefix.length -
    constants.ANALYSIS_CONCAT_PHRASE.length -
    1;

  const origAnalysisNameList = analysisName.split(
    constants.ANALYSIS_CONCAT_CHAR,
  );
  // count from back
  origAnalysisNameList.reverse();
  const [_1, lastIndex, _2] = origAnalysisNameList.reduce(
    (r, eachName, i) => {
      const [eachTotalLength, _, eachIsEnd] = r;
      if (eachIsEnd) {
        return r;
      }
      const newTotalLength = eachTotalLength + eachName.length + 1;
      if (newTotalLength > remainLength) {
        return [eachTotalLength, i, true];
      }

      return [newTotalLength, i, false];
    },
    [0, 0, false],
  );

  const fitAnalyistNameList = origAnalysisNameList.slice(0, lastIndex);
  // reverse again.
  fitAnalyistNameList.reverse();

  return `${thePrefix}${constants.ANALYSIS_CONCAT_CHAR}${constants.ANALYSIS_CONCAT_PHRASE}${constants.ANALYSIS_CONCAT_CHAR}${fitAnalyistNameList.join(constants.ANALYSIS_CONCAT_CHAR)}`;
};

export const fetchTagList = async () => {
  const client = ChrisAPIClient.getClient();
  const params = {
    limit: 30,
    offset: 0,
  };
  const fn = client.getTags;
  const boundFn = fn.bind(client);
  const { resource } = await fetchResource<Tag>(params, boundFn);
  return resource;
};

export const getPlugins = async (
  name: string,
  limit: number,
  offset: number,
  type: string,
) => {
  const client = ChrisAPIClient.getClient();
  const params = { name, limit, offset, type };
  const fn = client.getPluginMetas;
  const boundFn = fn.bind(client);
  const { resource: plugins, totalCount } = await fetchResource<PluginMeta>(
    params,
    boundFn,
  );

  return {
    plugins,
    totalCount,
  };
};

export const getNewTreeData = (
  treeData: DataBreadcrumb[],
  curKey: string,
  child: DataBreadcrumb[],
) => {
  const loop = (data: DataBreadcrumb[]) => {
    data.forEach((item) => {
      if (
        curKey.indexOf(item.key as string) === 0 ||
        (item.key as string).indexOf(curKey) === 0
      ) {
        if (item.children) {
          loop(item.children);
        } else if (item.key === curKey) {
          item.children = child;
        }
      }
    });
  };

  loop(treeData);
};

export const generateTreeNodes = async (
  treeNode: EventDataNode<any>,
): Promise<DataBreadcrumb[]> => {
  const arr: {
    breadcrumb: string;
    title: string;
    key: string;
    isLeaf: boolean;
    checkable: boolean;
  }[] = [];

  const {
    subFoldersMap: fetchSubFoldersMap,
    linkFilesMap: fetchLinkFilesMap,
    filesMap: fetchFilesMap,
  } = await fetchFolders(treeNode.breadcrumb);
  const subFoldersMap = fetchSubFoldersMap || [];
  const linkFilesMap = fetchLinkFilesMap || [];
  const filesMap = fetchFilesMap || [];

  const items = [...subFoldersMap, ...linkFilesMap, ...filesMap];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.data.path) {
      // assume to be a folder or a link as files have fname's property
      const path = item.data.path;
      const fileNameList = path.split("/");
      const fileName = fileNameList[fileNameList.length - 1];

      arr.push({
        breadcrumb: path,
        title: fileName,
        key: `${treeNode.key}-${i}`,
        isLeaf: false,
        checkable: true,
      });
    } else {
      // assumed to be a file
      const path = item.data.fname;
      const fileNameList = path.split("/");
      const fileName = fileNameList[fileNameList.length - 1];
      arr.push({
        breadcrumb: `${treeNode.breadcrumb}/${fileName}`,
        title: fileName,
        key: `${treeNode.key}-${i}`,
        isLeaf: true,
        checkable: true,
      });
    }
  }

  return arr;
};

export const generatePipelineWithData = async (data: any) => {
  const client = ChrisAPIClient.getClient();
  const pipelineInstance: Pipeline = await client.createPipeline(data);
  try {
    const resources = await fetchResources(pipelineInstance);
    return {
      resources,
      pipelineInstance,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error(
      "Unhandled error. Please reach out to @devbabymri.org to report this error",
    );
  }
};

/**

This function takes a string input as its parameter and generates a random hex color code based on the input string. The color generated will always be the same for a given input string.
The function uses a simple hash function to generate a numerical hash value from the input string. It then uses the hash value to generate a color by selecting three values from the set of valid hex characters (0-9 and A-F), using the hash value as a seed to ensure that the same input string always generates the same color.
*/

export const stringToColour = (input: string) => {
  const letters = "0123456789ABCDEF";
  let hash = 0;
  /*
The hash value is generated using a simple hashing algorithm called the Fowler–Noll–Vo (FNV) hash function, which is commonly used in computer science to generate hash values for strings.
The FNV hash function is a non-cryptographic hash function that generates a hash value by multiplying and XORing the input data with a prime number.
*/

  for (let i = 0; i < input.length; i++) {
    /*
The charCodeAt() method is used to retrieve the Unicode value of each character in the string, which is then added to the current value of the hash variable. The expression ((hash << 5) - hash) is a bitwise operation that multiplies the current value of the hash variable by 31 (which is the prime number used by the FNV hash function).
Multiplying and XORing are two common bitwise operations that are used in computer science and cryptography.
Multiplying two numbers is a basic arithmetic operation that results in the product of the two numbers. However, in the context of bitwise operations, multiplication is performed on the binary representations of the numbers. For example, the binary representation of 5 is 101 and the binary representation of 3 is 011. If we multiply these two numbers using bitwise multiplication, we get 111, which is the binary representation of the decimal number 7.
XOR (exclusive OR) is another bitwise operation that is commonly used in computer science and cryptography. XOR is performed on two binary digits and results in a 1 if the digits are different and a 0 if they are the same. For example, if we XOR the binary digits 101 and 011, we get 110.
When it comes to hash functions, multiplying and XORing are used in combination to generate hash values for input data. In general, the idea is to take the input data, multiply it by a prime number, and then XOR the result with another value. This process is repeated for each byte of input data, and the final result is the hash value.
The specific details of how multiplication and XORing are used in a hash function depend on the particular algorithm being used. For example, the FNV hash function multiplies the input data by the prime number 31 and then XORs the result with the previous hash value

(hash << 5) shifts the binary representation of the value in the hash variable to the left by 5 bits. This means that the bits in the binary representation are shifted to the left by 5 places, and the new bits on the right are filled with zeros. For example, if the value of hash is 00110011, then (hash << 5) would be 11001100000.
The resulting value is then subtracted from the original hash value, resulting in (hash << 5) - hash. The purpose of this operation depends on the context of the code, but in the case of hash functions, this is a common step in generating a hash value.
This operation is often used in hash functions to create a unique hash value that is dependent on the input data. The << operator is used to create a "rolling" hash, where the hash value for each byte of input data is calculated using the previous hash value. The subtraction of the shifted value from the original hash value creates a sort of "interference" between the bits in the hash value, helping to ensure that small changes in the input data result in large changes in the resulting hash value. This can help to prevent collisions, where two different input values result in the same hash value.
*/

    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }

  /*
In each iteration of the loop, the code takes the hash value and shifts it right by i * 8 bits using the >> operator. This means that in the first iteration, the lowest 8 bits of the hash value are used to calculate the color, in the second iteration the next 8 bits, and so on. The resulting value is then ANDed with 0xFF, which is 255 in decimal and 11111111 in binary. This masks the value to only include the lowest 8 bits.
The resulting value is then used to index into the letters string using the modulo operator %. This ensures that the index is always between 0 and 15, which is the range of valid hexadecimal digits. The character at the resulting index is added to the color string.
After the loop has finished running three times, the color string contains a valid hexadecimal color code that is based on the hash value. The resulting color code is in the format #RRGGBB, where RR, GG, and BB are two-digit hexadecimal values that represent the red, green, and blue components of the color, respectively.
*/
  let color = "#";

  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;

    color += letters[value % 16];
  }

  return color;
};

/*
The format #RRGGBB is a notation used to represent a color using hexadecimal notation. In this format, the color is represented by three pairs of two-digit hexadecimal values. The first pair represents the red component of the color, the second pair represents the green component, and the third pair represents the blue component.
The two-digit hexadecimal values in each pair range from 00 to FF, which represent the decimal values from 0 to 255. The first digit in each pair represents the most significant bits, and the second digit represents the least significant bits.
For example, the color #FF0000 represents a shade of red. The FF in the first pair represents the maximum value of the red component, indicating that the color is fully saturated with red. The 00 in the second and third pairs represents the minimum value of the green and blue components, respectively, indicating that there is no green or blue in the color.
Similarly, the color #00FF00 represents a shade of green, and the color #0000FF represents a shade of blue. By combining different values for the red, green, and blue components, it is possible to create a wide range of different colors, from bright and saturated to pale and pastel.
*/

export async function fetchComputeInfo(
  plugin_id: number,
  dictionary_id: number,
) {
  const client = ChrisAPIClient.getClient();
  const computeEnvs = await client.getComputeResources({
    plugin_id: `${plugin_id}`,
  });

  if (computeEnvs.getItems()) {
    const computeEnvData = {
      [dictionary_id]: {
        computeEnvs: computeEnvs.data,
        currentlySelected: computeEnvs.data[0].name,
      },
    };
    return computeEnvData;
  }
  return undefined;
}
