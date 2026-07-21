import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ImageFile {
  id: string;
  url: string;
  file?: File;
  category: string;
  isCover: boolean;
}

interface ImageUploaderProps {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  categories: string[];
}

export function ImageUploader({ images, onChange, categories }: ImageUploaderProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
      category: categories[0] || 'Uncategorized',
      isCover: images.length === 0,
    }));
    onChange([...images, ...newImages]);
  }, [images, onChange, categories]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }
  });

  const removeImage = (id: string) => {
    const filtered = images.filter(img => img.id !== id);
    if (filtered.length > 0 && images.find(i => i.id === id)?.isCover) {
      filtered[0].isCover = true;
    }
    onChange(filtered);
  };

  const setCover = (id: string) => {
    onChange(images.map(img => ({
      ...img,
      isCover: img.id === id
    })));
  };

  const updateCategory = (id: string, category: string) => {
    onChange(images.map(img => img.id === id ? { ...img, category } : img));
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Drag & drop photos here</h3>
        <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {images.map((img, index) => (
            <Card key={img.id} className={`overflow-hidden relative group ${img.isCover ? 'ring-2 ring-primary' : ''}`}>
              <div className="aspect-square relative">
                <img src={img.url} alt="Uploaded preview" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="bg-background/80 hover:bg-background text-[10px] cursor-pointer" onClick={() => setCover(img.id)}>
                      {img.isCover ? 'Cover Photo' : 'Set as Cover'}
                    </Badge>
                    <Button size="icon" variant="destructive" className="h-6 w-6 rounded-full" onClick={() => removeImage(img.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <select 
                    className="h-7 text-xs rounded bg-background/90 text-foreground border-0 px-2"
                    value={img.category}
                    onChange={(e) => updateCategory(img.id, e.target.value)}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
