"use client"

import { useEffect, useRef, useState } from 'react'
import {
  GraphComponent,
  GraphEditorInputMode,
  License,
  IGraph,
  Rect,
  Size,
  //ShapeNodeStyle,
  GraphItemTypes,
  GroupNodeStyle,
  INode,
  Point,
  LayoutExecutor,
  MinimumNodeSizeStage,
  ComponentLayout,
  ComponentLayoutData
  
} from '@yfiles/yfiles'
import yfLicense from "@/lib/license.json"
import { ZoomControls } from '@/components/ZoomControls'
import { Toolbar } from '@/components/Toolbar'
import { LeftPanel } from '@/components/LeftPanel'
import { ReactComponentNodeStyle } from '@/utils/ReactComponentNodeStyle'
import { NodeTemplate } from '@/components/yfiles/NodeTemplate'
import { AnnotationToolbar } from '@/components/AnnotationToolbar'

// You'll need to provide your yFiles license here
License.value = yfLicense

export default function YFilesCanvas() {
  const graphComponentRef = useRef<GraphComponent | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isArrowMode, setIsArrowMode] = useState(false)
  const [isStickyMode, setIsStickyMode] = useState(false)
  const [isTextMode, setIsTextMode] = useState(false)

  useEffect(() => {
    if (!containerRef.current || graphComponentRef.current) {
      return
    }

    // Initialize the GraphComponent
    const graphComponent = new GraphComponent(containerRef.current)
    graphComponentRef.current = graphComponent

    // Configure basic interaction
    const graph = graphComponent.graph
    configureGraph(graph)
    

    // Create 5 flowcharts with random nodes
    createFlowchartGroups(graph)

    // Enable editing
    graphComponent.inputMode = new GraphEditorInputMode({
      selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
      allowEditLabel: true,
      allowCreateNode: false

    })

    graphComponent.inputMode.addEventListener('item-right-clicked', (args) => {
      console.log("Graph Right Clicked", args.item)
    })


    // Apply layout and fit the graph
    applyLayoutAndFit(graphComponent)
    
    return () => {
      // Clean up on unmount
      graphComponent.cleanUp()
      graphComponentRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || graphComponentRef.current) {
      return
    }
    //Annotation actions here
  }, [isArrowMode, isStickyMode, isTextMode])

  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 25));
  const handleZoomReset = () => setZoom(100);

  return (
    <div className="relative h-full w-full">
      
      <LeftPanel />
      <Toolbar 
       onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onArrowTool={() => setIsArrowMode(true)}
        onStickyNote={() => setIsStickyMode(true)}
        onTextTool={() => setIsTextMode(true)}
      />
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      <AnnotationToolbar onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}/>
      <ZoomControls 
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />
    </div>
  )
}

function configureGraph(graph: IGraph) {
  // Configure default styles for nodes and edges
  graph.nodeDefaults.style = new ReactComponentNodeStyle(NodeTemplate)

  graph.nodeDefaults.size = new Size(100, 60)

  // Configure group node style to be transparent
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: 'transparent',
    contentAreaFill: 'transparent',
    stroke: 'rgba(0, 0, 0, 0.2)',
    cornerRadius: 8,
    tabPosition: 'top-leading',
    tabWidth: 120,
    tabHeight: 24
  })

}

function createFlowchartGroups(graph: IGraph) {
  const flowchartNames = [
    'User Authentication Flow',
    'Payment Processing',
    'Data Validation Pipeline',
    'Notification System',
    'Report Generation'
  ]

  // Create main container group for all flowcharts
  const mainGroup = graph.createGroupNode()
 
  // Set transparent style for the main group (no outline)
  graph.setStyle(mainGroup, new GroupNodeStyle({
    tabFill: 'transparent',
    contentAreaFill: 'transparent',
    stroke: 'transparent',
    cornerRadius: 0,
    tabPosition: 'top-leading',
    tabWidth: 0,
    tabHeight: 0
  }))

  const groupPositions = [
    new Point(50, 50),
    new Point(450, 50),
    new Point(850, 50),
    new Point(250, 350),
    new Point(650, 350)
  ]
  flowchartNames.forEach((name, index) => {
    createFlowchart(graph, name, groupPositions[index], mainGroup)
  })
  
  // Adjust the main group bounds to fit all content
  graph.adjustGroupNodeLayout(mainGroup)
}

function createFlowchart(graph: IGraph, name: string, position: Point, parentGroup: INode) {
  // Generate random number of nodes between 5 and 10
  const nodeCount = Math.floor(Math.random() * 6) + 5
  
  // Create group node
  const groupNode = graph.createGroupNode()
  //graph.addLabel(groupNode, name)
  
  // Set this flowchart group as child of the main group
  graph.setParent(groupNode, parentGroup)
  
  const nodes: INode[] = []
  
  // Create nodes within the group
  for (let i = 0; i < nodeCount; i++) {
    const x = position.x + (i % 3) * 120
    const y = position.y + Math.floor(i / 3) * 80 + 40
    
    const node = graph.createNode(new Rect(x, y, 100, 60))
    graph.addLabel(node, `Step ${i + 1}`)
    graph.setParent(node, groupNode)
    nodes.push(node)
  }
  
  // Create edges to form a flowchart structure
  for (let i = 0; i < nodes.length - 1; i++) {
    // Create sequential connections
    if (i < nodes.length - 1) {
      graph.createEdge(nodes[i], nodes[i + 1])
    }
    
    // Add some branching (random connections)
    if (Math.random() > 0.7 && i < nodes.length - 2) {
      graph.createEdge(nodes[i], nodes[i + 2])
    }
  }
  
  // Adjust group bounds to fit content
  graph.adjustGroupNodeLayout(groupNode)
}

async function applyLayoutAndFit(graphComponent: GraphComponent) {
  // Apply hierarchical layout to each group
  const layout = new ComponentLayout()
  const layoutData = new ComponentLayoutData()
  
  // Apply layout
  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: new MinimumNodeSizeStage(layout),
    layoutData,
    animateViewport: true
  })
  
  try {
    await layoutExecutor.start()
    graphComponent.fitGraphBounds()
  } catch (error) {
    console.error('Layout failed:', error)
    graphComponent.fitGraphBounds()
  }
}
