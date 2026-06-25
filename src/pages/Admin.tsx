import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Project {
  id: string;
  name: string;
  description: string;
  disclaimer?: string;
  thumbnail?: string;
  thumbnail_position?: string;
  category?: string;
  year?: number;
  links?: string;
}

interface Image {
  id: string;
  project_slug: string;
  filename: string;
  r2_key: string;
  caption: string;
  sort_order: number;
  uploaded_at: string;
}

function r2Url(key: string) {
  return `/api/r2/${key}`;
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json() as Promise<Project[]>;
    },
  });

  const { data: images = [] } = useQuery<Image[]>({
    queryKey: ['images', selectedProject],
    queryFn: async () => {
      const res = await fetch(`/api/images?project=${selectedProject}`);
      if (!res.ok) throw new Error('Failed to fetch images');
      const data = await res.json();
      return data.images || [];
    },
    enabled: !!selectedProject,
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('projectSlug', selectedProject);
          formData.append('caption', '');
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          if (!res.ok) throw new Error(`Upload failed: ${file.name}`);
          return res.json();
        })
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['images', selectedProject] }),
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['images', selectedProject] }),
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (project: Project) => {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingProject(null);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSelectedProject('');
    },
  });

  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!uploadMutation.isPending) setPendingPreviews([]);
  }, [uploadMutation.isPending]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      const previews = files.filter(f => f.type.startsWith('image/')).map(f => URL.createObjectURL(f));
      setPendingPreviews(previews);
      uploadMutation.mutate(files);
    },
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'], 'video/*': ['.mp4', '.webm', '.mov'] },
  });

  const activeProject = projects.find((p) => p.id === selectedProject) ?? null;

  if (projectsLoading) return <div className="max-w-4xl mx-auto px-5 py-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10 space-y-6">
      <h1 className="text-4xl font-bold">Portfolio Admin</h1>

      {/* Projects */}
      <section className="p-5 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Projects</h2>
          <button onClick={() => setShowNewForm(!showNewForm)} className="px-3 py-1 bg-black text-white rounded text-sm hover:opacity-70">
            {showNewForm ? 'Cancel' : '+ New'}
          </button>
        </div>

        {showNewForm && (
          <div className="mb-4">
            <ProjectForm project={null} images={[]} onSave={(p) => { updateProjectMutation.mutate(p); setShowNewForm(false); }} onCancel={() => setShowNewForm(false)} />
          </div>
        )}

        <div className="space-y-2">
          {projects.map((p) => {
            const isSelected = selectedProject === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProject(isSelected ? '' : p.id)}
                className={`flex items-center gap-4 p-3 bg-white border rounded cursor-pointer transition-all hover:shadow-sm ${isSelected ? 'border-black ring-1 ring-black' : 'border-gray-200'}`}
              >
                {/* Thumbnail preview */}
                <div className="w-14 h-14 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  {p.thumbnail ? (
                    <img src={p.thumbnail.startsWith('./') ? p.thumbnail : r2Url(p.thumbnail)} className="w-full h-full object-cover" alt={p.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.category} · {p.year}</p>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setEditingProject(p)} className="px-2 py-1 text-sm border rounded hover:bg-gray-100">Edit</button>
                  <button onClick={() => { if (confirm('Delete?')) deleteProjectMutation.mutate(p.id); }} className="px-2 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Image management for selected project */}
      {selectedProject && activeProject && (
        <section className="p-5 bg-gray-50 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">Images — {activeProject.name}</h2>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-black bg-gray-100' : 'border-gray-300 hover:border-gray-500'}`}
          >
            <input {...getInputProps()} />
            <p className="text-sm text-gray-500">{isDragActive ? 'Drop here...' : 'Drag & drop images/videos, or click to select'}</p>
            {uploadMutation.isPending && <p className="mt-1 text-xs text-blue-600">Uploading...</p>}
          </div>

          {/* Image grid */}
          {(images.length > 0 || pendingPreviews.length > 0) && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Click an image to set as thumbnail</p>
              <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
                {/* Pending upload previews */}
                {pendingPreviews.map((src, i) => (
                  <div key={`pending-${i}`} className="relative rounded overflow-hidden border-2 border-dashed border-gray-300 animate-pulse">
                    <img src={src} className="w-full h-32 object-cover bg-gray-100 opacity-60" alt="Uploading..." />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="text-white text-xs font-medium">Uploading…</span>
                    </div>
                  </div>
                ))}
                {images.map((img) => {
                  const isThumb = activeProject.thumbnail === img.r2_key;
                  return (
                    <div
                      key={img.id}
                      className={`group relative rounded overflow-hidden border-2 cursor-pointer transition-all ${isThumb ? 'border-black shadow-md' : 'border-transparent hover:border-gray-400'}`}
                      onClick={() => updateProjectMutation.mutate({ ...activeProject, thumbnail: img.r2_key })}
                    >
                      <img
                        src={r2Url(img.r2_key)}
                        alt={img.filename}
                        className="w-full h-32 object-cover bg-gray-100"
                      />
                      {isThumb && (
                        <div className="absolute top-1.5 left-1.5 bg-black text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                          Thumbnail
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteImageMutation.mutate(img.id); }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <p className="text-[10px] text-gray-500 truncate px-1.5 py-1 bg-white">{img.filename}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Edit modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Edit — {editingProject.name}</h3>
            <ProjectForm
              project={editingProject}
              images={editingProject.id === selectedProject ? images : []}
              onSave={(p) => updateProjectMutation.mutate(p)}
              onCancel={() => setEditingProject(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectForm({
  project,
  images,
  onSave,
  onCancel,
}: {
  project: Project | null;
  images: Image[];
  onSave: (p: Project) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Project>(
    project ?? {
      id: '',
      name: '',
      description: '',
      disclaimer: '',
      thumbnail: '',
      thumbnail_position: 'center center',
      category: '',
      year: new Date().getFullYear(),
      links: '',
    }
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, id: form.id || `project-${Date.now()}` }); }} className="space-y-3">
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" required />
      <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" rows={3} required />
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Category" value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border border-gray-300 rounded text-sm" />
        <input type="number" placeholder="Year" value={form.year ?? ''} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} className="px-3 py-2 border border-gray-300 rounded text-sm" />
      </div>
      <textarea placeholder="Disclaimer (optional)" value={form.disclaimer ?? ''} onChange={(e) => setForm({ ...form, disclaimer: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" rows={2} />

      {/* Thumbnail picker */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Thumbnail</p>
        {images.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img) => {
              const isSelected = form.thumbnail === img.r2_key;
              return (
                <div
                  key={img.id}
                  onClick={() => setForm({ ...form, thumbnail: img.r2_key })}
                  className={`relative rounded overflow-hidden border-2 cursor-pointer transition-all ${isSelected ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={r2Url(img.r2_key)} alt={img.filename} className="w-full h-16 object-cover bg-gray-100" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="text-white text-lg">✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Upload images first to select a thumbnail</p>
        )}
        {form.thumbnail && (
          <div className="mt-2 flex items-center gap-2">
            <img src={form.thumbnail.startsWith('./') ? form.thumbnail : r2Url(form.thumbnail)} className="w-10 h-10 object-cover rounded" alt="Current thumbnail" />
            <p className="text-xs text-gray-500 truncate">{form.thumbnail}</p>
          </div>
        )}
      </div>

      <input
        placeholder="Thumbnail position (e.g. center center)"
        value={form.thumbnail_position ?? 'center center'}
        onChange={(e) => setForm({ ...form, thumbnail_position: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
      />

      <div className="flex gap-2 pt-2">
        <button type="submit" className="flex-1 py-2 bg-black text-white rounded text-sm hover:opacity-70">Save</button>
        <button type="button" onClick={onCancel} className="flex-1 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200">Cancel</button>
      </div>
    </form>
  );
}
