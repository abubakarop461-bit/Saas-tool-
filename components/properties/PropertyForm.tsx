"use client";
import { useActionState } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createPropertyAction, updatePropertyAction } from '@/app/properties/actions';
import { supabase } from '@/lib/supabaseClient';
import { TagsInput } from '@/components/ui/tags-input';
import { MediaPicker } from '@/components/ui/media-picker';
import { IndianNumberInput } from '@/components/ui/indian-number-input';
import { Building2, MapPin, User, ImageIcon, DollarSign, Trash2, ChevronLeft, ChevronDown, Loader2, Plus, X, Layers } from 'lucide-react';
import { isResidentialType, BHK_CONFIG_OPTIONS, COMMERCIAL_CONFIG_OPTIONS, DEFAULT_PROPERTY_TYPES, fetchPropertyTypes, saveNewPropertyType, DEFAULT_CONFIG_OPTIONS, fetchConfigurationOptions, saveNewConfiguration, saveNewLocation } from '@/lib/propertyTypes';
import { useProfile } from '@/lib/auth';
import Link from 'next/link';

interface PropertyFormProps {
  initialValues?: Partial<any>;
  mode?: 'create' | 'edit';
}

const SECTIONS = [
  { label: 'Basic Info', icon: Building2 },
  { label: 'Location', icon: MapPin },
  { label: 'Pricing & Area', icon: DollarSign },
  { label: 'Unit Inventory', icon: Layers },
  { label: 'Ownership', icon: User },
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

// property_code has a unique constraint in the DB. Leaving the field blank used to submit
// an empty string (not null), and Postgres treats duplicate empty strings as a unique-key
// collision -- so the second property ever saved with a blank code failed. Generating a
// fresh, effectively-collision-proof code per form load removes the need to ever leave it
// blank; staff can still overwrite it with their own scheme if they want.
function generatePropertyCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PRP-${timestamp}-${random}`;
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

  // Only one layout (desktop wizard or mobile single-scroll) is ever mounted at a time,
  // matching the lg: (1024px) breakpoint the rest of the app uses. Previously both were
  // always mounted with CSS display toggling, which duplicated every field's `name`
  // attribute in the same <form> -- the hidden copy stayed empty, so native `required`
  // validation silently blocked every submission with no visible error.
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

  const [configuration, setConfiguration] = useState<string[]>(
    initialValues.configuration ? initialValues.configuration.split(',').map((s: string) => s.trim()) : []
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

  // Property types (default + custom from DB)
  const [propertyTypes, setPropertyTypes] = useState<string[]>(DEFAULT_PROPERTY_TYPES);
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newPropertyTypeInput, setNewPropertyTypeInput] = useState('');
  const [isSavingType, setIsSavingType] = useState(false);

  // New location quick-creation
  const [isAddingNewLocation, setIsAddingNewLocation] = useState(false);
  const [newLocationInput, setNewLocationInput] = useState('');
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  // Auto-generate a code for new properties so the field is never submitted blank.
  // Editing an existing property (even one that currently has no code) keeps whatever
  // is already there rather than forcing a code onto it.
  const [propertyCode, setPropertyCode] = useState(
    initialValues.property_code || (initialValues.id ? '' : generatePropertyCode())
  );

  // Live preview state
  const [previewTitle, setPreviewTitle] = useState(initialValues.title || '');
  const [previewPrice, setPreviewPrice] = useState(initialValues.price || '');
  const [previewType, setPreviewType] = useState(initialValues.property_type || '');
  const [alternateOwnerContacts, setAlternateOwnerContacts] = useState<string[]>(
    Array.isArray(initialValues.alternate_owner_contacts) ? initialValues.alternate_owner_contacts : []
  );

  // Unit Inventory Management & Stacking Matrix state
  const [towersList, setTowersList] = useState<string[]>(
    initialValues.towers_list
      ? String(initialValues.towers_list).split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['Tower A', 'Tower B']
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

  // Commercial/other property types (Office Space, Shop, Plot, etc.) don't have a BHK
  // configuration -- auto-fill Configuration with the property type itself the moment it's
  // picked, so staff aren't stuck free-typing "office" by hand. Only fires when Configuration
  // is still empty, so it never overwrites something the user already entered.
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
      const { error } = await supabase.from('properties').delete().eq('id', initialValues.id);
      if (!error) { router.push('/properties'); router.refresh(); }
      else alert('Failed to delete: ' + error.message);
    } catch { alert('Error deleting property'); }
    finally { setDeleting(false); }
  };

  function formatPrice(v: string | number) {
    const n = parseFloat(String(v));
    if (!n) return '';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')} L`;
    return `₹${n.toLocaleString('en-IN')}`;
  }

  // Required fields are validated here rather than via the native `required` attribute:
  // whichever wizard section isn't currently active is display:none, and a hidden required
  // field can't be focused by the browser to show its validation error -- it just silently
  // blocks submission instead. This runs on submit, jumps to the offending section, and
  // shows a toast so the failure is actually visible.
  function validateRequiredFields(): boolean {
    if (!previewTitle.trim()) {
      toast.error('Property Title is required.');
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

  // ── Render Helpers for Property Form Sections ──

  const renderBasicInfo = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel required>Society Name</FieldLabel>
          <input
            name="title"
            className={inputCls}
            placeholder="e.g. Modern Luxury Villa"
            defaultValue={initialValues.title ?? ''}
            onChange={e => setPreviewTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Property Code</FieldLabel>
          <input name="property_code" className={inputCls} placeholder="PRP-001" value={propertyCode} onChange={e => setPropertyCode(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel>Property Type</FieldLabel>
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
            <FieldLabel>Configuration</FieldLabel>
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
                placeholder="Type new config (e.g. 7 BHK, Duplex Penthouse)..."
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
            placeholder="Add config..."
          />
          <input type="hidden" name="configuration" value={configuration.join(', ')} />
        </div>
      </div>


      <div className="space-y-1.5">
        <FieldLabel>Description</FieldLabel>
        <textarea
          name="description"
          className={textareaCls}
          rows={3}
          placeholder="Public property description copy..."
          defaultValue={initialValues.description ?? ''}
        />
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <FieldLabel required>Location Tags</FieldLabel>
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
          placeholder="e.g. Kalyani Nagar, Viman Nagar"
        />
        <input type="hidden" name="location" value={locations.join(', ')} />
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Address</FieldLabel>
        <textarea
          name="address"
          className={textareaCls}
          rows={3}
          placeholder="Full property address details..."
          defaultValue={initialValues.address ?? ''}
        />
      </div>
    </div>
  );


  const renderPricing = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel required>Price (₹)</FieldLabel>
          <IndianNumberInput
            name="price"
            className={inputCls}
            placeholder="e.g. 1,50,00,000"
            defaultValue={initialValues.price ?? ''}
            onValueChange={setPreviewPrice}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Listing Type</FieldLabel>
          <SelectWrapper>
            <select name="listing_type" className={selectCls} defaultValue={initialValues.listing_type ?? 'Sale'}>
              <option>Sale</option>
              <option>Rent</option>
            </select>
          </SelectWrapper>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel>Carpet Area (sq ft)</FieldLabel>
          <input type="number" name="carpet_area" className={inputCls} placeholder="e.g. 1200" defaultValue={initialValues.carpet_area ?? ''} />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Built Up Area (sq ft)</FieldLabel>
          <input type="number" name="built_up_area" className={inputCls} placeholder="e.g. 1500" defaultValue={initialValues.built_up_area ?? ''} />
        </div>
      </div>
    </div>
  );

  const renderUnitInventory = () => {
    const totalProjectUnits = towersList.length * totalFloors * unitsPerFloor;
    const towerPrefix = activePreviewTower.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'T';

    return (
      <div className="space-y-6 text-left">
        {/* Header Introduction Banner */}
        <div className="p-4 bg-white border border-[#ebebeb] rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#b8922e] uppercase tracking-widest font-mono">
              Unit Stacking & Project Inventory Engine
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#d4ad4d]/15 text-[#96751f] border border-[#d4ad4d]/30">
              {totalProjectUnits} Projected Units
            </span>
          </div>
          <h3 className="text-sm font-extrabold text-zinc-900">Configure Building Towers, Floors & Unit Distribution</h3>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Specify the tower nomenclature, floor height, and density. The system will automatically project and generate the visual unit inventory matrix for this project.
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
                  placeholder="e.g. Tower C, West Wing"
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
                  className="h-8 px-3 bg-[#d4ad4d] hover:bg-[#b8922e] text-white rounded-lg text-xs font-bold transition-all shrink-0"
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
              <span className="text-[10px] text-zinc-400 block">{unitsPerFloor} apartments per tier</span>
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
              <span className="text-[10px] text-zinc-400 block">Allotment timeline</span>
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
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Projected Value</span>
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
                <p className="text-[10px] text-zinc-400">Visual unit matrix preview that will project into the Unit Inventory page</p>
              </div>

              {/* Tower Switcher */}
              <div className="flex items-center gap-1 bg-[#fafaf8] p-1 border border-zinc-200 rounded-lg">
                {towersList.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePreviewTower(t)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
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

  const renderOwnership = () => (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <FieldLabel>Property Source</FieldLabel>
        <SelectWrapper>
          <select name="source_type" className={selectCls} defaultValue={initialValues.source_type ?? 'Direct'}>
            <option value="Direct">Direct</option>
            <option value="Broker">Broker</option>
          </select>
        </SelectWrapper>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel>Owner Name</FieldLabel>
          <input name="owner_name" className={inputCls} placeholder="Contact person" defaultValue={initialValues.owner_name ?? ''} />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Owner Contact</FieldLabel>
          <input name="owner_contact" className={inputCls} placeholder="+91 90000 00000" defaultValue={initialValues.owner_contact ?? ''} />
        </div>
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Additional Mobile Numbers</FieldLabel>
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
            className="flex items-center gap-1 text-[11px] font-bold text-[#b8922e] hover:text-[#96751f] transition-colors"
          >
            <Plus className="h-3 w-3" /> Add another number
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <FieldLabel>Apartment / Unit No (Private)</FieldLabel>
          <input 
            name="unit_no" 
            className={inputCls + " border-[#d4ad4d]/40 font-bold bg-[#fafaf8]"} 
            placeholder="e.g. Cypress-401, Floor 9" 
            defaultValue={initialValues.unit_no ?? ''} 
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Agreed Brokerage Terms (Private)</FieldLabel>
          <input 
            name="brokerage" 
            className={inputCls + " border-[#d4ad4d]/40 font-bold bg-[#fafaf8]"} 
            placeholder="e.g. 1% or 2%" 
            defaultValue={initialValues.brokerage ?? ''} 
          />
        </div>
      </div>

      <div className="space-y-1.5 pt-2">
        <FieldLabel>Internal Notes</FieldLabel>
        <textarea
          name="internal_notes"
          className={textareaCls}
          rows={3}
          placeholder="Private notes..."
          defaultValue={initialValues.internal_notes ?? ''}
        />
      </div>
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-5 text-left">
      <div className="space-y-1.5">
        <FieldLabel>Property Images & Videos</FieldLabel>
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
      
      {/* Hidden inputs to pass paths to Server Action */}
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
        <h1 className="text-[15px] font-extrabold text-zinc-900 flex-1 text-center lg:text-left" style={{ letterSpacing: '-0.3px' }}>
          {isEdit ? 'Edit Property' : 'New Property'}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || isPending}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 text-rose-600 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 transition-all disabled:opacity-50"
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
        {/* Only one of these layouts is ever mounted (see isDesktop above) -- previously
            both were always mounted with CSS show/hide, duplicating every field's name
            attribute in this <form> and breaking both validation and submitted values. */}
        {isDesktop ? (
        /* ── DESKTOP VIEWPORT: Split Panel Nav Wizard ── */
        <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
          {/* Left navigation */}
          <div className="w-[200px] shrink-0 border-r border-[#ebebeb] bg-white pt-6 pb-10">
            {SECTIONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSection(i)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all border-r-2 ${
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
              <div className="mx-3 mt-6 p-3 bg-[#fafaf8] border border-[#ebebeb] rounded-xl">
                <div className="text-[9px] font-extrabold text-zinc-300 uppercase tracking-wider mb-2">Preview</div>
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
                    <MapPin className="h-2.5 w-2.5" />
                    {locations.slice(0, 2).join(', ')}
                    {locations.length > 2 && ` +${locations.length - 2}`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right fields */}
          {/* Sections stay mounted (display:none when inactive) rather than unmounting,
              so fields from earlier sections are still present in FormData when submitting
              from a later section — otherwise saving from the last page would silently
              drop required fields like title/price and fail. */}
          <div className="flex-1 px-8 py-6 max-w-2xl">
            <div style={{ display: activeSection === 0 ? 'block' : 'none' }}>{renderBasicInfo()}</div>
            <div style={{ display: activeSection === 1 ? 'block' : 'none' }}>{renderLocation()}</div>
            <div style={{ display: activeSection === 2 ? 'block' : 'none' }}>{renderPricing()}</div>
            <div style={{ display: activeSection === 3 ? 'block' : 'none' }}>{renderUnitInventory()}</div>
            <div style={{ display: activeSection === 4 ? 'block' : 'none' }}>{renderOwnership()}</div>
            <div style={{ display: activeSection === 5 ? 'block' : 'none' }}>{renderMedia()}</div>

            {/* Bottom navigation bar */}
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#ebebeb]">
              {activeSection > 0 ? (
                <button type="button" onClick={() => setActiveSection(s => s - 1)}
                  className="text-[11px] font-bold text-zinc-400 hover:text-zinc-700 flex items-center gap-1 transition-colors">
                  ← {SECTIONS[activeSection - 1].label}
                </button>
              ) : <span />}
              {activeSection < SECTIONS.length - 1 ? (
                <button type="button" onClick={() => setActiveSection(s => s + 1)}
                  className="dc-btn font-bold text-[11px] flex items-center gap-1">
                  {SECTIONS[activeSection + 1].label} →
                </button>
              ) : (
                <button type="submit" disabled={isPending} className="dc-btn gold font-bold flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isPending ? 'Saving…' : 'Save Property'}
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
              <span>Basic Information</span>
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
              <span>Pricing & Carpet Area</span>
            </h3>
            {renderPricing()}
          </div>

          <div className="px-5 pt-6 pb-5 border-b border-zinc-100 space-y-4">
            <h3 className="text-[11px] font-black text-zinc-900 pb-2.5 uppercase tracking-wider flex items-baseline gap-2 border-b border-zinc-100">
              <span className="font-serif italic font-bold text-[#d4ad4d] text-sm">04.</span>
              <span>Unit Inventory & Stacking</span>
            </h3>
            {renderUnitInventory()}
          </div>

          <div className="px-5 pt-6 pb-5 border-b border-zinc-100 space-y-4">
            <h3 className="text-[11px] font-black text-zinc-900 pb-2.5 uppercase tracking-wider flex items-baseline gap-2 border-b border-zinc-100">
              <span className="font-serif italic font-bold text-[#d4ad4d] text-sm">05.</span>
              <span>Ownership & Private Terms</span>
            </h3>
            {renderOwnership()}
          </div>

          <div className="px-5 pt-6 pb-8 space-y-4">
            <h3 className="text-[11px] font-black text-zinc-900 pb-2.5 uppercase tracking-wider flex items-baseline gap-2 border-b border-zinc-100">
              <span className="font-serif italic font-bold text-[#d4ad4d] text-sm">06.</span>
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
