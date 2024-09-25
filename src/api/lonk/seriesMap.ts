import { immerable } from "immer";

/**
 * A wrapper around {@link Map} where the key is (pacs_name, SeriesInstanceUID).
 */
class SeriesMap<T> {
  [immerable] = true;

  private readonly map: Map<string, T>;

  public constructor() {
    this.map = new Map();
  }

  /**
   * Get a value for a DICOM series.
   */
  public get(pacs_name: string, SeriesInstanceUID: string): T | undefined {
    const key = this.keyOf(SeriesInstanceUID, pacs_name);
    return this.map.get(key);
  }

  /**
   * Set a value for a DICOM series.
   */
  public set(pacs_name: string, SeriesInstanceUID: string, value: T) {
    const key = this.keyOf(SeriesInstanceUID, pacs_name);
    this.map.set(key, value);
  }

  /**
   * Get and remove a value for a DICOM series.
   */
  public pop(pacs_name: string, SeriesInstanceUID: string): T | null {
    const key = this.keyOf(SeriesInstanceUID, pacs_name);
    const value = this.map.get(key);
    this.map.delete(key);
    return value || null;
  }

  private keyOf(pacs_name: string, SeriesInstanceUID: string): string {
    return JSON.stringify({ SeriesInstanceUID, pacs_name });
  }

  /**
   * Get the entries `[pacs_name, SeriesInstanceUID, value]`
   */
  public entries(): [string, string, T][] {
    // when we upgrade to TS 5.9, use Iterator.map instead of Array.map
    return Array.from(this.map.entries()).map(([key, value]) => {
      const { pacs_name, SeriesInstanceUID } = JSON.parse(key);
      return [pacs_name, SeriesInstanceUID, value];
    });
  }
}

export default SeriesMap;
