/**
 * A wrapper around {@link Map} where the key is (pacs_name, SeriesInstanceUID).
 */
class SeriesMap<T> {
  private readonly map: Map<string, T>;

  public constructor() {
    this.map = new Map();
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
}

export default SeriesMap;
