import { CheckCircle2 } from 'lucide-react';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';

function Field({ value, onChange, readOnly, placeholder = '', className = '' }) {
  return (
    <input
      readOnly={readOnly}
      value={value || ''}
      placeholder={placeholder}
      onChange={(event) => onChange?.(event.target.value)}
      className={`form-cell-input h-full min-h-[22px] w-full bg-transparent px-1 text-center text-xs font-medium text-slate-900 outline-none transition-colors hover:bg-slate-50/50 focus:bg-indigo-50/80 dark:text-slate-100 dark:hover:bg-slate-800/40 dark:focus:bg-indigo-950/60 ${className}`}
    />
  );
}

export default function ToolHandoverSheet({ records = [], details = {}, onRecordChange, onDetailsChange, onSubmit, readOnly = false }) {
  const scrollRef = useHorizontalScroll();
  const safeRecords = (records || []).slice(0, 20).concat(Array.from({ length: Math.max(0, 20 - (records || []).length) }, () => ({})));
  const setDetail = (field, value) => !readOnly && onDetailsChange?.(field, value);

  const opnDefects = details.opnDefects || [
    { opn: '10', mr: '', cr: '' },
    { opn: '20', mr: '', cr: '' },
    { opn: '30', mr: '', cr: '' },
    { opn: '40', mr: '', cr: '' },
    { opn: '50', mr: '', cr: '' },
    { opn: '60', mr: '', cr: '' },
    { opn: '70', mr: '', cr: '' },
    { opn: '80', mr: '', cr: '' },
    { opn: '90', mr: '', cr: '' },
  ];
  const materialAbnormalities = (details.materialAbnormalities || [
    { op: 'Op#10', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
    { op: 'Op#20', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
    { op: 'Op#30', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
    { op: 'Op#40', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
    { op: 'Op#50', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
    { op: 'Op#60', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
    { op: 'Op#70', abnormality1: '', abnormality2: '', abnormality3: '', abnormality4: '', totFopPart: '', total: '' },
  ]).map(row => ({
    ...row,
    abnormality1: row.abnormality1 ?? row.abnormality ?? '',
    abnormality2: row.abnormality2 ?? '',
    abnormality3: row.abnormality3 ?? '',
    abnormality4: row.abnormality4 ?? '',
  }));

  const updateOpnDefect = (index, field, value) => {
    if (readOnly) return;
    const current = [...opnDefects];
    current[index] = { ...current[index], [field]: value };
    setDetail('opnDefects', current);
  };

  const updateMaterialAbnormality = (index, field, value) => {
    if (readOnly) return;
    const current = [...materialAbnormalities];
    current[index] = { ...current[index], [field]: value };
    setDetail('materialAbnormalities', current);
  };

  const totalMR = opnDefects.reduce((acc, curr) => acc + (Number(curr.mr) || 0), 0);
  const totalCR = opnDefects.reduce((acc, curr) => acc + (Number(curr.cr) || 0), 0);

  return (
    <div className="mx-auto w-full max-w-[1340px] p-2 sm:p-4">
      <div ref={scrollRef} className="form-grid overflow-x-auto no-scrollbar rounded-xl border-2 border-slate-500 bg-white shadow-md dark:border-slate-600 dark:bg-slate-900">
        <div className="min-w-[1120px]">
          <table className="w-full table-fixed border-collapse text-[10px] leading-tight text-slate-700 dark:text-slate-200">
            <colgroup>
              <col style={{ width: '25%' }} />  {/* 1. Tool Description */}
              <col style={{ width: '4%' }} />   {/* 2. Op# */}
              <col style={{ width: '4.5%' }} /> {/* 3. M/c No */}
              <col style={{ width: '4.5%' }} /> {/* 4. Tool No */}
              <col style={{ width: '6%' }} />   {/* 5. Time */}
              <col style={{ width: '22%' }} />  {/* 6. Reason for FOP */}
              <col style={{ width: '6%' }} />   {/* 7. FOP parts */}
              <col style={{ width: '6%' }} />   {/* 8. FOP Rej. */}
              <col style={{ width: '11%' }} />  {/* 9. Tool setting by */}
              <col style={{ width: '11%' }} />  {/* 10. QA Insp. */}
            </colgroup>
            <tbody>
              {/* ── TOP HEADER ROW 1: Page B (left) & (Date & shift as mentioned on page A) (right) ── */}
              <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-400 dark:border-slate-600">
                <td colSpan={3} className="px-3 py-1.5 border-r border-slate-400 dark:border-slate-600">
                  <div className="flex items-center gap-2">
                    <img src={`${import.meta.env.BASE_URL}sata-vikas-logo.svg`} alt="Logo" className="h-4 w-auto" />
                    <span className="font-bold text-[11px] text-slate-900 dark:text-slate-100">
                      Page B
                    </span>
                  </div>
                </td>
                <td colSpan={7} className="px-3 py-1.5 text-center">
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    (Date &amp; shift as mentioned on page A)
                  </span>
                </td>
              </tr>

              {/* ── TOP HEADER ROW 2: First Operation Part (FOP) Record ── */}
              <tr className="bg-slate-100/90 dark:bg-slate-800/70 border-b border-slate-400 dark:border-slate-600">
                <td colSpan={10} className="py-1.5 text-center font-bold text-[13px] tracking-wide text-indigo-900 dark:text-indigo-200">
                  First Operation Part (FOP) Record
                </td>
              </tr>

              {/* ── FOP GRID HEADER ─────────────────────── */}
              <tr className="bg-slate-100 text-center font-bold text-[10.5px] text-slate-800 dark:bg-slate-800 dark:text-slate-100 border-b border-slate-400 dark:border-slate-600">
                <td className="border border-slate-400 px-1 py-1.5 dark:border-slate-600">Tool Description</td>
                <td className="border border-slate-400 px-1 dark:border-slate-600">Op#</td>
                <td className="border border-slate-400 px-1 dark:border-slate-600">M/c No</td>
                <td className="border border-slate-400 px-1 dark:border-slate-600">Tool No</td>
                <td className="border border-slate-400 px-1 dark:border-slate-600">Time</td>
                <td className="border border-slate-400 px-1 dark:border-slate-600">Reason for FOP</td>
                <td className="border border-slate-400 px-1 dark:border-slate-600">FOP parts</td>
                <td className="border border-slate-400 px-1 dark:border-slate-600">FOP Rej.</td>
                <td className="border border-slate-400 px-1 dark:border-slate-600">Tool setting by</td>
                <td className="border border-slate-400 px-1 dark:border-slate-600">QA Insp.</td>
              </tr>

              {/* ── FOP GRID ROWS (16 Rows matching physical sheet) ─────────────── */}
              {safeRecords.map((record, index) => (
                <tr key={index} className="even:bg-slate-50/40 dark:even:bg-slate-800/20 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-colors">
                  <td className="border border-slate-400 p-0 dark:border-slate-600">
                    <Field readOnly={readOnly} value={record.toolDescription} onChange={(v) => onRecordChange?.(index, 'toolDescription', v)} className="text-left font-semibold px-2" />
                  </td>
                  <td className="border border-slate-400 p-0 dark:border-slate-600">
                    <Field readOnly={readOnly} value={record.operationNo} onChange={(v) => onRecordChange?.(index, 'operationNo', v)} />
                  </td>
                  <td className="border border-slate-400 p-0 dark:border-slate-600">
                    <Field readOnly={readOnly} value={record.machineNo} onChange={(v) => onRecordChange?.(index, 'machineNo', v)} />
                  </td>
                  <td className="border border-slate-400 p-0 dark:border-slate-600">
                    <Field readOnly={readOnly} value={record.toolNo} onChange={(v) => onRecordChange?.(index, 'toolNo', v)} />
                  </td>
                  <td className="border border-slate-400 p-0 dark:border-slate-600">
                    <Field readOnly={readOnly} value={record.time} onChange={(v) => onRecordChange?.(index, 'time', v)} />
                  </td>
                  <td className="border border-slate-400 p-0 dark:border-slate-600">
                    <Field readOnly={readOnly} value={record.reasonForFOP} onChange={(v) => onRecordChange?.(index, 'reasonForFOP', v)} className="text-left px-2" />
                  </td>
                  <td className="border border-slate-400 p-0 dark:border-slate-600">
                    <Field readOnly={readOnly} value={record.fopParts} onChange={(v) => onRecordChange?.(index, 'fopParts', v)} />
                  </td>
                  <td className="border border-slate-400 p-0 dark:border-slate-600">
                    <Field readOnly={readOnly} value={record.fopRejection} onChange={(v) => onRecordChange?.(index, 'fopRejection', v)} />
                  </td>
                  <td className="border border-slate-400 p-0 dark:border-slate-600">
                    <Field readOnly={readOnly} value={record.toolSetBy} onChange={(v) => onRecordChange?.(index, 'toolSetBy', v)} />
                  </td>
                  <td className="border border-slate-400 p-0 dark:border-slate-600">
                    <Field readOnly={readOnly} value={record.qaInsp} onChange={(v) => onRecordChange?.(index, 'qaInsp', v)} />
                  </td>
                </tr>
              ))}

              {/* ── MIDDLE SECTION: SHIFT HANDOVER & RED TABLE REJECTION ── */}
              <tr className="border-t-2 border-slate-700 dark:border-slate-400">
                <td colSpan={10} className="p-0">
                  <table className="w-full table-fixed border-collapse text-[10px] leading-tight text-slate-800 dark:text-slate-200">
                    <colgroup>
                      <col style={{ width: '36%' }} /> {/* Problem Analysis */}
                      <col style={{ width: '22%' }} /> {/* Handover Check Item */}
                      <col style={{ width: '7%' }} />  {/* Start */}
                      <col style={{ width: '7%' }} />  {/* End */}
                      <col style={{ width: '18%' }} /> {/* Defect */}
                      <col style={{ width: '10%' }} /> {/* Quantity */}
                    </colgroup>
                    <tbody>
                      {/* Section Title Header Bar */}
                      <tr className="border-b-2 border-slate-700 dark:border-slate-400 bg-slate-800 dark:bg-slate-950 text-white font-bold text-[11px]">
                        <td colSpan={4} className="border-r-2 border-slate-700 dark:border-slate-400 px-2.5 py-1.5 tracking-tight">
                          Shift handover/Take over communication (MUST)
                        </td>
                        <td colSpan={2} className="px-2 py-1.5 text-center text-rose-300 font-bold tracking-tight">
                          Red table REJECTION :
                        </td>
                      </tr>

                      {/* Row 1: Merged Problem Analysis (rowSpan=2, colSpan=4) | DEFECT & Quantity headers */}
                      <tr>
                        <td rowSpan={2} colSpan={4} className="border border-slate-400 border-r-2 border-r-slate-700 px-2 py-1.5 align-top dark:border-slate-600 dark:border-r-slate-400 bg-slate-50/40 dark:bg-slate-800/20">
                          <div className="flex flex-col h-full justify-between gap-1">
                            <span className="font-bold text-[10px] text-indigo-900 dark:text-indigo-300">Problem Analysis :</span>
                            <div className="flex-1 min-h-[30px]">
                              <Field
                                readOnly={readOnly}
                                value={details.problemAnalysis}
                                onChange={(val) => setDetail('problemAnalysis', val)}
                                className="text-left font-normal"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-1 font-bold text-center text-[10px] text-slate-900 dark:text-slate-100 dark:border-slate-600">
                          DEFECT
                        </td>
                        <td className="border border-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-1 font-bold text-center text-[10px] text-slate-900 dark:text-slate-100 dark:border-slate-600">
                          Quantity
                        </td>
                      </tr>

                      {/* Row 2: Total Defect (MUST FILL) : */}
                      <tr className="bg-rose-50/40 dark:bg-rose-950/20">
                        <td className="border border-slate-400 px-2 py-1 font-bold text-[9.5px] text-rose-900 dark:text-rose-200 dark:border-slate-600">
                          Total Defect (MUST FILL) :
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600 font-bold">
                          <Field readOnly={readOnly} value={details.totalDefect} onChange={(val) => setDetail('totalDefect', val)} className="font-bold text-rose-800 dark:text-rose-300" />
                        </td>
                      </tr>

                      {/* Row 3: Why? (1) | Handover check : / Start / End headers | Defect 0 */}
                      <tr>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600">
                          <div className="flex items-center gap-1">
                            <span className="w-12 shrink-0 font-semibold text-[10px] text-slate-600 dark:text-slate-400">Why?</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.why1} onChange={(val) => setDetail('why1', val)} className="text-left font-medium" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 font-bold text-[10px] text-slate-900 dark:text-slate-100 dark:border-slate-600">
                          Handover check :
                        </td>
                        <td className="border border-slate-400 bg-slate-100 dark:bg-slate-800 text-center font-bold text-[10px] text-slate-900 dark:text-slate-100 dark:border-slate-600 py-1">
                          Start
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 bg-slate-100 dark:bg-slate-800 text-center font-bold text-[10px] text-slate-900 dark:text-slate-100 dark:border-slate-600 dark:border-r-slate-400 py-1">
                          End
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.defect0} onChange={(val) => setDetail('defect0', val)} className="text-left px-2" />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.quantity0} onChange={(val) => setDetail('quantity0', val)} />
                        </td>
                      </tr>

                      {/* Row 4: Why? (2) | RM on line-Qty | Defect 1 */}
                      <tr>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600">
                          <div className="flex items-center gap-1">
                            <span className="w-12 shrink-0 font-semibold text-[10px] text-slate-600 dark:text-slate-400">Why?</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.why2} onChange={(val) => setDetail('why2', val)} className="text-left font-medium" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600 font-medium text-[9.5px] bg-slate-50/50 dark:bg-slate-800/30">
                          RM on line-Qty
                        </td>
                        <td className="border border-slate-400 text-center dark:border-slate-600 p-0">
                          <Field readOnly={readOnly} value={details.startCheck0} onChange={(val) => setDetail('startCheck0', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 text-center dark:border-slate-600 dark:border-r-slate-400 p-0">
                          <Field readOnly={readOnly} value={details.endCheck0} onChange={(val) => setDetail('endCheck0', val)} />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.defect1} onChange={(val) => setDetail('defect1', val)} className="text-left px-2" />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.quantity1} onChange={(val) => setDetail('quantity1', val)} />
                        </td>
                      </tr>

                      {/* Row 5: Why? (3) | Running Cavity | Defect 2 */}
                      <tr>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600">
                          <div className="flex items-center gap-1">
                            <span className="w-12 shrink-0 font-semibold text-[10px] text-slate-600 dark:text-slate-400">Why?</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.why3} onChange={(val) => setDetail('why3', val)} className="text-left font-medium" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600 font-medium text-[9.5px] bg-slate-50/50 dark:bg-slate-800/30">
                          Running Cavity
                        </td>
                        <td className="border border-slate-400 text-center dark:border-slate-600 p-0">
                          <Field readOnly={readOnly} value={details.startCheck1} onChange={(val) => setDetail('startCheck1', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 text-center dark:border-slate-600 dark:border-r-slate-400 p-0">
                          <Field readOnly={readOnly} value={details.endCheck1} onChange={(val) => setDetail('endCheck1', val)} />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.defect2} onChange={(val) => setDetail('defect2', val)} className="text-left px-2" />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.quantity2} onChange={(val) => setDetail('quantity2', val)} />
                        </td>
                      </tr>

                      {/* Row 6: Why? (4) | All Gauges online (Y/N) | Defect 3 */}
                      <tr>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600">
                          <div className="flex items-center gap-1">
                            <span className="w-12 shrink-0 font-semibold text-[10px] text-slate-600 dark:text-slate-400">Why?</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.why4} onChange={(val) => setDetail('why4', val)} className="text-left font-medium" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600 font-medium text-[9.5px] bg-slate-50/50 dark:bg-slate-800/30">
                          All Gauges online (Y/N)
                        </td>
                        <td className="border border-slate-400 text-center dark:border-slate-600 p-0">
                          <Field readOnly={readOnly} value={details.startCheck2} onChange={(val) => setDetail('startCheck2', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 text-center dark:border-slate-600 dark:border-r-slate-400 p-0">
                          <Field readOnly={readOnly} value={details.endCheck2} onChange={(val) => setDetail('endCheck2', val)} />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.defect3} onChange={(val) => setDetail('defect3', val)} className="text-left px-2" />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.quantity3} onChange={(val) => setDetail('quantity3', val)} />
                        </td>
                      </tr>

                      {/* Row 7: Why? (5) | Missing Gauges : | Defect 4 */}
                      <tr>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600">
                          <div className="flex items-center gap-1">
                            <span className="w-12 shrink-0 font-semibold text-[10px] text-slate-600 dark:text-slate-400">Why?</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.why5} onChange={(val) => setDetail('why5', val)} className="text-left font-medium" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600 font-medium text-[9.5px] bg-slate-50/50 dark:bg-slate-800/30">
                          Missing Gauges :
                        </td>
                        <td className="border border-slate-400 text-center dark:border-slate-600 p-0">
                          <Field readOnly={readOnly} value={details.startCheck3} onChange={(val) => setDetail('startCheck3', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 text-center dark:border-slate-600 dark:border-r-slate-400 p-0">
                          <Field readOnly={readOnly} value={details.endCheck3} onChange={(val) => setDetail('endCheck3', val)} />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.defect4} onChange={(val) => setDetail('defect4', val)} className="text-left px-2" />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.quantity4} onChange={(val) => setDetail('quantity4', val)} />
                        </td>
                      </tr>

                      {/* Row 8: Root Cause : | (empty center) | Defect 5 */}
                      <tr>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600">
                          <div className="flex items-center gap-1">
                            <span className="shrink-0 font-bold text-[10px] text-slate-900 dark:text-slate-100">Root Cause :</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.rootCause} onChange={(val) => setDetail('rootCause', val)} className="text-left font-medium" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 bg-slate-50/30 dark:border-slate-600 dark:bg-slate-800/20"></td>
                        <td className="border border-slate-400 bg-slate-50/30 dark:border-slate-600 dark:bg-slate-800/20"></td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 bg-slate-50/30 dark:border-slate-600 dark:border-r-slate-400 dark:bg-slate-800/20"></td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.defect5} onChange={(val) => setDetail('defect5', val)} className="text-left px-2" />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.quantity5} onChange={(val) => setDetail('quantity5', val)} />
                        </td>
                      </tr>

                      {/* Row 9: Action 1 : | PDI Report/PV No. | Defect 6 */}
                      <tr>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600">
                          <div className="flex items-center gap-1">
                            <span className="shrink-0 font-bold text-[10px] text-slate-900 dark:text-slate-100">Action 1 :</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.action1} onChange={(val) => setDetail('action1', val)} className="text-left font-medium" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600 font-medium text-[9.5px] bg-slate-50/50 dark:bg-slate-800/30">
                          PDI Report/PV No.
                        </td>
                        <td className="border border-slate-400 text-center dark:border-slate-600 p-0">
                          <Field
                            readOnly={readOnly}
                            value={details.startCheck4 ?? details.pvReport ?? details.pdiReportPvNo}
                            onChange={(val) => {
                              setDetail('startCheck4', val);
                              setDetail('pvReport', val);
                              setDetail('pdiReportPvNo', val);
                            }}
                          />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 text-center dark:border-slate-600 dark:border-r-slate-400 p-0">
                          <Field readOnly={readOnly} value={details.endCheck4} onChange={(val) => setDetail('endCheck4', val)} />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.defect6} onChange={(val) => setDetail('defect6', val)} className="text-left px-2" />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.quantity6} onChange={(val) => setDetail('quantity6', val)} />
                        </td>
                      </tr>

                      {/* Row 10: Action 2 : | Tool Inv on line No. | Defect 7 */}
                      <tr>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600">
                          <div className="flex items-center gap-1">
                            <span className="shrink-0 font-bold text-[10px] text-slate-900 dark:text-slate-100">Action 2 :</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.action2} onChange={(val) => setDetail('action2', val)} className="text-left font-medium" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 px-2 py-0.5 dark:border-slate-600 font-medium text-[9.5px] bg-slate-50/50 dark:bg-slate-800/30">
                          Tool Inv on line No.
                        </td>
                        <td className="border border-slate-400 text-center dark:border-slate-600 p-0">
                          <Field
                            readOnly={readOnly}
                            value={details.startCheck5 ?? details.toolInv ?? details.toolInvOnLineNo}
                            onChange={(val) => {
                              setDetail('startCheck5', val);
                              setDetail('toolInv', val);
                              setDetail('toolInvOnLineNo', val);
                            }}
                          />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 text-center dark:border-slate-600 dark:border-r-slate-400 p-0">
                          <Field readOnly={readOnly} value={details.endCheck5} onChange={(val) => setDetail('endCheck5', val)} />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.defect7} onChange={(val) => setDetail('defect7', val)} className="text-left px-2" />
                        </td>
                        <td className="border border-slate-400 p-0 dark:border-slate-600">
                          <Field readOnly={readOnly} value={details.quantity7} onChange={(val) => setDetail('quantity7', val)} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ── BOTTOM SECTION: SHIFT COMMUNICATION / DEFECT / MATERIAL & TOOL ── */}
              <tr className="border-t-2 border-slate-700 dark:border-slate-400">
                <td colSpan={10} className="p-0">
                  <table className="w-full table-fixed border-collapse text-[10px] leading-tight text-slate-800 dark:text-slate-200">
                    <colgroup>
                      <col style={{ width: '33%' }} />
                      <col style={{ width: '4.33%' }} />
                      <col style={{ width: '4.33%' }} />
                      <col style={{ width: '4.34%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '14%' }} />
                    </colgroup>
                    <tbody>
                      {/* Section Header Bar */}
                      <tr className="bg-slate-800 dark:bg-slate-950 text-white font-bold text-[11px] border-b-2 border-slate-700 dark:border-slate-400">
                        <td className="border-r-2 border-slate-700 dark:border-slate-400 px-2.5 py-1.5">
                          Shift communication / Remark :
                        </td>
                        <td colSpan={3} className="border-r-2 border-slate-700 dark:border-slate-400 px-1 py-1.5 text-center text-amber-300 font-bold whitespace-nowrap">
                          Opn# defect/Sh :
                        </td>
                        <td colSpan={6} className="px-2.5 py-1.5 font-bold">
                          Material &amp; Tool related communication
                        </td>
                      </tr>

                      {/* Row 1: Section Sub-headers + Supplier Info & Die/Cavity */}
                      <tr className="text-[10px]">
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 bg-indigo-50/60 dark:bg-indigo-950/40 px-2 py-1 font-bold text-indigo-950 dark:text-indigo-200">
                          PDI OK parts for shift (PDI Insp. to write)
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 py-1 text-center font-bold">
                          Opn#
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 py-1 text-center font-bold">
                          MR
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 bg-slate-100 dark:bg-slate-800 py-1 text-center font-bold">
                          CR
                        </td>
                        <td rowSpan={2} colSpan={3} className="border border-slate-400 dark:border-slate-600 bg-slate-50/70 dark:bg-slate-800/50 px-2 py-1 align-top">
                          <div className="flex flex-col h-full justify-between gap-1">
                            <span className="font-bold text-[10px] text-slate-800 dark:text-slate-200 whitespace-nowrap">Supplier information :</span>
                            <div className="flex-1 min-h-[22px]">
                              <Field readOnly={readOnly} value={details.supplierInfo} onChange={(val) => setDetail('supplierInfo', val)} className="text-left font-medium" />
                            </div>
                          </div>
                        </td>
                        <td rowSpan={2} colSpan={3} className="border border-slate-400 dark:border-slate-600 bg-slate-50/70 dark:bg-slate-800/50 px-2 py-1 align-top">
                          <div className="flex flex-col h-full justify-between gap-1">
                            <span className="font-bold text-[10px] text-slate-800 dark:text-slate-200 whitespace-nowrap">Die/Cavity Number :</span>
                            <div className="flex-1 min-w-0 min-h-[22px]">
                              <Field readOnly={readOnly} value={details.dieCavityNo} onChange={(val) => setDetail('dieCavityNo', val)} className="text-left font-medium" />
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Row 2: Part 1 | Opn 10 */}
                      <tr>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 px-2 py-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[10px] text-slate-700 dark:text-slate-300 w-14 shrink-0">Part 1</span>
                            <span className="text-slate-400 mr-2">:</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.pdiOkPart1} onChange={(val) => setDetail('pdiOkPart1', val)} className="text-left font-semibold text-slate-900 dark:text-slate-100" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-slate-700 dark:text-slate-300">
                          10
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[0]?.mr} onChange={(val) => updateOpnDefect(0, 'mr', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[0]?.cr} onChange={(val) => updateOpnDefect(0, 'cr', val)} />
                        </td>
                      </tr>

                      {/* Row 3: Part 2 | Opn 20 | M/c (Opn#) Header */}
                      <tr>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 px-2 py-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[10px] text-slate-700 dark:text-slate-300 w-14 shrink-0">Part 2</span>
                            <span className="text-slate-400 mr-2">:</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.pdiOkPart2} onChange={(val) => setDetail('pdiOkPart2', val)} className="text-left font-semibold text-slate-900 dark:text-slate-100" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-slate-700 dark:text-slate-300">
                          20
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[1]?.mr} onChange={(val) => updateOpnDefect(1, 'mr', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[1]?.cr} onChange={(val) => updateOpnDefect(1, 'cr', val)} />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-center font-bold text-[10px] text-slate-900 dark:text-slate-100 py-1">
                          M/c (Opn#)
                        </td>
                        <td colSpan={4} className="border border-slate-400 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 font-bold text-[10px] text-slate-900 dark:text-slate-100 text-center">
                          Abnormty /Alarm (Mention time here)
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-center font-bold text-[10px] text-slate-900 dark:text-slate-100 py-1 whitespace-nowrap">
                          Tot.FOP Part
                        </td>
                      </tr>

                      {/* Row 4: Rework generation subhead | Opn 30 | Op#10 */}
                      <tr>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 bg-slate-100/90 dark:bg-slate-800/80 px-2 py-0.5 font-bold text-[10px] text-slate-800 dark:text-slate-200">
                          Rework generation :
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-slate-700 dark:text-slate-300">
                          30
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[2]?.mr} onChange={(val) => updateOpnDefect(2, 'mr', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[2]?.cr} onChange={(val) => updateOpnDefect(2, 'cr', val)} />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                          Op#10
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[0]?.abnormality1 ?? materialAbnormalities[0]?.abnormality} onChange={(val) => updateMaterialAbnormality(0, 'abnormality1', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[0]?.abnormality2} onChange={(val) => updateMaterialAbnormality(0, 'abnormality2', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[0]?.abnormality3} onChange={(val) => updateMaterialAbnormality(0, 'abnormality3', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[0]?.abnormality4} onChange={(val) => updateMaterialAbnormality(0, 'abnormality4', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0 font-bold">
                          <Field readOnly={readOnly} value={materialAbnormalities[0]?.totFopPart ?? materialAbnormalities[0]?.total} onChange={(val) => updateMaterialAbnormality(0, 'totFopPart', val)} className="font-bold" />
                        </td>
                      </tr>

                      {/* Row 5: Part 1 | Opn 40 | Op#20 */}
                      <tr>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 px-2 py-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[10px] text-slate-700 dark:text-slate-300 w-14 shrink-0">Part 1</span>
                            <span className="text-slate-400 mr-2">:</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.reworkGenPart1} onChange={(val) => setDetail('reworkGenPart1', val)} className="text-left font-semibold text-slate-900 dark:text-slate-100" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-slate-700 dark:text-slate-300">
                          40
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[3]?.mr} onChange={(val) => updateOpnDefect(3, 'mr', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[3]?.cr} onChange={(val) => updateOpnDefect(3, 'cr', val)} />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                          Op#20
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[1]?.abnormality1 ?? materialAbnormalities[1]?.abnormality} onChange={(val) => updateMaterialAbnormality(1, 'abnormality1', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[1]?.abnormality2} onChange={(val) => updateMaterialAbnormality(1, 'abnormality2', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[1]?.abnormality3} onChange={(val) => updateMaterialAbnormality(1, 'abnormality3', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[1]?.abnormality4} onChange={(val) => updateMaterialAbnormality(1, 'abnormality4', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0 font-bold">
                          <Field readOnly={readOnly} value={materialAbnormalities[1]?.totFopPart ?? materialAbnormalities[1]?.total} onChange={(val) => updateMaterialAbnormality(1, 'totFopPart', val)} className="font-bold" />
                        </td>
                      </tr>

                      {/* Row 6: Part 2 | Opn 50 | Op#30 */}
                      <tr>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 px-2 py-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[10px] text-slate-700 dark:text-slate-300 w-14 shrink-0">Part 2</span>
                            <span className="text-slate-400 mr-2">:</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.reworkGenPart2} onChange={(val) => setDetail('reworkGenPart2', val)} className="text-left font-semibold text-slate-900 dark:text-slate-100" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-slate-700 dark:text-slate-300">
                          50
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[4]?.mr} onChange={(val) => updateOpnDefect(4, 'mr', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[4]?.cr} onChange={(val) => updateOpnDefect(4, 'cr', val)} />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                          Op#30
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[2]?.abnormality1 ?? materialAbnormalities[2]?.abnormality} onChange={(val) => updateMaterialAbnormality(2, 'abnormality1', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[2]?.abnormality2} onChange={(val) => updateMaterialAbnormality(2, 'abnormality2', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[2]?.abnormality3} onChange={(val) => updateMaterialAbnormality(2, 'abnormality3', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[2]?.abnormality4} onChange={(val) => updateMaterialAbnormality(2, 'abnormality4', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0 font-bold">
                          <Field readOnly={readOnly} value={materialAbnormalities[2]?.totFopPart ?? materialAbnormalities[2]?.total} onChange={(val) => updateMaterialAbnormality(2, 'totFopPart', val)} className="font-bold" />
                        </td>
                      </tr>

                      {/* Row 7: Rework cleared in shift : */}
                      <tr>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 bg-slate-100/90 dark:bg-slate-800/80 px-2 py-0.5 font-bold text-[10px] text-slate-800 dark:text-slate-200">
                          Rework cleared in shift :
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-slate-700 dark:text-slate-300">
                          60
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[5]?.mr} onChange={(val) => updateOpnDefect(5, 'mr', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[5]?.cr} onChange={(val) => updateOpnDefect(5, 'cr', val)} />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                          Op#40
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[3]?.abnormality1 ?? materialAbnormalities[3]?.abnormality} onChange={(val) => updateMaterialAbnormality(3, 'abnormality1', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[3]?.abnormality2} onChange={(val) => updateMaterialAbnormality(3, 'abnormality2', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[3]?.abnormality3} onChange={(val) => updateMaterialAbnormality(3, 'abnormality3', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[3]?.abnormality4} onChange={(val) => updateMaterialAbnormality(3, 'abnormality4', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0 font-bold">
                          <Field readOnly={readOnly} value={materialAbnormalities[3]?.totFopPart ?? materialAbnormalities[3]?.total} onChange={(val) => updateMaterialAbnormality(3, 'totFopPart', val)} className="font-bold" />
                        </td>
                      </tr>

                      {/* Row 8: Part 1 | Opn 70 | Op#50 */}
                      <tr>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 px-2 py-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[10px] text-slate-700 dark:text-slate-300 w-14 shrink-0">Part 1</span>
                            <span className="text-slate-400 mr-2">:</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.reworkClearedPart1} onChange={(val) => setDetail('reworkClearedPart1', val)} className="text-left font-semibold text-slate-900 dark:text-slate-100" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-slate-700 dark:text-slate-300">
                          70
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[6]?.mr} onChange={(val) => updateOpnDefect(6, 'mr', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[6]?.cr} onChange={(val) => updateOpnDefect(6, 'cr', val)} />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                          Op#50
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[4]?.abnormality1 ?? materialAbnormalities[4]?.abnormality} onChange={(val) => updateMaterialAbnormality(4, 'abnormality1', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[4]?.abnormality2} onChange={(val) => updateMaterialAbnormality(4, 'abnormality2', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[4]?.abnormality3} onChange={(val) => updateMaterialAbnormality(4, 'abnormality3', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[4]?.abnormality4} onChange={(val) => updateMaterialAbnormality(4, 'abnormality4', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0 font-bold">
                          <Field readOnly={readOnly} value={materialAbnormalities[4]?.totFopPart ?? materialAbnormalities[4]?.total} onChange={(val) => updateMaterialAbnormality(4, 'totFopPart', val)} className="font-bold" />
                        </td>
                      </tr>

                      {/* Row 9: Part 2 | Opn 80 | Op#60 */}
                      <tr>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 px-2 py-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[10px] text-slate-700 dark:text-slate-300 w-14 shrink-0">Part 2</span>
                            <span className="text-slate-400 mr-2">:</span>
                            <div className="flex-1">
                              <Field readOnly={readOnly} value={details.reworkClearedPart2} onChange={(val) => setDetail('reworkClearedPart2', val)} className="text-left font-semibold text-slate-900 dark:text-slate-100" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-slate-700 dark:text-slate-300">
                          80
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[7]?.mr} onChange={(val) => updateOpnDefect(7, 'mr', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[7]?.cr} onChange={(val) => updateOpnDefect(7, 'cr', val)} />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                          Op#60
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[5]?.abnormality1 ?? materialAbnormalities[5]?.abnormality} onChange={(val) => updateMaterialAbnormality(5, 'abnormality1', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[5]?.abnormality2} onChange={(val) => updateMaterialAbnormality(5, 'abnormality2', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[5]?.abnormality3} onChange={(val) => updateMaterialAbnormality(5, 'abnormality3', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[5]?.abnormality4} onChange={(val) => updateMaterialAbnormality(5, 'abnormality4', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0 font-bold">
                          <Field readOnly={readOnly} value={materialAbnormalities[5]?.totFopPart ?? materialAbnormalities[5]?.total} onChange={(val) => updateMaterialAbnormality(5, 'totFopPart', val)} className="font-bold" />
                        </td>
                      </tr>

                      {/* Row 10: Rework approval No | Opn 90 | Op#70 */}
                      <tr>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 px-2 py-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[10px] text-slate-800 dark:text-slate-200 whitespace-nowrap">Rework approval No :</span>
                            <div className="flex-1 ml-2">
                              <Field readOnly={readOnly} value={details.reworkApprovalNo} onChange={(val) => setDetail('reworkApprovalNo', val)} className="text-left font-semibold text-slate-900 dark:text-slate-100" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-slate-700 dark:text-slate-300">
                          90
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[8]?.mr} onChange={(val) => updateOpnDefect(8, 'mr', val)} />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 text-center p-0">
                          <Field readOnly={readOnly} value={opnDefects[8]?.cr} onChange={(val) => updateOpnDefect(8, 'cr', val)} />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 text-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                          Op#70
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[6]?.abnormality1 ?? materialAbnormalities[6]?.abnormality} onChange={(val) => updateMaterialAbnormality(6, 'abnormality1', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[6]?.abnormality2} onChange={(val) => updateMaterialAbnormality(6, 'abnormality2', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[6]?.abnormality3} onChange={(val) => updateMaterialAbnormality(6, 'abnormality3', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 px-1 py-0.5">
                          <Field readOnly={readOnly} value={materialAbnormalities[6]?.abnormality4} onChange={(val) => updateMaterialAbnormality(6, 'abnormality4', val)} className="text-left font-medium" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 text-center p-0 font-bold">
                          <Field readOnly={readOnly} value={materialAbnormalities[6]?.totFopPart ?? materialAbnormalities[6]?.total} onChange={(val) => updateMaterialAbnormality(6, 'totFopPart', val)} className="font-bold" />
                        </td>
                      </tr>

                      {/* Row 11: Document Box (rowSpan=2) | Total Opn# / MR / CR | TOTAL : Material Abnormalities */}
                      <tr>
                        <td rowSpan={2} className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 p-0 align-top bg-slate-50/90 dark:bg-slate-800/80">
                          <div className="flex flex-col h-full text-[9px] leading-tight divide-y divide-slate-300 dark:divide-slate-700">
                            <div className="flex items-center px-2 py-0.5">
                              <span className="font-bold text-slate-700 dark:text-slate-300 w-20 shrink-0">Doc. No.:</span>
                              <Field readOnly={readOnly} value={details.docNo ?? 'SV/F/0615'} onChange={(val) => setDetail('docNo', val)} className="text-left font-bold text-slate-900 dark:text-slate-100" />
                            </div>
                            <div className="flex items-center px-2 py-0.5">
                              <span className="font-bold text-slate-700 dark:text-slate-300 w-20 shrink-0">Rev. No.:</span>
                              <Field readOnly={readOnly} value={details.revNo ?? '03'} onChange={(val) => setDetail('revNo', val)} className="text-left font-semibold" />
                            </div>
                            <div className="flex items-center px-2 py-0.5">
                              <span className="font-bold text-slate-700 dark:text-slate-300 w-20 shrink-0">Date (Rev.):</span>
                              <Field readOnly={readOnly} value={details.dateRev ?? '17.04.2026'} onChange={(val) => setDetail('dateRev', val)} className="text-left font-semibold" />
                            </div>
                            <div className="flex items-center px-2 py-0.5">
                              <span className="font-bold text-slate-700 dark:text-slate-300 w-20 shrink-0">Date (Org.):</span>
                              <Field readOnly={readOnly} value={details.dateOrg ?? '01.04.2011'} onChange={(val) => setDetail('dateOrg', val)} className="text-left font-semibold" />
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-center font-bold text-[10px] text-indigo-950 dark:text-indigo-200 py-1">
                          Total
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-indigo-50/40 dark:bg-indigo-950/30 text-center font-bold p-0">
                          <Field
                            readOnly={readOnly}
                            value={details.opnDefectsTotalMr || (totalMR > 0 ? String(totalMR) : '0')}
                            onChange={(val) => setDetail('opnDefectsTotalMr', val)}
                            className="text-center font-extrabold text-indigo-900 dark:text-indigo-200"
                          />
                        </td>
                        <td className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 bg-indigo-50/40 dark:bg-indigo-950/30 text-center font-bold p-0">
                          <Field
                            readOnly={readOnly}
                            value={details.opnDefectsTotalCr || (totalCR > 0 ? String(totalCR) : '0')}
                            onChange={(val) => setDetail('opnDefectsTotalCr', val)}
                            className="text-center font-extrabold text-indigo-900 dark:text-indigo-200"
                          />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-center font-bold text-[10px] text-indigo-950 dark:text-indigo-200 py-1">
                          TOTAL :
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-indigo-50/40 dark:bg-indigo-950/30 px-1 py-0.5 text-center font-bold">
                          <Field readOnly={readOnly} value={details.materialAbnormalitiesTotal1 ?? materialAbnormalities[6]?.abnormality1} onChange={(val) => setDetail('materialAbnormalitiesTotal1', val)} className="font-bold text-indigo-900 dark:text-indigo-200" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-indigo-50/40 dark:bg-indigo-950/30 px-1 py-0.5 text-center font-bold">
                          <Field readOnly={readOnly} value={details.materialAbnormalitiesTotal2 ?? materialAbnormalities[6]?.abnormality2} onChange={(val) => setDetail('materialAbnormalitiesTotal2', val)} className="font-bold text-indigo-900 dark:text-indigo-200" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-indigo-50/40 dark:bg-indigo-950/30 px-1 py-0.5 text-center font-bold">
                          <Field readOnly={readOnly} value={details.materialAbnormalitiesTotal3 ?? materialAbnormalities[6]?.abnormality3} onChange={(val) => setDetail('materialAbnormalitiesTotal3', val)} className="font-bold text-indigo-900 dark:text-indigo-200" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-indigo-50/40 dark:bg-indigo-950/30 px-1 py-0.5 text-center font-bold">
                          <Field readOnly={readOnly} value={details.materialAbnormalitiesTotal4 ?? materialAbnormalities[6]?.abnormality4} onChange={(val) => setDetail('materialAbnormalitiesTotal4', val)} className="font-bold text-indigo-900 dark:text-indigo-200" />
                        </td>
                        <td className="border border-slate-400 dark:border-slate-600 bg-indigo-50/40 dark:bg-indigo-950/30 text-center font-bold p-0">
                          <Field
                            readOnly={readOnly}
                            value={details.materialAbnormalitiesTotal ?? (materialAbnormalities[6]?.totFopPart || '4')}
                            onChange={(val) => setDetail('materialAbnormalitiesTotal', val)}
                            className="font-extrabold text-indigo-900 dark:text-indigo-200"
                          />
                        </td>
                      </tr>

                      {/* Row 12: Prepared by & Supervisor Signature Row */}
                      <tr className="bg-slate-50/90 dark:bg-slate-800/90">
                        <td colSpan={5} className="border border-slate-400 border-r-2 border-r-slate-700 dark:border-slate-600 dark:border-r-slate-400 px-3 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap text-[10.5px]">Prepared by - Employee No :</span>
                            <div className="flex-1">
                              <Field
                                readOnly={readOnly}
                                value={details.preparedByEmpNo}
                                onChange={(val) => setDetail('preparedByEmpNo', val)}
                                className="text-left font-semibold text-blue-700 dark:text-blue-300"
                              />
                            </div>
                          </div>
                        </td>
                        <td colSpan={5} className="border border-slate-400 dark:border-slate-600 px-3 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap text-[10.5px]">Module incharge/Supervisor :</span>
                            <div className="flex-1">
                              <Field
                                readOnly={readOnly}
                                value={details.moduleIncharge}
                                onChange={(val) => setDetail('moduleIncharge', val)}
                                className="text-left font-semibold text-blue-700 dark:text-blue-300"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {!readOnly && (
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onSubmit} className="btn-success text-xs">
            <CheckCircle2 size={16} /> Save Tool &amp; Handover Form
          </button>
        </div>
      )}
    </div>
  );
}
