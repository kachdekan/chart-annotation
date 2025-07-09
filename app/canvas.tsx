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
  HierarchicLayout,
  HierarchicLayoutData,
  LayoutExecutor,
  MinimumNodeSizeStage,
  ComponentLayout,
  ComponentLayoutData,
  IInputMode,
  GraphInputMode,
  IEdge,
  PolylineEdgeStyle,
  Arrow,
  ArrowType,
  ShapeNodeStyle,
  Fill,
  Stroke,
  IModelItem
  
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

interface ArrowData {
  group: INode
  edge: IEdge
  startNode: INode
  endNode: INode
  color: string
}

export default function YFilesCanvas() {
  const graphComponentRef = useRef<GraphComponent | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isArrowMode, setIsArrowMode] = useState(false)
  const [arrowColor, setArrowColor] = useState('blue')
  const [selectedArrow, setSelectedArrow] = useState<ArrowData | null>(null)
  const [annotationPosition, setAnnotationPosition] = useState<{ x: number; y: number } | null>(null)
  const arrowsRef = useRef<Map<IEdge, ArrowData>>(new Map())

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
    const inputMode = new GraphEditorInputMode({
      selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
      allowEditLabel: true
    })
    
    // Add double-click handler for arrows
    // Check if itemDoubleClicked exists before adding listener
    if (inputMode.itemDoubleClicked && inputMode.itemDoubleClicked.addListener) {
      inputMode.itemDoubleClicked.addListener((sender, args) => {
        const item = args.item
        if (item instanceof IEdge) {
          const arrowData = arrowsRef.current.get(item)
          if (arrowData) {
            const location = args.location
            setSelectedArrow(arrowData)
            setAnnotationPosition({ x: location.x, y: location.y })
            args.handled = true
          }
        }
      })
    }
    
    graphComponent.inputMode = inputMode

    // Apply layout and fit the graph
    applyLayoutAndFit(graphComponent)
    
    return () => {
      // Clean up on unmount
      graphComponent.cleanUp()
      graphComponentRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!graphComponentRef.current) return
    
    const graphComponent = graphComponentRef.current
    
    if (isArrowMode) {
      // Switch to arrow drawing mode
      const arrowInputMode = createArrowInputMode(graphComponent.graph)
      graphComponent.inputMode = arrowInputMode
    } else {
      // Switch back to normal editing mode
      const inputMode = new GraphEditorInputMode({
        selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
        allowEditLabel: true
      })
      
      // Re-add double-click handler for arrows
      // Check if itemDoubleClicked exists before adding listener
      if (inputMode.itemDoubleClicked && inputMode.itemDoubleClicked.addListener) {
        inputMode.itemDoubleClicked.addListener((sender, args) => {
          const item = args.item
          if (item instanceof IEdge) {
            const arrowData = arrowsRef.current.get(item)
            if (arrowData) {
              const location = args.location
              setSelectedArrow(arrowData)
              setAnnotationPosition({ x: location.x, y: location.y })
              args.handled = true
            }
          }
        })
      }
      
      graphComponent.inputMode = inputMode
    }
  }, [isArrowMode])

  const createArrowInputMode = (graph: IGraph): IInputMode => {
    const inputMode = new GraphInputMode()
    let isDrawing = false
    let startPoint: Point | null = null
    let currentArrow: ArrowData | null = null

    inputMode.addCanvasClickedListener((sender, args) => {
      if (!isDrawing) {
        // Start drawing
        startPoint = args.location
        isDrawing = true
      } else {
        // Finish drawing
        if (startPoint && currentArrow) {
          const endPoint = args.location
          
          // Update the end node position
          graph.setNodeLayout(currentArrow.endNode, new Rect(endPoint.x - 1, endPoint.y - 1, 2, 2))
          
          // Adjust group bounds
          graph.adjustGroupNodeLayout(currentArrow.group)
          
          // Store the arrow data
          arrowsRef.current.set(currentArrow.edge, currentArrow)
        }
        
        isDrawing = false
        startPoint = null
        currentArrow = null
      }
    })

    inputMode.addMouseMovedListener((sender, args) => {
      if (isDrawing && startPoint) {
        const currentPoint = args.location
        
        if (!currentArrow) {
          // Create the arrow structure
          currentArrow = createArrowStructure(graph, startPoint, currentPoint, arrowColor)
        } else {
          // Update the end node position
          graph.setNodeLayout(currentArrow.endNode, new Rect(currentPoint.x - 1, currentPoint.y - 1, 2, 2))
          graph.adjustGroupNodeLayout(currentArrow.group)
        }
      }
    })

    return inputMode
  }

  const createArrowStructure = (graph: IGraph, start: Point, end: Point, color: string): ArrowData => {
    // Create group for the arrow
    const group = graph.createGroupNode()
    
    // Set transparent group style
    graph.setStyle(group, new GroupNodeStyle({
      tabFill: 'transparent',
      contentAreaFill: 'transparent',
      stroke: 'transparent',
      cornerRadius: 0,
      tabPosition: 'top-leading',
      tabWidth: 0,
      tabHeight: 0
    }))
    
    // Create invisible start node
    const startNode = graph.createNode(new Rect(start.x - 1, start.y - 1, 2, 2))
    graph.setStyle(startNode, new ShapeNodeStyle({
      fill: Fill.TRANSPARENT,
      stroke: Stroke.TRANSPARENT
    }))
    graph.setParent(startNode, group)
    
    // Create invisible end node
    const endNode = graph.createNode(new Rect(end.x - 1, end.y - 1, 2, 2))
    graph.setStyle(endNode, new ShapeNodeStyle({
      fill: Fill.TRANSPARENT,
      stroke: Stroke.TRANSPARENT
    }))
    graph.setParent(endNode, group)
    
    // Create visible edge with arrow
    const edge = graph.createEdge(startNode, endNode)
    const edgeStyle = new PolylineEdgeStyle({
      stroke: new Stroke(getColorValue(color), 2),
      targetArrow: new Arrow({
        type: ArrowType.TRIANGLE,
        fill: getColorValue(color),
        stroke: new Stroke(getColorValue(color), 1)
      })
    })
    graph.setStyle(edge, edgeStyle)
    
    return {
      group,
      edge,
      startNode,
      endNode,
      color
    }
  }

  const updateArrowColor = (arrowData: ArrowData, newColor: string) => {
    if (!graphComponentRef.current) return
    
    const graph = graphComponentRef.current.graph
    const edgeStyle = new PolylineEdgeStyle({
      stroke: new Stroke(getColorValue(newColor), 2),
      targetArrow: new Arrow({
        type: ArrowType.TRIANGLE,
        fill: getColorValue(newColor),
        stroke: new Stroke(getColorValue(newColor), 1)
      })
    })
    
    graph.setStyle(arrowData.edge, edgeStyle)
    arrowData.color = newColor
  }

  const deleteArrow = (arrowData: ArrowData) => {
    if (!graphComponentRef.current) return
    
    const graph = graphComponentRef.current.graph
    
    // Remove from tracking
    arrowsRef.current.delete(arrowData.edge)
    
    // Remove the entire group (this will remove all child elements)
    graph.remove(arrowData.group)
    
    // Clear selection
    setSelectedArrow(null)
    setAnnotationPosition(null)
  }

  const getColorValue = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      'blue': '#3b82f6',
      'yellow': '#eab308',
      'orange': '#f97316',
      'red': '#ef4444',
      'green': '#22c55e',
      'purple': '#a855f7'
    }
    return colorMap[colorName] || '#3b82f6'
  }

  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 25));
  const handleZoomReset = () => setZoom(100);

  const handleArrowModeToggle = () => {
    setIsArrowMode(!isArrowMode)
    setSelectedArrow(null)
    setAnnotationPosition(null)
  }

  return (
    <div className="relative h-full w-full">
      
      <LeftPanel />
      
        <Toolbar 
          isArrowMode={isArrowMode}
          onArrowModeToggle={handleArrowModeToggle}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
        />
      
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      {selectedArrow && annotationPosition && (
        <AnnotationToolbar 
          position={annotationPosition}
          selectedColor={selectedArrow.color}
          onColorChange={(color) => updateArrowColor(selectedArrow, color)}
          onDelete={() => deleteArrow(selectedArrow)}
          onClose={() => {
            setSelectedArrow(null)
            setAnnotationPosition(null)
          }}
        />
      )}
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
  /*graph.edgeDefaults.style = {
    targetArrow: '#hsl(var(--primary)) small triangle'
  }

  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    textFill: 'hsl(var(--primary-foreground))'
  })*/
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
  graph.addLabel(mainGroup, 'Flowchart Collection')
  
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
  graph.addLabel(groupNode, name)
  
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
  const graph = graphComponent.graph
  
  // Apply hierarchical layout to each group
  const layout = new ComponentLayout()
  layout.componentLayoutPolicy = 'single'
  
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