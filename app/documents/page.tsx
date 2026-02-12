'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/contexts/project-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Plus, 
  Save, 
  Loader2, 
  FolderOpen, 
  ChevronRight,
  Folder,
  File,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ContextType {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

interface Artifact {
  id: string;
  name: string;
  context_type_id: string;
  status: 'active' | 'archived' | 'completed';
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  filename: string;
  content: string;
  metadata: string | null;
  updated_at: string;
}

interface Hierarchy {
  project: {
    id: string;
    name: string;
    slug: string;
  };
  contextTypes: ContextType[];
  artifacts: Artifact[];
  documents: Document[];
}

export default function DocumentsPage() {
  const router = useRouter();
  const { selectedProjectId } = useProject();
  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);
  const [selectedContextType, setSelectedContextType] = useState<string | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [hierarchyLoading, setHierarchyLoading] = useState(true);
  
  // Dialog states
  const [showCreateContextType, setShowCreateContextType] = useState(false);
  const [showCreateArtifact, setShowCreateArtifact] = useState(false);
  const [showCreateDocument, setShowCreateDocument] = useState(false);
  const [newContextTypeName, setNewContextTypeName] = useState('');
  const [newArtifactName, setNewArtifactName] = useState('');
  const [newDocumentName, setNewDocumentName] = useState('');

  // Redirect if no project selected
  useEffect(() => {
    if (!selectedProjectId || selectedProjectId === 'all') {
      router.push('/projects');
    }
  }, [selectedProjectId, router]);

  // Load hierarchy when project changes
  useEffect(() => {
    if (!selectedProjectId || selectedProjectId === 'all') return;
    loadHierarchy();
  }, [selectedProjectId, selectedContextType, selectedArtifact]);

  const loadHierarchy = async () => {
    if (!selectedProjectId || selectedProjectId === 'all') return;

    setHierarchyLoading(true);
    try {
      const params = new URLSearchParams({ project_id: selectedProjectId });
      if (selectedContextType) {
        params.append('context_type_id', selectedContextType);
      }
      if (selectedArtifact) {
        params.append('artifact_id', selectedArtifact);
      }

      const res = await fetch(`/api/documents/hierarchy?${params}`);
      if (res.ok) {
        const data = await res.json();
        setHierarchy(data);
      }
    } catch (error) {
      console.error('Error loading hierarchy:', error);
    } finally {
      setHierarchyLoading(false);
    }
  };

  const loadDocument = async (filename: string) => {
    if (!hierarchy?.project || !selectedContextType || !selectedArtifact) return;

    setLoading(true);
    try {
      const contextTypeName = hierarchy.contextTypes.find(ct => ct.id === selectedContextType)?.name;
      const artifactName = hierarchy.artifacts.find(a => a.id === selectedArtifact)?.name;
      const path = `${hierarchy.project.slug || hierarchy.project.name}/${contextTypeName}/${artifactName}/${filename}`;
      const res = await fetch(`/api/documents/${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDoc(data.document);
        setContent(data.document.content);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    if (!selectedDoc || !hierarchy?.project || !selectedContextType || !selectedArtifact) return;

    setLoading(true);
    try {
      const contextTypeName = hierarchy.contextTypes.find(ct => ct.id === selectedContextType)?.name;
      const artifactName = hierarchy.artifacts.find(a => a.id === selectedArtifact)?.name;
      const path = `${hierarchy.project.name}/${contextTypeName}/${artifactName}/${selectedDoc.filename}`;
      
      const res = await fetch(`/api/documents/${encodeURIComponent(path)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        await loadHierarchy();
        alert('Document saved!');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document');
    } finally {
      setLoading(false);
    }
  };

  const createContextType = async () => {
    if (!selectedProjectId || selectedProjectId === 'all' || !newContextTypeName.trim()) return;

    setLoading(true);
    try {
      // Create via document manager - we'll need to create a document to trigger hierarchy creation
      // For now, let's use the document-db service directly via an API endpoint
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `${hierarchy?.project.name}/${newContextTypeName.trim()}/_init/README.md`,
          content: `# ${newContextTypeName.trim()}\n\nInitial context type.`,
        }),
      });
      if (res.ok) {
        setNewContextTypeName('');
        setShowCreateContextType(false);
        await loadHierarchy();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create context type');
      }
    } catch (error) {
      console.error('Error creating context type:', error);
      alert('Failed to create context type');
    } finally {
      setLoading(false);
    }
  };

  const createArtifact = async () => {
    if (!selectedContextType || !newArtifactName.trim()) return;

    setLoading(true);
    try {
      const contextTypeName = hierarchy?.contextTypes.find(ct => ct.id === selectedContextType)?.name;
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `${hierarchy?.project.name}/${contextTypeName}/${newArtifactName.trim()}/README.md`,
          content: `# ${newArtifactName.trim()}\n\nInitial artifact.`,
        }),
      });
      if (res.ok) {
        setNewArtifactName('');
        setShowCreateArtifact(false);
        await loadHierarchy();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create artifact');
      }
    } catch (error) {
      console.error('Error creating artifact:', error);
      alert('Failed to create artifact');
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async () => {
    if (!selectedArtifact || !newDocumentName.trim()) return;

    setLoading(true);
    try {
      const contextTypeName = hierarchy?.contextTypes.find(ct => ct.id === selectedContextType)?.name;
      const artifactName = hierarchy?.artifacts.find(a => a.id === selectedArtifact)?.name;
      const filename = newDocumentName.trim().endsWith('.md') 
        ? newDocumentName.trim() 
        : `${newDocumentName.trim()}.md`;
      
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `${hierarchy?.project.name}/${contextTypeName}/${artifactName}/${filename}`,
          content: `# ${filename.replace('.md', '')}\n\n`,
        }),
      });
      if (res.ok) {
        setNewDocumentName('');
        setShowCreateDocument(false);
        await loadHierarchy();
        await loadDocument(filename);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create document');
      }
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (filename: string) => {
    if (!hierarchy?.project || !selectedContextType || !selectedArtifact) return;
    if (!confirm(`Delete document "${filename}"?`)) return;

    setLoading(true);
    try {
      const contextTypeName = hierarchy.contextTypes.find(ct => ct.id === selectedContextType)?.name;
      const artifactName = hierarchy.artifacts.find(a => a.id === selectedArtifact)?.name;
      const path = `${hierarchy.project.slug || hierarchy.project.name}/${contextTypeName}/${artifactName}/${filename}`;
      
      const res = await fetch(`/api/documents/${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (selectedDoc?.filename === filename) {
          setSelectedDoc(null);
          setContent('');
        }
        await loadHierarchy();
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedProjectId || selectedProjectId === 'all') {
    return null;
  }

  if (hierarchyLoading) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Documents</h1>
          <p className="text-muted-foreground">
            {hierarchy?.project.name ? `Project: ${hierarchy.project.name}` : 'Manage project documents'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Hierarchy Navigation */}
          <div className="lg:col-span-1 space-y-4">
            {/* Context Types */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Context Types</CardTitle>
                  <Button
                    onClick={() => setShowCreateContextType(true)}
                    size="sm"
                    variant="ghost"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {hierarchy?.contextTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No context types yet</p>
                ) : (
                  <div className="space-y-1">
                    {hierarchy?.contextTypes.map((ct) => (
                      <button
                        key={ct.id}
                        onClick={() => {
                          setSelectedContextType(ct.id);
                          setSelectedArtifact(null);
                          setSelectedDoc(null);
                          setContent('');
                        }}
                        className={cn(
                          "w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-sm",
                          selectedContextType === ct.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Folder className="h-4 w-4 shrink-0" />
                        <span className="truncate">{ct.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Artifacts */}
            {selectedContextType && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Artifacts</CardTitle>
                    <Button
                      onClick={() => setShowCreateArtifact(true)}
                      size="sm"
                      variant="ghost"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {hierarchy?.artifacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No artifacts yet</p>
                  ) : (
                    <div className="space-y-1">
                      {hierarchy?.artifacts.map((art) => (
                        <button
                          key={art.id}
                          onClick={() => {
                            setSelectedArtifact(art.id);
                            setSelectedDoc(null);
                            setContent('');
                          }}
                          className={cn(
                            "w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-sm",
                            selectedArtifact === art.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <FolderOpen className="h-4 w-4 shrink-0" />
                          <span className="truncate">{art.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Documents List */}
            {selectedArtifact && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Documents</CardTitle>
                    <Button
                      onClick={() => setShowCreateDocument(true)}
                      size="sm"
                      variant="ghost"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {hierarchy?.documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents yet</p>
                  ) : (
                    <div className="space-y-1">
                      {hierarchy?.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-sm group",
                            selectedDoc?.id === doc.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <button
                            onClick={() => loadDocument(doc.filename)}
                            className="flex-1 text-left flex items-center gap-2 min-w-0"
                          >
                            <File className="h-4 w-4 shrink-0" />
                            <span className="truncate font-mono text-xs">{doc.filename}</span>
                          </button>
                          <button
                            onClick={() => deleteDocument(doc.filename)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded-sm"
                            title="Delete document"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Document Editor */}
          <div className="lg:col-span-3">
            <Card>
              {selectedDoc ? (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedDoc.filename}</CardTitle>
                        <CardDescription>
                          Last updated: {format(new Date(selectedDoc.updated_at), 'PPp')}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={saveDocument}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-[600px] font-mono text-sm"
                      spellCheck={false}
                    />
                    <div className="mt-4 p-4 bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">💡 Tip:</span> Add @ai flags to items you want AI assistance with.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Examples: @ai, @ai:cursor, @ai:claude, @ai:local
                      </p>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent>
                  <div className="text-center text-muted-foreground py-20">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      {!selectedContextType 
                        ? 'Select a context type to get started'
                        : !selectedArtifact
                        ? 'Select an artifact to view documents'
                        : 'Select a document to edit'}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Create Context Type Dialog */}
      <Dialog open={showCreateContextType} onOpenChange={setShowCreateContextType}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Context Type</DialogTitle>
            <DialogDescription>
              Create a new context type for organizing documents (e.g., "tech", "business", "journal").
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="context-type-name">Name</Label>
              <Input
                id="context-type-name"
                value={newContextTypeName}
                onChange={(e) => setNewContextTypeName(e.target.value)}
                placeholder="e.g., tech, business, journal"
                onKeyDown={(e) => e.key === 'Enter' && createContextType()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateContextType(false)}>
              Cancel
            </Button>
            <Button onClick={createContextType} disabled={!newContextTypeName.trim() || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Artifact Dialog */}
      <Dialog open={showCreateArtifact} onOpenChange={setShowCreateArtifact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Artifact</DialogTitle>
            <DialogDescription>
              Create a new artifact within the selected context type (e.g., "sprint-1", "stripe-integration").
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="artifact-name">Name</Label>
              <Input
                id="artifact-name"
                value={newArtifactName}
                onChange={(e) => setNewArtifactName(e.target.value)}
                placeholder="e.g., sprint-1, stripe-integration"
                onKeyDown={(e) => e.key === 'Enter' && createArtifact()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateArtifact(false)}>
              Cancel
            </Button>
            <Button onClick={createArtifact} disabled={!newArtifactName.trim() || loading || !selectedContextType}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Document Dialog */}
      <Dialog open={showCreateDocument} onOpenChange={setShowCreateDocument}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Document</DialogTitle>
            <DialogDescription>
              Create a new document. Include .md extension or it will be added automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="document-name">Filename</Label>
              <Input
                id="document-name"
                value={newDocumentName}
                onChange={(e) => setNewDocumentName(e.target.value)}
                placeholder="e.g., standup-2026-02-05.md"
                onKeyDown={(e) => e.key === 'Enter' && createDocument()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDocument(false)}>
              Cancel
            </Button>
            <Button onClick={createDocument} disabled={!newDocumentName.trim() || loading || !selectedArtifact}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
