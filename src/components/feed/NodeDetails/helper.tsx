/**
 * Extract the required API URI of the selected feed.
 * 
 * @param plugin the selected plugin
 * @returns the API URI of the selected feed as a string.
 */

export function getFilesHref(plugin: any) {
    return plugin?.collection.items[0].links.find((obj:any) => (obj.rel === "files")).href
}