"use client";
import { useActionState } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createPropertyAction, updatePropertyAction, deletePropertyAction } from '@/app/properties/actions';
import { supabase } from '@/lib/supabaseClient';
import { TagsInput } from '@/components/ui/tags-input';
import { MediaPicker } from '@/components/ui/media-picker';
import { IndianNumberInput } from '@/components/ui/indian-number-input';
import {
  Building2,
  Home,
  MapPin,
  User,
  ImageIcon,
  DollarSign,
  Trash2,
  ChevronLeft,
  ChevronDown,
  Loader2,
  Plus,
  X,
  Layers,
  Compass,
  Car,
  Key,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import {
  isResidentialType,
  BHK_CONFIG_OPTIONS,
  COMMERCIAL_CONFIG_OPTIONS,
  DEFAULT_PROPERTY_TYPES,
  fetchPropertyTypes,
  saveNewPropertyType,
  DEFAULT_CONFIG_OPTIONS,
  fetchConfigurationOptions,
  saveNewConfiguration,
  saveNewLocation
} from '@/lib/propertyTypes';
import { useProfile } from '@/lib/auth';
import Link from 'next/link';

interface PropertyFormProps {
  initialValues?: Partial<any>;
  mode?: 'create' | 'edit';
}

type ListingNature = 'standalone' | 'project';

// Standalone properties do NOT require a separate unit inventory/stacking matrix tab
const STANDALONE_SECTIONS = [
  { label: 'Basic Info', icon: Home },
  { label: 'Location', icon: MapPin },
  { label: 'Pricing & Area', icon: DollarSign },
  { label: 'Ownership', icon: User },
  { label: 'Media', icon: ImageIcon },
];

// Multi-Unit Projects include the procedural Unit Stacking & Inventory Matrix tab
const PROJECT_SECTIONS = [
  { label: 'Project Info', icon: Building2 },
  { label: 'Location', icon: MapPin },
  { label: 'Pricing & Land', icon: DollarSign },
  { label: 'Unit Stacking', icon: Layers },
  { label: 'Developer', icon: User },
  { label: 'Media', icon: ImageIcon },
];

const inputCls = "w-full h-10 px-3.5 bg-[#fafaf8] border border-zinc-200/80 rounded-xl text-base lg:text-[12px] font-medium text-zinc-800 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-[#d4ad4d] focus:ring-4 focus:ring-[#d4ad4d]/10 transition-all";
const selectCls = "w-full h-10 px-3.5 bg-[#fafaf8] border border-zinc-200/80 rounded-xl text-base lg:text-[12px] font-medium text-zinc-800 focus:bg-white focus:outline-none focus:border-[#d4ad4d] focus:ring-4 focus:ring-[#d4ad4d]/10 transition-all appearance-none cursor-pointer";
const labelCls = "text-[10px] font-bold text-zinc-400 uppercase tracking-widest";
const textareaCls = "w-full px-3.5 py-2.5 bg-[#fafaf8] border border-zinc-200/80 rounded-xl text-base lg:text-[12px] font-medium text-zinc-800 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-[#d4ad4d] focus:ring-4 focus:ring-[#d4ad4d]/10 transition-all resize-none";

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className={labelCls}>
      {children}
      {required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
    </div>
  );
}

function generatePropertyCode(type: ListingNature = 'standalone'): string {
  const prefix = type === 'standalone' ? 'IND' : 'PRJ';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PRP-${prefix}-${timestamp}-${random}`;
}

export function PropertyForm({ initialValues = {}, mode = 'create' }: PropertyFormProps) {
  const router = useRouter();
  const profile = useProfile();
  const isAdmin = profile?.role === 'Admin' || profile?.role === 'SuperAdmin';

  const isEdit = mode === 'edit' && !!initialValues.id;
  const [state, formAction, isPending] = useActionState(isEdit ? updatePropertyAction : createPropertyAction, null);
  const [deleting, setDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [images, setImages] = useState<any[]>([]);

  // Top-Level Property Mode: Standalone Property vs Multi-Unit Project
  const [listingNature, setListingNature] = useState<ListingNature>(() => {
    if (initialValues.listing_nature) return initialValues.listing_nature as ListingNature;
    if (initialValues.towers_list && String(initialValues.towers_list).includes(',')) return 'project';
    return 'standalone';
  });

  const sections = listingNature === 'standalone' ? STANDALONE_SECTIONS : PROJECT_SECTIONS;

  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (initialValues.id) {
      supabase.from('property_images')
        .select('*')
        .eq('property_id', initialValues.id)
        .order('sort_order', { ascending: true })
        .then(async ({ data }: any) => {
          if (data) {
            const mapped = await Promise.all(data.map(async (img: any) => {
              if (img.url.startsWith('http')) return { ...img, previewUrl: img.url };
              const { data: sData } = await supabase.storage.from('property-images').createSignedUrl(img.url, 604800);
              return { ...img, previewUrl: sData?.signedUrl || img.url };
            }));
            setImages(mapped);
          }
        });
    }
  }, [initialValues.id]);

  const handleImagesUploaded = async (newPaths: string[]) => {
    const newImgs = await Promise.all(newPaths.map(async path => {
      const { data: sData } = await supabase.storage.from('property-images').createSignedUrl(path, 604800);
      return {
        url: path,
        previewUrl: sData?.signedUrl || path
      };
    }));
    setImages(prev => [...prev, ...newImgs]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Basic Configuration & Property Types
  const [configuration, setConfiguration] = useState<string[]>(
    initialValues.configuration ? initialValues.configuration.split(',').map((s: string) => s.trim()) : ['3 BHK']
  );
  const [customConfigOptions, setCustomConfigOptions] = useState<string[]>([]);
  const [isAddingNewConfig, setIsAddingNewConfig] = useState(false);
  const [newConfigInput, setNewConfigInput] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const [locations, setLocations] = useState<string[]>(
    initialValues.location
      ? initialValues.location.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
  );
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>([]);

  const [propertyTypes, setPropertyTypes] = useState<string[]>(DEFAULT_PROPERTY_TYPES);
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newPropertyTypeInput, setNewPropertyTypeInput] = useState('');
  const [isSavingType, setIsSavingType] = useState(false);

  const [isAddingNewLocation, setIsAddingNewLocation] = useState(false);
  const [newLocationInput, setNewLocationInput] = useState('');
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  const [propertyCode, setPropertyCode] = useState(
    initialValues.property_code || (initialValues.id ? '' : generatePropertyCode(listingNature))
  );

  // Live preview & core form fields
  const [previewTitle, setPreviewTitle] = useState(initialValues.title || '');
  const [previewPrice, setPreviewPrice] = useState(initialValues.price || '13500000');
  const [previewType, setPreviewType] = useState(initialValues.property_type || (listingNature === 'standalone' ? 'Apartment' : 'Residential Project'));
  const [carpetArea, setCarpetArea] = useState<string>(String(initialValues.carpet_area || '1680'));
  const [builtUpArea, setBuiltUpArea] = useState<string>(String(initialValues.built_up_area || '2150'));
  
  const [alternateOwnerContacts, setAlternateOwnerContacts] = useState<string[]>(
    Array.isArray(initialValues.alternate_owner_contacts) ? initialValues.alternate_owner_contacts : []
  );

  // ── Standalone Specific State (Integrated directly into basic & pricing) ──
  const [standaloneUnitNo, setStandaloneUnitNo] = useState(initialValues.unit_no || 'A-1204');
  const [standaloneFloorNumber, setStandaloneFloorNumber] = useState<number>(Number(initialValues.floor_number) || 12);
  const [standaloneTotalFloors, setStandaloneTotalFloors] = useState<number>(Number(initialValues.total_floors) || 20);
  const [standaloneFacing, setStandaloneFacing] = useState(initialValues.facing || 'East Facing (Riverfront & Sunrise View)');
  const [standaloneFurnishing, setStandaloneFurnishing] = useState(initialValues.furnishing || 'Semi-Furnished (Modular Kitchen + Wardrobes)');
  const [standaloneParking, setStandaloneParking] = useState(initialValues.parking || '2 Covered Parking Slots');
  const [standalonePossession, setStandalonePossession] = useState(initialValues.possession_status || 'Ready to Move');
  const [standaloneMaintenance, setStandaloneMaintenance] = useState(initialValues.maintenance || '5500');

  // ── Project Specific State ──
  const [developerName, setDeveloperName] = useState(initialValues.developer_name || 'Luxe Realty Developers');
  const [reraNumber, setReraNumber] = useState(initialValues.rera_number || 'P52100029381');
  const [landParcel, setLandParcel] = useState(initialValues.land_parcel || '12.5 Acres');
  const [towersList, setTowersList] = useState<string[]>(
    initialValues.towers_list
      ? String(initialValues.towers_list).split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['Tower A', 'Tower B', 'Tower C']
  );
  const [newTowerInput, setNewTowerInput] = useState('');
  const [totalFloors, setTotalFloors] = useState<number>(Number(initialValues.total_floors) || 14);
  const [unitsPerFloor, setUnitsPerFloor] = useState<number>(Number(initialValues.units_per_floor) || 4);
  const [possessionTimeline, setPossessionTimeline] = useState<string>(initialValues.possession_date || 'December 2026');
  const [activePreviewTower, setActivePreviewTower] = useState<string>('Tower A');

  useEffect(() => {
    fetchPropertyTypes(supabase).then(types => {
      setPropertyTypes(types);
      if (initialValues.property_type && !types.includes(initialValues.property_type)) {
        setPropertyTypes(prev => [...prev, initialValues.property_type]);
      }
    });

    fetchConfigurationOptions(supabase).then(configs => {
      setCustomConfigOptions(configs);
    });

    supabase.from('locations').select('name').order('name').then(({ data }: any) => {
      if (data) setLocationOptions(data.map((l: any) => ({ value: l.name, label: l.name })));
    });
  }, [initialValues.property_type]);

  const handleAddNewType = async () => {
    const trimmed = newPropertyTypeInput.trim();
    if (!trimmed) return;
    setIsSavingType(true);
    try {
      const updated = await saveNewPropertyType(trimmed, supabase);
      setPropertyTypes(updated);
      handlePropertyTypeChange(trimmed);
      setIsAddingNewType(false);
      setNewPropertyTypeInput('');
      toast.success(`Property type "${trimmed}" created and saved!`);
    } catch (err) {
      toast.error('Failed to create property type');
    } finally {
      setIsSavingType(false);
    }
  };

  const handleAddNewConfig = async () => {
    const trimmed = newConfigInput.trim();
    if (!trimmed) return;
    setIsSavingConfig(true);
    try {
      const updated = await saveNewConfiguration(trimmed, supabase);
      setCustomConfigOptions(updated);
      if (!configuration.includes(trimmed)) {
        setConfiguration(prev => [...prev, trimmed]);
      }
      setIsAddingNewConfig(false);
      setNewConfigInput('');
      toast.success(`Configuration "${trimmed}" created and saved!`);
    } catch (err) {
      toast.error('Failed to create configuration');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleAddNewLocation = async () => {
    const trimmed = newLocationInput.trim();
    if (!trimmed) return;
    setIsSavingLocation(true);
    try {
      await saveNewLocation(trimmed, supabase);
      setLocationOptions(prev => {
        if (prev.some(l => l.value.toLowerCase() === trimmed.toLowerCase())) return prev;
        return [...prev, { value: trimmed, label: trimmed }].sort((a, b) => a.label.localeCompare(b.label));
      });
      if (!locations.includes(trimmed)) {
        setLocations(prev => [...prev, trimmed]);
      }
      setIsAddingNewLocation(false);
      setNewLocationInput('');
      toast.success(`Location "${trimmed}" added to master database!`);
    } catch (err) {
      toast.error('Failed to add location');
    } finally {
      setIsSavingLocation(false);
    }
  };

  const computedConfigOptions = useMemo(() => {
    const base = (!previewType || isResidentialType(previewType)) ? BHK_CONFIG_OPTIONS : COMMERCIAL_CONFIG_OPTIONS;
    const baseValues = new Set(base.map(b => b.value.toLowerCase()));
    const extra = customConfigOptions
      .filter(c => !baseValues.has(c.toLowerCase()))
      .map(c => ({ value: c, label: c }));
    return [...base, ...extra];
  }, [previewType, customConfigOptions]);

  useEffect(() => {
    if (state?.success) {
      toast.success(isEdit ? 'Property updated successfully' : 'Property saved successfully');
      if (locations.length > 0) {
        locations.forEach(loc => {
          supabase.from('locations').upsert({ name: loc }, { onConflict: 'name' });
        });
      }
      router.push('/properties');
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handlePropertyTypeChange = (value: string) => {
    setPreviewType(value);
    if (value && !isResidentialType(value) && configuration.length === 0) {
      setConfiguration([value]);
    }
  };

  const handleDelete = async () => {
    if (!initialValues.id) return;
    if (!confirm('Are you sure you want to delete this property? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await deletePropertyAction(initialValues.id);
      if (res.success) {
        toast.success('Property deleted successfully');
        router.push('/properties');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to delete property');
      }
    } catch {
      toast.error('Error deleting property');
    } finally {
      setDeleting(false);
    }
  };

  function formatPrice(v: string | number) {
    const n = parseFloat(String(v));
    if (!n) return '';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    return `₹${n.toLocaleString('en-IN')}`;
  }

  function validateRequiredFields(): boolean {
    if (!previewTitle.trim()) {
      toast.error('Property Title / Name is required.');
      setActiveSection(0);
      return false;
    }
    if (locations.length === 0) {
      toast.error('At least one location is required.');
      setActiveSection(1);
      return false;
    }
    if (!previewPrice || !String(previewPrice).trim()) {
      toast.error('Price is required.');
      setActiveSection(2);
      return false;
    }
    return true;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!validateRequiredFields()) {
      e.preventDefault();
    }
  };

  // ── Render Option Switcher (Standalone vs Project) ──
  const renderListingNatureSelector = () => (
    <div className="space-y-2 mb-6">
      <FieldLabel required>Property Category / Structure</FieldLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Standalone Option */}
        <button
          type="button"
          onClick={() => {
            setListingNature('standalone');
            if (activeSection >= STANDALONE_SECTIONS.length) {
              setActiveSection(STANDALONE_SECTIONS.length - 1);
            }
            if (!initialValues.id) {
              setPropertyCode(generatePropertyCode('standalone'));
              if (!previewType || previewType.includes('Project')) setPreviewType('Apartment');
            }
          }}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
            listingNature === 'standalone'
              ? 'bg-amber-500/5 border-[#d4ad4d] ring-2 ring-[#d4ad4d]/30 shadow-xs'
              : 'bg-white border-zinc-200/90 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-xl ${listingNature === 'standalone' ? 'bg-[#d4ad4d] text-white shadow-xs' : 'bg-zinc-100 text-zinc-600'}`}>
                <Home className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-zinc-900">Standalone Property</h4>
                <span className="text-[10px] font-bold text-[#b8922e] uppercase tracking-wider font-mono">Individual Property / Resale Unit</span>
              </div>
            </div>
            {listingNature === 'standalone' && (
              <CheckCircle2 className="h-4 w-4 text-[#d4ad4d] shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2.5 leading-relaxed">
            For individual apartments, duplex penthouses, standalone villas, bungalows, or single commercial shops. <strong>No unit inventory stacking required.</strong>
          </p>
        </button>

        {/* Project Option */}
        <button
          type="button"
          onClick={() => {
            setListingNature('project');
            if (!initialValues.id) {
              setPropertyCode(generatePropertyCode('project'));
              if (!previewType || previewType === 'Apartment') setPreviewType('Residential Project');
            }
          }}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
            listingNature === 'project'
              ? 'bg-amber-500/5 border-[#d4ad4d] ring-2 ring-[#d4ad4d]/30 shadow-xs'
              : 'bg-white border-zinc-200/90 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-xl ${listingNature === 'project' ? 'bg-zinc-900 text-white shadow-xs' : 'bg-zinc-100 text-zinc-600'}`}>
                <Building2 className="h-5 w-5 text-[#d4ad4d]" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-zinc-900">Multi-Unit Project</h4>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Township / Society with Towers & Units</span>
              </div>
            </div>
            {listingNature === 'project' && (
              <CheckCircle2 className="h-4 w-4 text-[#d4ad4d] shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2.5 leading-relaxed">
            For large residential developments and societies with multiple towers, floors, and unit inventories. Generates procedural stacking matrix and inventory forecasts.
          </p>
        </button>
      </div>

      <input type="hidden" name="listing_nature" value={listingNature} />
    </div>
  );

  // ── Render Basic Info ──
  const renderBasicInfo = () => (
    <div className="space-y-5 text-left">
      {renderListingNatureSelector()}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel required>
            {listingNature === 'standalone' ? 'Property Name / Unit Title' : 'Project / Society Name'}
          </FieldLabel>
          <input
            name="title"
            className={inputCls}
            placeholder={listingNature === 'standalone' ? 'e.g. Skyline Duplex Penthouse, A-1204' : 'e.g. Vivencia Luxury Residences'}
            defaultValue={initialValues.title ?? ''}
            onChange={e => setPreviewTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Property Code</FieldLabel>
          <input name="property_code" className={inputCls} placeholder="PRP-IND-001" value={propertyCode} onChange={e => setPropertyCode(e.target.value)} />
        </div>
      </div>

      {listingNature === 'standalone' ? (
        /* Standalone specific fields integrated cleanly */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FieldLabel required>Unit / Flat Number</FieldLabel>
            <input
              type="text"
              name="unit_no"
              className={inputCls + " font-bold text-[#b8922e]"}
              placeholder="e.g. A-1204, Villa 7, Office 401"
              value={standaloneUnitNo}
              onChange={e => setStandaloneUnitNo(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <FieldLabel>Floor Level (Unit Floor / Total Building Floors)</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                name="floor_number"
                min={0}
                max={100}
                className={inputCls}
                placeholder="Floor (12)"
                value={standaloneFloorNumber}
                onChange={e => setStandaloneFloorNumber(Number(e.target.value) || 1)}
              />
              <input
                type="number"
                name="total_floors"
                min={1}
                max={100}
                className={inputCls}
                placeholder="Of Total (20)"
                value={standaloneTotalFloors}
                onChange={e => setStandaloneTotalFloors(Number(e.target.value) || 1)}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Multi-Unit Project specific fields */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FieldLabel required>Developer / Builder Firm</FieldLabel>
            <input
              name="developer_name"
              className={inputCls}
              placeholder="e.g. Panchshil Developers, Solitaire Group"
              value={developerName}
              onChange={e => setDeveloperName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>RERA Registration Number</FieldLabel>
            <input
              name="rera_number"
              className={inputCls + " font-mono"}
              placeholder="e.g. P52100029381"
              value={reraNumber}
              onChange={e => setReraNumber(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel>{listingNature === 'standalone' ? 'Property Type' : 'Project Type'}</FieldLabel>
            {isAdmin && !isAddingNewType && (
              <button
                type="button"
                onClick={() => setIsAddingNewType(true)}
                className="text-[10px] font-bold text-[#d4ad4d] hover:text-[#b8922e] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3" /> New Type
              </button>
            )}
          </div>

          {isAddingNewType ? (
            <div className="space-y-1.5 p-2 bg-zinc-50 border border-zinc-200/80 rounded-xl">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newPropertyTypeInput}
                  onChange={e => setNewPropertyTypeInput(e.target.value)}
                  placeholder="Type new property type..."
                  className={inputCls + " h-8 text-xs"}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewType();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddNewType}
                  disabled={isSavingType || !newPropertyTypeInput.trim()}
                  className="h-8 px-3 bg-[#d4ad4d] hover:bg-[#b8922e] text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {isSavingType ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAddingNewType(false); setNewPropertyTypeInput(''); }}
                  className="h-8 px-2 text-zinc-400 hover:text-zinc-700 text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <input type="hidden" name="property_type" value={previewType} />
            </div>
          ) : (
            <SelectWrapper>
              <select
                name="property_type"
                className={selectCls}
                value={previewType}
                onChange={e => {
                  if (e.target.value === '__add_new__') {
                    setIsAddingNewType(true);
                  } else {
                    handlePropertyTypeChange(e.target.value);
                  }
                }}
              >
                <option value="">Select Type</option>
                {propertyTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
                {isAdmin && (
                  <option value="__add_new__" className="font-bold text-[#d4ad4d]">
                    + Type & Create New Property Type...
                  </option>
                )}
              </select>
            </SelectWrapper>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel>{listingNature === 'standalone' ? 'Unit Configuration' : 'Available Project Configurations'}</FieldLabel>
            {isAdmin && !isAddingNewConfig && (
              <button
                type="button"
                onClick={() => setIsAddingNewConfig(true)}
                className="text-[10px] font-bold text-[#d4ad4d] hover:text-[#b8922e] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3" /> New Config
              </button>
            )}
          </div>

          {isAddingNewConfig && (
            <div className="flex items-center gap-1.5 p-2 bg-zinc-50 border border-zinc-200/80 rounded-xl mb-2">
              <input
                type="text"
                value={newConfigInput}
                onChange={e => setNewConfigInput(e.target.value)}
                placeholder="Type new config (e.g. 5 BHK Sky Villa)..."
                className={inputCls + " h-8 text-xs"}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewConfig();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddNewConfig}
                disabled={isSavingConfig || !newConfigInput.trim()}
                className="h-8 px-3 bg-[#d4ad4d] hover:bg-[#b8922e] text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {isSavingConfig ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => { setIsAddingNewConfig(false); setNewConfigInput(''); }}
                className="h-8 px-2 text-zinc-400 hover:text-zinc-700 text-xs font-semibold shrink-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          <TagsInput
            value={configuration}
            onChange={setConfiguration}
            options={computedConfigOptions}
            allowCustom={true}
            placeholder={listingNature === 'standalone' ? 'Select config (e.g. 3 BHK)' : 'Add configs (e.g. 2 BHK, 3 BHK, 4 BHK)'}
          />
          <input type="hidden" name="configuration" value={configuration.join(', ')} />
        </div>
      </div>

      {listingNature === 'standalone' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FieldLabel>Direction Facing / View</FieldLabel>
            <SelectWrapper>
              <select
                name="facing"
                className={selectCls}
                value={standaloneFacing}
                onChange={e => setStandaloneFacing(e.target.value)}
              >
                <option value="East (Riverfront & Sunrise View)">East (Riverfront & Sunrise View)</option>
                <option value="West (Sunset & Skyline View)">West (Sunset & Skyline View)</option>
                <option value="North-East (Vaastu Compliant)">North-East (Vaastu Compliant)</option>
                <option value="Garden / Swimming Pool Facing">Garden / Swimming Pool Facing</option>
                <option value="Main Road / Corner View">Main Road / Corner View</option>
              </select>
            </SelectWrapper>
          </div>

          <div className="space-y-1.5">
            <FieldLabel>Furnishing Status</FieldLabel>
            <SelectWrapper>
              <select
                name="furnishing"
                className={selectCls}
                value={standaloneFurnishing}
                onChange={e => setStandaloneFurnishing(e.target.value)}
              >
                <option value="Unfurnished">Unfurnished Bare Shell</option>
                <option value="Semi-Furnished (Modular Kitchen + Wardrobes)">Semi-Furnished (Kitchen + Wardrobes)</option>
                <option value="Fully Furnished Luxury Interior">Fully Furnished Luxury Interior</option>
              </select>
            </SelectWrapper>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <FieldLabel>Description / Marketing Pitch</FieldLabel>
        <textarea
          name="description"
          className={textareaCls}
          rows={3}
          placeholder={listingNature === 'standalone' ? 'Describe the private unit views, sun exposure, interior finishes, and key features...' : 'Comprehensive project overview, township amenities, clubhouses, and connectivity advantages...'}
          defaultValue={initialValues.description ?? ''}
        />
      </div>
    </div>
  );

  // ── Render Location ──
  const renderLocation = () => (
    <div className="space-y-5 text-left">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <FieldLabel required>Location Tags / Micro-Market</FieldLabel>
          {isAdmin && !isAddingNewLocation && (
            <button
              type="button"
              onClick={() => setIsAddingNewLocation(true)}
              className="text-[10px] font-bold text-[#d4ad4d] hover:text-[#b8922e] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Add Location
            </button>
          )}
        </div>

        {isAddingNewLocation && (
          <div className="flex items-center gap-1.5 p-2 bg-zinc-50 border border-zinc-200/80 rounded-xl mb-2">
            <input
              type="text"
              value={newLocationInput}
              onChange={e => setNewLocationInput(e.target.value)}
              placeholder="Type new Pune location (e.g. Model Colony, Prabhat Road)..."
              className={inputCls + " h-8 text-xs"}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNewLocation();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddNewLocation}
              disabled={isSavingLocation || !newLocationInput.trim()}
              className="h-8 px-3 bg-[#d4ad4d] hover:bg-[#b8922e] text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              {isSavingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => { setIsAddingNewLocation(false); setNewLocationInput(''); }}
              className="h-8 px-2 text-zinc-400 hover:text-zinc-700 text-xs font-semibold shrink-0 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        <TagsInput
          value={locations}
          onChange={setLocations}
          options={locationOptions}
          allowCustom={true}
          placeholder="e.g. Kalyani Nagar, Koregaon Park, Baner"
        />
        <input type="hidden" name="location" value={locations.join(', ')} />
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Full Address / Landmark</FieldLabel>
        <textarea
          name="address"
          className={textareaCls}
          rows={3}
          placeholder={listingNature === 'standalone' ? 'Complete street address, building wing, floor and landmark...' : 'Project site address, sector, survey number, and nearest landmark...'}
          defaultValue={initialValues.address ?? ''}
        />
      </div>
    </div>
  );

  // ── Render Pricing & Area ──
  const renderPricing = () => {
    const priceNum = Number(previewPrice) || 0;
    const carpetNum = Number(carpetArea) || 1;
    const ratePerSqFt = carpetNum > 0 && priceNum > 0 ? Math.round(priceNum / carpetNum) : 0;

    return (
      <div className="space-y-5 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FieldLabel required>{listingNature === 'standalone' ? 'Agreed / Listing Price (₹)' : 'Base Starting Price (₹)'}</FieldLabel>
            <IndianNumberInput
              name="price"
              className={inputCls + " font-bold text-[#b8922e]"}
              placeholder="e.g. 1,35,00,000"
              defaultValue={initialValues.price ?? previewPrice}
              onValueChange={setPreviewPrice}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Listing / Transaction Type</FieldLabel>
            <SelectWrapper>
              <select name="listing_type" className={selectCls} defaultValue={initialValues.listing_type ?? 'Sale'}>
                <option value="Sale">Outright Sale</option>
                <option value="Rent">Lease / Rent</option>
              </select>
            </SelectWrapper>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FieldLabel>{listingNature === 'standalone' ? 'Carpet Area (sq ft)' : 'Min. Carpet Area (sq ft)'}</FieldLabel>
            <input
              type="number"
              name="carpet_area"
              className={inputCls}
              placeholder="e.g. 1680"
              value={carpetArea}
              onChange={e => setCarpetArea(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>{listingNature === 'standalone' ? 'Super Built Up Area (sq ft)' : 'Super Built Up Area (sq ft)'}</FieldLabel>
            <input
              type="number"
              name="built_up_area"
              className={inputCls}
              placeholder="e.g. 2150"
              value={builtUpArea}
              onChange={e => setBuiltUpArea(e.target.value)}
            />
          </div>
        </div>

        {listingNature === 'project' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel>Total Land Parcel Size</FieldLabel>
              <input
                name="land_parcel"
                className={inputCls}
                placeholder="e.g. 12.5 Acres"
                value={landParcel}
                onChange={e => setLandParcel(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Target Possession Date</FieldLabel>
              <input
                type="text"
                name="possession_date"
                value={possessionTimeline}
                onChange={e => setPossessionTimeline(e.target.value)}
                className={inputCls}
                placeholder="e.g. December 2026"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <FieldLabel>Monthly Maintenance (₹/month)</FieldLabel>
                <input
                  name="maintenance"
                  className={inputCls}
                  placeholder="e.g. 5500"
                  value={standaloneMaintenance}
                  onChange={e => setStandaloneMaintenance(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Reserved Car Parking</FieldLabel>
                <SelectWrapper>
                  <select
                    name="parking"
                    className={selectCls}
                    value={standaloneParking}
                    onChange={e => setStandaloneParking(e.target.value)}
                  >
                    <option value="1 Covered Parking Slot">1 Covered Parking</option>
                    <option value="2 Covered Parking Slots">2 Covered Parking Slots</option>
                    <option value="3 Covered Parking Slots">3 Covered Parking Slots</option>
                    <option value="Open Parking Slot">Open Parking</option>
                    <option value="None">None</option>
                  </select>
                </SelectWrapper>
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Possession Status</FieldLabel>
                <SelectWrapper>
                  <select
                    name="possession_status"
                    className={selectCls}
                    value={standalonePossession}
                    onChange={e => setStandalonePossession(e.target.value)}
                  >
                    <option value="Ready to Move">Ready to Move</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Resale Immediate Allotment">Resale Immediate</option>
                  </select>
                </SelectWrapper>
              </div>
            </div>

            <div className="p-3.5 bg-[#fafaf8] border border-zinc-200/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Calculated Rate per Sq.Ft</span>
                <span className="text-sm font-extrabold text-zinc-900">
                  {ratePerSqFt > 0 ? `₹${ratePerSqFt.toLocaleString('en-IN')} / sq ft` : '—'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Carpet Efficiency: {carpetNum && builtUpArea ? Math.round((carpetNum / Number(builtUpArea)) * 100) : 78}%
              </span>
            </div>

            <input type="hidden" name="possession_date" value={standalonePossession} />
          </div>
        )}
      </div>
    );
  };

  // ── Render Project Unit Stacking Matrix (Only for Multi-Unit Projects) ──
  const renderProjectUnitStacking = () => {
    const totalProjectUnits = towersList.length * totalFloors * unitsPerFloor;
    const towerPrefix = activePreviewTower.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'T';

    return (
      <div className="space-y-6 text-left">
        {/* Header Introduction Banner */}
        <div className="p-4 bg-white border border-[#ebebeb] rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#b8922e] uppercase tracking-widest font-mono">
              Multi-Tower Stacking & Inventory Matrix
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#d4ad4d]/15 text-[#96751f] border border-[#d4ad4d]/30">
              {totalProjectUnits} Projected Units
            </span>
          </div>
          <h3 className="text-sm font-extrabold text-zinc-900">Configure Towers, Height & Floor-by-Floor Matrix</h3>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Specify the tower nomenclature, floor height, and units per floor. The system will automatically generate the visual unit inventory stacking projection.
          </p>
        </div>

        {/* Configuration Controls */}
        <div className="space-y-4">
          {/* Towers Configuration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel required>Project Towers & Wings</FieldLabel>
              <span className="text-[10px] text-zinc-400 font-medium font-mono">{towersList.length} Towers configured</span>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center p-3 bg-[#fafaf8] border border-zinc-200/80 rounded-xl">
              {towersList.map((t, idx) => (
                <span 
                  key={idx} 
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePreviewTower === t 
                      ? 'bg-zinc-900 text-white shadow-xs' 
                      : 'bg-white border border-zinc-200 text-zinc-800'
                  }`}
                >
                  <Building2 className="h-3 w-3 text-[#d4ad4d]" />
                  {t}
                  {towersList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = towersList.filter((_, i) => i !== idx);
                        setTowersList(next);
                        if (activePreviewTower === t) setActivePreviewTower(next[0] || 'Tower A');
                      }}
                      className="ml-1 text-zinc-400 hover:text-rose-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}

              {/* Add tower input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. Tower D, East Wing"
                  value={newTowerInput}
                  onChange={(e) => setNewTowerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = newTowerInput.trim();
                      if (val && !towersList.includes(val)) {
                        setTowersList(prev => [...prev, val]);
                        setNewTowerInput('');
                      }
                    }
                  }}
                  className="h-8 px-2.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#d4ad4d]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = newTowerInput.trim();
                    if (val && !towersList.includes(val)) {
                      setTowersList(prev => [...prev, val]);
                      setNewTowerInput('');
                    }
                  }}
                  className="h-8 px-3 bg-[#d4ad4d] hover:bg-[#b8922e] text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  + Add Tower
                </button>
              </div>
            </div>
          </div>

          {/* Floors & Units per floor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <FieldLabel required>Total Floors per Tower</FieldLabel>
              <input
                type="number"
                min={1}
                max={60}
                value={totalFloors}
                onChange={(e) => setTotalFloors(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
                className={inputCls}
                placeholder="e.g. 14"
              />
              <span className="text-[10px] text-zinc-400 block">Floors 1 through {totalFloors}</span>
            </div>

            <div className="space-y-1.5">
              <FieldLabel required>Units per Floor</FieldLabel>
              <input
                type="number"
                min={1}
                max={12}
                value={unitsPerFloor}
                onChange={(e) => setUnitsPerFloor(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                className={inputCls}
                placeholder="e.g. 4"
              />
              <span className="text-[10px] text-zinc-400 block">{unitsPerFloor} apartments per floor</span>
            </div>

            <div className="space-y-1.5">
              <FieldLabel>Target Possession Date</FieldLabel>
              <input
                type="text"
                value={possessionTimeline}
                onChange={(e) => setPossessionTimeline(e.target.value)}
                className={inputCls}
                placeholder="e.g. December 2026"
              />
              <span className="text-[10px] text-zinc-400 block">Project Delivery Timeline</span>
            </div>
          </div>

          {/* Quick Metrics Calculation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-zinc-900 text-white rounded-xl shadow-xs">
            <div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Towers</span>
              <span className="text-base font-extrabold text-white">{towersList.length} Towers</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Floors / Height</span>
              <span className="text-base font-extrabold text-white">{totalFloors} Floors</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Total Project Units</span>
              <span className="text-base font-extrabold text-[#d4ad4d]">{totalProjectUnits} Units</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Projected Pipeline</span>
              <span className="text-base font-extrabold text-emerald-400">
                {previewPrice ? formatPrice(Number(previewPrice) * totalProjectUnits) : '₹' + (totalProjectUnits * 1.35).toFixed(1) + ' Cr'}
              </span>
            </div>
          </div>

          {/* Visual Interactive Building Stacking Matrix Projection */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-zinc-900">Interactive Building Stacking Projection</h4>
                <p className="text-[10px] text-zinc-400">Visual unit matrix preview projected into the Unit Inventory page</p>
              </div>

              {/* Tower Switcher */}
              <div className="flex items-center gap-1 bg-[#fafaf8] p-1 border border-zinc-200 rounded-lg">
                {towersList.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePreviewTower(t)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      activePreviewTower === t 
                        ? 'bg-zinc-900 text-white' 
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Stacking Grid (Floors descending) */}
            <div className="border border-zinc-200 rounded-2xl bg-[#fafaf8] p-4 max-h-72 overflow-y-auto space-y-2">
              {Array.from({ length: Math.min(totalFloors, 8) }).map((_, fIdx) => {
                const floorNum = totalFloors - fIdx;
                return (
                  <div key={floorNum} className="flex items-center gap-2">
                    <span className="w-16 text-[10px] font-mono font-bold text-zinc-500 shrink-0 text-right pr-2 border-r border-zinc-200">
                      Floor {floorNum < 10 ? `0${floorNum}` : floorNum}
                    </span>
                    <div className="flex flex-wrap gap-2 flex-1">
                      {Array.from({ length: unitsPerFloor }).map((_, uIdx) => {
                        const unitNumStr = uIdx + 1 < 10 ? `0${uIdx + 1}` : `${uIdx + 1}`;
                        const unitCode = `${towerPrefix}-${floorNum}${unitNumStr}`;
                        const isToken = floorNum === 2 && uIdx === 0;
                        const isBooked = floorNum === 1 && uIdx === 0;
                        return (
                          <div 
                            key={uIdx}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left min-w-[105px] ${
                              isBooked 
                                ? 'bg-zinc-100 border-zinc-300 text-zinc-500' 
                                : isToken 
                                  ? 'bg-amber-50 border-amber-200 text-amber-900' 
                                  : 'bg-white border-zinc-200 text-zinc-800 shadow-2xs'
                            }`}
                          >
                            <div>
                              <span className="font-mono font-extrabold text-[11px] block">{unitCode}</span>
                              <span className="text-[9px] text-zinc-400 block">{configuration[0] || '3 BHK'}</span>
                            </div>
                            <span className={`w-2 h-2 rounded-full ${
                              isBooked ? 'bg-zinc-400' : isToken ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {totalFloors > 8 && (
                <div className="text-center text-[10px] font-mono font-bold text-zinc-400 py-1">
                  ... and {totalFloors - 8} more lower tiers ({towerPrefix}-0101 to {towerPrefix}-0{(totalFloors - 8)}0{unitsPerFloor})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden inputs to pass along with Form submission */}
        <input type="hidden" name="towers_list" value={towersList.join(', ')} />
        <input type="hidden" name="total_floors" value={totalFloors} />
        <input type="hidden" name="units_per_floor" value={unitsPerFloor} />
        <input type="hidden" name="total_units" value={totalProjectUnits} />
        <input type="hidden" name="possession_date" value={possessionTimeline} />
      </div>
    );
  };

  // ── Render Ownership / Builder SPOC ──
  const renderOwnership = () => (
    <div className="space-y-5 text-left">
      <div className="space-y-1.5">
        <FieldLabel>{listingNature === 'standalone' ? 'Property Listing Source' : 'Sales Mandate Type'}</FieldLabel>
        <SelectWrapper>
          <select name="source_type" className={selectCls} defaultValue={initialValues.source_type ?? 'Direct'}>
            <option value="Direct">{listingNature === 'standalone' ? 'Direct Owner / Landlord' : 'Developer Direct Mandate'}</option>
            <option value="Broker">{listingNature === 'standalone' ? 'Channel Partner / Broker' : 'Sole Selling Mandate'}</option>
          </select>
        </SelectWrapper>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel>{listingNature === 'standalone' ? 'Owner Full Name' : 'Builder / SPOC Name'}</FieldLabel>
          <input name="owner_name" className={inputCls} placeholder="e.g. Ramesh Chandra / Rajesh Sharma" defaultValue={initialValues.owner_name ?? ''} />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>{listingNature === 'standalone' ? 'Owner Contact Number' : 'SPOC Contact Number'}</FieldLabel>
          <input name="owner_contact" className={inputCls} placeholder="+91 98200 00000" defaultValue={initialValues.owner_contact ?? ''} />
        </div>
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Additional Contact Numbers</FieldLabel>
        <div className="space-y-2">
          {alternateOwnerContacts.map((num, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                name="alternate_owner_contacts"
                value={num}
                onChange={e => setAlternateOwnerContacts(prev => prev.map((p, i) => i === idx ? e.target.value : p))}
                className={inputCls}
                placeholder="+91 90000 00001"
              />
              <button
                type="button"
                onClick={() => setAlternateOwnerContacts(prev => prev.filter((_, i) => i !== idx))}
                className="shrink-0 p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setAlternateOwnerContacts(prev => [...prev, ''])}
            className="flex items-center gap-1 text-[11px] font-bold text-[#b8922e] hover:text-[#96751f] transition-colors cursor-pointer"
          >
            <Plus className="h-3 w-3" /> Add another number
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <FieldLabel>Agreed Brokerage / Commission (%)</FieldLabel>
          <input 
            name="brokerage" 
            className={inputCls + " border-[#d4ad4d]/40 font-bold bg-[#fafaf8]"} 
            placeholder="e.g. 2.0% or ₹2.5 Lakhs" 
            defaultValue={initialValues.brokerage ?? ''} 
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Confidential Agency Notes</FieldLabel>
          <input 
            name="internal_notes" 
            className={inputCls} 
            placeholder="Key possession nuances, negotiation scope..." 
            defaultValue={initialValues.internal_notes ?? ''} 
          />
        </div>
      </div>
    </div>
  );

  // ── Render Media ──
  const renderMedia = () => (
    <div className="space-y-5 text-left">
      <div className="space-y-1.5">
        <FieldLabel>{listingNature === 'standalone' ? 'Property Photos & Floor Plans' : 'Project Elevation Renders & Master Layout'}</FieldLabel>
        <MediaPicker 
          bucket="property-images" 
          fieldPrefix={`prop-${initialValues.id || 'new'}_`} 
          onUploadComplete={handleImagesUploaded}
        />
      </div>

      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <FieldLabel>Uploaded Media ({images.length})</FieldLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                <img 
                  src={img.previewUrl} 
                  alt="Property media" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-white/95 text-rose-600 hover:text-rose-700 p-1 rounded-md shadow-sm border border-zinc-100 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {images.map((img, idx) => (
        <input key={idx} type="hidden" name="image_urls" value={img.url} />
      ))}
    </div>
  );

  return (
    <form action={formAction} onSubmit={handleSubmit} className="min-h-screen bg-[#fafaf8]">
      {isEdit && <input type="hidden" name="id" value={initialValues.id} />}

      {/* Sticky top header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#ebebeb] px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between gap-3 shadow-[0_1px_0_0_#ebebeb]">
        <Link href="/properties" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 transition-colors shrink-0">
          <ChevronLeft className="h-4 w-4" />
          <span className="text-xs font-semibold hidden sm:block">Back to Properties</span>
        </Link>
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-[15px] font-extrabold text-zinc-900 leading-tight" style={{ letterSpacing: '-0.3px' }}>
            {isEdit ? 'Edit Property' : 'Add New Property'}
          </h1>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:inline-block">
            {listingNature === 'standalone' ? '🏠 Standalone Individual Property (Direct Listing)' : '🏢 Multi-Tower Project & Stacking Matrix'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || isPending}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 text-rose-600 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#d4ad4d] text-white text-[11px] font-bold hover:bg-[#b8922e] transition-all shadow-[0_2px_8px_rgba(212,173,77,.35)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isPending ? 'Saving…' : (isEdit ? 'Update Property' : 'Save Property')}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {state?.error && (
        <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-[11px] font-bold">
          Error: {state.error}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {isDesktop ? (
        /* ── DESKTOP VIEWPORT: Split Panel Nav Wizard ── */
        <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
          {/* Left navigation */}
          <div className="w-[210px] shrink-0 border-r border-[#ebebeb] bg-white pt-6 pb-10">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSection(i)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all border-r-2 cursor-pointer ${
                    activeSection === i
                      ? 'border-[#d4ad4d] bg-zinc-50 text-zinc-900'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                      i < activeSection
                        ? 'bg-[#d4ad4d]'
                        : activeSection === i
                        ? 'bg-[#d4ad4d] ring-4 ring-[#d4ad4d]/20'
                        : 'bg-[#e8e7e4]'
                    }`}
                  />
                  <span className="text-[11px] font-bold">{s.label}</span>
                </button>
              );
            })}

            {/* Live preview card */}
            {(previewTitle || previewType) && (
              <div className="mx-3 mt-6 p-3 bg-[#fafaf8] border border-[#ebebeb] rounded-xl text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">Preview</div>
                  <span className="text-[9px] font-bold text-[#b8922e]">
                    {listingNature === 'standalone' ? 'Standalone' : 'Project'}
                  </span>
                </div>
                {previewTitle && (
                  <div className="text-[11px] font-extrabold text-zinc-900 leading-tight">{previewTitle}</div>
                )}
                {previewType && (
                  <div className="text-[9.5px] text-zinc-400 mt-1">{previewType}</div>
                )}
                {previewPrice && (
                  <div className="text-[11px] font-bold text-[#d4ad4d] mt-1.5">{formatPrice(previewPrice)}</div>
                )}
                {locations.length > 0 && (
                  <div className="text-[9px] text-zinc-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5 text-[#d4ad4d]" />
                    {locations.slice(0, 2).join(', ')}
                    {locations.length > 2 && ` +${locations.length - 2}`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right fields */}
          <div className="flex-1 px-8 py-6 max-w-2xl">
            {listingNature === 'standalone' ? (
              <>
                <div style={{ display: activeSection === 0 ? 'block' : 'none' }}>{renderBasicInfo()}</div>
                <div style={{ display: activeSection === 1 ? 'block' : 'none' }}>{renderLocation()}</div>
                <div style={{ display: activeSection === 2 ? 'block' : 'none' }}>{renderPricing()}</div>
                <div style={{ display: activeSection === 3 ? 'block' : 'none' }}>{renderOwnership()}</div>
                <div style={{ display: activeSection === 4 ? 'block' : 'none' }}>{renderMedia()}</div>
              </>
            ) : (
              <>
                <div style={{ display: activeSection === 0 ? 'block' : 'none' }}>{renderBasicInfo()}</div>
                <div style={{ display: activeSection === 1 ? 'block' : 'none' }}>{renderLocation()}</div>
                <div style={{ display: activeSection === 2 ? 'block' : 'none' }}>{renderPricing()}</div>
                <div style={{ display: activeSection === 3 ? 'block' : 'none' }}>{renderProjectUnitStacking()}</div>
                <div style={{ display: activeSection === 4 ? 'block' : 'none' }}>{renderOwnership()}</div>
                <div style={{ display: activeSection === 5 ? 'block' : 'none' }}>{renderMedia()}</div>
              </>
            )}

            {/* Bottom navigation bar */}
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#ebebeb]">
              {activeSection > 0 ? (
                <button type="button" onClick={() => setActiveSection(s => s - 1)}
                  className="text-[11px] font-bold text-zinc-400 hover:text-zinc-700 flex items-center gap-1 transition-colors cursor-pointer">
                  ← {sections[activeSection - 1].label}
                </button>
              ) : <span />}
              {activeSection < sections.length - 1 ? (
                <button type="button" onClick={() => setActiveSection(s => s + 1)}
                  className="dc-btn font-bold text-[11px] flex items-center gap-1 cursor-pointer">
                  {sections[activeSection + 1].label} →
                </button>
              ) : (
                <button type="submit" disabled={isPending} className="dc-btn gold font-bold flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isPending ? 'Saving…' : (isEdit ? 'Update Property' : 'Save Property')}
                </button>
              )}
            </div>
          </div>
        </div>
        ) : (
        /* ── MOBILE VIEWPORT: Single Page Scrolling stacked layout ── */
        <div className="text-left space-y-0 bg-white">
          <div className="px-5 pt-6 pb-5 border-b border-zinc-100 space-y-4">
            <h3 className="text-[11px] font-black text-zinc-900 pb-2.5 uppercase tracking-wider flex items-baseline gap-2 border-b border-zinc-100">
              <span className="font-serif italic font-bold text-[#d4ad4d] text-sm">01.</span>
              <span>{listingNature === 'standalone' ? 'Basic Property Information' : 'Project Master Information'}</span>
            </h3>
            {renderBasicInfo()}
          </div>

          <div className="px-5 pt-6 pb-5 border-b border-zinc-100 space-y-4">
            <h3 className="text-[11px] font-black text-zinc-900 pb-2.5 uppercase tracking-wider flex items-baseline gap-2 border-b border-zinc-100">
              <span className="font-serif italic font-bold text-[#d4ad4d] text-sm">02.</span>
              <span>Location Details</span>
            </h3>
            {renderLocation()}
          </div>

          <div className="px-5 pt-6 pb-5 border-b border-zinc-100 space-y-4">
            <h3 className="text-[11px] font-black text-zinc-900 pb-2.5 uppercase tracking-wider flex items-baseline gap-2 border-b border-zinc-100">
              <span className="font-serif italic font-bold text-[#d4ad4d] text-sm">03.</span>
              <span>Pricing & Area</span>
            </h3>
            {renderPricing()}
          </div>

          {listingNature === 'project' && (
            <div className="px-5 pt-6 pb-5 border-b border-zinc-100 space-y-4">
              <h3 className="text-[11px] font-black text-zinc-900 pb-2.5 uppercase tracking-wider flex items-baseline gap-2 border-b border-zinc-100">
                <span className="font-serif italic font-bold text-[#d4ad4d] text-sm">04.</span>
                <span>Unit Inventory & Stacking Matrix</span>
              </h3>
              {renderProjectUnitStacking()}
            </div>
          )}

          <div className="px-5 pt-6 pb-5 border-b border-zinc-100 space-y-4">
            <h3 className="text-[11px] font-black text-zinc-900 pb-2.5 uppercase tracking-wider flex items-baseline gap-2 border-b border-zinc-100">
              <span className="font-serif italic font-bold text-[#d4ad4d] text-sm">{listingNature === 'project' ? '05.' : '04.'}</span>
              <span>{listingNature === 'standalone' ? 'Ownership & Private Terms' : 'Developer & Mandate Terms'}</span>
            </h3>
            {renderOwnership()}
          </div>

          <div className="px-5 pt-6 pb-8 space-y-4">
            <h3 className="text-[11px] font-black text-zinc-900 pb-2.5 uppercase tracking-wider flex items-baseline gap-2 border-b border-zinc-100">
              <span className="font-serif italic font-bold text-[#d4ad4d] text-sm">{listingNature === 'project' ? '06.' : '05.'}</span>
              <span>Media Uploads</span>
            </h3>
            {renderMedia()}
          </div>
        </div>
        )}
      </div>
    </form>
  );
}
