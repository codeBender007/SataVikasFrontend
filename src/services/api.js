import apiClient, { API_BASE_URL } from './axiosInstance';
import { mockProductionLogs, mockUsers } from './mockData';
import { createEmptyFormData, TPM_LOSS_CATEGORIES } from '../types/models';

export { apiClient, API_BASE_URL };

export function resolveImagePath(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/satavikas/api';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith(cleanBase)) return cleanPath;
  return `${cleanBase}${cleanPath}`;
}

// Flag to toggle between Real Backend API calls and local Mock fallback
const USE_MOCK_FALLBACK = false;

const normalizeAuthUser = (payload, username) => {
  const userName = payload?.username || username || 'user';
  const fullName = payload?.full_name || payload?.fullName || payload?.name || userName;
  const role = payload?.role || 'employee';
  const employeeId = payload?.employee_id || payload?.employeeId || payload?.id || 'N/A';

  return {
    id: payload?.id || employeeId,
    username: userName,
    fullName,
    email: payload?.email || `${userName}@satavikas.com`,
    role,
    department: payload?.department || 'Production',
    employeeId,
    token: payload?.access_token || payload?.token,
    status: payload?.status || 'active',
  };
};

// Simulate network delay for mock mode
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const searchableText = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(searchableText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(searchableText).join(' ');
  return String(value);
};

const getSingleEmployeeId = (log) => {
  const value = log.employeeId || log.employeeNumbers || log.employee_number || '';
  return String(value).split(',')[0].trim();
};

const UPLOAD_ACTIVITY_STORAGE_KEY = 'sata_vikas_employee_form_upload_activity';

const notifyUploadActivity = (entry) => {
  const activity = {
    id: `${entry.formType || 'production'}-${entry.id || Date.now()}`,
    logId: entry.id || Date.now(),
    formName: entry.formType === 'tool-handover' ? 'Tool & Handover Form' : 'Production Sheet',
    employeeName: entry.uploadedBy || entry.entryPersonName || 'Unknown employee',
    employeeId: getSingleEmployeeId(entry) || '—',
    uploadedAt: new Date().toISOString(),
  };

  try {
    const existing = JSON.parse(localStorage.getItem(UPLOAD_ACTIVITY_STORAGE_KEY) || '[]');
    if (!existing.some(item => item.id === activity.id)) {
      localStorage.setItem(UPLOAD_ACTIVITY_STORAGE_KEY, JSON.stringify([activity, ...existing]));
      window.dispatchEvent(new Event('form-upload-activity-recorded'));
    }
  } catch (error) {
    console.warn('Unable to save form upload activity:', error);
  }
};

export function getFormUploadActivities() {
  try {
    const activities = JSON.parse(localStorage.getItem(UPLOAD_ACTIVITY_STORAGE_KEY) || '[]');
    return activities.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  } catch {
    return [];
  }
}


// ─── DATA NORMALIZATION & MAPPERS ────────────────────────────

/**
 * Maps and normalizes backend Form A API response into frontend model
 */
export function normalizeBackendFormA(raw) {
  if (!raw) return createEmptyFormData();

  const emptyHours = () => ({
    hr1: '', hr2: '', hr3: '', hr4: '', hr5: '', hr6: '', hr7: '',
    hr8: '', hr9: '', hr10: '', hr11: '', hr12: '', hr13: '', total: ''
  });

  const emptyTpmHours = () => ({
    hr1: '', hr2: '', hr3: '', hr4: '', hr5: '', hr6: '', hr7: '',
    hr8: '', hr9: '', hr10: '', hr11: '', hr12: '', hr13: ''
  });

  const part1Prod = { ...emptyHours(), ...(raw.part1Production || {}) };
  const part1Cast = { ...emptyHours(), ...(raw.part1CastingRej || {}) };
  const part1Mach = { ...emptyHours(), ...(raw.part1MachiningRej || {}) };
  const part1Unp = { ...emptyHours(), ...(raw.part1UnprocessedRej || {}) };

  const part2Prod = { ...emptyHours(), ...(raw.part2Production || {}) };
  const part2Cast = { ...emptyHours(), ...(raw.part2CastingRej || {}) };
  const part2Mach = { ...emptyHours(), ...(raw.part2MachiningRej || {}) };
  const part2Unp = { ...emptyHours(), ...(raw.part2UnprocessedRej || {}) };

  let partNo1 = raw.partNo1 || raw.part_number || raw.pdi_ok_part1 || '';
  let partNo2 = raw.partNo2 || raw.part_number_2 || raw.pdi_ok_part2 || '';
  let uph = raw.uph !== undefined && raw.uph !== null ? String(raw.uph) : '';

  // Per-hour UPH map (matches the physical form: each hour can have a different UPH)
  const uphValues = {
    hr1: '', hr2: '', hr3: '', hr4: '', hr5: '', hr6: '', hr7: '',
    hr8: '', hr9: '', hr10: '', hr11: '', hr12: '', hr13: ''
  };

  const part2UphValues = {
    hr1: '', hr2: '', hr3: '', hr4: '', hr5: '', hr6: '', hr7: '',
    hr8: '', hr9: '', hr10: '', hr11: '', hr12: '', hr13: ''
  };

  // Process production_grid if present in backend format
  if (Array.isArray(raw.production_grid)) {
    // Collect distinct part numbers in grid order
    const distinctParts = [];
    raw.production_grid.forEach(entry => {
      const p = String(entry.part_number || '').trim();
      if (p && p !== 'Form A' && p !== 'Page A' && !distinctParts.includes(p)) {
        distinctParts.push(p);
      }
    });

    const p1Ident = distinctParts[0] || partNo1;
    const p2Ident = distinctParts[1] || partNo2;

    if (!partNo1 && p1Ident) partNo1 = p1Ident;
    if (!partNo2 && p2Ident) partNo2 = p2Ident;

    raw.production_grid.forEach(entry => {
      const slotNum = String(entry.hour_slot || '').replace(/[^0-9]/g, '');
      if (!slotNum) return;
      const hrKey = `hr${slotNum}`;

      const entryPart = String(entry.part_number || '').trim();
      const isPart2 = (p2Ident && entryPart === p2Ident) ||
                      (distinctParts.length >= 2 && entryPart !== p1Ident && entryPart !== '');

      if (!isPart2) {
        if (entry.uph !== undefined && entry.uph !== null) {
          uphValues[hrKey] = String(entry.uph);
          if (!uph && entry.uph !== 0) uph = String(entry.uph);
        }
        if (entry.actual_production !== undefined && entry.actual_production !== null) {
          part1Prod[hrKey] = String(entry.actual_production);
        }
        if (entry.casting_rejection !== undefined && entry.casting_rejection !== null) {
          part1Cast[hrKey] = String(entry.casting_rejection);
        }
        if (entry.machining_rejection !== undefined && entry.machining_rejection !== null) {
          part1Mach[hrKey] = String(entry.machining_rejection);
        }
        if (entry.unprocessed_rejection !== undefined && entry.unprocessed_rejection !== null) {
          part1Unp[hrKey] = String(entry.unprocessed_rejection);
        }
      } else {
        if (entry.uph !== undefined && entry.uph !== null) {
          part2UphValues[hrKey] = String(entry.uph);
        }
        if (entry.actual_production !== undefined && entry.actual_production !== null) {
          part2Prod[hrKey] = String(entry.actual_production);
        }
        if (entry.casting_rejection !== undefined && entry.casting_rejection !== null) {
          part2Cast[hrKey] = String(entry.casting_rejection);
        }
        if (entry.machining_rejection !== undefined && entry.machining_rejection !== null) {
          part2Mach[hrKey] = String(entry.machining_rejection);
        }
        if (entry.unprocessed_rejection !== undefined && entry.unprocessed_rejection !== null) {
          part2Unp[hrKey] = String(entry.unprocessed_rejection);
        }
      }
    });
  }

  // Populate from pre-existing raw.uphValues or raw.part2UphValues if present
  if (raw.uphValues && typeof raw.uphValues === 'object') {
    Object.keys(uphValues).forEach(k => {
      if (raw.uphValues[k] !== undefined && raw.uphValues[k] !== '') {
        uphValues[k] = String(raw.uphValues[k]);
      }
    });
  }
  if (raw.part2UphValues && typeof raw.part2UphValues === 'object') {
    Object.keys(part2UphValues).forEach(k => {
      if (raw.part2UphValues[k] !== undefined && raw.part2UphValues[k] !== '') {
        part2UphValues[k] = String(raw.part2UphValues[k]);
      }
    });
  }

  // Calculate totals for production rows
  const sumHours = (hoursObj) => {
    let sum = 0;
    for (let i = 1; i <= 13; i++) {
      const val = parseInt(hoursObj[`hr${i}`]);
      if (!isNaN(val)) sum += val;
    }
    return sum > 0 ? String(sum) : '';
  };

  uphValues.total = raw.uphValues?.total || raw.plan1Total || sumHours(uphValues);
  part2UphValues.total = raw.part2UphValues?.total || raw.plan2Total || sumHours(part2UphValues);

  // FIX: Only compute a sum when OCR / stored data did not already provide a total.
  // This prevents overriding a value the operator physically wrote in the Total column.
  part1Prod.total = part1Prod.total || sumHours(part1Prod);
  part1Cast.total = part1Cast.total || sumHours(part1Cast);
  part1Mach.total = part1Mach.total || sumHours(part1Mach);
  part1Unp.total = part1Unp.total || sumHours(part1Unp);
  part2Prod.total = part2Prod.total || sumHours(part2Prod);
  part2Cast.total = part2Cast.total || sumHours(part2Cast);
  part2Mach.total = part2Mach.total || sumHours(part2Mach);
  part2Unp.total = part2Unp.total || sumHours(part2Unp);

  // Helper for matching TPM loss categories accurately even with OCR typos (e.g. "Machice cleaning")
  const matchTpmLoss = (reason, cat, code) => {
    const reasonStr = String(reason || '').toLowerCase().trim();
    const catStr = String(cat || code || '').toLowerCase().trim();
    const has = (...kw) => kw.some(k => reasonStr.includes(k));

    return tpmLosses.find(t => {
      const desc = t.description.toLowerCase().trim();

      // 1. Direct match or substring
      if (reasonStr && (desc === reasonStr || desc.includes(reasonStr) || reasonStr.includes(desc))) return true;

      // 2. Exact keyword mapping for all 31 TPM rows
      if (desc.includes('breakdown-mech') && (has('mech', 'mechanical') || (catStr.includes('bd') && has('mech')))) return true;
      if (desc.includes('breakdown-elect') && (has('elect', 'electrical') || (catStr.includes('bd') && has('elect')))) return true;
      if (desc.includes('hydraulic') && has('hydraulic')) return true;
      if (desc.includes('breakdown-fixture') && (has('breakdown-fixture', 'breakdown fixture', 'fixture breakdown') || (has('fixture') && (has('bd', 'breakdown') || catStr.includes('bd'))))) return true;

      if (desc.includes('fixture change') && has('fixture change')) return true;
      if (desc.includes('setting change') && has('setting change')) return true;
      if (desc.includes('tool change (replacement/breakage)') && (has('tool change', 'replacement', 'breakage') && !has('startup', 'start up'))) return true;
      if (desc.includes('program') && has('program')) return true;

      if (desc.includes('startup after breakdown') && (has('startup after breakdown', 'start up after breakdown') || (has('startup', 'start up') && has('breakdown')))) return true;
      if (desc.includes('startup after tool change') && (has('startup after tool change', 'start up after tool change') || (has('startup', 'start up') && has('tool')))) return true;
      if (desc.includes('planned stopage') && (has('planned stopage', 'planned stoppage') || (has('startup', 'start up') && has('planned')))) return true;
      if (desc.includes('power failure & start up') && (has('power failure & start up', 'power failure and start up') || (has('startup', 'start up') && has('power')))) return true;

      if (desc.includes('lower ct') && (has('lower ct', 'partial bd', 'lower-ct', 'partial breakdown') || (has('ct') && has('speed')))) return true;
      if (desc.includes('untrained') && has('untrained')) return true;
      if (desc.includes('tool buildup') && has('tool buildup', 'tool build up', 'buildup', 'build up')) return true;
      if (desc.includes('slow running') && (has('slow running', 'minor stoppages', 'minor stoppage', 'slow'))) return true;

      if (desc.includes('waiting : casting') && (has('waiting : casting', 'waiting: casting', 'waiting casting') || (has('casting') && (catStr.includes('mw') || catStr.includes('ml') || has('waiting'))))) return true;
      if (desc.includes('child parts') && (has('child parts', 'child part', 'ed part', 'child') || (has('child') && has('waiting')))) return true;
      if (desc.includes('waiting : tool / fixture') && (has('tool / fixture', 'tool/fixture', 'waiting tool', 'waiting fixture', 'tool & fixture'))) return true;
      if (desc.includes('trolley') && has('trolley', 'packing box', 'pallet')) return true;

      if (desc.includes('meeting') && has('meeting', 'discussion', 'supervisor discussion')) return true;
      if (desc.includes('issue analysis') && has('issue analysis', 'analysis/adjustment', 'issue adjustment', 'adjustment')) return true;
      if (desc.includes('lab report') && has('lab report', 'getting lab report', 'lab')) return true;
      if (desc.includes('consumable') && has('consumable', 'coolant', 'consumable (coolant)', 'delay consumable')) return true;

      // Machine cleaning (handles paper typo "Machice cleaning")
      if (desc.includes('machine cleaning') && has('machine cleaning', 'machice cleaning', 'machice', 'machine clean', 'm/c cleaning', 'mc cleaning', 'cleaning', 'clean', 'machice clean')) return true;

      if (desc.includes('manpower not available') && has('manpower', 'man power', 'not available', 'manpower not available', 'man power not available')) return true;
      if (desc.includes('power failure') && !desc.includes('start up') && (has('power failure', 'power fail', 'power cut', 'electricity failure') && !has('startup', 'start up'))) return true;
      if (desc.includes('utility loss') && has('utility', 'air/water', 'water supply', 'air supply', 'utility loss')) return true;
      if (desc.includes('ppc no schedule') && has('ppc', 'no schedule', 'planned stoppage', 'ppc no schedule')) return true;
      if (desc.includes('pm/reconditioning') && has('pm/reconditioning', 'pm / reconditioning', 'reconditioning', 'pm', 'preventive maintenance', 'pm reconditioning')) return true;
      if (desc.includes('lunch (l) /tea (t)') && has('lunch', 'tea', 'lunch/tea', 'l/t', 'tea stoppage', 'lunch stoppage', 'lunch (l)', 'tea (t)')) return true;

      return false;
    });
  };

  // Map TPM Losses
  const tpmLosses = TPM_LOSS_CATEGORIES.map(cat => ({
    ...cat,
    hourlyValues: emptyTpmHours(),
  }));

  const lossEntriesList = raw.loss_entries || raw.tpmEntries || raw.tpm_entries || raw.losses || [];

  if (Array.isArray(lossEntriesList) && lossEntriesList.length > 0) {
    lossEntriesList.forEach(loss => {
      const slotNum = String(loss.hour_slot || '').replace(/[^0-9]/g, '');
      if (!slotNum) return;
      const hrKey = `hr${slotNum}`;
      const duration = String(loss.duration_minutes !== undefined && loss.duration_minutes !== null ? loss.duration_minutes : (loss.duration || ''));
      const found = matchTpmLoss(
        loss.loss_reason || loss.description || loss.reason,
        loss.loss_category || loss.group,
        loss.code
      );

      if (found) {
        found.hourlyValues[hrKey] = duration;
      }
    });
  }

  // Calculate grand totals
  const totalProduction = (parseInt(part1Prod.total) || 0) + (parseInt(part2Prod.total) || 0);
  let totalLossMin = 0;
  tpmLosses.forEach(loss => {
    for (let i = 1; i <= 13; i++) {
      const val = parseInt(loss.hourlyValues?.[`hr${i}`]);
      if (!isNaN(val)) totalLossMin += val;
    }
  });

  const numericId = parseInt(raw.id, 10);
  const defaultSerial = !isNaN(numericId)
    ? (numericId >= 1000 ? String(numericId).padStart(6, '0') : String(7823 + numericId).padStart(6, '0'))
    : '007824';
  const uniqueId = raw.form_unique_id || raw.formUniqueId || raw.form_a_unique_number || raw.serialNo || raw.serial_no || raw.serialNumber;
  const serialNo = uniqueId || (raw.id ? defaultSerial : '007824');

  return {
    id: raw.id || null,
    form_unique_id: uniqueId || serialNo,
    form_a_unique_number: uniqueId || serialNo,
    serialNo,
    date: raw.logDate || raw.log_date || raw.date || '',
    shift: raw.shift || '',
    zone: raw.zone || '',
    machineNo: raw.machineNo || raw.machine_no || '',
    qaCell: raw.qaCell || raw.qa_cell || '',
    operationNumber: raw.operationNumber || raw.operation_number || raw.opearationNumber || '',
    partNo1: (raw.partNo1 && raw.partNo1 !== 'Form A' ? raw.partNo1 : '') || (raw.part && raw.part !== 'Form A' ? raw.part : '') || (partNo1 !== 'Form A' ? partNo1 : '') || (raw.opearationNumber === 'Page-B' || raw.formType === 'tool-handover' ? 'Tool & Handover' : ''),
    partNo2: raw.partNo2 || raw.part_number_2 || raw.part2 || partNo2 || '',
    plan1: raw.plan1 || raw.plan || '',
    plan2: raw.plan2 || '',
    employeeNumbers: raw.employeeNumbers || raw.employeeNumber || raw.employee_number || raw.employeeId || raw.employee_id || '',
    employeeId: raw.employeeId || raw.employeeNumber || raw.employee_number || raw.employeeNumbers || raw.employee_id || '',
    scheduledQuantity: raw.scheduledQuantity || raw.scheduled_quantity || '',
    page: raw.page || (raw.opearationNumber === 'Page-B' ? 'B' : 'A'),
    uphValues,
    part2UphValues,
    uph,
    part1Production: part1Prod,
    part1CastingRej: part1Cast,
    part1MachiningRej: part1Mach,
    part1UnprocessedRej: part1Unp,
    part2Production: part2Prod,
    part2CastingRej: part2Cast,
    part2MachiningRej: part2Mach,
    part2UnprocessedRej: part2Unp,
    supervisorName: raw.supervisorName || raw.supervisor_name || '',
    shiftIncharge: raw.shiftInchargeName || raw.shift_incharge_name || raw.shiftIncharge || '',
    entryPersonName: raw.entryPersonName || raw.entry_person_name || raw.uploadedBy || '',
    pdiOkPart1: raw.pdiOkPart1 || raw.pdiOkPart || raw.pdi_ok_part1 || '',
    pdiOkPart2: raw.pdiOkPart2 || raw.pdi_ok_part2 || '',
    abnormalityToolChange: raw.abnormalityToolChange || raw.abnormality_parts || raw.abnormalityParts || '',
    otherAbnormality: raw.otherAbnormality || raw.other_abnormality || '',
    imagePath: resolveImagePath(raw.imagePath || raw.image_path),
    tpmLosses,
    totalProduction: raw.totalProduction ?? raw.total_production ?? totalProduction,
    totalLossMin: raw.totalLossMin ?? raw.total_loss_min ?? totalLossMin,
    uploadedBy: raw.uploadedBy || raw.entryPersonName || raw.entry_person_name || raw.employeeNumber || 'Operator',
    uploadedById: raw.uploadedById || raw.employeeNumber || raw.employee_number || raw.employeeId || '',
    uploadedAt: raw.createdAt || raw.created_at || raw.uploadedAt || null,
    formType: (raw.opearationNumber === 'Page-B' || raw.formType === 'tool-handover') ? 'tool-handover' : 'production',
  };
}


export function formatFormAToBackend(formData) {
  const productionGrid = [];
  const part1 = formData.partNo1 || '';
  const part2 = formData.partNo2;
  const uph = parseInt(formData.uph) || 0;

  for (let i = 1; i <= 13; i++) {
    const hrKey = `hr${i}`;
    const slot = `H${i}`;

    // Use per-hour UPH from uphValues if available; fall back to the single uph value
    const hourUph = parseInt(formData.uphValues?.[hrKey]) || parseInt(formData.uph) || 0;

    const prod1 = parseInt(formData.part1Production?.[hrKey]) || 0;
    const cast1 = parseInt(formData.part1CastingRej?.[hrKey]) || 0;
    const mach1 = parseInt(formData.part1MachiningRej?.[hrKey]) || 0;
    const unp1 = parseInt(formData.part1UnprocessedRej?.[hrKey]) || 0;

    if (prod1 || cast1 || mach1 || unp1 || hourUph) {
      productionGrid.push({
        part_number: part1,
        hour_slot: slot,
        uph: hourUph,
        actual_production: prod1,
        casting_rejection: cast1,
        machining_rejection: mach1,
        unprocessed_rejection: unp1,
      });
    }

    if (part2) {
      const hourUph2 = parseInt(formData.part2UphValues?.[hrKey]) || 0;
      const prod2 = parseInt(formData.part2Production?.[hrKey]) || 0;
      const cast2 = parseInt(formData.part2CastingRej?.[hrKey]) || 0;
      const mach2 = parseInt(formData.part2MachiningRej?.[hrKey]) || 0;
      const unp2 = parseInt(formData.part2UnprocessedRej?.[hrKey]) || 0;

      if (prod2 || cast2 || mach2 || unp2 || hourUph2) {
        productionGrid.push({
          part_number: part2,
          hour_slot: slot,
          uph: hourUph2,
          actual_production: prod2,
          casting_rejection: cast2,
          machining_rejection: mach2,
          unprocessed_rejection: unp2,
        });
      }
    }
  }

  const lossEntries = [];
  if (Array.isArray(formData.tpmLosses)) {
    formData.tpmLosses.forEach(loss => {
      for (let i = 1; i <= 13; i++) {
        const hrKey = `hr${i}`;
        const val = parseInt(loss.hourlyValues?.[hrKey]);
        if (val && !isNaN(val) && val > 0) {
          lossEntries.push({
            loss_category: loss.group || loss.category || loss.code || 'Other',
            loss_reason: loss.description || loss.reason || 'Loss',
            hour_slot: `H${i}`,
            duration_minutes: val,
          });
        }
      }
    });
  }

  const uniqueId = formData.serialNo || formData.form_unique_id || formData.form_a_unique_number || formData.serialNumber || (formData.id ? (parseInt(formData.id, 10) < 1000 ? String(7823 + parseInt(formData.id, 10)).padStart(6, '0') : String(formData.id).padStart(6, '0')) : null);

  return {
    form_unique_id: uniqueId,
    form_a_unique_number: uniqueId,
    log_date: formData.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    shift: formData.shift || 'A',
    qa_cell: formData.qaCell || formData.qa_cell || '',
    operation_number: formData.operationNumber || formData.operation_number || '',
    machine_no: formData.machineNo || formData.machine_no || '',
    employee_number: formData.employeeId || formData.employeeNumbers || formData.employee_number || '',
    supervisor_name: formData.supervisorName || formData.supervisor_name || '',
    shift_incharge_name: formData.shiftIncharge || formData.shift_incharge_name || '',
    pdi_ok_part1: formData.pdiOkPart1 || formData.pdi_ok_part1 || '',
    pdi_ok_part2: formData.pdiOkPart2 || formData.pdi_ok_part2 || null,
    entry_person_name: formData.entryPersonName || formData.entry_person_name || formData.uploadedBy || '',
    abnormality_parts: formData.abnormalityToolChange || formData.abnormality_parts || '',
    other_abnormality: formData.otherAbnormality || formData.other_abnormality || '',
    image_path: formData.imagePath || formData.image_path || null,
    production_grid: productionGrid,
    loss_entries: lossEntries,
    form_data: JSON.parse(JSON.stringify(formData)),
  };
}

// ─── 1. USER LOGIN ───────────────────────────────────────────
export async function apiLogin(username, password) {
  if (!username || !password) throw new Error('Username and password are required');

  try {
    const res = await apiClient.post('/login', { username, password });
    const payload = res.data || {};
    return normalizeAuthUser(payload, username);
  } catch (err) {
    const detail = err?.response?.data?.detail;
    if (detail) {
      throw new Error(typeof detail === 'string' ? detail : 'Incorrect username or password');
    }
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      throw new Error('Incorrect username or password');
    }
    if (err?.code === 'ERR_NETWORK' || !err?.response) {
      throw new Error('Unable to connect to server. Please check your internet connection or server status.');
    }
    throw new Error('Login failed. Please check your credentials and try again.');
  }
}

// ─── 2. CREATE NEW USER ──────────────────────────────────────
export async function createUser(userData) {
  const payload = {
    employee_id: userData.employeeId || userData.employee_id || `EMP-${Date.now().toString().slice(-4)}`,
    full_name: userData.fullName || userData.full_name || userData.username,
    username: userData.username,
    email: userData.email,
    password: userData.password || '123456',
    role: userData.role || 'operator',
    designation: userData.designation || 'Machining Operator',
    department: userData.department || 'Production',
    status: userData.status ? (userData.status.toLowerCase() === 'active' ? 'active' : 'inactive') : 'active',
  };

  if (!USE_MOCK_FALLBACK) {
    try {
      const res = await apiClient.post('/createuser', payload);
      const data = res.data || {};
      const formattedUser = {
        id: data.employee_id || payload.employee_id,
        employeeId: data.employee_id || payload.employee_id,
        username: data.username || payload.username,
        fullName: data.full_name || payload.full_name,
        email: data.email || payload.email,
        password: payload.password,
        role: data.role || payload.role,
        designation: data.designation || payload.designation,
        department: data.department || payload.department,
        status: (data.status || payload.status).toLowerCase(),
        createdDate: new Date().toISOString().split('T')[0],
      };
      const users = readUsers();
      users.unshift(formattedUser);
      saveUsers(users);
      return formattedUser;
    } catch (err) {
      if (err.response?.data?.detail) {
        throw new Error(typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail));
      }
      console.warn('Backend API /createuser failed, saving locally:', err);
    }
  }

  await delay(500);
  const users = readUsers();
  const empExists = users.some(u => (u.employeeId || u.employee_id)?.toLowerCase() === payload.employee_id.toLowerCase());
  if (empExists) throw new Error(`Employee ID '${payload.employee_id}' is already in use.`);
  const userExists = users.some(u => u.username?.toLowerCase() === payload.username.toLowerCase());
  if (userExists) throw new Error(`Username '${payload.username}' is already taken.`);
  const emailExists = users.some(u => u.email?.toLowerCase() === payload.email.toLowerCase());
  if (emailExists) throw new Error(`Email address '${payload.email}' is already registered.`);

  const newUser = {
    id: payload.employee_id,
    employeeId: payload.employee_id,
    username: payload.username,
    fullName: payload.full_name,
    email: payload.email,
    role: payload.role,
    designation: payload.designation,
    department: payload.department,
    status: payload.status.toLowerCase(),
    createdDate: new Date().toISOString().split('T')[0],
  };
  users.unshift(newUser);
  saveUsers(users);
  return newUser;
}

export const registerUser = createUser;

// ─── 3. EXTRACT FORM DATA FROM IMAGE ─────────
export async function extractFormDataFromImage(file) {
  if (!USE_MOCK_FALLBACK) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/production/extractimage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      // The API wraps OCR output in `data`; normalize that payload, not the wrapper.
      // Keep the durable server path so the original paper form is linked on save.
      const extractionPayload = res.data?.data || res.data;
      // Vision returns Page A metadata in `header`; the existing form mapper uses
      // flat field names. Flatten it before normalising so the preview shows the
      // uploaded sheet's date, shift, QA cell, machine, part and names.
      const extracted = normalizeBackendFormA({
        ...extractionPayload,
        ...(extractionPayload?.header || {}),
        part: extractionPayload?.header?.part || extractionPayload?.part || '',
        partNo1: extractionPayload?.header?.partNo1 || extractionPayload?.header?.part || extractionPayload?.partNo1 || '',
        partNo2: extractionPayload?.header?.partNo2 || extractionPayload?.partNo2 || '',
        plan1: extractionPayload?.header?.plan1 || extractionPayload?.header?.plan || extractionPayload?.plan1 || '',
        plan2: extractionPayload?.header?.plan2 || extractionPayload?.plan2 || '',
        scheduledQuantity: extractionPayload?.header?.scheduled_quantity || extractionPayload?.header?.scheduledQuantity || extractionPayload?.scheduledQuantity || '',
        supervisorName: extractionPayload?.header?.supervisor_name || extractionPayload?.supervisorName || '',
        shiftIncharge: extractionPayload?.header?.shift_incharge_name || extractionPayload?.shiftIncharge || '',
        entryPersonName: extractionPayload?.header?.entry_person_name || extractionPayload?.entryPersonName || '',
        pdiOkPart1: extractionPayload?.header?.pdi_ok_part1 || extractionPayload?.pdiOkPart1 || '',
        pdiOkPart2: extractionPayload?.header?.pdi_ok_part2 || extractionPayload?.pdiOkPart2 || '',
        abnormalityToolChange: extractionPayload?.header?.abnormality_parts || extractionPayload?.header?.abnormalityToolChange || extractionPayload?.abnormalityToolChange || '',
        otherAbnormality: extractionPayload?.header?.other_abnormality || extractionPayload?.header?.otherAbnormality || extractionPayload?.otherAbnormality || '',
      });
      return {
        ...extracted,
        imagePath: resolveImagePath(res.data?.image_path || extracted.imagePath),
        lowConfidenceFields: extractionPayload?.low_confidence_fields || [],
        detectedFormType: res.data?.detected_form_type || 'A',
      };
    } catch (err) {
      console.warn('Backend OCR call failed:', err);
      const detail = err.response?.data?.detail;
      if (err.response?.status === 503) {
        throw new Error('Form reading is temporarily busy. Please retry in a moment, or fill the form manually.');
      }
      throw new Error(typeof detail === 'string' ? detail : 'Unable to read the form image. Please try again or enter the form manually.');
    }
  }

  await delay(2500);

  const mockExtracted = createEmptyFormData();
  mockExtracted.date = '2-9-2026';
  mockExtracted.shift = 'Morning';
  mockExtracted.machineNo = 'MP4C69';
  mockExtracted.qaCell = 'QA-Cell';
  mockExtracted.operationNumber = '10';
  mockExtracted.partNo1 = 'T-20';
  mockExtracted.employeeNumbers = 'EM001';
  mockExtracted.employeeId = 'EM001';
  mockExtracted.scheduledQuantity = '';
  mockExtracted.uph = '';
  mockExtracted.uphValues = {
    hr1: '200', hr2: '175', hr3: '95', hr4: '84', hr5: '235',
    hr6: '600', hr7: '22', hr8: '82', hr9: '7', hr10: '', hr11: '', hr12: '', hr13: '', total: ''
  };
  mockExtracted.part1Production = {
    hr1: '102', hr2: '103', hr3: '104', hr4: '106', hr5: '74',
    hr6: '16', hr7: '15', hr8: '200', hr9: '8', hr10: '', hr11: '', hr12: '', hr13: '', total: '728',
  };
  mockExtracted.part1CastingRej = {
    hr1: '0', hr2: '0', hr3: '0', hr4: '0', hr5: '0',
    hr6: '0', hr7: '0', hr8: '0', hr9: '0', hr10: '', hr11: '', hr12: '', hr13: '', total: '0',
  };
  mockExtracted.part1MachiningRej = {
    hr1: '0', hr2: '0', hr3: '0', hr4: '0', hr5: '0',
    hr6: '0', hr7: '0', hr8: '0', hr9: '0', hr10: '', hr11: '', hr12: '', hr13: '', total: '0',
  };
  mockExtracted.part1UnprocessedRej = {
    hr1: '0', hr2: '0', hr3: '0', hr4: '0', hr5: '0',
    hr6: '0', hr7: '0', hr8: '0', hr9: '0', hr10: '', hr11: '', hr12: '', hr13: '', total: '0',
  };
  mockExtracted.supervisorName = 'JATIN';
  mockExtracted.shiftIncharge = 'Adnan Sir';
  mockExtracted.pdiOkPart1 = '';
  mockExtracted.pdiOkPart2 = '';
  mockExtracted.entryPersonName = 'Jatin';
  mockExtracted.abnormalityToolChange = '24';
  mockExtracted.otherAbnormality = '32';

  mockExtracted.tpmLosses = TPM_LOSS_CATEGORIES.map((cat) => {
    const hourlyValues = { hr1: '', hr2: '', hr3: '', hr4: '', hr5: '', hr6: '', hr7: '', hr8: '', hr9: '', hr10: '', hr11: '', hr12: '', hr13: '' };
    const desc = (cat.description || '').toLowerCase();
    if (desc.includes('waiting : casting') || desc.includes('waiting: casting')) hourlyValues.hr1 = '2';
    if (desc.includes('startup after tool change')) hourlyValues.hr2 = '16';
    if (desc.includes('pm/reconditioning')) hourlyValues.hr2 = '6';
    if (desc.includes('hydraulic')) hourlyValues.hr4 = '34';
    if (desc.includes('machine cleaning')) hourlyValues.hr4 = '1';
    if (desc.includes('breakdown-fixture')) hourlyValues.hr6 = '12';
    if (desc.includes('delay : consumable') || desc.includes('delay: consumable')) hourlyValues.hr7 = '3';
    if (desc.includes('tool buildup')) hourlyValues.hr8 = '32';
    return { ...cat, hourlyValues };
  });

  return mockExtracted;
}

export const uploadFormImage = extractFormDataFromImage;

// ─── 4. SAVE FORM A ───────────────
export async function saveFormA(formData) {
  const payload = formatFormAToBackend(formData);
  console.info('[Form A save] review state', formData);
  console.info('[Form A save] outgoing payload', payload);

  if (!USE_MOCK_FALLBACK) {
    try {
      const res = await apiClient.post('/form-a-save', payload);
      const savedId = res.data?.log_id || res.data?.id;
      if (!savedId) throw new Error('The form was saved without a record ID.');
      const persistedResponse = await apiClient.get(`/form-a/${savedId}`);
      console.info('[Form A save] persisted read-back', persistedResponse.data);
      const savedRecord = normalizeBackendFormA(persistedResponse.data);
      notifyUploadActivity(savedRecord);
      window.dispatchEvent(new Event('production-log-submitted'));
      return savedRecord;
    } catch (err) {
      console.warn('Backend API /form-a-save submit failed:', err);
      let detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        if (detail.includes('UNIQUE constraint failed') || detail.includes('form_unique_id')) {
          detail = 'This form has already been uploaded with the same Form No. Please check your Form No. before uploading.';
        }
        throw new Error(detail);
      }
      throw new Error('Unable to save the form to the server. Please check your connection and try again.');
    }
  }

  await delay(1000);
  const newLog = {
    ...formData,
    id: 1000 + mockProductionLogs.length + 1,
    uploadedAt: new Date().toISOString(),
  };
  mockProductionLogs.unshift(newLog);
  notifyUploadActivity(newLog);
  window.dispatchEvent(new Event('production-log-submitted'));
  return newLog;
}

export const submitProductionLog = saveFormA;

// ─── 5. GET FILTERED FORM A LIST ─────────────────────────────
export async function getFilteredFormAList(filters = {}) {
  if (!USE_MOCK_FALLBACK) {
    try {
      const params = {};
      if (filters.log_date || filters.date || filters.dateFrom) {
        params.log_date = filters.log_date || filters.date || filters.dateFrom;
      }
      if (filters.shift) params.shift = filters.shift;
      if (filters.machine_no || filters.machineNo) {
        params.machine_no = filters.machine_no || filters.machineNo;
      }
      if (filters.operator_id || filters.operatorId || filters.userId) {
        params.operator_id = filters.operator_id || filters.operatorId || filters.userId;
      }
      if (filters.limit) params.limit = filters.limit;
      if (filters.offset !== undefined) params.offset = filters.offset;

      const res = await apiClient.get('/form-a/list', { params });
      const rawList = Array.isArray(res.data)
        ? res.data
        : (res.data?.data || res.data?.items || res.data?.records || []);
      let logs = rawList.map(item => normalizeBackendFormA(item));

      if (filters.dateFrom) {
        logs = logs.filter(l => !l.date || l.date >= filters.dateFrom);
      }
      if (filters.dateTo) {
        logs = logs.filter(l => !l.date || l.date <= filters.dateTo);
      }
      if (filters.search) {
        const query = filters.search.trim().toLowerCase();
        logs = logs.filter(log => searchableText(log).toLowerCase().includes(query));
      }

      return logs;
    } catch (err) {
      console.warn('Backend API /form-a/list fetch failed, falling back to mock:', err);
    }
  }

  await delay(400);
  let logs = mockProductionLogs.map(log => ({ ...log, employeeId: getSingleEmployeeId(log) }));

  if (filters.userId || filters.operator_id) {
    const opId = String(filters.userId || filters.operator_id).trim().toLowerCase();
    logs = logs.filter(l => {
      const empId = String(l.employeeId || l.employeeNumbers || '').trim().toLowerCase();
      const upId = String(l.uploadedById || '').trim().toLowerCase();
      const upBy = String(l.uploadedBy || '').trim().toLowerCase();
      const entryPerson = String(l.entryPersonName || '').trim().toLowerCase();
      return empId === opId || upId === opId || upBy === opId || entryPerson === opId || empId.includes(opId);
    });
  }
  if (filters.dateFrom) {
    logs = logs.filter(l => l.date >= filters.dateFrom);
  }
  if (filters.dateTo) {
    logs = logs.filter(l => l.date <= filters.dateTo);
  }
  if (filters.shift) {
    logs = logs.filter(l => l.shift === filters.shift);
  }
  if (filters.machineNo || filters.machine_no) {
    const mNo = (filters.machineNo || filters.machine_no).toLowerCase();
    logs = logs.filter(l => (l.machineNo || '').toLowerCase().includes(mNo));
  }
  if (filters.search) {
    const query = filters.search.trim().toLowerCase();
    logs = logs.filter(log => searchableText(log).toLowerCase().includes(query));
  }

  return logs;
}

export const getProductionLogs = getFilteredFormAList;

// ─── 6. GET SINGLE FORM A FULL DETAILS BY ID ─────────────────
export async function getFormAById(id) {
  if (!USE_MOCK_FALLBACK) {
    try {
      const res = await apiClient.get(`/form-a/${id}`);
      return normalizeBackendFormA(res.data);
    } catch (err) {
      console.warn(`Backend API /form-a/${id} fetch failed:`, err);
    }
  }

  await delay(300);
  const log = mockProductionLogs.find(l => String(l.id) === String(id));
  if (!log) throw new Error('Form A record not found');
  return normalizeBackendFormA(log);
}

export const getProductionLogById = getFormAById;

// ─── UPDATE PRODUCTION LOG (FALLBACK / EDIT) ─────────────────
export async function updateProductionLog(id, data) {
  if (!USE_MOCK_FALLBACK) {
    try {
      const payload = formatFormAToBackend(data);
      const res = await apiClient.put(`/form-a/${id}`, payload);
      window.dispatchEvent(new Event('production-log-submitted'));

      const responseHasData = res.data && (res.data.id || res.data.log_id || res.data.log_date || res.data.machine_no);
      if (responseHasData) {
        return normalizeBackendFormA(res.data);
      }
      try {
        const refreshed = await apiClient.get(`/form-a/${id}`);
        return normalizeBackendFormA(refreshed.data);
      } catch {
        return { ...data, id: Number(id) };
      }
    } catch (err) {
      console.warn('Backend API update failed:', err);
      if (err.response?.data?.detail) {
        throw new Error(typeof err.response.data.detail === 'string' ? err.response.data.detail : 'Update failed');
      }
      throw new Error('Unable to save your changes. Please check your connection and try again.');
    }
  }

  await delay(600);
  const idx = mockProductionLogs.findIndex(l => String(l.id) === String(id));
  if (idx === -1) throw new Error('Log not found');
  mockProductionLogs[idx] = { ...mockProductionLogs[idx], ...data };
  window.dispatchEvent(new Event('production-log-submitted'));
  return mockProductionLogs[idx];
}

// ─── TOOL & SHIFT HANDOVER FORMS (PAGE B - PDF SPEC) ───────────

/**
 * 1. Extract Form B Data from Image 
 * Accepts a physical Form B / Form 2 photo, runs OCR pipeline, returns structured JSON
 */
export async function extractFormBDataFromImage(file) {
  if (!USE_MOCK_FALLBACK) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/form-b/extract-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const extracted = res.data?.data || res.data;
      return {
        ...extracted,
        imagePath: resolveImagePath(res.data?.image_path || extracted?.imagePath),
        detectedFormType: res.data?.detected_form_type || 'B',
      };
    } catch (err) {
      const detail = err.response?.data?.detail;
      throw new Error(typeof detail === 'string' ? detail : 'Unable to reach the form-reading service. Please retry, or fill the form manually.');
    }
  }

  await delay(2000);
  return {
    header: {
      log_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      shift: 'A',
      machine_no: '2078, 2082',
      part_name: 'K-10',
      operation_no: '60',
      operator_name: 'Anoop Narendra',
      supervisor_name: 'Mr. Sailesh',
    },
    records: Array.from({ length: 16 }, (_, i) => ({
      toolDescription: i === 0 ? 'Drill 8.5mm' : i === 1 ? 'Insert CNMG' : '',
      operationNo: i === 0 ? '60' : i === 1 ? '20' : '',
      machineNo: i === 0 ? '2078' : i === 1 ? '2082' : '',
      toolNo: i === 0 ? 'T-01' : i === 1 ? 'T-04' : '',
      time: i === 0 ? '08:30' : i === 1 ? '10:15' : '',
      reasonForFOP: i === 0 ? 'Routine tool wear replacement' : i === 1 ? 'Edge chipping observed' : '',
      fopParts: i === 0 ? '5' : i === 1 ? '3' : '',
      fopRejection: i === 0 ? '0' : i === 1 ? '1' : '',
      toolSetBy: 'Anoop N.',
      qaInsp: 'OK - Verified',
      quantity: '',
      totFopPart: '',
      handoverCheck: '',
      defect: '',
      materialOrTool: '',
      remarks: '',
    })),
    details: {
      problemAnalysis: 'Minor dimensional variation observed at start of shift.',
      why1: 'Tool edge wear after 480 cycles',
      why2: 'Hardness fluctuation in raw casting batch',
      why3: '',
      why4: '',
      why5: '',
      rootCause: 'Normal tool wear reached limit',
      action1: 'Replaced drill tool T-01 and offset calibrated',
      action2: 'First 5 pieces checked and verified by QA',
      totalDefect: '1',
      pdiOkPart1: 'K-10 (OK)',
      pdiOkPart2: '',
      supplierInfo: 'SATA Casting Div.',
      dieCavityNo: 'C-04',
      opnDefects: [
        { opn: '10', mr: '0', cr: '0' },
        { opn: '20', mr: '1', cr: '0' },
        { opn: '30', mr: '0', cr: '0' },
        { opn: '40', mr: '0', cr: '0' },
        { opn: '50', mr: '0', cr: '0' },
        { opn: '60', mr: '0', cr: '0' },
        { opn: '70', mr: '0', cr: '0' },
      ],
      materialAbnormalities: [
        { op: 'Op#10', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
        { op: 'Op#20', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
        { op: 'Op#30', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
        { op: 'Op#40', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
        { op: 'Op#50', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
        { op: 'Op#60', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
        { op: 'Op#70', abnormality1: '4', abnormality2: '', abnormality3: '0', abnormality4: '', totFopPart: '4', total: '4' },
      ],
      materialAbnormalitiesTotal1: '4',
      materialAbnormalitiesTotal2: '',
      materialAbnormalitiesTotal3: '0',
      materialAbnormalitiesTotal4: '',
      materialAbnormalitiesTotal: '4',
    },
    low_confidence_fields: [],
  };
}

/**
 * 2. Save Form B (Relational Data Persistence)
 * Persists reviewed Form B data into Form2HandoverLog, Form2ToolRecord, and Form2PDIInspectionRecord
 */
export async function saveFormB(formData) {
  const records = formData.records || [];
  const firstMachine = records.find(r => r.machineNo)?.machineNo || formData.machineNo || formData.machine_no || '—';

  const toolRecords = records
    .filter(r => r.toolDescription || r.toolNo || r.reasonForFOP)
    .map(r => ({
      tool_name: r.toolDescription || r.tool_name || '',
      tool_code: r.toolNo || r.tool_code || '',
      operationNo: r.operationNo || '',
      machineNo: r.machineNo || '',
      time: r.time || '',
      reasonForFOP: r.reasonForFOP || '',
      fopParts: r.fopParts || '',
      fopRejection: r.fopRejection || '',
      toolSetBy: r.toolSetBy || '',
      qaInsp: r.qaInsp || '',
      standard_life: parseInt(r.standard_life) || 500,
      actual_life: parseInt(r.actual_life) || 0,
      status: r.status || 'OK',
      remarks: r.remarks || r.reasonForFOP || '',
    }));

  const payload = {
    log_date: formData.date || formData.log_date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    shift: formData.shift || 'A',
    machine_no: firstMachine,
    part_name: formData.part_name || formData.partNo1 || 'K-10',
    operation_no: formData.operation_no || formData.operationNumber || '60',
    operator_name: formData.uploadedBy || formData.operator_name || 'Operator',
    operator_id: String(formData.uploadedById || formData.employeeId || ''),
    supervisor_name: formData.supervisor_name || formData.supervisorName || '',
    handover_notes: formData.handover_notes || formData.details?.shiftCommunication || '',
    image_path: formData.imagePath || null,
    total_defect: formData.total_defect || formData.details?.totalDefect || '0',
    tool_records: toolRecords,
    pdi_inspections: formData.pdi_inspections || [],
    records: formData.records,
    details: formData.details,
  };

  if (!USE_MOCK_FALLBACK) {
    try {
      const res = await apiClient.post('/form-b/save', payload);
      const savedRecord = {
        ...formData,
        ...payload,
        id: res.data?.log_id || res.data?.id || Date.now(),
        formType: 'tool-handover',
        qaCell: 'FOP Record',
        partNo1: payload.part_name,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      notifyUploadActivity(savedRecord);
      window.dispatchEvent(new Event('production-log-submitted'));
      return savedRecord;
    } catch (err) {
      console.warn('Backend API /form-b/save failed:', err);
      if (err.response?.data?.detail) {
        throw new Error(typeof err.response.data.detail === 'string' ? err.response.data.detail : 'Save failed');
      }
      throw new Error('Unable to save the form to the server. Please check your connection and try again.');
    }
  }

  await delay(600);
  const newForm = {
    ...formData,
    ...payload,
    id: 2000 + mockProductionLogs.length + 1,
    formType: 'tool-handover',
    qaCell: 'FOP Record',
    partNo1: payload.part_name || 'Tool & Handover',
    uploadedAt: new Date().toISOString(),
  };
  mockProductionLogs.unshift(newForm);
  notifyUploadActivity(newForm);
  window.dispatchEvent(new Event('production-log-submitted'));
  return newForm;
}

export const submitToolHandoverForm = saveFormB;

/**
 * 3. Get Filtered Form B List
 */
export async function getFilteredFormBList(filters = {}) {
  if (!USE_MOCK_FALLBACK) {
    try {
      const params = {};
      if (filters.log_date || filters.date || filters.dateFrom) params.log_date = filters.log_date || filters.date || filters.dateFrom;
      if (filters.shift) params.shift = filters.shift;
      if (filters.machine_no || filters.machineNo) params.machine_no = filters.machine_no || filters.machineNo;
      if (filters.operator_id || filters.operatorId || filters.userId) params.operator_id = filters.operator_id || filters.operatorId || filters.userId;
      if (filters.limit) params.limit = filters.limit;
      if (filters.offset !== undefined) params.offset = filters.offset;

      const res = await apiClient.get('/form-b/list', { params });
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      let logs = rawList.map(item => ({
        ...item,
        formType: 'tool-handover',
        partNo1: item.part_name || item.partNo1 || 'Tool & Handover',
        qaCell: 'FOP Record',
        totalProduction: 0,
        totalLossMin: 0,
        uploadedAt: item.created_at || item.createdAt || item.uploadedAt || null,
      }));

      if (filters.search) {
        const query = filters.search.trim().toLowerCase();
        logs = logs.filter(log => searchableText(log).toLowerCase().includes(query));
      }
      return logs;
    } catch (err) {
      console.warn('Backend API /form-b/list failed, falling back to mock:', err);
    }
  }

  await delay(300);
  return mockProductionLogs.filter(l => l.formType === 'tool-handover');
}

/**
 * 4. Get Single Form B Full Details by ID
 */
export async function getFormBById(id) {
  if (!USE_MOCK_FALLBACK) {
    try {
      const res = await apiClient.get(`/form-b/${id}`);
      return { ...res.data, imagePath: resolveImagePath(res.data?.imagePath || res.data?.image_path) };
    } catch (err) {
      console.warn(`Backend API /form-b/${id} failed:`, err);
    }
  }

  await delay(300);
  const log = mockProductionLogs.find(l => String(l.id) === String(id));
  if (!log) throw new Error('Form B record not found');
  return log;
}

/**
 * 5. Update Form B Record
 */
export async function updateFormB(id, formData) {
  if (!USE_MOCK_FALLBACK) {
    try {
      const res = await apiClient.put(`/form-b/${id}`, formData);
      window.dispatchEvent(new Event('production-log-submitted'));

      // If the response has meaningful data, return it directly.
      // Otherwise re-fetch the record to get the persisted state,
      // so the view never shows a blank form after saving.
      const responseHasData = res.data && (res.data.id || res.data.log_id || res.data.records || res.data.details);
      if (responseHasData) {
        return { ...formData, ...res.data };
      }
      try {
        const refreshed = await apiClient.get(`/form-b/${id}`);
        return { ...formData, ...(refreshed.data || {}) };
      } catch {
        // Fall back to returning the draft as-is (already frontend-normalized)
        return { ...formData, id: Number(id) };
      }
    } catch (err) {
      console.warn(`Backend API update /form-b/${id} failed:`, err);
      if (err.response?.data?.detail) {
        throw new Error(typeof err.response.data.detail === 'string' ? err.response.data.detail : 'Update failed');
      }
      throw new Error('Unable to save your changes. Please check your connection and try again.');
    }
  }

  await delay(500);
  const idx = mockProductionLogs.findIndex(l => String(l.id) === String(id));
  if (idx === -1) throw new Error('Form B not found');
  mockProductionLogs[idx] = { ...mockProductionLogs[idx], ...formData };
  window.dispatchEvent(new Event('production-log-submitted'));
  return mockProductionLogs[idx];
}

// ─── USERS MANAGEMENT ────────────────────────────────────────
const USERS_STORAGE_KEY = 'sata_vikas_users';

const readUsers = () => {
  try {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return savedUsers ? JSON.parse(savedUsers) : [...mockUsers];
  } catch {
    return [...mockUsers];
  }
};

const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.warn('Unable to save user changes:', error);
  }
};

export async function getUsers() {
  if (!USE_MOCK_FALLBACK) {
    try {
      const res = await apiClient.get('/users');
      return res.data;
    } catch (err) {
      console.warn('Backend API getUsers failed, falling back to local storage:', err);
    }
  }

  await delay(400);
  return readUsers();
}

export async function updateUser(id, userData) {
  const payload = {
    ...userData,
    full_name: userData.fullName || userData.full_name,
  };
  if (!USE_MOCK_FALLBACK) {
    try {
      const res = await apiClient.put(`/users/${id}`, payload);
      return res.data;
    } catch (err) {
      if (err.response?.data?.detail) {
        throw new Error(typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail));
      }
      console.warn('Backend API updateUser failed:', err);
    }
  }

  await delay(600);
  const users = readUsers();
  const idx = users.findIndex(u => String(u.id) === String(id));
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], ...userData };
  saveUsers(users);
  return users[idx];
}

export async function deleteUser(id) {
  if (!USE_MOCK_FALLBACK) {
    try {
      const res = await apiClient.delete(`/users/${id}`);
      return res.data;
    } catch (err) {
      if (err.response?.data?.detail) {
        throw new Error(typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail));
      }
      console.warn('Backend API deleteUser failed:', err);
    }
  }

  await delay(400);
  const users = readUsers();
  const idx = users.findIndex(u => String(u.id) === String(id));
  if (idx === -1) throw new Error('User not found');
  users.splice(idx, 1);
  saveUsers(users);
  return { success: true };
}
