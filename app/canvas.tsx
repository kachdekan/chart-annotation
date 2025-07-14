"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  GraphComponent,
  GraphEditorInputMode,
  License,
  IGraph,
  IEdge,
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
import { Toolbar, ToolbarMode} from '@/components/Toolbar'
import { LeftPanel } from '@/components/LeftPanel'
import { ReactComponentNodeStyle } from '@/utils/ReactComponentNodeStyle'
import { NodeTemplate } from '@/components/yfiles/NodeTemplate'
import { AnnotationToolbar } from '@/components/AnnotationToolbar'

// You'll need to provide your yFiles license here
License.value = yfLicense


export default function YFilesCanvas() {
  const graphComponentRef = useRef<GraphComponent | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [toolbarState, setToolbarState] = useState({
    arrowMode: false,
    stickyMode: false,
    textMode: false,
    sectionMode: false
  })
  // Ref to always hold latest toolbarState
  const toolbarStateRef = useRef(toolbarState);

  const setToolbarMode =(mode: ToolbarMode) => {
    const newState = {
      arrowMode: false,
      stickyMode: false,
      textMode: false,
      sectionMode: false
    };
    if(mode) newState[mode] = !toolbarState[mode]
    setToolbarState(newState);
  }
  //let sections: INode[] | null = null

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

   

    // Apply layout and fit the graph
    applyLayoutAndFit(graphComponent)
    
    return () => {
      // Clean up on unmount
      graphComponent.cleanUp()
      graphComponentRef.current = null
    }
  }, [])

  // Keep toolbarStateRef in sync with toolbarState
  useEffect(() => {
    toolbarStateRef.current = toolbarState;
  }, [toolbarState]);

  useEffect(() => {
    if (!graphComponentRef.current) {
      return;
    }
    const graphComponent = graphComponentRef.current;
    // Cast to correct type to ensure add/removeEventListener exists
    const inputMode = graphComponent.inputMode as any;
    // Handler that always uses the latest toolbarState
    const handleCanvasClicked = (args: any) => {
      const toolbar = toolbarStateRef.current;
      console.log("Updated", toolbar);
      const location = args.location;
      if (toolbar.arrowMode) {
        console.log("Arrow Mode is Enabled");
        const node1 = graphComponent.graph.createNode(
          new Rect(location.x, location.y, 1, 1),
        );
        const port1 = graphComponent.graph.addPort(node1);
        const node2 = graphComponent.graph.createNode(
          new Rect(location.x + 150, location.y, 1, 1),
        );
        const port2 = graphComponent.graph.addPort(node2);
        graphComponent.graph.createEdge(port1, port2);
      } else if (toolbar.stickyMode) {
        console.log("Sticky mode enabled");
        const node = graphComponent.graph.createNode(
          new Rect(location.x - 75, location.y - 50, 200, 250),
          new ReactComponentNodeStyle(() => (
            <g>
              {/* Background rectangle with border */}
              <rect
                width={200}
                height={250}
                rx="8" // rounded corners
                fill="#FFFFC5"
                strokeWidth={1.5}
              />
            </g>
          ))
        );
        graphComponent.graph.addLabel(node, "Double-click to edit Sticky");
      } else if (toolbar.textMode) {
        console.log("Text mode enabled");
        const node = graphComponent.graph.createNode(
          new Rect(location.x - 100, location.y - 25, 200, 50),
          new ReactComponentNodeStyle(() => (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-center">Double-click to edit text</p>
            </div>
          ))
        );
        graphComponent.graph.addLabel(node, "Double-click to edit");
      } else if (toolbar.sectionMode) {
        console.log("Section mode enabled");
      }
    };
    if (inputMode && typeof inputMode.addEventListener === 'function') {
      inputMode.addEventListener('canvas-clicked', handleCanvasClicked);
    }
    return () => {
      if (inputMode && typeof inputMode.removeEventListener === 'function') {
        inputMode.removeEventListener('canvas-clicked', handleCanvasClicked);
      }
    };
  }, [])

  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 25));
  const handleZoomReset = () => setZoom(100);

  return (
    <div className="relative h-full w-full">
      
      <LeftPanel />
      <Toolbar 
        state={toolbarState}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onArrowTool={() => setToolbarMode("arrowMode")}
        onStickyNote={() => setToolbarMode("stickyMode")}
        onSectionTool={() => setToolbarMode("sectionMode")}
        onTextTool={() => setToolbarMode("textMode")}
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
    stroke: 'transparent',
    cornerRadius: 8,
    tabPosition: 'top-leading',
    tabWidth: 0,
    tabHeight: 0
    
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
  const section1 = graph.createGroupNode()
  const section2 = graph.createGroupNode()

 
  // Set transparent style for the main group (no outline)
  graph.setStyle(section1, new GroupNodeStyle({
    tabFill: 'transparent',
    contentAreaFill: 'transparent',
    stroke: 'rgba(0, 0, 0, 0.2)',
    cornerRadius: 8,
    tabPosition: 'top-leading',
    tabWidth: 120,
    tabHeight: 24
  }))

  graph.setStyle(section2, new GroupNodeStyle({
    tabFill: 'transparent',
    contentAreaFill: 'transparent',
    stroke: 'rgba(0, 0, 0, 0.2)',
    cornerRadius: 8,
    tabPosition: 'top-leading',
    tabWidth: 120,
    tabHeight: 24
  }))


  const groupPositions = [
    new Point(50, 50),
    new Point(450, 50),
    new Point(850, 50),
    new Point(250, 350),
    new Point(650, 350)
  ]
  flowchartNames.slice(0, 3).forEach((name, index) => {
    createFlowchart(graph, name, groupPositions[index], section1)
  })
  flowchartNames.slice(3, 5).forEach((name, index) => {
    createFlowchart(graph, name, groupPositions[index], section2)
  })
  
  
  // Adjust the main group bounds to fit all content
  graph.adjustGroupNodeLayout(section1)
  graph.adjustGroupNodeLayout(section2)
  
  return section1
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
