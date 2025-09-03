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
            visit(tree, "element", (node, index, parent) => {
              if (!parent || typeof index !== "number") return
              
              // Check if this is a header element
              const headerLevel = getHeaderLevel(node.tagName)
              if (!headerLevel) return
              
              // Check if header text starts with DM variations (case insensitive)
              const headerText = getHeaderText(node).toLowerCase()
              const dmPatterns = ["(dm note)", "(dm notes)", "(dm only)", "(dm)"]
              if (!dmPatterns.some(pattern => headerText.startsWith(pattern))) return
              
              // Found a DM Note header - remove it and everything until the next equal/higher level header
              const siblings = parent.children
              const elementsToRemove: any[] = [node] // Start with the DM header itself
              
              // Find all subsequent elements to remove until next header of same or higher level
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
                elementsToRemove.push(sibling)
              }
              
              // Remove all marked elements
              for (const elementToRemove of elementsToRemove) {
                const elementIndex = siblings.indexOf(elementToRemove)
                if (elementIndex !== -1) {
                  siblings.splice(elementIndex, 1)
                }
              }
              
              // Return "skip" to avoid processing removed nodes
              return ["skip", index]
            })
          }
        },
      ]
    },
  }
}