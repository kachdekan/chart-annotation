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
  ComponentLayoutData,
  IModelItem,
  ItemEventArgs
  
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

    const deletingSelectionListener = (sender: any, args: any) => {
      const nodesToRemove: INode[] = []
      graphComponent.selection.forEach((item: IModelItem) => {
        if (item instanceof IEdge) {
          const edge = item
          if (edge.sourceNode && edge.targetNode) {
            const sourceNode = edge.sourceNode
            const targetNode = edge.targetNode
            // Arrow nodes are 1x1, a characteristic of our arrow annotations
            if (
              sourceNode.layout.width === 1 &&
              sourceNode.layout.height === 1 &&
              targetNode.layout.width === 1 &&
              targetNode.layout.height === 1
            ) {
              nodesToRemove.push(sourceNode)
              nodesToRemove.push(targetNode)
            }
          }
        }
      })

      if (nodesToRemove.length > 0) {
        // Use a timeout to avoid modifying the graph during an event callback
        setTimeout(() => {
          const graph = graphComponent.graph
          nodesToRemove.forEach(node => graph.remove(node))
        }, 0)
      }
    };
    
    // Create 5 flowcharts with random nodes
    createFlowchartGroups(graph, graphComponent)

    // Enable editing
    graphComponent.inputMode = new GraphEditorInputMode({
      selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
      allowEditLabel: true,
      allowCreateNode: false
    });
    graphComponent.inputMode.addEventListener('deleting-selection', deletingSelectionListener);
    

   

    // Apply layout and fit the graph
    applyLayoutAndFit(graphComponent)
    
    return () => {
      // Clean up on unmount
      if (graphComponent.inputMode) {
        const geim = graphComponent.inputMode as GraphEditorInputMode
        geim.removeEventListener('deleting-selection', deletingSelectionListener)
      }
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
    const inputMode = graphComponent.inputMode as any;

    // Update selectable items based on sectionMode
    if (toolbarStateRef.current.sectionMode) {
      // Only top-level group nodes (flowcharts) selectable
      inputMode.selectableItems = GraphItemTypes.GROUP_NODE;
      // Only allow selection of group nodes whose parent is root (top-level)
      inputMode.itemSelectablePredicate = (item: any) => {
        const graph = graphComponent.graph;
        return graph.isGroupNode(item) && graph.getParent(item) == null;
      };
    } else {
      // Restore normal selection
      inputMode.selectableItems = GraphItemTypes.NODE | GraphItemTypes.EDGE;
      inputMode.itemSelectablePredicate = null;
    }
    // Handler that always uses the latest toolbarState
    const handleCanvasClicked = (args: any) => {
      const toolbar = toolbarStateRef.current;
      const location = args.location;
      if (toolbar.arrowMode) {
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
        const node = graphComponent.graph.createNode(
          new Rect(location.x - 100, location.y - 25, 200, 50),
          new ReactComponentNodeStyle(() => (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-center">Double-click to edit text</p>
            </div>
          ))
        );
        graphComponent.graph.addLabel(node, "Double-click to edit");
      }
    };
    // --- Sectioning logic ---
    const handleMultiSelectionFinished = (args: any) => {
      const toolbar = toolbarStateRef.current;
      if (!toolbar.sectionMode) return;
      // Get selected top-level group nodes robustly (yFiles v30)
      const graph = graphComponent.graph;
      const selectedNodes: INode[] = [];
      graphComponent.selection.nodes.forEach((node: INode) => {
        if (graph.isGroupNode(node) && graph.getParent(node) == null) {
          selectedNodes.push(node);
        }
      });
      if (selectedNodes.length < 2) return; // Only group if more than one
      // Create a new group node
      const groupNode = graphComponent.graph.createGroupNode();
      // Style the group node as a section
      graphComponent.graph.setStyle(groupNode, new GroupNodeStyle({
        tabFill: 'transparent',
        contentAreaFill: 'transparent',
        stroke: 'rgba(0, 0, 0, 0.2)',
        cornerRadius: 8,
        tabPosition: 'top-leading',
        tabWidth: 120,
        tabHeight: 24
      }));
      // Optionally, add a label to the group node
      graphComponent.graph.addLabel(groupNode, 'Section');
      // Set parent for each selected node
      selectedNodes.forEach((node: INode) => {
        graphComponent.graph.setParent(node, groupNode);
      });
      // Adjust group bounds to fit content
      graphComponent.graph.adjustGroupNodeLayout(groupNode);
      // Optionally clear selection
      graphComponent.selection.clear();
    };
    if (inputMode && typeof inputMode.addEventListener === 'function') {
      inputMode.addEventListener('canvas-clicked', handleCanvasClicked);
      inputMode.addEventListener('multi-selection-finished', handleMultiSelectionFinished);
    }
    return () => {
      if (inputMode && typeof inputMode.removeEventListener === 'function') {
        inputMode.removeEventListener('canvas-clicked', handleCanvasClicked);
        inputMode.removeEventListener('multi-selection-finished', handleMultiSelectionFinished);
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

function createFlowchartGroups(graph: IGraph, graphComponent?: GraphComponent) {
  const flowchartNames = [
    'User Authentication Flow',
    'Payment Processing',
    'Data Validation Pipeline',
    'Notification System',
    'Report Generation'
  ];

  // No main container group for all flowcharts (all ungrouped at start)
  const groupPositions = [
    new Point(50, 50),
    new Point(450, 50),
    new Point(850, 50),
    new Point(250, 350),
    new Point(650, 350)
  ];
  const createdGroups: INode[] = [];
  flowchartNames.forEach((name, index) => {
    const groupNode = createFlowchart(graph, name, groupPositions[index]);
    // Expand group node to ensure children are visible
    if (graph.setGroupNodeCollapsed) {
      graph.setGroupNodeCollapsed(groupNode, false);
    }
    createdGroups.push(groupNode);
  });
  // Log all nodes and group nodes
  const allNodes = Array.from(graph.nodes);
  const allGroups = Array.from(graph.groupNodes ? graph.groupNodes : []);
  console.log('All nodes:', allNodes);
  console.log('All group nodes:', allGroups);
  // Force fit to bounds if graphComponent is provided
  if (graphComponent) {
    graphComponent.fitGraphBounds();
  }
}

function createFlowchart(graph: IGraph, name: string, position: Point): INode {
  // Generate random number of nodes between 5 and 10
  const nodeCount = Math.floor(Math.random() * 6) + 5;
  
  // Create group node
  const groupNode = graph.createGroupNode();
  // Use default groupNode style (transparent, as set in configureGraph)
  // Add a label for clarity
  graph.addLabel(groupNode, name);
  
  const nodes: INode[] = [];
  // Create nodes within the group
  for (let i = 0; i < nodeCount; i++) {
    const x = position.x + (i % 3) * 120;
    const y = position.y + Math.floor(i / 3) * 80 + 40;
    const node = graph.createNode(new Rect(x, y, 100, 60));
    graph.addLabel(node, `Step ${i + 1}`);
    graph.setParent(node, groupNode);
    nodes.push(node);
  }
  // Create edges to form a flowchart structure
  for (let i = 0; i < nodes.length - 1; i++) {
    // Create sequential connections
    if (i < nodes.length - 1) {
      graph.createEdge(nodes[i], nodes[i + 1]);
    }
    // Add some branching (random connections)
    if (Math.random() > 0.7 && i < nodes.length - 2) {
      graph.createEdge(nodes[i], nodes[i + 2]);
    }
  }
  // Adjust group bounds to fit content
  graph.adjustGroupNodeLayout(groupNode);
  return groupNode;
}

async function applyLayoutAndFit(graphComponent: GraphComponent) {
  // Apply hierarchical layout to each group
  const layout = new ComponentLayout();
  const layoutData = new ComponentLayoutData();
  // Apply layout
  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: new MinimumNodeSizeStage(layout),
    layoutData,
    animateViewport: true
  });
  try {
    await layoutExecutor.start();
    graphComponent.fitGraphBounds();
  } catch (error) {
    console.error('Layout failed:', error);
    graphComponent.fitGraphBounds();
  }
}
