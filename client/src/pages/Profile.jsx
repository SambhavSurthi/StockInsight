import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogOut, Save, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { useDataViewPreference } from '../utils/useDataViewPreference';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [dataViewType, setDataViewType] = useDataViewPreference();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [navigate, token]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
        }));
      } else {
        toast.error('Failed to load user data');
      }
    } catch (error) {
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password || undefined,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success('Profile updated successfully');
        setFormData({
          ...formData,
          password: '',
          confirmPassword: '',
        });
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Server error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-2 py-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl">Profile Settings</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Update your account information and preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            New Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {formData.password && (
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}

        <div className="space-y-2 rounded-lg border bg-card p-4">
          <label className="text-sm font-medium">Data View Type</label>
          <p className="text-xs text-muted-foreground mb-3">
            Choose how dates are displayed in tables and charts
          </p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dataViewType"
                value="left-to-right"
                checked={dataViewType === 'left-to-right'}
                onChange={(e) => setDataViewType(e.target.value)}
                className="h-4 w-4 text-primary"
              />
              <span className="text-sm">Left to Right (Newest First)</span>
              <span className="text-xs text-muted-foreground ml-auto">Dec 04, Dec 03, Dec 02, Dec 01</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dataViewType"
                value="right-to-left"
                checked={dataViewType === 'right-to-left'}
                onChange={(e) => setDataViewType(e.target.value)}
                className="h-4 w-4 text-primary"
              />
              <span className="text-sm">Right to Left (Oldest First)</span>
              <span className="text-xs text-muted-foreground ml-auto">Dec 01, Dec 02, Dec 03, Dec 04</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive bg-background px-4 py-2 text-sm font-medium text-destructive shadow-sm hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
