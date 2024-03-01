import { TagsDictionary } from "../types";
import { Label, LabelProps } from "@patternfly/react-core";

const COLORS: ReadonlyArray<LabelProps["color"]> = [
  "blue",
  "cyan",
  "green",
  "grey",
  "orange",
  "purple",
  "red",
  "grey",
  "gold",
];

type TagColorMapping = { [key: string]: LabelProps["color"] };

/**
 * Assigns colors to key-value pairs. The colors are to be used for
 * {@link Label} components.
 */
class TagColors {
  private readonly colorFor: TagColorMapping;

  /**
   * Since the number of colors we can use is small relative to the infinite
   * possible tag key-value pairs, the color-to-tag assignment algorithm works
   * like this:
   *
   * 1. If tag has a large number of possible values, it remains uncolored.
   * 2. Tags with few possible values are prioritized for color assignment.
   */
  constructor(tagsDictionary: TagsDictionary) {
    const entries = Object.entries(tagsDictionary)
      // tags with too many possible values should not be given colors
      .filter(([_name, values]) => values.length <= COLORS.length / 2 + 1)
      // sort in ascending order of number of possible values
      .sort(([_aName, a], [_bName, b]) => a.length - b.length)
      .reduce((acc: [string, LabelProps["color"]][], [key, values]) => {
        if (values.length > COLORS.length - acc.length) {
          return acc;
        }
        // allocate colors to tag values
        const colors = COLORS.slice(acc.length, acc.length + values.length);
        const keys = values.map((value) => `${key}:${value}`);
        return acc.concat(colors.map((color, i) => [keys[i], color]));
      }, []);
    this.colorFor = Object.fromEntries(entries);
  }

  getColor(key: string, value: string): LabelProps["color"] {
    return this.colorFor[`${key}:${value}`];
  }
}

export default TagColors;
