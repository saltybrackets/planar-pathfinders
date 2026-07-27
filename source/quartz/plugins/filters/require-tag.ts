import { QuartzFilterPlugin } from "../types"
import { slugTag } from "../../util/path"

export interface Options {
  tag: string
}

export const RequireTag: QuartzFilterPlugin<Options> = (userOpts) => {
  if (!userOpts?.tag) {
    throw new Error("RequireTag filter requires a `tag` option")
  }
  const requiredTag = slugTag(userOpts.tag)

  return {
    name: "RequireTag",
    shouldPublish(_ctx, [_tree, vfile]) {
      const tags: string[] = vfile.data?.frontmatter?.tags || []
      return Array.isArray(tags) && tags.includes(requiredTag)
    },
  }
}
