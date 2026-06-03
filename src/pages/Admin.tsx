import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import '@/styles/admin.css';

interface Image {
  id: string;
  project_slug: string;
  filename: string;
  r2_key: string;
  caption: string;
  sort_order: number;
  uploaded_at: string;
}

interface Project {
  id: string;
  name: string;
}

export default function Admin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [images, setImages] = useState<Image[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch projects from data.json
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/data/data.json');
        const data = await res.json();
        setProjects(data.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
        if (data.length > 0) {
          setSelectedProject(data[0].id);
        }
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch images when project changes
  useEffect(() => {
    if (!selectedProject) return;

    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/images?project=${selectedProject}`);
        if (!res.ok) throw new Error('Failed to fetch images');
        const data = await res.json();
        setImages(data.images || []);
      } catch (err) {
        setError('Failed to load images');
      }
    };

    fetchImages();
  }, [selectedProject]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!selectedProject) {
        setError('Select a project first');
        return;
      }

      setUploading(true);
      setError('');

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectSlug', selectedProject);
        formData.append('caption', '');

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) throw new Error('Upload failed');

          // Refresh images list
          const imagesRes = await fetch(`/api/images?project=${selectedProject}`);
          const imagesData = await imagesRes.json();
          setImages(imagesData.images || []);
        } catch (err) {
          setError(`Failed to upload ${file.name}`);
        }
      }

      setUploading(false);
    },
    [selectedProject]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
  });

  const deleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setImages(images.filter((img) => img.id !== id));
    } catch (err) {
      setError('Failed to delete image');
    }
  };

  if (loading) return <div className="admin-container">Loading...</div>;

  return (
    <div className="admin-container">
      <h1>Portfolio Admin</h1>

      <div className="admin-section">
        <label>Select Project:</label>
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-section">
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <p>{isDragActive ? 'Drop files here...' : 'Drag files here or click to select'}</p>
        </div>
        {uploading && <p className="status">Uploading...</p>}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="admin-section">
        <h2>Images ({images.length})</h2>
        <div className="gallery">
          {images.map((img) => (
            <div key={img.id} className="image-card">
              <div className="image-placeholder">[Image]</div>
              <div className="image-info">
                <p className="filename">{img.filename}</p>
                {img.caption && <p className="caption">{img.caption}</p>}
                <p className="r2-key">{img.r2_key}</p>
              </div>
              <button onClick={() => deleteImage(img.id)} className="delete-btn">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
