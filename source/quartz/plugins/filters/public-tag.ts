import { QuartzFilterPlugin } from "../types"

export const PublicTag: QuartzFilterPlugin<{}> = () => ({
  name: "PublicTag",
  shouldPublish(_ctx, [_tree, vfile]) {
    const tags: string[] = vfile.data?.frontmatter?.tags || []
    return Array.isArray(tags) ? tags.includes("public") : false
  },
})