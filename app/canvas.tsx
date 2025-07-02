"use client"

import { useEffect, useRef, useState } from 'react'
import {
  GraphComponent,
  GraphEditorInputMode,
  License,
  IGraph,
  Rect,
  Size,
  ShapeNodeStyle,
  GraphItemTypes,
  
} from '@yfiles/yfiles'
import yfLicense from "@/lib/license.json"
import { ZoomControls } from '@/components/ZoomControls'
import { Toolbar } from '@/components/Toolbar'
import { LeftPanel } from '@/components/LeftPanel'

// You'll need to provide your yFiles license here
License.value = yfLicense

export default function YFilesCanvas() {
  const graphComponentRef = useRef<GraphComponent | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
    

    // Add some sample data
    createSampleGraph(graph)

    // Enable editing
    graphComponent.inputMode = new GraphEditorInputMode({
      selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
      allowEditLabel: true
    })

    // Fit the graph into the view
    graphComponent.fitGraphBounds()
    
    return () => {
      // Clean up on unmount
      graphComponent.cleanUp()
      graphComponentRef.current = null
    }
  }, [])

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
      />
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
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
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'rectangle',
    fill: 'hsl(var(--primary))',
    stroke: 'hsl(var(--primary))'
  })

  graph.nodeDefaults.size = new Size(100, 60)

  /*graph.edgeDefaults.style = {
    targetArrow: '#hsl(var(--primary)) small triangle'
  }

  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    textFill: 'hsl(var(--primary-foreground))'
  })*/
}

function createSampleGraph(graph: IGraph) {
  // Create some nodes
  const node1 = graph.createNode(new Rect(0, 0, 100, 60))
  const node2 = graph.createNode(new Rect(150, 100, 100, 60))
  const node3 = graph.createNode(new Rect(-100, 100, 100, 60))

  // Add labels
  graph.addLabel(node1, 'Node 1')
  graph.addLabel(node2, 'Node 2')
  graph.addLabel(node3, 'Node 3')

  // Create edges between the nodes
  graph.createEdge(node1, node2)
  graph.createEdge(node1, node3)
}
