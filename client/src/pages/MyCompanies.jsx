import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import FilesystemItem from '../components/ui/FilesystemItem';
import { API_ENDPOINTS } from '../config/api';

const MyCompanies = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [futureAnalysis, setFutureAnalysis] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [navigate, token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, portfolioRes, futureRes] = await Promise.all([
        fetch(API_ENDPOINTS.CATEGORIES.BASE, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API_ENDPOINTS.PORTFOLIO.BASE, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API_ENDPOINTS.FUTURE_ANALYSIS.BASE, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (categoriesRes.status === 401 || portfolioRes.status === 401 || futureRes.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (portfolioRes.ok) {
        const portfolioData = await portfolioRes.json();
        setPortfolio(portfolioData);
      }

      if (futureRes.ok) {
        const futureData = await futureRes.json();
        setFutureAnalysis(futureData);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Build hierarchical tree structure
  const treeData = useMemo(() => {
    const buildTree = () => {
      const rootNode = {
        name: 'My Companies',
        nodes: [],
      };

      // Group companies by category
      const categoryMap = new Map();
      
      // Add portfolio companies
      portfolio.forEach((company) => {
        const categoryId = company.categoryId?._id || company.categoryId;
        const categoryName = company.categoryId?.name || 'Uncategorized';
        const categoryColor = company.categoryId?.color;

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            name: categoryName,
            color: categoryColor,
            nodes: [],
            count: 0,
          });
        }
        const category = categoryMap.get(categoryId);
        category.nodes.push({
          name: company.name,
          screenerId: company.screenerId,
          type: 'portfolio',
          company: company,
        });
        category.count++;
      });

      // Add future analysis companies
      futureAnalysis.forEach((company) => {
        const categoryId = company.categoryId?._id || company.categoryId;
        const categoryName = company.categoryId?.name || 'Uncategorized';
        const categoryColor = company.categoryId?.color;

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            name: categoryName,
            color: categoryColor,
            nodes: [],
            count: 0,
          });
        }
        const category = categoryMap.get(categoryId);
        category.nodes.push({
          name: company.name,
          screenerId: company.screenerId,
          type: 'future',
          company: company,
        });
        category.count++;
      });

      // Convert map to array and sort
      const categoryNodes = Array.from(categoryMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      // Add sub-folders for Portfolio and Future Analysis within each category
      categoryNodes.forEach((category) => {
        const portfolioCompanies = category.nodes.filter((c) => c.type === 'portfolio');
        const futureCompanies = category.nodes.filter((c) => c.type === 'future');

        const subFolders = [];

        if (portfolioCompanies.length > 0) {
          subFolders.push({
            name: 'Portfolio',
            nodes: portfolioCompanies.map((c) => ({
              name: c.name,
              screenerId: c.screenerId,
              type: 'portfolio',
              company: c.company,
            })),
            count: portfolioCompanies.length,
          });
        }

        if (futureCompanies.length > 0) {
          subFolders.push({
            name: 'Future Analysis',
            nodes: futureCompanies.map((c) => ({
              name: c.name,
              screenerId: c.screenerId,
              type: 'future',
              company: c.company,
            })),
            count: futureCompanies.length,
          });
        }

        category.nodes = subFolders;
      });

      rootNode.nodes = categoryNodes;
      return rootNode;
    };

    return buildTree();
  }, [categories, portfolio, futureAnalysis]);

  const handleFileClick = (node) => {
    if (node.screenerId && node.company) {
      const from = node.type === 'portfolio' ? 'portfolio' : 'future';
      navigate(
        `/company/${node.screenerId}?name=${encodeURIComponent(node.name)}&from=${from}`
      );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-2 py-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading companies...</p>
      </div>
    );
  }

  const totalCompanies = portfolio.length + futureAnalysis.length;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl">My Companies List</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Hierarchical view of all your companies organized by categories.
        </p>
        <p className="text-xs text-muted-foreground">
          Total: {totalCompanies} {totalCompanies === 1 ? 'company' : 'companies'}
        </p>
      </div>

      {totalCompanies === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
          <p className="text-sm font-medium mb-1">No companies yet</p>
          <p className="text-xs text-muted-foreground">
            Add companies to your portfolio or future analysis to see them here
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="max-h-[600px] overflow-y-auto">
            <ul>
              <FilesystemItem
                node={treeData}
                animated={true}
                onFileClick={handleFileClick}
              />
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCompanies;
