import React, { useState, useEffect } from 'react';
import { X, Folder, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '../config/api';

const CategorySelectModal = ({ isOpen, onClose, onConfirm, type }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setFetching(true);
      const res = await fetch(API_ENDPOINTS.CATEGORIES.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length === 0) {
          toast.info('No categories found. Please create a category first in the Categories tab.');
        }
      } else {
        toast.error('Failed to load categories');
      }
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setFetching(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedCategoryId) {
      toast.error('Please select a category');
      return;
    }

    onConfirm(selectedCategoryId);
    setSelectedCategoryId('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">
            Select Category
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
          {fetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="py-8 text-center">
              <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                No categories found
              </p>
              <p className="text-xs text-muted-foreground">
                Please create a category first in the Categories tab.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category._id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selectedCategoryId === category._id
                      ? 'border-primary bg-primary/10'
                      : 'border-input hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedCategoryId || categories.length === 0}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelectModal;

