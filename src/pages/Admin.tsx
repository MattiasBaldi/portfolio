import { useState } from 'react';
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

export default function Admin() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json() as Promise<Project[]>;
    },
  });

  // Fetch images for selected project
  const { data: images = [] } = useQuery({
    queryKey: ['images', selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      const res = await fetch(`/api/images?project=${selectedProject}`);
      if (!res.ok) throw new Error('Failed to fetch images');
      const data = await res.json();
      return data.images || [];
    },
    enabled: !!selectedProject,
  });

  // Upload image mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!selectedProject) throw new Error('Select a project first');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectSlug', selectedProject);
      formData.append('caption', '');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', selectedProject] });
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', selectedProject] });
    },
  });

  // Update project mutation
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

  // Delete project mutation
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files.forEach(file => uploadMutation.mutate(file)),
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'], 'video/*': ['.mp4', '.webm', '.mov'] },
  });

  if (projectsLoading) return <div className="max-w-4xl mx-auto px-5 py-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="text-4xl font-bold mb-7">Portfolio Admin</h1>

      {/* Projects List */}
      <div className="mb-7 p-5 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Projects</h2>
          <button onClick={() => setShowNewForm(!showNewForm)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            {showNewForm ? 'Cancel' : 'New Project'}
          </button>
        </div>

        {showNewForm && (
          <ProjectForm
            project={null}
            onSave={(p) => {
              updateProjectMutation.mutate(p);
              setShowNewForm(false);
            }}
            onCancel={() => setShowNewForm(false)}
          />
        )}

        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-white border rounded hover:shadow-sm">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-gray-500">{p.category}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingProject(p)} className="px-2 py-1 bg-amber-500 text-white text-sm rounded hover:bg-amber-600">
                  Edit
                </button>
                <button onClick={() => setSelectedProject(p.id)} className={`px-2 py-1 text-sm rounded ${selectedProject === p.id ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  Select
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this project?')) deleteProjectMutation.mutate(p.id);
                  }}
                  className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Edit Project</h3>
            <ProjectForm
              project={editingProject}
              onSave={(p) => updateProjectMutation.mutate(p)}
              onCancel={() => setEditingProject(null)}
            />
          </div>
        </div>
      )}

      {/* Image Upload */}
      {selectedProject && (
        <div className="mb-7 p-5 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Upload Images</h2>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-400 hover:border-gray-600'}`}>
            <input {...getInputProps()} />
            <p className="text-sm text-gray-600">{isDragActive ? 'Drop here...' : 'Drag files or click to select'}</p>
          </div>
          {uploadMutation.isPending && <p className="mt-2 text-blue-600 text-sm">Uploading...</p>}
        </div>
      )}

      {/* Images Gallery */}
      {selectedProject && images.length > 0 && (
        <div className="mb-7 p-5 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Images</h2>
          <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
            {images.map((img) => (
              <div key={img.id} className="group relative bg-white rounded overflow-hidden border border-gray-200 hover:shadow-md">
                <div className="w-full h-[150px] bg-gradient-to-br from-gray-300 to-gray-100 flex items-center justify-center text-gray-500 text-xs">[{img.filename}]</div>
                <div className="p-2 text-xs">
                  <p className="truncate font-medium">{img.filename}</p>
                  <p className="text-gray-400">{img.r2_key}</p>
                </div>
                <button
                  onClick={() => deleteImageMutation.mutate(img.id)}
                  className="absolute top-1 right-1 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectForm({ project, onSave, onCancel }: { project: Project | null; onSave: (p: Project) => void; onCancel: () => void }) {
  const [form, setForm] = useState(
    project || {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      id: form.id || `project-${Date.now()}`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded"
        required
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded"
        rows={3}
        required
      />
      <input
        type="text"
        placeholder="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />
      <input
        type="number"
        placeholder="Year"
        value={form.year}
        onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />
      <input
        type="text"
        placeholder="Disclaimer"
        value={form.disclaimer}
        onChange={(e) => setForm({ ...form, disclaimer: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />
      <input
        type="text"
        placeholder="Thumbnail URL"
        value={form.thumbnail}
        onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />
      <div className="flex gap-2 pt-4">
        <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save
        </button>
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
          Cancel
        </button>
      </div>
    </form>
  );
}
