import { Root as HTMLRoot } from "hast"
import { visit } from "unist-util-visit"
import { QuartzTransformerPlugin } from "../types"

function getHeaderLevel(tagName: string): number | null {
  const match = tagName.match(/^h(\d)$/i)
  return match ? parseInt(match[1], 10) : null
}

function getHeaderText(node: any): string {
  let text = ""
  
  if (node.children) {
    for (const child of node.children) {
      if (child.type === "text") {
        text += child.value
      } else if (child.children) {
        text += getHeaderText(child)
      }
    }
  }
  
  return text.trim()
}

export const RemoveDMHeaderSections: QuartzTransformerPlugin<{}> = () => {
  return {
    name: "RemoveDMHeaderSections",
    htmlPlugins() {
      return [
        () => {
          return async (tree: HTMLRoot, file) => {
            const nodesToRemove: Array<{ index: number, parent: any }> = []
            
            visit(tree, "element", (node, index, parent) => {
              if (!parent || typeof index !== "number") return
              
              // Check if this is a header element
              const headerLevel = getHeaderLevel(node.tagName)
              if (!headerLevel) return
              
              // Check if header text starts with "(DM Note)"
              const headerText = getHeaderText(node)
              if (!headerText.startsWith("(DM Note)")) return
              
              // Found a DM Note header - mark it for removal
              nodesToRemove.push({ index, parent })
              
              // Find all subsequent elements to remove until next header of same or higher level
              const siblings = parent.children
              for (let i = index + 1; i < siblings.length; i++) {
                const sibling = siblings[i]
                
                if (sibling.type === "element") {
                  const siblingHeaderLevel = getHeaderLevel(sibling.tagName)
                  
                  // Stop if we hit a header of same or higher level (lower number = higher level)
                  if (siblingHeaderLevel && siblingHeaderLevel <= headerLevel) {
                    break
                  }
                }
                
                // Mark this sibling for removal
                nodesToRemove.push({ index: i, parent })
              }
            })
            
            // Remove nodes in reverse order to maintain correct indices
            nodesToRemove.sort((a, b) => b.index - a.index)
            
            for (const { index, parent } of nodesToRemove) {
              parent.children.splice(index, 1)
            }
          }
        },
      ]
    },
  }
}