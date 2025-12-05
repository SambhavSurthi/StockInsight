import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Folder, Loader2, X, Save } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import CategorySelectModal from '../components/CategorySelectModal';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [futureAnalysis, setFutureAnalysis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryChangeModal, setShowCategoryChangeModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchCategories();
      fetchPortfolio();
      fetchFutureAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, token]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.CATEGORIES.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        toast.error('Failed to load categories');
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.PORTFOLIO.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
      }
    } catch {
      // Silent fail
    }
  };

  const fetchFutureAnalysis = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.FUTURE_ANALYSIS.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFutureAnalysis(data);
      }
    } catch {
      // Silent fail
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.CATEGORIES.BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Category created successfully');
        setNewCategoryName('');
        setShowAddForm(false);
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to create category');
      }
    } catch {
      toast.error('Server error');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setEditName(category.name);
  };

  const handleUpdate = async (categoryId) => {
    if (!editName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.CATEGORIES.BY_ID(categoryId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Category updated successfully');
        setEditingId(null);
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to update category');
      }
    } catch {
      toast.error('Server error');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.CATEGORIES.BY_ID(categoryId), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Category deleted successfully');
        fetchCategories();
        fetchPortfolio();
        fetchFutureAnalysis();
      } else {
        toast.error(data.message || 'Failed to delete category');
      }
    } catch {
      toast.error('Server error');
    }
  };

  const handleChangeCompanyCategory = (company, type) => {
    setSelectedCompany({ ...company, type });
    setShowCategoryChangeModal(true);
  };

  const handleCategoryChangeConfirm = async (categoryId) => {
    if (!selectedCompany) return;

    try {
      const res = await fetch(API_ENDPOINTS.CATEGORIES.UPDATE_COMPANY_CATEGORY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          screenerId: selectedCompany.screenerId,
          categoryId,
          type: selectedCompany.type,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Category updated successfully');
        setShowCategoryChangeModal(false);
        setSelectedCompany(null);
        fetchPortfolio();
        fetchFutureAnalysis();
      } else {
        toast.error(data.message || 'Failed to update category');
      }
    } catch {
      toast.error('Server error');
    }
  };

  const getCompaniesInCategory = (categoryId) => {
    const portfolioCompanies = portfolio.filter((c) => c.categoryId?._id === categoryId || c.categoryId === categoryId);
    const futureCompanies = futureAnalysis.filter((c) => c.categoryId?._id === categoryId || c.categoryId === categoryId);
    return { portfolio: portfolioCompanies, future: futureCompanies };
  };

  if (loading && categories.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-2 py-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold sm:text-2xl">Categories</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Organize your companies into categories for better management.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Category</span>
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Color will be assigned automatically to keep categories distinct.
            </p>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewCategoryName('');
                }}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
          <Folder className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm font-medium mb-1">No categories yet</p>
          <p className="text-xs text-muted-foreground">
            Create your first category to organize your companies
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => {
            const { portfolio: portfolioCompanies, future: futureCompanies } = getCompaniesInCategory(category._id);
            const totalCompanies = portfolioCompanies.length + futureCompanies.length;

            return (
              <div
                key={category._id}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                {editingId === category._id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Category Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Color</label>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div
                          className="h-6 w-6 rounded-full border border-input"
                          style={{ backgroundColor: category.color || '#3b82f6' }}
                        />
                        <span>Assigned automatically</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(category._id)}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-5 w-5 rounded-full"
                          style={{ backgroundColor: category.color || '#3b82f6' }}
                        />
                        <span className="font-semibold">{category.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({totalCompanies} {totalCompanies === 1 ? 'company' : 'companies'})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          className="rounded-lg p-1.5 hover:bg-accent"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category._id)}
                          className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {totalCompanies > 0 && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        {portfolioCompanies.length > 0 && (
                          <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">Portfolio:</p>
                            <div className="space-y-1">
                              {portfolioCompanies.map((company) => (
                                <div
                                  key={company._id}
                                  className="flex items-center justify-between rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
                                >
                                  <span>{company.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleChangeCompanyCategory(company, 'portfolio')}
                                    className="text-primary hover:underline"
                                  >
                                    Change Category
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {futureCompanies.length > 0 && (
                          <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">Future Analysis:</p>
                            <div className="space-y-1">
                              {futureCompanies.map((company) => (
                                <div
                                  key={company._id}
                                  className="flex items-center justify-between rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
                                >
                                  <span>{company.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleChangeCompanyCategory(company, 'future')}
                                    className="text-primary hover:underline"
                                  >
                                    Change Category
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <CategorySelectModal
        isOpen={showCategoryChangeModal}
        onClose={() => {
          setShowCategoryChangeModal(false);
          setSelectedCompany(null);
        }}
        onConfirm={handleCategoryChangeConfirm}
        type={selectedCompany?.type}
      />
    </div>
  );
};

export default Categories;
