import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  MapPin,
  Clock,
  Route as RouteIcon,
  GripVertical,
  Undo2,
  Check,
  Loader2,
  ChevronLeft,
  Navigation,
  Copy,
} from 'lucide-react';
import { routesAPI, formatApiErrorDetail } from '@/lib/api';
import { toast } from 'sonner';

const COLOR_PRESETS = [
  '#0284c7',
  '#059669',
  '#f97316',
  '#dc2626',
  '#7c3aed',
  '#0d9488',
  '#d97706',
  '#db2777',
  '#2563eb',
  '#4f46e5',
];

const EMPTY_ROUTE_FORM = {
  id: '',
  nama: '',
  warna: '#0284c7',
  deskripsi: '',
  jam_operasi: '06:30 - 18:30',
  hari: 'Senin - Minggu',
  terminal_awal: '',
  terminal_akhir: '',
  autoCreateStarterStops: true,
};

const EMPTY_HALTE_FORM = {
  nama: '',
  arah: '',
  customArah: '',
  lat: '',
  lng: '',
  insertPosition: 'end',
  senin_kamis: '',
  jumat: '',
  sabtu: '',
  minggu: '',
};

const formatTimesList = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');

const parseTimesInput = (str) =>
  String(str || '')
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

const extractDirections = (haltes = []) => {
  const dirs = [];
  for (const h of haltes) {
    const arah = (h.arah || '').trim();
    if (arah && !dirs.includes(arah)) {
      dirs.push(arah);
    }
  }
  return dirs;
};

const AdminRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [activeDirection, setActiveDirection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [halteFilterQuery, setHalteFilterQuery] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'

  // Undo snapshot for last halte change on selected route
  const [undoSnapshot, setUndoSnapshot] = useState(null);

  // Drag & drop state
  const [draggedIdx, setDraggedIdx] = useState(null);

  // Route modal state
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [editingRouteMeta, setEditingRouteMeta] = useState(null);
  const [routeForm, setRouteForm] = useState(EMPTY_ROUTE_FORM);
  const [deleteRouteConfirm, setDeleteRouteConfirm] = useState(null);

  // Halte modal state
  const [showHalteDialog, setShowHalteDialog] = useState(false);
  const [editingHalteOrigIdx, setEditingHalteOrigIdx] = useState(null);
  const [halteForm, setHalteForm] = useState(EMPTY_HALTE_FORM);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [deleteHalteConfirm, setDeleteHalteConfirm] = useState(null);

  // Rename direction modal state
  const [renameDirTarget, setRenameDirTarget] = useState(null);
  const [renameDirValue, setRenameDirValue] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [routesRes, presetsRes] = await Promise.all([
        routesAPI.adminList(),
        routesAPI.adminPresets().catch(() => ({ data: [] })),
      ]);
      const fetchedRoutes = Array.isArray(routesRes.data) ? routesRes.data : [];
      setRoutes(fetchedRoutes);
      setPresets(Array.isArray(presetsRes.data) ? presetsRes.data : []);
      if (fetchedRoutes.length > 0) {
        setSelectedRouteId((prev) =>
          prev && fetchedRoutes.some((r) => r.id === prev) ? prev : fetchedRoutes[0].id
        );
      }
    } catch (error) {
      toast.error(formatApiErrorDetail(error.response?.data?.detail) || 'Gagal memuat daftar rute');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId) || null,
    [routes, selectedRouteId]
  );

  const directions = useMemo(
    () => extractDirections(selectedRoute?.halte || []),
    [selectedRoute]
  );

  useEffect(() => {
    if (!selectedRouteId) return;
    const el = document.querySelector(`[data-route-card="${CSS.escape(selectedRouteId)}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedRouteId]);

  // Keep activeDirection valid when route changes
  useEffect(() => {
    if (!selectedRoute) {
      setActiveDirection('');
      return;
    }
    const dirs = extractDirections(selectedRoute.halte || []);
    if (dirs.length === 0) {
      setActiveDirection('');
    } else if (!dirs.includes(activeDirection)) {
      setActiveDirection(dirs[0]);
    }
  }, [selectedRouteId, selectedRoute, activeDirection]);

  // Filtered routes for left panel
  const filteredRoutes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((r) => {
      if (r.nama?.toLowerCase().includes(q) || r.deskripsi?.toLowerCase().includes(q)) return true;
      return (r.halte || []).some((h) => h.nama?.toLowerCase().includes(q));
    });
  }, [routes, searchQuery]);

  // Stops belonging to activeDirection, keeping original array indices
  const currentDirectionStops = useMemo(() => {
    if (!selectedRoute) return [];
    const list = [];
    (selectedRoute.halte || []).forEach((h, origIdx) => {
      if (!activeDirection || h.arah === activeDirection) {
        list.push({ ...h, origIdx });
      }
    });
    return list;
  }, [selectedRoute, activeDirection]);

  const displayedStops = useMemo(() => {
    const q = halteFilterQuery.trim().toLowerCase();
    if (!q) return currentDirectionStops;
    return currentDirectionStops.filter((h) => h.nama.toLowerCase().includes(q));
  }, [currentDirectionStops, halteFilterQuery]);

  // Preset suggestions matching halteForm.nama
  const matchingPresets = useMemo(() => {
    const q = halteForm.nama.trim().toLowerCase();
    const list = q
      ? presets.filter((p) => p.nama.toLowerCase().includes(q))
      : presets;
    return list.slice(0, 8);
  }, [presets, halteForm.nama]);

  // Persist route update to backend
  const persistRouteUpdate = async (updatedRoute, prevRouteForUndo = null, successMsg = null) => {
    if (prevRouteForUndo) {
      setUndoSnapshot({
        routeId: prevRouteForUndo.id,
        halte: JSON.parse(JSON.stringify(prevRouteForUndo.halte || [])),
      });
    }
    // Optimistic update
    setRoutes((prev) => prev.map((r) => (r.id === updatedRoute.id ? updatedRoute : r)));
    setSaving(true);
    try {
      const { data } = await routesAPI.update(updatedRoute.id, updatedRoute);
      setRoutes((prev) => prev.map((r) => (r.id === data.id ? data : r)));
      setLastSavedAt(new Date());
      if (successMsg) toast.success(successMsg);
      return data;
    } catch (error) {
      // Revert optimistic update if failed
      if (prevRouteForUndo) {
        setRoutes((prev) => prev.map((r) => (r.id === prevRouteForUndo.id ? prevRouteForUndo : r)));
      }
      toast.error(formatApiErrorDetail(error.response?.data?.detail) || 'Gagal menyimpan perubahan rute');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleUndoLastHalteChange = async () => {
    if (!undoSnapshot) return;
    const target = routes.find((r) => r.id === undoSnapshot.routeId);
    if (!target) {
      setUndoSnapshot(null);
      return;
    }
    const restored = { ...target, halte: undoSnapshot.halte };
    setUndoSnapshot(null);
    await persistRouteUpdate(restored, null, 'Perubahan terakhir dibatalkan');
  };

  // Reorder corridors in left list
  const handleMoveCorridor = async (e, index, delta) => {
    e.stopPropagation();
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= routes.length) return;
    const reordered = [...routes];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setRoutes(reordered);
    try {
      await routesAPI.reorder(reordered.map((r) => r.id));
      toast.success('Urutan daftar koridor diperbarui');
    } catch (error) {
      toast.error('Gagal menyimpan urutan koridor');
      loadInitialData();
    }
  };

  // Move halte within current direction
  const handleMoveHalte = async (dirIdx, delta) => {
    if (!selectedRoute) return;
    const targetDirIdx = dirIdx + delta;
    if (targetDirIdx < 0 || targetDirIdx >= currentDirectionStops.length) return;

    const prevSnapshot = JSON.parse(JSON.stringify(selectedRoute));
    const newHaltes = [...(selectedRoute.halte || [])];
    const origA = currentDirectionStops[dirIdx].origIdx;
    const origB = currentDirectionStops[targetDirIdx].origIdx;

    const temp = newHaltes[origA];
    newHaltes[origA] = newHaltes[origB];
    newHaltes[origB] = temp;

    await persistRouteUpdate({ ...selectedRoute, halte: newHaltes }, prevSnapshot);
  };

  // Drag & drop reorder within current direction
  const handleDropHalte = async (dropDirIdx) => {
    if (draggedIdx === null || draggedIdx === dropDirIdx || !selectedRoute) {
      setDraggedIdx(null);
      return;
    }
    const prevSnapshot = JSON.parse(JSON.stringify(selectedRoute));
    const dirOrigIndices = currentDirectionStops.map((s) => s.origIdx);
    const reorderedDirStops = currentDirectionStops.map((s) => selectedRoute.halte[s.origIdx]);

    const [moved] = reorderedDirStops.splice(draggedIdx, 1);
    reorderedDirStops.splice(dropDirIdx, 0, moved);

    const newHaltes = [...(selectedRoute.halte || [])];
    dirOrigIndices.forEach((origIdx, i) => {
      newHaltes[origIdx] = reorderedDirStops[i];
    });

    setDraggedIdx(null);
    await persistRouteUpdate(
      { ...selectedRoute, halte: newHaltes },
      prevSnapshot,
      'Urutan halte diperbarui'
    );
  };

  // Open Create/Edit Route Dialog
  const openCreateRouteDialog = () => {
    setEditingRouteMeta(null);
    setRouteForm(EMPTY_ROUTE_FORM);
    setShowRouteDialog(true);
  };

  const openEditRouteDialog = (e, route) => {
    if (e) e.stopPropagation();
    setEditingRouteMeta(route);
    setRouteForm({
      id: route.id || '',
      nama: route.nama || '',
      warna: route.warna || '#0284c7',
      deskripsi: route.deskripsi || '',
      jam_operasi: route.jam_operasi || '06:30 - 18:30',
      hari: route.hari || 'Senin - Minggu',
      terminal_awal: route.terminal_awal || '',
      terminal_akhir: route.terminal_akhir || '',
      autoCreateStarterStops: false,
    });
    setShowRouteDialog(true);
  };

  const handleSaveRouteMeta = async (e) => {
    e.preventDefault();
    if (!routeForm.nama.trim()) {
      toast.error('Nama rute/koridor wajib diisi');
      return;
    }
    setSaving(true);
    try {
      if (editingRouteMeta) {
        const updated = {
          ...editingRouteMeta,
          nama: routeForm.nama.trim(),
          warna: routeForm.warna,
          deskripsi: routeForm.deskripsi.trim(),
          jam_operasi: routeForm.jam_operasi.trim(),
          hari: routeForm.hari.trim(),
          terminal_awal: routeForm.terminal_awal.trim(),
          terminal_akhir: routeForm.terminal_akhir.trim(),
        };
        const { data } = await routesAPI.update(editingRouteMeta.id, updated);
        setRoutes((prev) => prev.map((r) => (r.id === data.id ? data : r)));
        toast.success(`Info rute "${data.nama}" berhasil diperbarui`);
      } else {
        const starterHaltes = [];
        const awal = routeForm.terminal_awal.trim();
        const akhir = routeForm.terminal_akhir.trim();
        if (routeForm.autoCreateStarterStops && awal && akhir) {
          const dir1 = `${awal} -> ${akhir}`;
          const dir2 = `${akhir} -> ${awal}`;
          starterHaltes.push(
            { nama: awal, arah: dir1, jadwal: {} },
            { nama: akhir, arah: dir1, jadwal: {} },
            { nama: akhir, arah: dir2, jadwal: {} },
            { nama: awal, arah: dir2, jadwal: {} }
          );
        }

        const payload = {
          id: routeForm.id.trim() || undefined,
          nama: routeForm.nama.trim(),
          warna: routeForm.warna,
          deskripsi: routeForm.deskripsi.trim() || `${awal || 'Asal'} - ${akhir || 'Tujuan'}`,
          jam_operasi: routeForm.jam_operasi.trim() || '06:30 - 18:30',
          hari: routeForm.hari.trim() || 'Senin - Minggu',
          terminal_awal: awal,
          terminal_akhir: akhir,
          halte: starterHaltes,
        };
        const { data } = await routesAPI.create(payload);
        setRoutes((prev) => [...prev, data]);
        setSelectedRouteId(data.id);
        setMobileView('detail');
        toast.success(`Rute baru "${data.nama}" berhasil ditambahkan`);
      }
      setShowRouteDialog(false);
    } catch (error) {
      toast.error(formatApiErrorDetail(error.response?.data?.detail) || 'Gagal menyimpan rute');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoute = async () => {
    if (!deleteRouteConfirm) return;
    setSaving(true);
    try {
      await routesAPI.remove(deleteRouteConfirm.id);
      const remaining = routes.filter((r) => r.id !== deleteRouteConfirm.id);
      setRoutes(remaining);
      if (selectedRouteId === deleteRouteConfirm.id) {
        setSelectedRouteId(remaining[0]?.id || null);
        setMobileView('list');
      }
      toast.success(`Rute "${deleteRouteConfirm.nama}" dihapus`);
    } catch (error) {
      toast.error(formatApiErrorDetail(error.response?.data?.detail) || 'Gagal menghapus rute');
    } finally {
      setSaving(false);
      setDeleteRouteConfirm(null);
    }
  };

  // Open Create/Edit Halte Dialog
  const openAddHalteDialog = (insertAfterDirIdx = null) => {
    const defaultArah = activeDirection || directions[0] || (
      selectedRoute?.terminal_awal && selectedRoute?.terminal_akhir
        ? `${selectedRoute.terminal_awal} -> ${selectedRoute.terminal_akhir}`
        : 'Lintasan Utama'
    );
    const posValue =
      insertAfterDirIdx !== null
        ? String(insertAfterDirIdx + 2)
        : 'end';

    setEditingHalteOrigIdx(null);
    setHalteForm({
      ...EMPTY_HALTE_FORM,
      arah: directions.includes(defaultArah) ? defaultArah : '__custom__',
      customArah: directions.includes(defaultArah) ? '' : defaultArah,
      insertPosition: posValue,
    });
    setShowHalteDialog(true);
  };

  const openEditHalteDialog = (stop) => {
    const j = stop.jadwal || {};
    const satTimes = j.sabtu?.length ? j.sabtu : j.sabtu_minggu || [];
    const sunTimes = j.minggu?.length ? j.minggu : j.sabtu_minggu || [];

    setEditingHalteOrigIdx(stop.origIdx);
    setHalteForm({
      nama: stop.nama || '',
      arah: directions.includes(stop.arah) ? stop.arah : '__custom__',
      customArah: directions.includes(stop.arah) ? '' : stop.arah || '',
      lat: stop.lat != null ? String(stop.lat) : '',
      lng: stop.lng != null ? String(stop.lng) : '',
      insertPosition: 'end',
      senin_kamis: formatTimesList(j.senin_kamis),
      jumat: formatTimesList(j.jumat),
      sabtu: formatTimesList(satTimes),
      minggu: formatTimesList(sunTimes),
    });
    setShowHalteDialog(true);
  };

  const handleSelectPreset = (preset) => {
    setHalteForm((prev) => ({
      ...prev,
      nama: preset.nama,
      lat: preset.lat != null ? String(preset.lat) : prev.lat,
      lng: preset.lng != null ? String(preset.lng) : prev.lng,
    }));
    setShowPresetDropdown(false);
  };

  const handleCopyScheduleFromWeekdays = () => {
    setHalteForm((prev) => ({
      ...prev,
      jumat: prev.senin_kamis,
      sabtu: prev.senin_kamis,
      minggu: prev.senin_kamis,
    }));
    toast.success('Jadwal Senin-Kamis disalin ke semua hari');
  };

  const handleSaveHalte = async (e) => {
    e.preventDefault();
    if (!selectedRoute) return;

    const finalNama = halteForm.nama.trim();
    const finalArah =
      halteForm.arah === '__custom__'
        ? halteForm.customArah.trim()
        : halteForm.arah.trim();

    if (!finalNama) {
      toast.error('Nama halte wajib diisi');
      return;
    }
    if (!finalArah) {
      toast.error('Arah lintasan wajib diisi');
      return;
    }

    const jadwal = {};
    const sk = parseTimesInput(halteForm.senin_kamis);
    const jm = parseTimesInput(halteForm.jumat);
    const sb = parseTimesInput(halteForm.sabtu);
    const mg = parseTimesInput(halteForm.minggu);
    if (sk.length) jadwal.senin_kamis = sk;
    if (jm.length) jadwal.jumat = jm;
    if (sb.length) jadwal.sabtu = sb;
    if (mg.length) jadwal.minggu = mg;

    const newStop = {
      nama: finalNama,
      arah: finalArah,
      jadwal,
    };

    const parsedLat = parseFloat(halteForm.lat);
    const parsedLng = parseFloat(halteForm.lng);
    if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) {
      newStop.lat = parsedLat;
      newStop.lng = parsedLng;
    }

    const prevSnapshot = JSON.parse(JSON.stringify(selectedRoute));
    const newHaltes = [...(selectedRoute.halte || [])];

    if (editingHalteOrigIdx !== null) {
      newHaltes[editingHalteOrigIdx] = newStop;
      const saved = await persistRouteUpdate(
        { ...selectedRoute, halte: newHaltes },
        prevSnapshot,
        `Halte "${finalNama}" diperbarui`
      );
      if (saved) {
        setActiveDirection(finalArah);
        setShowHalteDialog(false);
      }
    } else {
      // Find indices belonging to finalArah
      const dirIndices = [];
      newHaltes.forEach((h, i) => {
        if (h.arah === finalArah) dirIndices.push(i);
      });

      if (dirIndices.length === 0) {
        newHaltes.push(newStop);
      } else if (halteForm.insertPosition === 'end') {
        const lastOrigIdx = dirIndices[dirIndices.length - 1];
        newHaltes.splice(lastOrigIdx + 1, 0, newStop);
      } else {
        const pos = Math.max(1, Math.min(dirIndices.length + 1, parseInt(halteForm.insertPosition, 10) || dirIndices.length + 1));
        if (pos > dirIndices.length) {
          const lastOrigIdx = dirIndices[dirIndices.length - 1];
          newHaltes.splice(lastOrigIdx + 1, 0, newStop);
        } else {
          const targetOrigIdx = dirIndices[pos - 1];
          newHaltes.splice(targetOrigIdx, 0, newStop);
        }
      }

      const saved = await persistRouteUpdate(
        { ...selectedRoute, halte: newHaltes },
        prevSnapshot,
        `Halte "${finalNama}" ditambahkan ke lintasan`
      );
      if (saved) {
        setActiveDirection(finalArah);
        setShowHalteDialog(false);
      }
    }
  };

  const handleDeleteHalte = async () => {
    if (!selectedRoute || deleteHalteConfirm === null) return;
    const prevSnapshot = JSON.parse(JSON.stringify(selectedRoute));
    const newHaltes = [...(selectedRoute.halte || [])];
    const removedName = deleteHalteConfirm.nama;
    newHaltes.splice(deleteHalteConfirm.origIdx, 1);

    setDeleteHalteConfirm(null);
    await persistRouteUpdate(
      { ...selectedRoute, halte: newHaltes },
      prevSnapshot,
      `Halte "${removedName}" dihapus`
    );
  };

  const handleRenameDirection = async (e) => {
    e.preventDefault();
    if (!selectedRoute || !renameDirTarget || !renameDirValue.trim()) return;
    const newDirName = renameDirValue.trim();
    if (newDirName === renameDirTarget) {
      setRenameDirTarget(null);
      return;
    }
    const prevSnapshot = JSON.parse(JSON.stringify(selectedRoute));
    const newHaltes = (selectedRoute.halte || []).map((h) =>
      h.arah === renameDirTarget ? { ...h, arah: newDirName } : h
    );
    setRenameDirTarget(null);
    const saved = await persistRouteUpdate(
      { ...selectedRoute, halte: newHaltes },
      prevSnapshot,
      `Nama arah diubah menjadi "${newDirName}"`
    );
    if (saved) {
      setActiveDirection(newDirName);
    }
  };

  const selectRoute = (route) => {
    setSelectedRouteId(route.id);
    setHalteFilterQuery('');
    setUndoSnapshot(null);
    const dirs = extractDirections(route.halte || []);
    setActiveDirection(dirs[0] || '');
    setMobileView('detail');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Kelola Rute & Halte"
          subtitle="Atur daftar koridor, urutan halte tiap tempat (Ulee Kareng, Meudiwana, Ulee Lheue, dll.), serta tambah, edit, atau hapus rute"
          action={
            <div className="flex items-center gap-2">
              {undoSnapshot && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUndoLastHalteChange}
                  disabled={saving}
                  className="border-amber-300 text-amber-800 hover:bg-amber-50"
                >
                  <Undo2 className="w-4 h-4 mr-1.5" />
                  Undo
                </Button>
              )}
              <Button onClick={openCreateRouteDialog} className="bg-sky-600 hover:bg-sky-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Rute Baru
              </Button>
            </div>
          }
        />

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-4 animate-pulse h-96 bg-gray-100" />
            <Card className="lg:col-span-8 animate-pulse h-96 bg-gray-100" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* LEFT PANEL: CORRIDOR LIST */}
            <Card
              className={`lg:col-span-4 border-gray-200 ${
                mobileView === 'detail' ? 'hidden lg:block' : 'block'
              }`}
            >
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <RouteIcon className="w-4 h-4 text-sky-600" />
                    Daftar Koridor ({routes.length})
                  </CardTitle>
                  {saving ? (
                    <span className="text-xs text-sky-600 flex items-center gap-1 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan
                    </span>
                  ) : lastSavedAt ? (
                    <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      Tersimpan
                    </span>
                  ) : null}
                </div>
                <div className="relative mt-3">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari koridor atau nama halte..."
                    className="pl-9 h-9 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-2 max-h-[68vh] overflow-y-auto space-y-1.5">
                {filteredRoutes.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    Tidak ada koridor yang cocok dengan "{searchQuery}"
                  </div>
                ) : (
                  filteredRoutes.map((route) => {
                    const isSelected = route.id === selectedRouteId;
                    const actualIdx = routes.findIndex((r) => r.id === route.id);
                    const dirs = extractDirections(route.halte || []);
                    return (
                      <div
                        key={route.id}
                        data-route-card={route.id}
                        onClick={() => selectRoute(route)}
                        className={`group rounded-xl p-3 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50/90 border-sky-400 shadow-sm'
                            : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50/70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ring-2 ring-white shadow-sm"
                              style={{ backgroundColor: route.warna || '#0284c7' }}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">
                                {route.nama}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                {route.deskripsi || `${route.terminal_awal || '-'} - ${route.terminal_akhir || '-'}`}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <Badge variant="secondary" className="text-[11px] font-medium px-2 py-0">
                                  {route.halte?.length || 0} Halte
                                </Badge>
                                <Badge variant="outline" className="text-[11px] font-normal px-2 py-0">
                                  {dirs.length} Arah
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div
                            className="flex flex-col gap-0.5 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-0.5">
                              {!searchQuery && (
                                <>
                                  <button
                                    type="button"
                                    title="Naikkan urutan koridor"
                                    disabled={actualIdx <= 0}
                                    onClick={(e) => handleMoveCorridor(e, actualIdx, -1)}
                                    className="p-1 rounded hover:bg-gray-200/70 text-gray-500 disabled:opacity-30"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    title="Turunkan urutan koridor"
                                    disabled={actualIdx >= routes.length - 1}
                                    onClick={(e) => handleMoveCorridor(e, actualIdx, 1)}
                                    className="p-1 rounded hover:bg-gray-200/70 text-gray-500 disabled:opacity-30"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                title="Edit info koridor"
                                onClick={(e) => openEditRouteDialog(e, route)}
                                className="p-1 rounded hover:bg-sky-100 text-gray-600 hover:text-sky-700"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Hapus koridor"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteRouteConfirm(route);
                                }}
                                className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* RIGHT PANEL: ROUTE DETAIL & STOP SEQUENCE */}
            <div
              className={`lg:col-span-8 space-y-4 ${
                mobileView === 'list' ? 'hidden lg:block' : 'block'
              }`}
            >
              {!selectedRoute ? (
                <Card>
                  <CardContent className="p-12 text-center text-gray-500">
                    <RouteIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-gray-700">Pilih koridor untuk mengatur urutan halte</p>
                    <p className="text-sm mt-1">Atau klik "Tambah Rute Baru" di pojok kanan atas.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Selected Route Header Card */}
                  <Card className="border-gray-200">
                    <CardContent className="p-5">
                      <button
                        type="button"
                        onClick={() => setMobileView('list')}
                        className="lg:hidden inline-flex items-center text-xs font-semibold text-sky-700 mb-3"
                      >
                        <ChevronLeft className="w-4 h-4 mr-0.5" />
                        Semua Koridor
                      </button>

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: selectedRoute.warna || '#0284c7' }}
                            />
                            <h2 className="text-xl font-bold text-gray-900">
                              {selectedRoute.nama}
                            </h2>
                            <Badge variant="outline" className="text-xs font-mono text-gray-500">
                              {selectedRoute.id}
                            </Badge>
                          </div>
                          {selectedRoute.deskripsi && (
                            <p className="text-sm text-gray-600">{selectedRoute.deskripsi}</p>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {selectedRoute.jam_operasi || '-'} ({selectedRoute.hari || 'Senin - Minggu'})
                            </span>
                            {(selectedRoute.terminal_awal || selectedRoute.terminal_akhir) && (
                              <span className="inline-flex items-center gap-1">
                                <Navigation className="w-3.5 h-3.5 text-gray-400" />
                                {selectedRoute.terminal_awal || '-'} ↔ {selectedRoute.terminal_akhir || '-'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(e) => openEditRouteDialog(e, selectedRoute)}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1.5" />
                            Edit Info Rute
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => openAddHalteDialog(null)}
                            className="bg-sky-600 hover:bg-sky-700"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            Tambah Halte
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Direction Tabs & Sequence List */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3 border-b border-gray-100 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">
                            Urutan Halte Lintasan
                          </h3>
                          <p className="text-xs text-gray-500">
                            Gunakan tombol panah (↑/↓) atau seret (drag & drop) untuk mengubah urutan pemberhentian
                          </p>
                        </div>

                        <div className="relative w-full sm:w-56">
                          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <Input
                            value={halteFilterQuery}
                            onChange={(e) => setHalteFilterQuery(e.target.value)}
                            placeholder="Filter nama halte..."
                            className="pl-8 h-8 text-xs"
                          />
                        </div>
                      </div>

                      {/* Direction Tabs */}
                      <div className="flex flex-wrap items-center gap-2">
                        {directions.map((dir) => {
                          const count = (selectedRoute.halte || []).filter((h) => h.arah === dir).length;
                          const isActive = activeDirection === dir;
                          return (
                            <div
                              key={dir}
                              className={`inline-flex items-center rounded-lg border transition-all overflow-hidden ${
                                isActive
                                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => setActiveDirection(dir)}
                                className="px-3 py-1.5 text-xs font-semibold flex items-center"
                              >
                                {dir}
                                <span
                                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                                    isActive ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-600'
                                  }`}
                                >
                                  {count}
                                </span>
                              </button>
                              {isActive && (
                                <button
                                  type="button"
                                  title="Ubah nama arah lintasan"
                                  onClick={() => {
                                    setRenameDirTarget(dir);
                                    setRenameDirValue(dir);
                                  }}
                                  className="px-2 py-1.5 border-l border-sky-500/60 hover:bg-sky-700 text-sky-100 hover:text-white transition-colors"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => {
                            setEditingHalteOrigIdx(null);
                            setHalteForm({
                              ...EMPTY_HALTE_FORM,
                              arah: '__custom__',
                              customArah: '',
                              insertPosition: 'end',
                            });
                            setShowHalteDialog(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-dashed border-gray-300 text-gray-600 hover:border-sky-400 hover:text-sky-700"
                        >
                          + Arah Baru
                        </button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      {displayedStops.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 space-y-3">
                          <MapPin className="w-10 h-10 mx-auto text-gray-300" />
                          <p className="text-sm">
                            {halteFilterQuery
                              ? `Tidak ada halte bernama "${halteFilterQuery}" pada arah ini.`
                              : 'Belum ada halte terdaftar untuk koridor/arah ini.'}
                          </p>
                          {!halteFilterQuery && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAddHalteDialog(null)}
                            >
                              <Plus className="w-4 h-4 mr-1.5" />
                              Tambah Halte Pertama
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {displayedStops.map((stop) => {
                            const dirIdx = currentDirectionStops.findIndex(
                              (s) => s.origIdx === stop.origIdx
                            );
                            const isFirst = dirIdx === 0;
                            const isLast = dirIdx === currentDirectionStops.length - 1;
                            const hasCoords = stop.lat != null && stop.lng != null;
                            const skCount = stop.jadwal?.senin_kamis?.length || 0;
                            const sampleTimes = (stop.jadwal?.senin_kamis || []).slice(0, 4);
                            const canReorder = !halteFilterQuery.trim();

                            return (
                              <div
                                key={`${stop.origIdx}-${stop.nama}`}
                                draggable={canReorder}
                                onDragStart={() => setDraggedIdx(dirIdx)}
                                onDragOver={(e) => {
                                  if (canReorder) e.preventDefault();
                                }}
                                onDrop={() => canReorder && handleDropHalte(dirIdx)}
                                onDragEnd={() => setDraggedIdx(null)}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border bg-white transition-all ${
                                  draggedIdx === dirIdx
                                    ? 'opacity-50 border-sky-400 bg-sky-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-start sm:items-center gap-3 min-w-0">
                                  <div
                                    className={`mt-0.5 sm:mt-0 text-gray-400 flex-shrink-0 ${
                                      canReorder ? 'cursor-grab active:cursor-grabbing hover:text-gray-600' : 'opacity-30'
                                    }`}
                                    title={canReorder ? 'Seret untuk ubah urutan' : 'Hapus filter untuk ubah urutan'}
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>

                                  <div
                                    className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 text-white"
                                    style={{ backgroundColor: selectedRoute.warna || '#0284c7' }}
                                  >
                                    {dirIdx + 1}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-semibold text-sm text-gray-900">
                                        {stop.nama}
                                      </p>
                                      {isFirst && (
                                        <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          Awal
                                        </span>
                                      )}
                                      {isLast && !isFirst && (
                                        <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                          Akhir
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                                      {hasCoords ? (
                                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-gray-500">
                                          <MapPin className="w-3 h-3 text-sky-600" />
                                          {Number(stop.lat).toFixed(5)}, {Number(stop.lng).toFixed(5)}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600">
                                          <MapPin className="w-3 h-3" />
                                          Koordinat belum diisi
                                        </span>
                                      )}

                                      {skCount > 0 ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                                          <Clock className="w-3 h-3 text-gray-400" />
                                          {skCount} trip ({sampleTimes.join(', ')}
                                          {skCount > 4 ? ', ...' : ''})
                                        </span>
                                      ) : (
                                        <span className="text-[11px] text-gray-400">
                                          Jadwal belum diisi
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Stop Actions */}
                                <div className="flex items-center gap-1 self-end sm:self-center flex-shrink-0">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={!canReorder || isFirst || saving}
                                    onClick={() => handleMoveHalte(dirIdx, -1)}
                                    title="Geser ke atas"
                                    className="h-8 w-8 p-0"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={!canReorder || isLast || saving}
                                    onClick={() => handleMoveHalte(dirIdx, 1)}
                                    title="Geser ke bawah"
                                    className="h-8 w-8 p-0"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openAddHalteDialog(dirIdx)}
                                    title="Sisipkan halte baru tepat setelah halte ini"
                                    className="h-8 px-2 text-xs text-sky-700 hover:bg-sky-50"
                                  >
                                    <Plus className="w-3.5 h-3.5 mr-0.5" />
                                    Sisipkan
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditHalteDialog(stop)}
                                    title="Edit halte & jadwal"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setDeleteHalteConfirm(stop)}
                                    title="Hapus halte"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DIALOG: CREATE / EDIT ROUTE META */}
      <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRouteMeta ? `Edit Rute: ${editingRouteMeta.nama}` : 'Tambah Rute / Koridor Baru'}
            </DialogTitle>
            <DialogDescription>
              Lengkapi informasi rute Trans Koetaradja. Halte dan urutannya dapat dikelola setelah rute dibuat.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRouteMeta} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="route-nama">Nama Rute / Tempat *</Label>
              <Input
                id="route-nama"
                value={routeForm.nama}
                onChange={(e) => setRouteForm({ ...routeForm, nama: e.target.value })}
                placeholder="Contoh: Ulee Kareng / Meudiwana / Kaju"
                required
                className="mt-1"
              />
            </div>

            {!editingRouteMeta && (
              <div>
                <Label htmlFor="route-id">ID / Slug Rute (opsional)</Label>
                <Input
                  id="route-id"
                  value={routeForm.id}
                  onChange={(e) => setRouteForm({ ...routeForm, id: e.target.value })}
                  placeholder="Kosongkan untuk generate otomatis dari nama"
                  className="mt-1 font-mono text-sm"
                />
              </div>
            )}

            <div>
              <Label>Warna Identitas Koridor</Label>
              <div className="flex items-center gap-2 flex-wrap mt-1.5">
                {COLOR_PRESETS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setRouteForm({ ...routeForm, warna: hex })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      routeForm.warna === hex ? 'border-gray-900 scale-110' : 'border-white shadow'
                    }`}
                    style={{ backgroundColor: hex }}
                    aria-label={hex}
                  />
                ))}
                <input
                  type="color"
                  value={routeForm.warna}
                  onChange={(e) => setRouteForm({ ...routeForm, warna: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="route-desc">Deskripsi Lintasan</Label>
              <Input
                id="route-desc"
                value={routeForm.deskripsi}
                onChange={(e) => setRouteForm({ ...routeForm, deskripsi: e.target.value })}
                placeholder="Contoh: Pusat Kota - Simpang Ulee Kareng - Bandara SIM"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="route-awal">Terminal / Halte Awal</Label>
                <Input
                  id="route-awal"
                  value={routeForm.terminal_awal}
                  onChange={(e) => setRouteForm({ ...routeForm, terminal_awal: e.target.value })}
                  placeholder="Contoh: Halte Keudah"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="route-akhir">Terminal / Halte Akhir</Label>
                <Input
                  id="route-akhir"
                  value={routeForm.terminal_akhir}
                  onChange={(e) => setRouteForm({ ...routeForm, terminal_akhir: e.target.value })}
                  placeholder="Contoh: Halte Bandara SIM"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="route-jam">Jam Operasi</Label>
                <Input
                  id="route-jam"
                  value={routeForm.jam_operasi}
                  onChange={(e) => setRouteForm({ ...routeForm, jam_operasi: e.target.value })}
                  placeholder="06:30 - 18:30"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="route-hari">Hari Operasi</Label>
                <Input
                  id="route-hari"
                  value={routeForm.hari}
                  onChange={(e) => setRouteForm({ ...routeForm, hari: e.target.value })}
                  placeholder="Senin - Minggu"
                  className="mt-1"
                />
              </div>
            </div>

            {!editingRouteMeta && (
              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-sky-50 border border-sky-100 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={routeForm.autoCreateStarterStops}
                  onChange={(e) =>
                    setRouteForm({ ...routeForm, autoCreateStarterStops: e.target.checked })
                  }
                  className="mt-0.5"
                />
                <span>
                  Otomatis buat titik halte awal &amp; akhir untuk 2 arah lintasan berdasarkan Terminal Awal dan Terminal Akhir di atas (jika diisi).
                </span>
              </label>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowRouteDialog(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving} className="bg-sky-600 hover:bg-sky-700">
                {saving ? 'Menyimpan...' : editingRouteMeta ? 'Simpan Perubahan' : 'Buat Rute'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ADD / EDIT HALTE */}
      <Dialog open={showHalteDialog} onOpenChange={setShowHalteDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHalteOrigIdx !== null ? 'Edit Halte & Jadwal' : 'Tambah Halte ke Urutan Rute'}
            </DialogTitle>
            <DialogDescription>
              Pilih halte yang sudah ada untuk mengisi koordinat otomatis, atau ketik nama halte baru.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveHalte} className="space-y-4 mt-2">
            {/* Arah selector */}
            <div>
              <Label htmlFor="halte-arah">Arah Lintasan *</Label>
              <select
                id="halte-arah"
                value={halteForm.arah}
                onChange={(e) => setHalteForm({ ...halteForm, arah: e.target.value })}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {directions.map((dir) => (
                  <option key={dir} value={dir}>
                    {dir}
                  </option>
                ))}
                <option value="__custom__">+ Tulis Arah Lintasan Baru...</option>
              </select>

              {halteForm.arah === '__custom__' && (
                <Input
                  value={halteForm.customArah}
                  onChange={(e) => setHalteForm({ ...halteForm, customArah: e.target.value })}
                  placeholder="Contoh: Pusat Kota (Keudah) -> Ulee Lheue"
                  className="mt-2"
                  required
                />
              )}
            </div>

            {/* Nama Halte + Autocomplete Preset */}
            <div className="relative">
              <Label htmlFor="halte-nama">Nama Halte *</Label>
              <Input
                id="halte-nama"
                value={halteForm.nama}
                onFocus={() => setShowPresetDropdown(true)}
                onBlur={() => setTimeout(() => setShowPresetDropdown(false), 180)}
                onChange={(e) => {
                  setHalteForm({ ...halteForm, nama: e.target.value });
                  setShowPresetDropdown(true);
                }}
                placeholder="Contoh: Halte Ulee Kareng"
                required
                className="mt-1"
                autoComplete="off"
              />
              {showPresetDropdown && matchingPresets.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 bg-gray-50 border-b">
                    Saran Halte Terdaftar (klik untuk auto-isi koordinat)
                  </div>
                  {matchingPresets.map((preset) => (
                    <button
                      key={preset.nama}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectPreset(preset);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-sky-50 flex items-center justify-between gap-2"
                    >
                      <span className="font-medium text-gray-800">{preset.nama}</span>
                      {preset.lat != null && (
                        <span className="text-[11px] font-mono text-gray-400">
                          {Number(preset.lat).toFixed(4)}, {Number(preset.lng).toFixed(4)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Position selector when adding */}
            {editingHalteOrigIdx === null && halteForm.arah !== '__custom__' && (
              <div>
                <Label htmlFor="halte-pos">Posisi Urutan di Arah Ini</Label>
                <select
                  id="halte-pos"
                  value={halteForm.insertPosition}
                  onChange={(e) => setHalteForm({ ...halteForm, insertPosition: e.target.value })}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="end">Di akhir urutan lintasan</option>
                  {(selectedRoute?.halte || [])
                    .filter((h) => h.arah === halteForm.arah)
                    .map((h, i) => (
                      <option key={`${i}-${h.nama}`} value={String(i + 1)}>
                        Urutan #{i + 1} (sebelum {h.nama})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="halte-lat">Latitude (opsional)</Label>
                <Input
                  id="halte-lat"
                  value={halteForm.lat}
                  onChange={(e) => setHalteForm({ ...halteForm, lat: e.target.value })}
                  placeholder="5.55442"
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="halte-lng">Longitude (opsional)</Label>
                <Input
                  id="halte-lng"
                  value={halteForm.lng}
                  onChange={(e) => setHalteForm({ ...halteForm, lng: e.target.value })}
                  placeholder="95.31765"
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </div>

            {/* Jadwal */}
            <div className="border-t border-gray-100 pt-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Label className="text-sm font-semibold">Jadwal Keberangkatan (opsional)</Label>
                  <p className="text-xs text-gray-500">Pisahkan jam dengan koma, contoh: 06:50, 07:30, 08:15</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyScheduleFromWeekdays}
                  className="text-xs h-8"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Samakan Semua Hari
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">Senin - Kamis</Label>
                  <Textarea
                    rows={2}
                    value={halteForm.senin_kamis}
                    onChange={(e) => setHalteForm({ ...halteForm, senin_kamis: e.target.value })}
                    placeholder="06:50, 07:30, 08:15, ..."
                    className="mt-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Jum'at</Label>
                  <Textarea
                    rows={2}
                    value={halteForm.jumat}
                    onChange={(e) => setHalteForm({ ...halteForm, jumat: e.target.value })}
                    placeholder="06:50, 07:30, 14:00, ..."
                    className="mt-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Sabtu</Label>
                  <Textarea
                    rows={2}
                    value={halteForm.sabtu}
                    onChange={(e) => setHalteForm({ ...halteForm, sabtu: e.target.value })}
                    placeholder="07:00, 08:00, ..."
                    className="mt-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Minggu</Label>
                  <Textarea
                    rows={2}
                    value={halteForm.minggu}
                    onChange={(e) => setHalteForm({ ...halteForm, minggu: e.target.value })}
                    placeholder="07:00, 08:00, ..."
                    className="mt-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowHalteDialog(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving} className="bg-sky-600 hover:bg-sky-700">
                {saving ? 'Menyimpan...' : editingHalteOrigIdx !== null ? 'Simpan Halte' : 'Tambahkan Halte'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: RENAME DIRECTION */}
      <Dialog open={!!renameDirTarget} onOpenChange={(open) => !open && setRenameDirTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Nama Arah Lintasan</DialogTitle>
            <DialogDescription>
              Semua halte di arah ini akan otomatis diperbarui mengikuti nama baru.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameDirection} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="rename-dir-input">Nama Arah Lintasan</Label>
              <Input
                id="rename-dir-input"
                value={renameDirValue}
                onChange={(e) => setRenameDirValue(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRenameDirTarget(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving} className="bg-sky-600 hover:bg-sky-700">
                Simpan Nama Arah
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ALERT: DELETE CORRIDOR */}
      <AlertDialog
        open={!!deleteRouteConfirm}
        onOpenChange={(open) => !open && setDeleteRouteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Rute Koridor?</AlertDialogTitle>
            <AlertDialogDescription>
              Rute <strong>{deleteRouteConfirm?.nama}</strong> beserta seluruh{' '}
              {deleteRouteConfirm?.halte?.length || 0} haltenya akan dihapus permanen dari website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoute} className="bg-red-600 hover:bg-red-700">
              Ya, Hapus Rute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ALERT: DELETE HALTE */}
      <AlertDialog
        open={!!deleteHalteConfirm}
        onOpenChange={(open) => !open && setDeleteHalteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Halte dari Urutan Rute?</AlertDialogTitle>
            <AlertDialogDescription>
              Halte <strong>{deleteHalteConfirm?.nama}</strong> akan dihapus dari lintasan{' '}
              <strong>{selectedRoute?.nama}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHalte} className="bg-red-600 hover:bg-red-700">
              Ya, Hapus Halte
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminRoutes;
