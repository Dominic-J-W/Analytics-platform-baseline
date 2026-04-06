import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Plus, Edit2, Trash2, Search, Tag, Layers } from 'lucide-react';

// Aligned with DIVU_PRODUCTS table in ERD
interface Product {
  pid: string; // Primary key (was 'id')
  name: string; // Product name (NOT NULL)
  sku: string; // Stock keeping unit (UNIQUE, NOT NULL)
  target_uph: number; // Target Units Per Hour - critical for OEE calculations (NOT NULL)
  status: 'active' | 'discontinued'; // Product status
  created_by_uid: string; // Foreign key to DIVU_USERS (creator)
  // Additional UI fields for display (not in core ERD)
  category?: string;
  description?: string;
  unitsProduced?: number;
  qualityScore?: number;
}

export function Products() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('products_manage');

  const [products, setProducts] = useState<Product[]>([
    {
      pid: '1',
      name: 'Industrial Valve Assembly',
      sku: 'IVA-2024-001',
      target_uph: 45.5, // Target: 45.5 units per hour
      status: 'active',
      created_by_uid: '1',
      category: 'Mechanical Components',
      description: 'High-pressure valve assembly for industrial applications',
      unitsProduced: 15420,
      qualityScore: 98.5,
    },
    {
      pid: '2',
      name: 'Control Panel Module',
      sku: 'CPM-2024-015',
      target_uph: 28.0, // Target: 28 units per hour
      status: 'active',
      created_by_uid: '1',
      category: 'Electronics',
      description: 'Smart control panel for production line management',
      unitsProduced: 8750,
      qualityScore: 99.2,
    },
    {
      pid: '3',
      name: 'Power Sleeve Unit',
      sku: 'PSU-2023-047',
      target_uph: 62.25, // Target: 62.25 units per hour
      status: 'active',
      created_by_uid: '1',
      category: 'Power Systems',
      description: 'Power distribution and management sleeve',
      unitsProduced: 12300,
      qualityScore: 97.8,
    },
    {
      pid: '4',
      name: 'Legacy Sensor Kit',
      sku: 'LSK-2022-089',
      target_uph: 35.0, // Target: 35 units per hour
      status: 'discontinued',
      created_by_uid: '1',
      category: 'Sensors',
      description: 'Older generation sensor package',
      unitsProduced: 5200,
      qualityScore: 95.5,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    target_uph: '',
    category: '',
    description: '',
    status: 'active' as Product['status'],
  });

  const handleAdd = () => {
    setFormData({
      name: '',
      sku: '',
      target_uph: '',
      category: '',
      description: '',
      status: 'active',
    });
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      target_uph: product.target_uph.toString(),
      category: product.category || '',
      description: product.description || '',
      status: product.status,
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.pid === editingProduct.pid
            ? { 
                ...p, 
                name: formData.name,
                sku: formData.sku,
                target_uph: parseFloat(formData.target_uph) || 0,
                category: formData.category,
                description: formData.description,
                status: formData.status
              }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        pid: Date.now().toString(),
        name: formData.name,
        sku: formData.sku,
        target_uph: parseFloat(formData.target_uph) || 0,
        status: formData.status,
        created_by_uid: '1', // Current user ID
        category: formData.category,
        description: formData.description,
        unitsProduced: 0,
        qualityScore: 0,
      };
      setProducts([...products, newProduct]);
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDelete = (pid: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter((p) => p.pid !== pid));
    }
  };

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'discontinued':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Products</h2>
          <p className="text-slate-600">
            Manage product catalog and production tracking
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name, SKU, or category..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg text-slate-900 mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Industrial Valve Assembly"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., IVA-2024-001"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Target UPH
                <span className="text-slate-500 text-xs ml-1">(Units Per Hour)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.target_uph}
                onChange={(e) =>
                  setFormData({ ...formData, target_uph: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 45.5"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mechanical Components"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Product['status'],
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Product description..."
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.sku || !formData.target_uph}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.pid}
            className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-900 mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-slate-600">{product.sku}</span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded border capitalize ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-sm text-slate-600 mb-3">
                      {product.description}
                    </p>
                  )}
                  {product.category && (
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-600">
                        {product.category}
                      </span>
                    </div>
                  )}
                  {/* OEE Critical Field */}
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-600 font-medium">
                      Target: {product.target_uph} units/hour
                    </span>
                  </div>
                </div>
              </div>
              {canManage && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.pid)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
              <div>
                <div className="text-xs text-slate-600 mb-1">Units Produced</div>
                <div className="text-lg text-slate-900">
                  {product.unitsProduced?.toLocaleString() || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">Quality Score</div>
                <div className="text-lg text-slate-900">
                  {product.qualityScore || 0}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No products found</p>
        </div>
      )}
    </div>
  );
}
