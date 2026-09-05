// @ts-nocheck
import React, { useState, useEffect } from 'react';
const EMPTY_ARRAY: any[] = [];
import CustomColorPicker from './CustomColorPicker';
import { 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  FolderPlus, 
  Link, 
  Unlink, 
  Trash2, 
  Maximize2, 
  ChevronLeft, 
  Image as ImageIcon, 
  Type as TextIcon, 
  Sparkles, 
  Layers, 
  Layers as LayerIcon, 
  Box, 
  Circle, 
  Car, 
  Smile, 
  Armchair, 
  Copy, 
  PaintBucket, 
  CheckSquare, 
  Edit2, 
  Check, 
  GitCommit,
  Brush,
  Eraser,
  PenTool,
  Scissors,
  Crosshair,
  Cpu,
  RefreshCw,
  Sliders,
  Palette,
  Zap,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalSpaceAround,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { VectorObject, Layer, BrushSettings, EraserSettings, KnifeSettings, PivotSettings, MLSettings } from '../types';
import { getDailyLimitStatus } from '../utils/engine3D';
import { sanitizeString } from '../utils/securityGuard';

interface LeftPanelProps {
  objects: { [id: string]: VectorObject };
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  updateObject: (id: string, updates: Partial<VectorObject>) => void;
  deleteObject: (id: string) => void;
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  groupObjects: (ids: string[]) => void;
  activeTool: string;
  add3DModel?: (type: 'car' | 'character' | 'chair' | 'sphere' | 'box' | 'sword') => void;
  addCustom3DModel?: (mesh: any, filename: string) => void;
  add360Object?: (selectedIds: string[]) => void;
  currentUser: string | null;
  is360WizardActive?: boolean;
  draft360Views?: any[];
  draftAnchorId?: string | null;
  onionSkinEnabled360?: boolean;
  setOnionSkinEnabled360?: (val: boolean) => void;
  start360Wizard?: () => void;
  addDraft360View?: (drawingId: string, name: string, angle: number) => void;
  cancel360Wizard?: () => void;
  compile360Wizard?: (containerName: string) => void;
  adaptiveSubdivisionEnabled: boolean;
  setAdaptiveSubdivisionEnabled: (val: boolean) => void;
  adaptiveSubdivisionPoints: number;
  setAdaptiveSubdivisionPoints: (val: number) => void;
  duplicateObject: (id: string, offset?: { x: number; y: number }) => string | null;
  duplicateLassoBatch?: () => void;
  deleteLassoBatch?: () => void;
  lassoPoints?: any[];
  setLassoPoints?: React.Dispatch<React.SetStateAction<any[]>>;
  fillToolColor?: string;
  setFillToolColor?: (val: string) => void;
  toolbarCollapsed?: boolean;
  applyFillForever?: boolean;
  setApplyFillForever?: (val: boolean) => void;
  ignoreInnerDrawings?: boolean;
  setIgnoreInnerDrawings?: React.Dispatch<React.SetStateAction<boolean>>;
  applyColorFillToSelected?: () => void;
  setActiveTool?: (tool: string) => void;
  brushSettings?: BrushSettings;
  setBrushSettings?: React.Dispatch<React.SetStateAction<BrushSettings>>;
  eraserSettings?: EraserSettings;
  setEraserSettings?: React.Dispatch<React.SetStateAction<EraserSettings>>;
  knifeSettings?: KnifeSettings;
  setKnifeSettings?: React.Dispatch<React.SetStateAction<KnifeSettings>>;
  pivotSettings?: PivotSettings;
  setPivotSettings?: React.Dispatch<React.SetStateAction<PivotSettings>>;
  mlSettings?: MLSettings;
  setMlSettings?: React.Dispatch<React.SetStateAction<MLSettings>>;
  batchScaleLasso?: (factor: number) => void;
  batchColorLasso?: (color: string) => void;
  batchAlignLasso?: (align: 'left' | 'center' | 'top' | 'bottom') => void;
}

export default function LeftPanel({
  objects,
  selectedObjectId,
  setSelectedObjectId,
  updateObject,
  deleteObject,
  layers,
  setLayers,
  activeLayerId,
  setActiveLayerId,
  open,
  setOpen,
  groupObjects,
  activeTool,
  setActiveTool,
  add3DModel,
  addCustom3DModel,
  add360Object,
  currentUser,
  is360WizardActive = false,
  draft360Views = EMPTY_ARRAY,
  draftAnchorId = null,
  onionSkinEnabled360 = true,
  setOnionSkinEnabled360,
  start360Wizard,
  addDraft360View,
  cancel360Wizard,
  compile360Wizard,
  adaptiveSubdivisionEnabled,
  setAdaptiveSubdivisionEnabled,
  adaptiveSubdivisionPoints,
  setAdaptiveSubdivisionPoints,
  duplicateObject,
  duplicateLassoBatch,
  deleteLassoBatch,
  lassoPoints,
  setLassoPoints,
  fillToolColor,
  setFillToolColor,
  toolbarCollapsed = false,
  applyFillForever,
  setApplyFillForever,
  ignoreInnerDrawings = true,
  setIgnoreInnerDrawings,
  applyColorFillToSelected,
  brushSettings,
  setBrushSettings,
  eraserSettings,
  setEraserSettings,
  knifeSettings,
  setKnifeSettings,
  pivotSettings,
  setPivotSettings,
  mlSettings,
  setMlSettings,
  batchScaleLasso,
  batchColorLasso,
  batchAlignLasso,
}: LeftPanelProps) {
  const [expandedNodes, setExpandedNodes] = useState<{ [id: string]: boolean }>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenamingText] = useState('');
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState<string>('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selected360Ids, setSelected360Ids] = useState<string[]>([]);
  const [customViewName, setCustomViewName] = useState('Front View');
  const [customViewAngle, setCustomViewAngle] = useState(0);
  const [masterContainerName, setMasterContainerName] = useState('Master_360_Character');
  const [is3DLibraryOpen, setIs3DLibraryOpen] = useState(true);


  // Toggle node expansion
  const toggleExpand = (id: string, e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Start inline renaming strictly with full event stop
  const startRename = (obj: VectorObject, e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setRenamingId(obj.id);
    setRenamingText(obj.name);
  };

  const handleRenameSave = (id: string) => {
    if (renameText && renameText.trim()) {
      const sanitized = sanitizeString(renameText.trim());
      if (sanitized) {
        updateObject(id, { name: sanitized });
      }
    }
    setRenamingId(null);
  };

  // Save rename on clicking ANYWHERE outside the input box
  useEffect(() => {
    if (!renamingId) return;
    const handleGlobalClickToSave = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('#rename-input-container')) {
        return;
      }
      handleRenameSave(renamingId);
    };

    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handleGlobalClickToSave, true);
    }, 40);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleGlobalClickToSave, true);
    };
  }, [renamingId, renameText]);

  // Visibility toggle
  const toggleVisibility = (obj: VectorObject, e: React.MouseEvent) => {
    e.stopPropagation();
    updateObject(obj.id, { isHidden: !obj.isHidden });
  };

  // Lock toggle
  const toggleLock = (obj: VectorObject, e: React.MouseEvent) => {
    e.stopPropagation();
    updateObject(obj.id, { isLocked: !obj.isLocked });
  };

  // Drag and Drop Parenting
  const handleDragStart = (id: string, e: React.DragEvent) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetParentId: string | null, e: React.DragEvent) => {
    e.preventDefault();
    const childId = e.dataTransfer.getData('text/plain') || draggedId;
    if (!childId || childId === targetParentId) return;

    // Detect Circular reference
    if (targetParentId) {
      let current = objects[targetParentId];
      while (current && current.parentId) {
        if (current.parentId === childId) {
          alert("Circular parent relationship not allowed!");
          return;
        }
        current = objects[current.parentId];
      }
    }

    // Set new parent
    const child = objects[childId];
    const oldParentId = child.parentId;

    // Remove child from old parent's children list
    if (oldParentId) {
      const oldParent = objects[oldParentId];
      updateObject(oldParentId, {
        childrenIds: oldParent.childrenIds.filter(id => id !== childId)
      });
    }

    // Add child to new parent's children list
    if (targetParentId) {
      const targetParent = objects[targetParentId];
      updateObject(targetParentId, {
        childrenIds: [...targetParent.childrenIds, childId]
      });
    }

    // Update child's parent pointer
    updateObject(childId, { parentId: targetParentId });
    setDraggedId(null);
  };

  // Group all selected objects
  const handleGroupSelected = () => {
    if (selectedObjectId) {
      groupObjects([selectedObjectId]);
    }
  };

  // Advanced Layer operations
  const handleAddLayer = () => {
    if (layers.length >= 50) {
      alert("App Safety Guard: Maximum limit is 50 layers per project to maintain high rendering performance.");
      return;
    }
    const defaultName = `Layer ${layers.length + 1}`;
    const name = sanitizeString(defaultName) || defaultName;
    const id = `layer_${Date.now()}`;
    const nextZ = layers.length > 0 ? Math.max(...layers.map(l => l.zIndex)) + 1 : 1;
    const newLayer: Layer = {
      id,
      name,
      zIndex: nextZ,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
    };
    (newLayer as any).blurAmount = 0;
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(id);
  };

  const handleDeleteLayer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (layers.length <= 1) {
      alert("Must keep at least one layer!");
      return;
    }
    setLayers(prev => prev.filter(l => l.id !== id));
    if (activeLayerId === id) {
      const remaining = layers.filter(l => l.id !== id);
      setActiveLayerId(remaining[0].id);
    }
  };

  const moveLayer = (index: number, dir: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const sorted = [...layers].sort((a, b) => b.zIndex - a.zIndex);
    const targetIdx = sorted.findIndex(l => l.id === layers[index].id);
    const swapIdx = dir === 'up' ? targetIdx - 1 : targetIdx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    // Swap position in sorted array
    const temp = sorted[targetIdx];
    sorted[targetIdx] = sorted[swapIdx];
    sorted[swapIdx] = temp;

    // Update z-indexes accordingly
    const updated = sorted.map((layer, idx) => ({
      ...layer,
      zIndex: sorted.length - idx
    }));

    setLayers(updated);
  };

  const updateLayerProp = (layerId: string, updates: Partial<Layer & { blurAmount: number }>) => {
    // If layer is being locked or hidden, automatically deselect any currently selected object on this layer
    if (updates.locked === true || updates.visible === false || updates.opacity === 0) {
      if (selectedObjectId && objects[selectedObjectId]) {
        const obj = objects[selectedObjectId];
        const eff = obj.layerId || (layers && layers[0] ? layers[0].id : 'layer_1');
        if (eff === layerId) {
          setSelectedObjectId(null);
        }
      }
    }
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, ...updates } as Layer : l));
  };

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // Render object item recursively for hierarchy representation
  const renderTreeItem = (obj: VectorObject, depth: number) => {
    const hasChildren = obj.childrenIds.length > 0;
    const isExpanded = !!expandedNodes[obj.id];
    const isSelected = selectedObjectId === obj.id;
    const effLayerId = obj.layerId || (layers && layers[0] ? layers[0].id : 'layer_1');
    const currentLayer = layers?.find(l => l.id === effLayerId);
    const isLayerLocked = currentLayer?.locked === true;
    const isLayerHidden = currentLayer?.visible === false || currentLayer?.opacity === 0;
    const isInteractable = !isLayerLocked && !isLayerHidden && !obj.isLocked && !obj.isHidden && effLayerId === activeLayerId;
    const twoLetters = (obj.name || 'DR').trim().slice(0, 2).toUpperCase();

    return (
      <div key={obj.id} className="flex flex-col">
        <div
          draggable={!isTouchDevice && isInteractable}
          onDragStart={(e) => isInteractable && handleDragStart(obj.id, e)}
          onDragOver={handleDragOver}
          onDrop={(e) => isInteractable && handleDrop(obj.id, e)}
          onClick={() => {
            if (!isInteractable) return;
            // Unselect if already selected, otherwise select
            setSelectedObjectId(isSelected ? null : obj.id);
          }}
          onTouchEnd={(e) => {
            // Avoid triggering when tapping inner buttons or inputs
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('input') || target.closest('#rename-input-container')) {
              return;
            }
            e.preventDefault(); // Stop synthetic click delay and bypass draggable touch interference on mobile screens
            if (!isInteractable) return;
            setSelectedObjectId(isSelected ? null : obj.id);
          }}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
          className={`flex items-center justify-between py-1.5 px-2 rounded-xl group/item transition-colors select-none cursor-pointer ${
            isSelected 
              ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-sm' 
              : 'border border-neutral-800/40 bg-neutral-900/40 hover:bg-neutral-800/80 text-white'
          }`}
        >
          {/* Main Drawing Row: Clicking strictly selects or unselects */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1 pointer-events-none">
            {/* Collapse / Expand Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleExpand(obj.id, e);
              }}
              className="p-0.5 rounded hover:bg-neutral-700 text-neutral-400 shrink-0 pointer-events-auto"
              title={isExpanded ? "Collapse full drawing details" : "Expand full drawing details"}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-amber-400" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
            </button>

            {/* Type Icon */}
            {obj.type === 'image' ? (
              <ImageIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            ) : obj.type === 'text' ? (
              <TextIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}

            {/* 2-Letter Badge to guarantee clear visibility when space is compact */}
            <span 
              className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-amber-300 font-mono text-[10px] font-black shrink-0 tracking-wider shadow-sm select-none"
              title={`Drawing: ${obj.name}`}
            >
              {twoLetters}
            </span>

            {/* Drawing Name: strictly plain text display with 100% solid opacity */}
            {renamingId === obj.id ? (
              <div 
                id="rename-input-container"
                className="flex items-center gap-1.5 min-w-0 pointer-events-auto" 
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={renameText}
                  onChange={(e) => setRenamingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSave(obj.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  autoFocus
                  style={{ fontSize: '16px' }}
                  className="bg-neutral-950 text-white border-2 border-amber-400 px-2 py-0.5 rounded outline-none w-28 font-bold shadow-inner"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRenameSave(obj.id);
                  }}
                  className="p-1 rounded bg-amber-500 text-neutral-950 hover:bg-amber-400 font-bold shrink-0"
                  title="Save Name"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
              </div>
            ) : (
              <span 
                className={`text-[12.5px] truncate font-bold select-none flex-1 transition-colors min-w-0 ${
                  isSelected ? 'text-amber-300 font-extrabold' : 'text-white group-hover/item:text-amber-200'
                }`}
                title={isSelected ? `[Selected] ${obj.name} (Click to unselect)` : `${obj.name} (Click to select)`}
              >
                {obj.name}
              </span>
            )}
          </div>

          {/* Quick Item Actions - separated with generous gap to very right side */}
          <div className="flex items-center gap-1 ml-auto pl-4 shrink-0">
            {/* Very small pencil icon to edit drawing name strictly with wide safety spacing */}
            <button
              type="button"
              onPointerDown={(e) => { e.stopPropagation(); }}
              onMouseDown={(e) => { e.stopPropagation(); }}
              onTouchStart={(e) => { e.stopPropagation(); }}
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); startRename(obj, e); }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startRename(obj, e);
              }}
              className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-amber-400 transition-colors pointer-events-auto"
              title="Rename drawing"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => toggleVisibility(obj, e)}
              className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors pointer-events-auto"
              title="Show/Hide drawing"
            >
              {obj.isHidden ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-neutral-400" />}
            </button>
            <button
              type="button"
              onClick={(e) => toggleLock(obj, e)}
              className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors pointer-events-auto"
              title={obj.isLocked ? "Unlock drawing" : "Lock drawing on layer"}
            >
              {obj.isLocked ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5 text-neutral-400" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                duplicateObject(obj.id);
              }}
              className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-amber-400 transition-colors pointer-events-auto"
              title="Duplicate drawing"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteObject(obj.id);
              }}
              className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-rose-400 transition-colors pointer-events-auto"
              title="Delete drawing"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expanded View: reveals full unabbreviated drawing name in full view */}
        {isExpanded && (
          <div className="mt-1 mb-1.5 ml-6 mr-1 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/90 text-xs space-y-1 shadow-inner">
            <div className="flex items-center justify-between text-neutral-400 text-[9.5px] uppercase font-black tracking-wider">
              <span>Full Name</span>
              <span className="text-amber-400 font-mono font-bold">[{twoLetters}]</span>
            </div>
            <div className="text-white font-black text-[13px] break-words">
              {obj.name}
            </div>
            <div className="text-[10px] text-neutral-400 flex items-center gap-2 pt-1 border-t border-neutral-900 mt-1">
              <span>Type: <b className="text-neutral-300 capitalize">{obj.type}</b></span>
              <span>•</span>
              <span>Layer: <b className="text-neutral-300">{currentLayer?.name || 'Layer 1'}</b></span>
            </div>
          </div>
        )}

        {/* Render child elements if expanded */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {obj.childrenIds.map(childId => objects[childId] && renderTreeItem(objects[childId], depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Find root-level elements for initial rendering tree pass (strictly filter by active layer)
  const rootObjects = Object.values(objects)
    .filter(o => !o.parentId)
    .filter(o => (o.layerId || (layers && layers[0] ? layers[0].id : 'layer_1')) === activeLayerId);
  const sortedLayersList = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div
      className={`absolute ${toolbarCollapsed ? 'left-14' : 'left-56'} h-full transition-all duration-200 shrink-0 z-30 ${
        open ? 'w-64' : 'w-0'
      }`}
    >
      {/* Slider Open Close Handle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-16 bg-neutral-800 hover:bg-amber-500 border-y border-r border-neutral-700 hover:border-amber-400 rounded-r-lg flex items-center justify-center text-neutral-400 hover:text-neutral-950 transition-all cursor-pointer z-50 shadow-lg shadow-black/20"
      >
        {open ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      <div className={`w-full h-full bg-neutral-900/95 backdrop-blur-md border-r border-neutral-800 flex flex-col overflow-hidden ${
        open ? 'w-64' : 'w-0 border-r-0'
      }`}>
        {open && (
        <>
          {/* Header */}
          <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-3 shrink-0 select-none">
            <span className="text-xs uppercase tracking-widest font-black text-neutral-400 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              HIERARCHY TREE
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleGroupSelected}
                disabled={!selectedObjectId}
                className={`p-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all ${
                  !selectedObjectId ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                title="Add Selected to Group"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 text-neutral-400 hover:text-rose-400 transition-all lg:hidden"
                title="Close Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Root-Level Drag-Drop Landing Box */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(null, e)}
            className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin select-none"
          >
            {/* 🎭 Swap Studio Quick Tool */}
            <div className="border border-indigo-500/40 bg-neutral-900 rounded-2xl p-3 space-y-2 shrink-0 shadow-lg" id="shape-studio-left-panel">
              <div className="flex items-center justify-between text-indigo-400">
                <div className="flex items-center gap-1.5 font-black text-[10.5px] uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Swap Studio (SWP)
                </div>
                <span className="text-[9px] font-mono bg-indigo-900/80 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-700/60 font-bold">
                  SWP
                </span>
              </div>
              <p className="text-[9px] text-neutral-300 leading-normal">
                Add selected drawings as swapable parts. Transform &amp; move automatically with the main character while position stays locked.
              </p>
              <button
                type="button"
                id="btn-open-shape-studio"
                onClick={() => setActiveTool?.('SWAP_STUDIO')}
                className={`w-full py-2 px-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                  activeTool === 'SWAP_STUDIO' || activeTool === 'SWP' || activeTool === 'SST'
                    ? 'bg-indigo-600 text-white shadow-indigo-600/30 ring-2 ring-indigo-400 scale-[1.02]'
                    : 'bg-neutral-900 hover:bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {activeTool === 'SWAP_STUDIO' || activeTool === 'SWP' || activeTool === 'SST' ? '✓ Swap Studio (SWP) Active' : '▶ Open Swap Studio (SWP)'}
              </button>
            </div>

            {/* 🎯 Adaptive Geometry Deformation Controller */}
            <div className="border border-amber-500/30 bg-neutral-950/90 rounded-2xl p-3 space-y-3 shrink-0 shadow-lg" id="adaptive-subdivision-panel">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider">Deformation Points Control</span>
              </div>
              <p className="text-[9px] text-neutral-400 leading-normal">
                Control dynamic point generation when stretching edges of 3D models & 2D drawings.
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  id="btn-start-adaptive"
                  onClick={() => setAdaptiveSubdivisionEnabled(true)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    adaptiveSubdivisionEnabled
                      ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/10 scale-105'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  ▶ START
                </button>
                <button
                  id="btn-stop-adaptive"
                  onClick={() => setAdaptiveSubdivisionEnabled(false)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    !adaptiveSubdivisionEnabled
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/10 scale-105'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-400'
                  }`}
                >
                  ■ STOP
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-widest">Points Per Split</span>
                  <span className="text-[10px] text-amber-400 font-mono font-black bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">{adaptiveSubdivisionPoints}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-neutral-500 font-mono">1</span>
                  <input
                    id="slider-adaptive-points"
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={adaptiveSubdivisionPoints}
                    onChange={(e) => setAdaptiveSubdivisionPoints(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[9px] font-bold text-neutral-500 font-mono">3</span>
                </div>
                <div className="text-[8px] text-neutral-500 leading-snug">
                  Strictly 1 to 3 points can be generated dynamically during edge elongation.
                </div>
              </div>
            </div>

            {/* 📋 Selected Drawing Quick Controls */}
            {selectedObjectId && objects[selectedObjectId] && (
              <div className="border border-neutral-800 bg-neutral-950/80 rounded-2xl p-3 space-y-2.5 shrink-0 shadow-lg" id="selected-drawing-controls">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Drawing Controls</span>
                  </div>
                  <span className="text-[9px] text-neutral-500 font-mono">SELECTED</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 flex items-center justify-between gap-2">
                  <span 
                    onClick={() => setSelectedObjectId(null)}
                    className="text-[13px] truncate font-extrabold text-white flex-1 cursor-pointer hover:text-rose-400 transition-colors"
                    title="Click to unselect drawing"
                  >
                    {objects[selectedObjectId].name}
                  </span>
                  <button
                    onClick={() => duplicateObject(selectedObjectId)}
                    className="bg-amber-500 hover:bg-amber-600 text-neutral-950 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0"
                  >
                    Duplicate
                  </button>
                </div>

                {/* Z-Index Controls */}
                <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Z-Index (Depth)</span>
                    <span className="text-[10px] font-mono font-bold text-neutral-300">
                      z: {objects[selectedObjectId].zIndex ?? 0}
                    </span>
                  </div>
                  
                  {/* Z-Index Range Slider */}
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      step={1}
                      value={objects[selectedObjectId].zIndex ?? 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateObject(selectedObjectId, { zIndex: val });
                      }}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-950 rounded-lg"
                      title="Slide to adjust Z-Index"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const currentZ = objects[selectedObjectId].zIndex ?? 0;
                        updateObject(selectedObjectId, { zIndex: currentZ - 1 });
                      }}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-black px-2.5 py-1 rounded-lg border border-neutral-700 cursor-pointer transition-colors"
                      title="Send Backward (-1)"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={objects[selectedObjectId].zIndex ?? 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateObject(selectedObjectId, { zIndex: val });
                      }}
                      className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-center font-mono font-bold text-amber-400 outline-none focus:border-amber-500"
                      title="Direct Z-Index depth value"
                    />
                    <button
                      onClick={() => {
                        const currentZ = objects[selectedObjectId].zIndex ?? 0;
                        updateObject(selectedObjectId, { zIndex: currentZ + 1 });
                      }}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-black px-2.5 py-1 rounded-lg border border-neutral-700 cursor-pointer transition-colors"
                      title="Bring Forward (+1)"
                    >
                      +
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      onClick={() => {
                        const zValues = Object.values(objects).map(o => o.zIndex ?? 0);
                        const minZ = zValues.length > 0 ? Math.min(...zValues) : 0;
                        updateObject(selectedObjectId, { zIndex: minZ - 1 });
                      }}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[9px] font-bold py-1 px-1.5 rounded-lg border border-neutral-700/80 transition-colors uppercase cursor-pointer"
                    >
                      Send to Back
                    </button>
                    <button
                      onClick={() => {
                        const zValues = Object.values(objects).map(o => o.zIndex ?? 0);
                        const maxZ = zValues.length > 0 ? Math.max(...zValues) : 0;
                        updateObject(selectedObjectId, { zIndex: maxZ + 1 });
                      }}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[9px] font-extrabold py-1 px-1.5 rounded-lg border border-amber-500/30 transition-colors uppercase cursor-pointer"
                    >
                      Bring to Front
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 📌 Points-Based Movement (PBM) & Rigid Point Deform Panel */}
            {(activeTool === 'PBM' || activeTool === 'RPD') && (
              <div className="border border-blue-500/40 bg-neutral-950/90 rounded-2xl p-3 space-y-3 shrink-0 shadow-lg animate-fade-in" id="pbm-left-panel">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <GitCommit className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider font-sans">🎯 Points-Based Movement (PBM)</span>
                </div>
                <p className="text-[9px] text-neutral-300 leading-normal font-medium">
                  Click on drawing to place <b>Blue Points</b>. Minimum 2 points are strictly required (e.g., Shoulder &amp; Hand). Drag points to move drawing sections strictly as-is without stroke distortion or overlap!
                </p>
                <div className="bg-neutral-900/80 p-2 rounded-xl border border-neutral-800 text-[9px] text-blue-300 font-bold space-y-1">
                  <div>• <b>Blue Points</b>: Joint skeleton points</div>
                  <div>• <b>Yellow Point</b>: Active selected point with capture radius</div>
                  <div>• <b>Extrude Mode</b>: Spawn connected joint chains</div>
                </div>
              </div>
            )}

            {/* 🖌️ Brush Tool Controls */}
            {(activeTool === 'BRS' || activeTool === 'VLB') && brushSettings && setBrushSettings && (
              <div className="border border-amber-500/40 bg-neutral-950/95 rounded-2xl p-3 space-y-3 shrink-0 shadow-xl animate-fade-in" id="brush-tool-panel">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Brush className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider font-sans">Brush Tool Engine</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono font-bold uppercase border border-amber-500/20">
                    {brushSettings.brushType}
                  </span>
                </div>

                {/* Brush Presets */}
                <div className="space-y-1">
                  <label className="text-[9px] text-neutral-400 font-bold uppercase flex justify-between">
                    <span>Brush Medium Preset</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'solid', label: 'Solid' },
                      { id: 'cold', label: 'Cold' },
                      { id: 'dry', label: 'Dry Bristle' },
                      { id: 'smooth', label: 'Smooth' },
                      { id: 'water', label: 'Water' },
                      { id: 'calligraphy', label: 'Calligraphy' },
                      { id: 'pencil', label: 'Pencil' },
                      { id: 'marker', label: 'Marker' },
                      { id: 'airbrush', label: 'Airbrush' },
                      { id: 'glow', label: 'Neon Glow' },
                      { id: 'ink', label: 'Sumi Ink' },
                      { id: 'charcoal', label: 'Charcoal' },
                      { id: 'oil', label: 'Oil Impasto' },
                      { id: 'watercolor', label: 'Watercolor' },
                      { id: 'crayon', label: 'Wax Crayon' },
                      { id: 'spray', label: 'Spray Paint' },
                      { id: 'dotted', label: 'Dotted' },
                      { id: 'dashed', label: 'Dashed' },
                      { id: 'ribbon', label: 'Ribbon' },
                      { id: 'organic', label: 'Organic Foliage' },
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          try {
                            setBrushSettings(prev => ({ ...prev, brushType: p.id as any }));
                          } catch (err) {
                            console.error('Brush preset error:', err);
                          }
                        }}
                        className={`text-[9px] py-1 px-1 rounded-lg font-bold border transition-all text-center truncate ${
                          brushSettings.brushType === p.id
                            ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stroke Size & Opacity */}
                <div className="space-y-2 bg-neutral-900/60 p-2 rounded-xl border border-neutral-800">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-neutral-400 font-bold">Size:</span>
                      <span className="text-amber-400 font-mono font-bold">{brushSettings.strokeWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={200}
                      value={brushSettings.strokeWidth}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({ ...prev, strokeWidth: Number(e.target.value) }));
                        } catch (err) {
                          console.error('Brush size change error:', err);
                        }
                      }}
                      className="w-full accent-amber-500 h-1 bg-neutral-800 rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-neutral-400 font-bold">Opacity:</span>
                      <span className="text-amber-400 font-mono font-bold">{Math.round((brushSettings.strokeOpacity ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={Math.round((brushSettings.strokeOpacity ?? 1) * 100)}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({ ...prev, strokeOpacity: Number(e.target.value) / 100 }));
                        } catch (err) {
                          console.error('Brush opacity change error:', err);
                        }
                      }}
                      className="w-full accent-amber-500 h-1 bg-neutral-800 rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-neutral-400 font-bold">Hardness / Flow:</span>
                      <span className="text-amber-400 font-mono font-bold">{Math.round((brushSettings.hardness ?? 0.8) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round((brushSettings.hardness ?? 0.8) * 100)}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({ ...prev, hardness: Number(e.target.value) / 100 }));
                        } catch (err) {
                          console.error('Brush hardness change error:', err);
                        }
                      }}
                      className="w-full accent-amber-500 h-1 bg-neutral-800 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* 🎲 Organic Khadra Texture & Jitter Engine */}
                <div className="space-y-2 bg-neutral-900/80 p-2.5 rounded-xl border border-amber-500/20">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Zap className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-wide">Khadra Texture &amp; Jitter</span>
                  </div>
                  
                  {/* Random Rotation Toggle */}
                  <label className="flex items-center justify-between cursor-pointer py-0.5">
                    <span className="text-[9px] text-neutral-300 font-bold">Random Rotation (360°)</span>
                    <input
                      type="checkbox"
                      checked={brushSettings.randomRotation ?? brushSettings.rotationJitter ?? false}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({
                            ...prev,
                            randomRotation: e.target.checked,
                            rotationJitter: e.target.checked,
                            jitterEnabled: e.target.checked || (prev.randomSize ?? prev.sizeJitter ?? false)
                          }));
                        } catch (err) {
                          console.error('Rotation jitter error:', err);
                        }
                      }}
                      className="accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* Random Size Variation Toggle */}
                  <label className="flex items-center justify-between cursor-pointer py-0.5">
                    <span className="text-[9px] text-neutral-300 font-bold">Organic Size Jitter (5-20%)</span>
                    <input
                      type="checkbox"
                      checked={brushSettings.randomSize ?? brushSettings.sizeJitter ?? false}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({
                            ...prev,
                            randomSize: e.target.checked,
                            sizeJitter: e.target.checked,
                            jitterEnabled: e.target.checked || (prev.randomRotation ?? prev.rotationJitter ?? false)
                          }));
                        } catch (err) {
                          console.error('Size jitter error:', err);
                        }
                      }}
                      className="accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* Scatter Slider */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[8.5px]">
                      <span className="text-neutral-400 font-bold">Stamp Scatter:</span>
                      <span className="text-amber-400 font-mono font-bold">{brushSettings.scatter ?? 0}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={brushSettings.scatter ?? 0}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({ ...prev, scatter: Number(e.target.value) }));
                        } catch (err) {
                          console.error('Scatter change error:', err);
                        }
                      }}
                      className="w-full accent-amber-500 h-1 bg-neutral-800 rounded cursor-pointer"
                    />
                  </div>

                  {/* Streamline Smoothing */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8.5px]">
                      <span className="text-neutral-400 font-bold">ML Curve Stabilizer:</span>
                      <span className="text-emerald-400 font-mono font-bold">{Math.round((brushSettings.streamline ?? 0.5) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round((brushSettings.streamline ?? 0.5) * 100)}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({ ...prev, streamline: Number(e.target.value) / 100 }));
                        } catch (err) {
                          console.error('Streamline change error:', err);
                        }
                      }}
                      className="w-full accent-emerald-500 h-1 bg-neutral-800 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Brush Color & Swatches */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] text-neutral-400 font-bold uppercase">
                    <span>Stroke Color</span>
                    <input
                      type="color"
                      value={brushSettings.strokeColor ?? '#000000'}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({ ...prev, strokeColor: e.target.value }));
                        } catch (err) {
                          console.error('Stroke color error:', err);
                        }
                      }}
                      className="w-5 h-5 rounded cursor-pointer border border-neutral-700 bg-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#78716c', '#06b6d4', '#84cc16', '#f43f5e', '#14b8a6'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          try {
                            setBrushSettings(prev => ({ ...prev, strokeColor: color }));
                          } catch (err) {
                            console.error('Color swatch click error:', err);
                          }
                        }}
                        style={{ backgroundColor: color }}
                        className={`h-5 rounded-md border ${brushSettings.strokeColor === color ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105' : 'border-neutral-700'} transition-all`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 🧹 Eraser Tool Controls */}
            {activeTool === 'ERS' && eraserSettings && setEraserSettings && (
              <div className="border border-rose-500/40 bg-neutral-950/95 rounded-2xl p-3 space-y-3 shrink-0 shadow-xl animate-fade-in" id="eraser-tool-panel">
                <div className="flex items-center justify-between text-rose-400">
                  <div className="flex items-center gap-1.5">
                    <Eraser className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider font-sans">Strict Real Vector Eraser</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 font-mono font-bold uppercase border border-rose-500/20">
                    No Paint
                  </span>
                </div>

                <p className="text-[9px] text-neutral-300 leading-normal font-medium">
                  Strictly deletes vector paths and splits strokes into true separate segments. Never covers drawings with white paint!
                </p>

                {/* Eraser Size Slider & Circle Indicator */}
                <div className="space-y-1.5 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-neutral-400 font-bold">Eraser Radius:</span>
                    <span className="text-rose-400 font-mono font-bold">{eraserSettings.radius ?? 25}px</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={200}
                    value={eraserSettings.radius ?? 25}
                    onChange={(e) => {
                      try {
                        setEraserSettings(prev => ({ ...prev, radius: Number(e.target.value) }));
                      } catch (err) {
                        console.error('Eraser radius change error:', err);
                      }
                    }}
                    className="w-full accent-rose-500 h-1 bg-neutral-800 rounded cursor-pointer"
                  />
                  {/* Live circular preview indicator */}
                  <div className="flex items-center justify-center py-2">
                    <div
                      style={{
                        width: Math.min(60, (eraserSettings.radius ?? 25) * 1.5),
                        height: Math.min(60, (eraserSettings.radius ?? 25) * 1.5)
                      }}
                      className="rounded-full border-2 border-dashed border-rose-400/80 bg-rose-500/10 flex items-center justify-center text-[8px] text-rose-300 font-mono"
                    >
                      {eraserSettings.radius}
                    </div>
                  </div>
                </div>

                {/* Eraser Mode */}
                <div className="space-y-1">
                  <label className="text-[9px] text-neutral-400 font-bold uppercase">Eraser Mode</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'cut', label: 'Vector Cut / Slice', desc: 'Splits strokes into continuous segments' },
                      { id: 'point', label: 'Point Erase', desc: 'Removes vertices inside radius' },
                      { id: 'stroke', label: 'Whole Stroke', desc: 'Deletes touched stroke entirely' },
                      { id: 'area', label: 'Area Erase', desc: 'Erases fills & points in area' }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          try {
                            setEraserSettings(prev => ({ ...prev, mode: m.id as any }));
                          } catch (err) {
                            console.error('Eraser mode error:', err);
                          }
                        }}
                        className={`text-left p-1.5 rounded-lg border transition-all ${
                          (eraserSettings.mode ?? 'cut') === m.id
                            ? 'bg-rose-500 text-white border-rose-400 font-bold shadow-sm'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                        }`}
                      >
                        <div className="text-[9px] font-bold">{m.label}</div>
                        <div className="text-[7.5px] opacity-80 leading-tight">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Layer Protect */}
                <label className="flex items-center justify-between cursor-pointer py-1 bg-neutral-900/40 px-2 rounded-lg border border-neutral-800/60">
                  <span className="text-[9px] text-neutral-300 font-bold">Erase Active Layer Only</span>
                  <input
                    type="checkbox"
                    checked={eraserSettings.eraseActiveLayerOnly ?? true}
                    onChange={(e) => {
                      try {
                        setEraserSettings(prev => ({ ...prev, eraseActiveLayerOnly: e.target.checked }));
                      } catch (err) {
                        console.error('Eraser layer toggle error:', err);
                      }
                    }}
                    className="accent-rose-500 rounded cursor-pointer"
                  />
                </label>

                {/* Instant Erase Actions */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        if (selectedObjectId) deleteObject(selectedObjectId);
                      } catch (err) {
                        console.error('Delete selected error:', err);
                      }
                    }}
                    disabled={!selectedObjectId}
                    className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 text-[9px] font-bold py-1.5 px-2 rounded-lg border border-neutral-800 transition-colors uppercase cursor-pointer text-center truncate"
                  >
                    Erase Selected
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        Object.keys(objects).forEach(id => {
                          if (objects[id]?.layerId === activeLayerId) deleteObject(id);
                        });
                      } catch (err) {
                        console.error('Clear layer error:', err);
                      }
                    }}
                    className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[9px] font-black py-1.5 px-2 rounded-lg border border-rose-500/30 transition-colors uppercase cursor-pointer text-center truncate"
                  >
                    Clear Layer
                  </button>
                </div>
              </div>
            )}

            {/* ✒️ Pen / Bezier Tool Controls */}
            {activeTool === 'PEN' && (
              <div className="border border-cyan-500/40 bg-neutral-950/95 rounded-2xl p-3 space-y-3 shrink-0 shadow-xl animate-fade-in" id="pen-tool-panel">
                <div className="flex items-center justify-between text-cyan-400">
                  <div className="flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider font-sans">Vector Bézier Pen</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono font-bold uppercase border border-cyan-500/20">
                    Real-time Bending
                  </span>
                </div>

                <p className="text-[9px] text-neutral-300 leading-normal font-medium">
                  Click or drag to place <b>Anchor Points</b> and <b>Direction Tangents</b>. The stroke draws, blends, and bends in real time — no need to connect first and last point!
                </p>

                <div className="bg-neutral-900/80 p-2 rounded-xl border border-neutral-800 text-[9px] text-cyan-300 font-bold space-y-1">
                  <div>• <b>Click & Drag:</b> Add anchor & pull handles to stretch/bend</div>
                  <div>• <b>Real-time Stroke:</b> Stroke renders & blends live on canvas</div>
                  <div>• <b>Edit Tangents:</b> Click square anchor or handle dots to reshape</div>
                  <div>• <b>Erase Drawing:</b> Use Eraser tool or click Erase button below</div>
                </div>

                {/* Path Action & Erase Controls */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        window.dispatchEvent(new CustomEvent('anim:finish-pen-stroke'));
                      } catch (err) {
                        console.error('Finish pen stroke error:', err);
                      }
                    }}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-[9.5px] font-black py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-md text-center flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    Finish / New Pen Stroke
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      try {
                        window.dispatchEvent(new CustomEvent('anim:erase-pen-drawing'));
                        if (selectedObjectId && objects[selectedObjectId] && selectedObjectId.startsWith('obj_')) {
                          deleteObject(selectedObjectId);
                        }
                      } catch (err) {
                        console.error('Erase pen drawing error:', err);
                      }
                    }}
                    className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[9.5px] font-bold py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer border border-rose-500/40 text-center flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    Erase Pen Drawing
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      try {
                        window.dispatchEvent(new CustomEvent('anim:erase-selected-anchor'));
                      } catch (err) {
                        console.error('Erase selected anchor error:', err);
                      }
                    }}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[9px] font-medium py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer border border-neutral-800 text-center"
                  >
                    Erase Selected Anchor Node
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      try {
                        if (selectedObjectId && objects[selectedObjectId]) {
                          const pts = [...objects[selectedObjectId].points].reverse();
                          updateObject(selectedObjectId, { points: pts });
                        }
                      } catch (err) {
                        console.error('Reverse path error:', err);
                      }
                    }}
                    disabled={!selectedObjectId}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-cyan-300 text-[9px] font-bold py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer border border-neutral-800 text-center"
                  >
                    Reverse Path Direction
                  </button>
                </div>
              </div>
            )}

            {/* 🎯 Lasso Batch Processing Suite */}
            {activeTool === 'LSO' && (
              <div className="border border-amber-500/40 bg-neutral-950/95 rounded-2xl p-3 space-y-3 shrink-0 shadow-xl animate-fade-in" id="lasso-batch-panel">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider font-sans">Lasso Batch Processing Suite</span>
                </div>
                <p className="text-[9px] text-neutral-300 leading-normal font-medium">
                  Draw a closed loop around multiple drawings on the canvas. Perform batch duplicate, move, scale, delete, or bulk color changes!
                </p>
                
                {lassoPoints && lassoPoints.length >= 3 ? (
                  <div className="space-y-2.5 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-neutral-400 font-bold">Lasso Boundary:</span>
                      <span className="text-emerald-400 font-mono font-black">Active Loop ({lassoPoints.length} pts)</span>
                    </div>

                    {/* Batch Duplicate */}
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (duplicateLassoBatch) duplicateLassoBatch();
                        } catch (err) {
                          console.error('Duplicate lasso batch error:', err);
                        }
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 text-[10px] font-black py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3 h-3" />
                      Duplicate Lasso Batch
                    </button>

                    {/* Batch Scale Controls */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            if (batchScaleLasso) batchScaleLasso(1.1);
                          } catch (err) {
                            console.error('Batch scale up error:', err);
                          }
                        }}
                        className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[9px] font-bold py-1.5 px-2 rounded-lg border border-neutral-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <ZoomIn className="w-3 h-3 text-amber-400" />
                        Scale +10%
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            if (batchScaleLasso) batchScaleLasso(0.9);
                          } catch (err) {
                            console.error('Batch scale down error:', err);
                          }
                        }}
                        className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[9px] font-bold py-1.5 px-2 rounded-lg border border-neutral-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <ZoomOut className="w-3 h-3 text-amber-400" />
                        Scale -10%
                      </button>
                    </div>

                    {/* Batch Align Controls */}
                    <div className="space-y-1">
                      <span className="text-[8.5px] text-neutral-400 font-bold uppercase">Batch Alignment</span>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'left', label: 'Left', icon: AlignLeft },
                          { id: 'center', label: 'Center', icon: AlignCenter },
                          { id: 'top', label: 'Top', icon: AlignVerticalSpaceAround },
                          { id: 'bottom', label: 'Bottom', icon: AlignRight }
                        ].map(a => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              try {
                                if (batchAlignLasso) batchAlignLasso(a.id as any);
                              } catch (err) {
                                console.error('Batch align error:', err);
                              }
                            }}
                            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white p-1 rounded-md text-[8.5px] font-bold flex flex-col items-center gap-0.5 border border-neutral-700/60"
                          >
                            <a.icon className="w-2.5 h-2.5 text-amber-400" />
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Batch Color Swatches */}
                    <div className="space-y-1">
                      <span className="text-[8.5px] text-neutral-400 font-bold uppercase">Batch Tint Color</span>
                      <div className="grid grid-cols-6 gap-1">
                        {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'].map(col => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => {
                              try {
                                if (batchColorLasso) batchColorLasso(col);
                              } catch (err) {
                                console.error('Batch color error:', err);
                              }
                            }}
                            style={{ backgroundColor: col }}
                            className="h-4 rounded border border-neutral-700 hover:scale-110 transition-transform"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Batch Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (deleteLassoBatch) deleteLassoBatch();
                        } catch (err) {
                          console.error('Batch delete error:', err);
                        }
                      }}
                      className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[9px] font-bold py-1 rounded-lg border border-rose-500/30 transition-colors uppercase cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete Batch Enclosed
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-center">
                    <span className="text-[9px] text-neutral-500 font-extrabold leading-normal block">Draw a closed loop on the canvas to select drawings.</span>
                  </div>
                )}
              </div>
            )}

            {/* 🎯 Pivot Tool Controls */}
            {activeTool === 'PVT' && (
              <div className="border border-indigo-500/40 bg-neutral-950/95 rounded-2xl p-3 space-y-3 shrink-0 shadow-xl animate-fade-in" id="pivot-tool-panel">
                <div className="flex items-center justify-between text-indigo-400">
                  <div className="flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider font-sans">Pivot Transform Origin</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono font-bold uppercase border border-indigo-500/20">
                    Snap Grid
                  </span>
                </div>

                <p className="text-[9px] text-neutral-300 leading-normal font-medium">
                  Sets the rotation and scaling center point of drawings. Click anywhere on canvas or choose a 9-point snapping anchor!
                </p>

                {selectedObjectId && objects[selectedObjectId] ? (
                  <div className="space-y-2.5 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-neutral-400 font-bold">Selected:</span>
                      <span className="text-indigo-400 font-bold truncate max-w-[120px]">{objects[selectedObjectId].name}</span>
                    </div>

                    {/* Coordinates Readout */}
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                      <div>
                        <span className="text-neutral-500 block text-[7.5px] uppercase font-bold">Local Pivot</span>
                        <span className="text-indigo-300 font-bold">
                          X: {Number(objects[selectedObjectId].pivots?.[0]?.localX ?? 0).toFixed(1)}
                        </span>
                        <span className="text-indigo-300 font-bold block">
                          Y: {Number(objects[selectedObjectId].pivots?.[0]?.localY ?? 0).toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[7.5px] uppercase font-bold">World Pivot</span>
                        <span className="text-emerald-300 font-bold">
                          X: {Number((objects[selectedObjectId].transform?.x ?? 0) + (objects[selectedObjectId].pivots?.[0]?.localX ?? 0)).toFixed(1)}
                        </span>
                        <span className="text-emerald-300 font-bold block">
                          Y: {Number((objects[selectedObjectId].transform?.y ?? 0) + (objects[selectedObjectId].pivots?.[0]?.localY ?? 0)).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* 9-Point Snapping Grid */}
                    <div className="space-y-1">
                      <span className="text-[8.5px] text-neutral-400 font-bold uppercase">Snap Pivot Position</span>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'tl', label: 'TL', fx: 0, fy: 0 },
                          { id: 'tc', label: 'TC', fx: 0.5, fy: 0 },
                          { id: 'tr', label: 'TR', fx: 1, fy: 0 },
                          { id: 'ml', label: 'ML', fx: 0, fy: 0.5 },
                          { id: 'center', label: 'Center', fx: 0.5, fy: 0.5 },
                          { id: 'mr', label: 'MR', fx: 1, fy: 0.5 },
                          { id: 'bl', label: 'BL', fx: 0, fy: 1 },
                          { id: 'bc', label: 'BC', fx: 0.5, fy: 1 },
                          { id: 'br', label: 'BR', fx: 1, fy: 1 },
                        ].map(pos => (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => {
                              try {
                                const obj = objects[selectedObjectId];
                                if (!obj || !obj.points || obj.points.length === 0) return;
                                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                                obj.points.forEach(p => {
                                  if (p.x < minX) minX = p.x;
                                  if (p.y < minY) minY = p.y;
                                  if (p.x > maxX) maxX = p.x;
                                  if (p.y > maxY) maxY = p.y;
                                });
                                const targetX = minX + (maxX - minX) * pos.fx;
                                const targetY = minY + (maxY - minY) * pos.fy;

                                const currentPivots = obj.pivots ? [...obj.pivots] : [{ id: `pvt_${Date.now()}`, name: 'Pivot_1', localX: 0, localY: 0, locked: false }];
                                currentPivots[0] = {
                                  ...currentPivots[0],
                                  localX: Number(targetX.toFixed(2)),
                                  localY: Number(targetY.toFixed(2))
                                };
                                updateObject(selectedObjectId, { pivots: currentPivots });
                              } catch (err) {
                                console.error('Pivot snap error:', err);
                              }
                            }}
                            className="bg-neutral-800 hover:bg-indigo-600 text-neutral-300 hover:text-white text-[8px] font-black py-1.5 rounded border border-neutral-700/80 transition-colors uppercase text-center cursor-pointer"
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset Pivot Button */}
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const obj = objects[selectedObjectId];
                          if (!obj || !obj.points) return;
                          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                          obj.points.forEach(p => {
                            if (p.x < minX) minX = p.x;
                            if (p.y < minY) minY = p.y;
                            if (p.x > maxX) maxX = p.x;
                            if (p.y > maxY) maxY = p.y;
                          });
                          const centerX = (minX + maxX) / 2;
                          const centerY = (minY + maxY) / 2;
                          const currentPivots = obj.pivots ? [...obj.pivots] : [{ id: `pvt_${Date.now()}`, name: 'Pivot_1', localX: 0, localY: 0, locked: false }];
                          currentPivots[0] = {
                            ...currentPivots[0],
                            localX: Number(centerX.toFixed(2)),
                            localY: Number(centerY.toFixed(2))
                          };
                          updateObject(selectedObjectId, { pivots: currentPivots });
                        } catch (err) {
                          console.error('Reset pivot error:', err);
                        }
                      }}
                      className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[9px] font-bold py-1.5 rounded-lg border border-neutral-700 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-indigo-400" />
                      Reset Pivot to Center
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-center">
                    <span className="text-[9px] text-neutral-500 font-extrabold leading-normal block">Select a drawing to adjust its pivot point.</span>
                  </div>
                )}
              </div>
            )}

            {/* 🗡️ Knife Tool Controls */}
            {activeTool === 'KNF' && knifeSettings && setKnifeSettings && (
              <div className="border border-emerald-500/40 bg-neutral-950/95 rounded-2xl p-3 space-y-3 shrink-0 shadow-xl animate-fade-in" id="knife-tool-panel">
                <div className="flex items-center justify-between text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider font-sans">Knife Slicing Engine</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono font-bold uppercase border border-emerald-500/20">
                    Real Path Cut
                  </span>
                </div>

                <p className="text-[9px] text-neutral-300 leading-normal font-medium">
                  Drag across any 2D vector drawing or 3D object to slice it into distinct separate objects along the cut line!
                </p>

                {/* Separation Gap Slider */}
                <div className="space-y-1.5 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-neutral-400 font-bold">Cut Separation Gap:</span>
                    <span className="text-emerald-400 font-mono font-bold">{knifeSettings.separateDistance ?? 8}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={knifeSettings.separateDistance ?? 8}
                    onChange={(e) => {
                      try {
                        setKnifeSettings(prev => ({ ...prev, separateDistance: Number(e.target.value) }));
                      } catch (err) {
                        console.error('Knife gap error:', err);
                      }
                    }}
                    className="w-full accent-emerald-500 h-1 bg-neutral-800 rounded cursor-pointer"
                  />
                  <div className="text-[8px] text-neutral-500">
                    Automatically separates the two cut halves by this gap distance.
                  </div>
                </div>

                {/* Slicing Keep Mode */}
                <div className="space-y-1">
                  <label className="text-[9px] text-neutral-400 font-bold uppercase">Keep Sliced Pieces</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'both', label: 'Both' },
                      { id: 'left', label: 'Left Only' },
                      { id: 'right', label: 'Right Only' }
                    ].map(k => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => {
                          try {
                            setKnifeSettings(prev => ({ ...prev, keepSide: k.id as any }));
                          } catch (err) {
                            console.error('Knife keep side error:', err);
                          }
                        }}
                        className={`text-[9px] py-1 px-1 rounded-lg font-bold border transition-all text-center uppercase ${
                          (knifeSettings.keepSide ?? 'both') === k.id
                            ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-sm'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                        }`}
                      >
                        {k.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smooth Cut Edge Toggle */}
                <label className="flex items-center justify-between cursor-pointer py-1 bg-neutral-900/40 px-2 rounded-lg border border-neutral-800/60">
                  <span className="text-[9px] text-neutral-300 font-bold">Smooth Cut Edges</span>
                  <input
                    type="checkbox"
                    checked={knifeSettings.smoothCut ?? true}
                    onChange={(e) => {
                      try {
                        setKnifeSettings(prev => ({ ...prev, smoothCut: e.target.checked }));
                      } catch (err) {
                        console.error('Knife smooth error:', err);
                      }
                    }}
                    className="accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            )}

            {/* 🧹 Smart Vector Eraser Suite */}
            {activeTool === 'ERS' && eraserSettings && setEraserSettings && (
              <div className="border border-rose-500/40 bg-neutral-950/95 rounded-2xl p-3 space-y-3 shrink-0 shadow-xl animate-fade-in" id="eraser-tool-panel">
                <div className="flex items-center justify-between text-rose-400">
                  <div className="flex items-center gap-1.5">
                    <Eraser className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider font-sans">Vector Eraser Engine</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 font-mono font-bold uppercase border border-rose-500/20">
                    Real Vector
                  </span>
                </div>

                <p className="text-[9px] text-neutral-300 leading-normal font-medium">
                  Cut, split, or erase vector lines and shapes in real-time. Works across both individual drawings and 3D meshes.
                </p>

                {/* Eraser Radius Slider */}
                <div className="space-y-1.5 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-neutral-400 font-bold">Eraser Brush Size:</span>
                    <span className="text-rose-400 font-mono font-bold">{eraserSettings.radius ?? 25}px</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    value={eraserSettings.radius ?? 25}
                    onChange={(e) => {
                      try {
                        setEraserSettings(prev => ({ ...prev, radius: Number(e.target.value) }));
                      } catch (err) {
                        console.error('Eraser radius error:', err);
                      }
                    }}
                    className="w-full accent-rose-500 h-1 bg-neutral-800 rounded cursor-pointer"
                  />
                </div>

                {/* Eraser Mode Buttons */}
                <div className="space-y-1">
                  <label className="text-[9px] text-neutral-400 font-bold uppercase">Erase Mode</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'cut', label: 'Vector Cut' },
                      { id: 'stroke', label: 'Whole Stroke' },
                      { id: 'point', label: 'Vertex Trim' }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          try {
                            setEraserSettings(prev => ({ ...prev, mode: m.id as any }));
                          } catch (err) {
                            console.error('Eraser mode error:', err);
                          }
                        }}
                        className={`text-[8.5px] py-1 px-1 rounded-lg font-bold border transition-all text-center uppercase ${
                          (eraserSettings.mode ?? 'cut') === m.id
                            ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Selected Drawing Quick Action */}
                {selectedObjectId && (
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        deleteObject(selectedObjectId);
                      } catch (err) {
                        console.error('Eraser delete object error:', err);
                      }
                    }}
                    className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[9px] font-bold py-1.5 rounded-lg border border-rose-500/20 uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Erase Entire Selected Object
                  </button>
                )}
              </div>
            )}

            {/* 🖌️ ML Smart Brush Suite */}
            {activeTool === 'BRS' && brushSettings && setBrushSettings && (
              <div className="border border-cyan-500/40 bg-neutral-950/95 rounded-2xl p-3 space-y-3 shrink-0 shadow-xl animate-fade-in" id="brush-tool-panel">
                <div className="flex items-center justify-between text-cyan-400">
                  <div className="flex items-center gap-1.5">
                    <Brush className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider font-sans">ML Vector Brush Studio</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono font-bold uppercase border border-cyan-500/20">
                    Smart Stabilized
                  </span>
                </div>

                {/* Brush Width & Opacity */}
                <div className="space-y-2 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-neutral-400 font-bold">Stroke Thickness:</span>
                      <span className="text-cyan-400 font-mono font-bold">{brushSettings.strokeWidth ?? 4}px</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={64}
                      value={brushSettings.strokeWidth ?? 4}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({ ...prev, strokeWidth: Number(e.target.value) }));
                        } catch (err) {
                          console.error('Brush width error:', err);
                        }
                      }}
                      className="w-full accent-cyan-500 h-1 bg-neutral-800 rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-neutral-400 font-bold">Opacity:</span>
                      <span className="text-cyan-400 font-mono font-bold">{Math.round((brushSettings.opacity ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={Math.round((brushSettings.opacity ?? 1) * 100)}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({ ...prev, opacity: Number(e.target.value) / 100 }));
                        } catch (err) {
                          console.error('Brush opacity error:', err);
                        }
                      }}
                      className="w-full accent-cyan-500 h-1 bg-neutral-800 rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-neutral-400 font-bold">Streamline Stabilization:</span>
                      <span className="text-cyan-400 font-mono font-bold">{brushSettings.streamline ?? 40}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={brushSettings.streamline ?? 40}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({ ...prev, streamline: Number(e.target.value) }));
                        } catch (err) {
                          console.error('Brush streamline error:', err);
                        }
                      }}
                      className="w-full accent-cyan-500 h-1 bg-neutral-800 rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-neutral-400 font-bold">Jitter / Scatter:</span>
                      <span className="text-cyan-400 font-mono font-bold">{brushSettings.jitterScatter ?? 0}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={brushSettings.jitterScatter ?? 0}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({ ...prev, jitterScatter: Number(e.target.value) }));
                        } catch (err) {
                          console.error('Brush jitter error:', err);
                        }
                      }}
                      className="w-full accent-cyan-500 h-1 bg-neutral-800 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Brush Color Picker */}
                <div className="space-y-1.5">
                  <span className="text-[8.5px] text-neutral-400 font-bold uppercase">Brush Ink Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brushSettings.strokeColor ?? '#000000'}
                      onChange={(e) => {
                        try {
                          setBrushSettings(prev => ({ ...prev, strokeColor: e.target.value }));
                        } catch (err) {
                          console.error('Brush color error:', err);
                        }
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <div className="grid grid-cols-6 gap-1 flex-1">
                      {['#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6'].map(col => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => {
                            try {
                              setBrushSettings(prev => ({ ...prev, strokeColor: col }));
                            } catch (err) {
                              console.error('Brush preset color error:', err);
                            }
                          }}
                          style={{ backgroundColor: col }}
                          className="h-5 rounded border border-neutral-700 hover:scale-105 transition-transform"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}



            {/* 🤖 Machine Learning Acceleration & Smart Shape Studio */}
            {mlSettings && setMlSettings && (
              <div className="border border-purple-500/40 bg-neutral-950/95 rounded-2xl p-3 space-y-3 shrink-0 shadow-xl animate-fade-in" id="ml-ai-panel">
                <div className="flex items-center justify-between text-purple-400">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider font-sans">ML Geometric Intelligence</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono font-bold uppercase border border-purple-500/20">
                    1000k+ Assets
                  </span>
                </div>

                <p className="text-[9px] text-neutral-300 leading-normal font-medium">
                  Accelerated spatial indexing and neural shape recognition for ultra-fast performance across thousands of objects.
                </p>

                {/* Smart Shape Detection Toggle */}
                <label className="flex items-center justify-between cursor-pointer py-1 bg-neutral-900/40 px-2 rounded-lg border border-neutral-800/60">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-200 font-bold">Smart Shape Detection</span>
                    <span className="text-[7.5px] text-neutral-400">Auto-converts sketches to perfect circles, rectangles & stars</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={mlSettings.smartShapeDetection ?? true}
                    onChange={(e) => {
                      try {
                        setMlSettings(prev => ({ ...prev, smartShapeDetection: e.target.checked }));
                      } catch (err) {
                        console.error('ML shape error:', err);
                      }
                    }}
                    className="accent-purple-500 rounded cursor-pointer"
                  />
                </label>

                {/* Stroke Stabilizer Strength Slider */}
                <div className="space-y-1 bg-neutral-900/60 p-2 rounded-xl border border-neutral-800">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-neutral-400 font-bold">ML Predictive Stabilizer:</span>
                    <span className="text-purple-400 font-mono font-bold">{Math.round((mlSettings.stabilizerStrength ?? 0.4) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((mlSettings.stabilizerStrength ?? 0.4) * 100)}
                    onChange={(e) => {
                      try {
                        setMlSettings(prev => ({ ...prev, stabilizerStrength: Number(e.target.value) / 100 }));
                      } catch (err) {
                        console.error('ML stabilizer error:', err);
                      }
                    }}
                    className="w-full accent-purple-500 h-1 bg-neutral-800 rounded cursor-pointer"
                  />
                </div>

                {/* Spatial Hashing Acceleration Toggle */}
                <label className="flex items-center justify-between cursor-pointer py-1 bg-neutral-900/40 px-2 rounded-lg border border-neutral-800/60">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-200 font-bold">Spatial Hashing Grid</span>
                    <span className="text-[7.5px] text-neutral-400">O(1) hit testing for 1000k+ vector objects</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={mlSettings.spatialHashAcceleration ?? true}
                    onChange={(e) => {
                      try {
                        setMlSettings(prev => ({ ...prev, spatialHashAcceleration: e.target.checked }));
                      } catch (err) {
                        console.error('ML spatial hash error:', err);
                      }
                    }}
                    className="accent-purple-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            )}

            {/* 🎨 Premium Fill Bucket Configuration */}
            {activeTool === 'FIL' && (
              <div className="border border-emerald-500/30 bg-neutral-950/90 rounded-2xl p-3 space-y-3 shrink-0 shadow-lg animate-fade-in" id="fill-tool-panel">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <PaintBucket className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Fill Tool Controls</span>
                </div>
                <p className="text-[9px] text-neutral-400 leading-normal font-medium">
                  Select a color and click on a <b>selected</b> drawing.
                  <br />
                  • <b>Closed Path:</b> Fills inner area (preserves stroke).
                  <br />
                  • <b>Open Path:</b> Color is applied directly to the stroke.
                </p>

                {/* Apply Fill Forever Toggle */}
                <div className="flex items-center justify-between py-1.5 bg-neutral-900/40 px-2 rounded-xl border border-neutral-800/40">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-300 font-bold uppercase">Apply Fill Forever</span>
                    <span className="text-[8px] text-neutral-500">Apply color to all frames on drawing</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!applyFillForever}
                      onChange={(e) => setApplyFillForever?.(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-neutral-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-500 after:border-neutral-400 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white" />
                  </label>
                </div>

                {/* Full Closed Fill Toggle */}
                <div className="flex items-center justify-between py-1.5 bg-neutral-900/40 px-2 rounded-xl border border-neutral-800/40">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-300 font-bold uppercase">Full Closed Fill</span>
                    <span className="text-[8px] text-neutral-500">Fill nested inner shapes too</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!ignoreInnerDrawings}
                      onChange={(e) => setIgnoreInnerDrawings?.(!e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-neutral-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-500 after:border-neutral-400 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white" />
                  </label>
                </div>

                {/* One-Tap Apply Fill Button */}
                <button
                  type="button"
                  onClick={applyColorFillToSelected}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black uppercase text-[10px] rounded-xl tracking-wider shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Apply fill color to selected drawing immediately"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Apply Fill to Selected
                </button>

                {/* Color Selection HUD */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-widest">Active Fill Color</span>
                  </div>
                  <CustomColorPicker
                    color={fillToolColor || '#4CAF50'}
                    onChange={(c) => setFillToolColor?.(c)}
                  />
                  {/* Preset Swatches */}
                  <div className="grid grid-cols-6 gap-1 pt-1">
                    {['#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB', '#1E88E5', '#039BE5', '#00ACC1', '#00897B', '#43A047', '#7CB342', '#FDD835', '#FFB300', '#F4511E', '#6D4C41', '#757575', '#37474F', '#000000'].map(swatch => (
                      <button
                        key={swatch}
                        onClick={() => setFillToolColor?.(swatch)}
                        style={{ backgroundColor: swatch }}
                        className={`w-full h-4 rounded-md transition-all border ${
                          fillToolColor === swatch ? 'border-white scale-110 shadow' : 'border-transparent hover:scale-105'
                        }`}
                        title={swatch}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 360° Studio Creation Center */}
            {activeTool === '360' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 space-y-3.5 animate-fade-in shrink-0">
                <div className="flex items-center gap-1.5 text-amber-400 justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider">360° Pseudo-3D Studio</span>
                  </div>
                </div>

                {!is360WizardActive ? (
                  <div className="space-y-3">
                    <p className="text-[10px] text-neutral-400 font-medium leading-normal">
                      Turn standard 2D layers into fully rotating characters. Select drawings manually or use our smart step-by-step drawing wizard!
                    </p>

                    {/* Interactive Wizard Start */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-center space-y-2">
                      <span className="text-[9px] text-amber-400 font-bold block">⭐ Interactive Co-Location Wizard</span>
                      <p className="text-[9px] text-neutral-400 leading-snug">
                        Draw your viewpoints (Front, Side, Back, etc.) one by one at the exact same spot. Wizard hides previous drawings and provides <b>onion skin guides</b> automatically!
                      </p>
                      <button
                        onClick={() => {
                          if (start360Wizard) {
                            start360Wizard();
                            setCustomViewName('Front View');
                            setCustomViewAngle(0);
                          }
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 text-[10px] font-black py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-md"
                      >
                        🚀 Launch Drawing Wizard
                      </button>
                    </div>

                    <div className="h-[1px] bg-neutral-850 my-2" />

                    {/* Classic Manual Selection Compile Option as Fallback */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-neutral-500 font-bold block">Option B: Classic Bulk Compiler</span>
                      {/* Available Drawings */}
                      <div className="space-y-1.5">
                        <span className="text-[8px] text-neutral-500 font-black uppercase tracking-widest block">Available 2D Drawings</span>
                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                          {Object.values(objects)
                            .filter(obj => obj.type !== '360_container' && obj.type !== '3d')
                            .map(obj => {
                              const isChecked = selected360Ids.includes(obj.id);
                              return (
                                <div 
                                  key={obj.id}
                                  onClick={() => {
                                    if (isChecked) {
                                      setSelected360Ids(selected360Ids.filter(id => id !== obj.id));
                                    } else {
                                      setSelected360Ids([...selected360Ids, obj.id]);
                                    }
                                  }}
                                  className={`flex items-center gap-2 p-1.5 rounded-xl text-xs cursor-pointer border transition-all ${
                                    isChecked 
                                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                                      : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-neutral-200'
                                  }`}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    readOnly
                                    className="accent-amber-500 rounded border-neutral-800 scale-90"
                                  />
                                  <span className="font-bold truncate text-[11px]">{obj.name}</span>
                                </div>
                              );
                            })
                          }
                          {Object.values(objects).filter(obj => obj.type !== '360_container' && obj.type !== '3d').length === 0 && (
                            <div className="text-[9px] text-neutral-500 font-medium text-center py-4 bg-neutral-950 border border-neutral-900 rounded-xl">
                              No 2D drawings found. Draw some elements first!
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Build Button */}
                      <button
                        onClick={() => {
                          if (selected360Ids.length === 0) {
                            alert("Please select at least one drawing.");
                            return;
                          }
                          if (add360Object) {
                            add360Object(selected360Ids);
                            setSelected360Ids([]);
                          }
                        }}
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                      >
                        Compile Selected ({selected360Ids.length})
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Active Wizard Flow */}
                    <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          WIZARD STEP 1: ADD VIEW
                        </span>
                        <button 
                          onClick={cancel360Wizard}
                          className="text-[9px] text-neutral-400 hover:text-white underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      {selectedObjectId && objects[selectedObjectId] && objects[selectedObjectId].type !== '360_container' && objects[selectedObjectId].type !== '3d' ? (
                        <div className="space-y-2.5">
                          <div className="p-2 bg-neutral-950 border border-neutral-850 rounded-lg text-[10px] text-white">
                            Selected Drawing: <b className="text-amber-400">{objects[selectedObjectId].name}</b>
                          </div>

                          {/* View Name configuration */}
                          <div className="space-y-1">
                            <label className="text-[8px] text-neutral-400 font-extrabold uppercase tracking-widest block">Viewpoint Custom Name</label>
                            <input 
                              type="text"
                              value={customViewName}
                              onChange={(e) => setCustomViewName(e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg p-1 text-[11px] font-bold focus:border-amber-500/50 focus:outline-none"
                            />
                            {/* Preset Buttons */}
                            <div className="flex flex-wrap gap-1">
                              {[
                                { n: 'Front View', a: 0 },
                                { n: 'Right View', a: 90 },
                                { n: 'Back View', a: 180 },
                                { n: 'Left View', a: 270 }
                              ].map(p => (
                                <button
                                  key={p.n}
                                  onClick={() => {
                                    setCustomViewName(p.n);
                                    setCustomViewAngle(p.a);
                                  }}
                                  className="bg-neutral-800 hover:bg-neutral-750 text-[9px] font-bold text-neutral-300 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
                                >
                                  {p.n} ({p.a}°)
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Angle slider configuration */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] text-neutral-400 font-extrabold uppercase tracking-widest">
                              <span>View Angle</span>
                              <span className="text-amber-400 font-bold">{customViewAngle}°</span>
                            </div>
                            <input 
                              type="range"
                              min="0"
                              max="359"
                              value={customViewAngle}
                              onChange={(e) => setCustomViewAngle(Number(e.target.value))}
                              className="w-full accent-amber-500"
                            />
                          </div>

                          {/* Register View Trigger */}
                          <button
                            onClick={() => {
                              if (addDraft360View) {
                                addDraft360View(selectedObjectId, customViewName, customViewAngle);
                                // Suggest next logical viewpoint!
                                if (customViewAngle === 0) {
                                  setCustomViewName('Right View');
                                  setCustomViewAngle(90);
                                } else if (customViewAngle === 90) {
                                  setCustomViewName('Back View');
                                  setCustomViewAngle(180);
                                } else if (customViewAngle === 180) {
                                  setCustomViewName('Left View');
                                  setCustomViewAngle(270);
                                } else {
                                  setCustomViewName(`Angle ${customViewAngle + 45}°`);
                                  setCustomViewAngle((customViewAngle + 45) % 360);
                                }
                                setSelectedObjectId(null); // Unselect so they can draw fresh
                              }
                            }}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                          >
                            + Register "{customViewName}"
                          </button>
                        </div>
                      ) : (
                        <div className="bg-neutral-950 border border-neutral-900 rounded-lg p-2.5 text-center space-y-1.5 text-neutral-400">
                          <p className="text-[10px] font-bold text-neutral-300">
                            ✍️ Ready for "{customViewName}" ({customViewAngle}°)
                          </p>
                          <p className="text-[9px] leading-relaxed text-neutral-500">
                            Draw the model at this viewpoint exactly at the same location as previous drawings. Then, select the drawing on the canvas to register it!
                          </p>
                          <div className="flex justify-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[8px] font-mono text-neutral-500">
                              Brush/Pen/Upload
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Onion Skinning Toggle */}
                    <div className="flex items-center justify-between bg-neutral-900/50 border border-neutral-850 rounded-xl p-2 px-3">
                      <span className="text-[10px] text-neutral-300 font-bold">Onion Skinning (Trace Assist)</span>
                      <input 
                        type="checkbox"
                        checked={onionSkinEnabled360}
                        onChange={(e) => setOnionSkinEnabled360?.(e.target.checked)}
                        className="accent-amber-500 scale-110 cursor-pointer"
                      />
                    </div>

                    {/* Queue List of Registered Viewpoints */}
                    <div className="space-y-1">
                      <span className="text-[8px] text-neutral-500 font-black uppercase tracking-widest block">Registered viewpoints ({draft360Views.length})</span>
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {draft360Views.map((view, idx) => (
                          <div 
                            key={view.id}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-900 border border-neutral-850 text-[10px]"
                          >
                            <span className="font-bold text-neutral-300 truncate max-w-[120px]">{view.name}</span>
                            <span className="font-mono text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded text-[9px]">{view.angle}°</span>
                          </div>
                        ))}
                        {draft360Views.length === 0 && (
                          <div className="text-[9px] text-neutral-500 text-center py-2 italic">
                            Waiting for first viewpoint registration...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Compile step */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 space-y-2">
                      <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider block">STEP 2: COMPILE MASTER OBJECT</span>
                      <div className="space-y-1">
                        <label className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest block">Master Object Name</label>
                        <input 
                          type="text"
                          value={masterContainerName}
                          onChange={(e) => setMasterContainerName(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg p-1 text-[11px] font-bold focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (draft360Views.length === 0) {
                            alert("Please add at least one viewpoint before compiling.");
                            return;
                          }
                          if (compile360Wizard) {
                            compile360Wizard(masterContainerName);
                          }
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-black py-2 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                        disabled={draft360Views.length === 0}
                      >
                        💫 Convert to 360° Object ({draft360Views.length} views)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 📦 3D Models & Shapes Library */}
            <div className="border border-neutral-800/80 bg-neutral-900/50 rounded-2xl p-3 space-y-3.5 shrink-0">
              <button 
                type="button"
                onClick={() => setIs3DLibraryOpen(!is3DLibraryOpen)}
                className="w-full flex items-center justify-between text-left text-[10px] font-black uppercase tracking-wider text-amber-400 focus:outline-none"
              >
                <div className="flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5" />
                  <span>💫 2D to 3D Extrusion Engine</span>
                </div>
                <span>{is3DLibraryOpen ? '▼' : '▶'}</span>
              </button>

              {is3DLibraryOpen && (
                <div className="space-y-3.5 animate-fade-in">
                  <p className="text-[10px] text-neutral-400 leading-normal">
                    Draw freely on the canvas using our 2D brush or pen tool, select your drawing, and instantly convert it into a solid 3D mesh proxy!
                  </p>

                  {/* Daily Conversion Limit & Info Card */}
                  <div className="bg-neutral-950 rounded-xl p-3 border border-neutral-850 space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider text-neutral-400">
                      <span>💫 Daily 3D Limit</span>
                      <span className="text-amber-400 font-mono text-[10px] font-bold">
                        {getDailyLimitStatus(currentUser || 'guest').count} / 10 Used
                      </span>
                    </div>
                    <div className="h-1 bg-neutral-850 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all"
                        style={{ width: `${Math.min(100, (getDailyLimitStatus(currentUser || 'guest').count / 10) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-neutral-500 leading-normal">
                      Select any drawing or custom shape and click <b>💫 Convert to 3D</b> in the properties panel to convert it into a real 3D solid model.
                    </p>
                  </div>


                </div>
              )}
            </div>

            <div className="h-[1px] bg-neutral-800/40 my-2 shrink-0" />

            {/* Tree Section */}
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mb-2">
                Drawings and Groups
              </div>
              {rootObjects.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-600 font-bold border border-dashed border-neutral-800/80 rounded-2xl p-4">
                  Draw or upload PNG to begin. Drag items to parent them recursively!
                </div>
              ) : (
                rootObjects.map(obj => renderTreeItem(obj, 0))
              )}
            </div>

            {/* Layer Panel Section */}
            <div className="border-t border-neutral-800/60 pt-4 mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <LayerIcon className="w-3.5 h-3.5 text-amber-500" />
                  3D Depth Layers System
                </div>
                <button
                  onClick={handleAddLayer}
                  className="px-2 py-0.5 text-[10px] bg-neutral-800 border border-neutral-700 hover:bg-amber-500 hover:text-neutral-950 font-black rounded-lg transition-all"
                >
                  + ADD LAYER
                </button>
              </div>

              <div className="space-y-2.5">
                {sortedLayersList.map((layer, index) => {
                  const isActive = activeLayerId === layer.id;
                  const blur = (layer as any).blurAmount ?? 0;
                  const itemCount = Object.values(objects).filter(o => {
                    const eff = o.layerId || (layers && layers[0] ? layers[0].id : 'layer_1');
                    return eff === layer.id;
                  }).length;

                  return (
                    <div
                      key={layer.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLayerId(layer.id);
                      }}
                      className={`flex flex-col p-3 rounded-xl border text-xs transition-all cursor-pointer relative overflow-hidden ${
                        isActive
                          ? 'bg-amber-500/10 border-amber-400 text-amber-200 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                          : 'bg-neutral-950/90 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:bg-neutral-900'
                      }`}
                    >
                      {isActive && (
                        <div className="mb-2 flex items-center justify-between border-b border-amber-500/30 pb-1.5">
                          <span className="px-2 py-0.5 text-[9px] bg-amber-500 text-neutral-950 font-black rounded uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-950 animate-pulse" />
                            ACTIVE LAYER
                          </span>
                          <span className="text-[10px] text-amber-400/90 font-mono font-black">
                            {itemCount} {itemCount === 1 ? 'drawing' : 'drawings'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                        {editingLayerId === layer.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (editingLayerName.trim()) {
                                const sanitized = sanitizeString(editingLayerName.trim());
                                if (sanitized) {
                                  updateLayerProp(layer.id, { name: sanitized });
                                }
                              }
                              setEditingLayerId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 flex-1 mr-1"
                          >
                            <input
                              type="text"
                              value={editingLayerName}
                              onChange={(e) => setEditingLayerName(e.target.value)}
                              className="bg-neutral-900 border border-neutral-700 text-xs text-white rounded-lg px-2 py-0.5 focus:outline-none focus:border-amber-500 font-bold w-full"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (editingLayerName.trim()) {
                                    const sanitized = sanitizeString(editingLayerName.trim());
                                    if (sanitized) {
                                      updateLayerProp(layer.id, { name: sanitized });
                                    }
                                  }
                                  setEditingLayerId(null);
                                } else if (e.key === 'Escape') {
                                  setEditingLayerId(null);
                                }
                              }}
                            />
                            <button
                              type="submit"
                              className="text-emerald-400 hover:text-emerald-300 p-1 shrink-0"
                              title="Save Layer Name"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        ) : (
                          <div 
                            className="flex items-center gap-1.5 truncate max-w-[140px] flex-1 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveLayerId(layer.id);
                            }}
                          >
                            <span className="truncate font-black text-white select-none">{layer.name}</span>
                            {!isActive && (
                              <span className="text-[9px] text-neutral-500 font-mono font-normal shrink-0">
                                ({itemCount})
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          {/* Visibility Toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLayerProp(layer.id, { visible: !layer.visible });
                            }}
                            className="p-1 rounded hover:bg-neutral-850 text-neutral-400 hover:text-white"
                            title={layer.visible ? "Hide Layer Drawings" : "Show Layer Drawings"}
                          >
                            {layer.visible ? <Eye className="w-3.5 h-3.5 text-neutral-300" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
                          </button>

                          {/* Lock Toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLayerProp(layer.id, { locked: !layer.locked });
                            }}
                            className="p-1 rounded hover:bg-neutral-850 text-neutral-400 hover:text-white"
                            title="Lock Layer"
                          >
                            {layer.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 text-neutral-600" />}
                          </button>

                          {/* Move Up/Down */}
                          <button
                            onClick={(e) => moveLayer(layers.findIndex(l => l.id === layer.id), 'up', e)}
                            className="p-0.5 rounded hover:bg-neutral-800 text-[10px] text-neutral-500 hover:text-white"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            onClick={(e) => moveLayer(layers.findIndex(l => l.id === layer.id), 'down', e)}
                            className="p-0.5 rounded hover:bg-neutral-800 text-[10px] text-neutral-500 hover:text-white"
                            title="Move Down"
                          >
                            ▼
                          </button>

                          {/* Delete Layer */}
                          <button
                            onClick={(e) => handleDeleteLayer(layer.id, e)}
                            className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-rose-400"
                            title="Delete Layer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit / Rename Layer Icon (Pen Icon) positioned at the very end */}
                          {editingLayerId !== layer.id && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingLayerId(layer.id);
                                setEditingLayerName(layer.name);
                              }}
                              className="p-1 text-neutral-400 hover:text-amber-400 transition-colors rounded hover:bg-neutral-800 shrink-0"
                              title="Edit Layer Name"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-neutral-400 hover:text-amber-400" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Opacity & Blur & 3D Depth sliders */}
                      {isActive && (
                        <div className="mt-2.5 pt-2 border-t border-amber-500/20 space-y-2 text-[10px]">
                          {/* Opacity */}
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400 font-bold">OPACITY</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={layer.opacity}
                                onChange={(e) => updateLayerProp(layer.id, { opacity: parseFloat(e.target.value) })}
                                className="w-20 accent-amber-500 h-1 bg-neutral-800 rounded-lg"
                              />
                              <span className="text-amber-400 font-black w-6 text-right">
                                {Math.round(layer.opacity * 100)}%
                              </span>
                            </div>
                          </div>

                          {/* Depth Blur */}
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400 font-bold">DEPTH BLUR</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={20}
                                step={1}
                                value={blur}
                                onChange={(e) => updateLayerProp(layer.id, { blurAmount: parseInt(e.target.value) })}
                                className="w-20 accent-amber-500 h-1 bg-neutral-800 rounded-lg"
                              />
                              <span className="text-amber-400 font-black w-6 text-right">
                                {blur}px
                              </span>
                            </div>
                          </div>

                          {/* 3D Multiplane Layer Depth */}
                          <div className="flex items-center justify-between">
                            <span className="text-amber-400 font-extrabold flex items-center gap-1">
                              <Box className="w-3 h-3 text-amber-400" />
                              3D DEPTH (Z)
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={-500}
                                max={500}
                                step={10}
                                value={layer.depth ?? 0}
                                onChange={(e) => updateLayerProp(layer.id, { depth: parseInt(e.target.value) })}
                                className="w-20 accent-amber-500 h-1 bg-neutral-800 rounded-lg"
                              />
                              <span className="text-amber-400 font-black w-8 text-right font-mono">
                                {layer.depth ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
