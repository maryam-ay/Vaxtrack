import { KPIIndicator, StateData, StockStatus } from './types';

export const INITIAL_KPI_INDICATORS: KPIIndicator[] = [
  {
    id: 'total-facilities',
    title: 'TOTAL FACILITIES',
    value: '1,759',
    subtext: 'Active facilities',
    status: 'informational',
    topColorClass: 'border-l-4 border-l-blue-500',
    textColorClass: 'text-slate-800',
    badgeBgClass: 'bg-blue-50 border border-blue-200',
    badgeTextClass: 'text-blue-700',
  },
  {
    id: 'in-full-delivery',
    title: 'IN-FULL DELIVERY RATE',
    value: '21.0%',
    subtext: '369 of 1,759',
    target: 'Target: > 95%',
    status: 'critical',
    topColorClass: 'border-l-4 border-l-red-500',
    textColorClass: 'text-slate-800',
    badgeBgClass: 'bg-red-50 border border-red-200',
    badgeTextClass: 'text-red-700',
  },
  {
    id: 'on-time-delivery',
    title: 'ON-TIME DELIVERY RATE',
    value: '93.9%',
    subtext: '1,652 of 1,759',
    target: 'Target: > 90%',
    status: 'on_target',
    topColorClass: 'border-l-4 border-l-emerald-500',
    textColorClass: 'text-slate-800',
    badgeBgClass: 'bg-emerald-50 border border-emerald-200',
    badgeTextClass: 'text-emerald-700',
  },
  {
    id: 'stockout-rate',
    title: 'STOCKOUT RATE',
    value: '75.2%',
    subtext: '1,322 of 1,759',
    target: 'Target: < 5%',
    status: 'critical',
    topColorClass: 'border-l-4 border-l-red-500',
    textColorClass: 'text-slate-800',
    badgeBgClass: 'bg-red-50 border border-red-200',
    badgeTextClass: 'text-red-700',
  },
  {
    id: 'reorder-level-status',
    title: 'REORDER LEVEL STATUS',
    value: '66.7%',
    subtext: '1,173 of 1,759',
    status: 'attention',
    topColorClass: 'border-l-4 border-l-amber-500',
    textColorClass: 'text-slate-800',
    badgeBgClass: 'bg-amber-50 border border-amber-200',
    badgeTextClass: 'text-amber-700',
  },
  {
    id: 'cce-functionality',
    title: 'CCE FUNCTIONALITY RATE',
    value: '87.4%',
    subtext: '1,538 of 1,759',
    target: 'Target: > 95%',
    status: 'attention',
    topColorClass: 'border-l-4 border-l-amber-500',
    textColorClass: 'text-slate-800',
    badgeBgClass: 'bg-amber-50 border border-amber-200',
    badgeTextClass: 'text-amber-700',
  },
  {
    id: 'reverse-logistics',
    title: 'REVERSE LOGISTICS COMPLETION',
    value: '23.4%',
    subtext: '412 of 1,759',
    target: 'Target: > 90%',
    status: 'critical',
    topColorClass: 'border-l-4 border-l-red-500',
    textColorClass: 'text-slate-800',
    badgeBgClass: 'bg-red-50 border border-red-200',
    badgeTextClass: 'text-red-700',
  },
  {
    id: 'stock-adequacy',
    title: 'STOCK ADEQUACY TO PLAN',
    value: '93.9%',
    subtext: '1,652 of 1,759',
    target: 'Target: > 90%',
    status: 'on_target',
    topColorClass: 'border-l-4 border-l-emerald-500',
    textColorClass: 'text-slate-800',
    badgeBgClass: 'bg-emerald-50 border border-emerald-200',
    badgeTextClass: 'text-emerald-700',
  },
];

export const VACCINE_INFO_MAP: Record<string, { name: string; targetMin: number; targetMax: number }> = {
  BCG: { name: 'Bacillus Calmette–Guérin (Tuberculosis)', targetMin: 20000, targetMax: 100000 },
  BOPV: { name: 'Bivalent Oral Polio Vaccine', targetMin: 30000, targetMax: 150000 },
  HPV: { name: 'Human Papillomavirus Vaccine', targetMin: 15000, targetMax: 80000 },
  HEPB: { name: 'Hepatitis B Vaccine', targetMin: 25000, targetMax: 120000 },
  IPV: { name: 'Inactivated Polio Vaccine', targetMin: 35000, targetMax: 160000 },
  MEASLES: { name: 'Measles Vaccine', targetMin: 40000, targetMax: 180000 },
  MENA: { name: 'Meningitis A Vaccine (MenA)', targetMin: 30000, targetMax: 140000 },
  MR: { name: 'Measles-Rubella Vaccine', targetMin: 40000, targetMax: 180000 },
  PCV: { name: 'Pneumococcal Conjugate Vaccine', targetMin: 35000, targetMax: 160000 },
  PENTA: { name: 'Pentavalent Vaccine', targetMin: 40000, targetMax: 180000 },
  ROTA: { name: 'Rotavirus Vaccine', targetMin: 35000, targetMax: 160000 },
  TD: { name: 'Tetanus and Diphtheria Toxoid Vaccine', targetMin: 20000, targetMax: 100000 },
  YF: { name: 'Yellow Fever Vaccine', targetMin: 25000, targetMax: 120000 },
};

export const INITIAL_STATES_DATA: StateData[] = [
  {
    id: 'abia',
    name: 'Abia',
    vaccines: {
      BCG: 32850,
      BOPV: 92670,
      HPV: 9660,
      HEPB: 29670,
      IPV: 45170,
      MEASLES: 46475,
      MENA: 36560,
      MR: 46475,
    },
    lgas: [
      {
        id: 'aba-north',
        name: 'Aba North',
        vaccines: {
          BCG: 9491,
          BOPV: 55000,
          HPV: 2791,
          HEPB: 8572,
          IPV: 13050,
          MEASLES: 13427,
          MENA: 10562,
          MR: 13427,
        },
        wards: [
          {
            id: 'ward-1',
            name: 'Ward 1',
            vaccines: {
              BCG: 1200,
              BOPV: 3890,
              HPV: 420,
              HEPB: 1100,
              IPV: 1680,
              MEASLES: 1740,
              MENA: 1320,
              MR: 1740,
            },
            facilities: [
              {
                id: 'gen-hosp',
                name: 'General Hospital',
                vaccines: { BCG: 40, BOPV: 40, HPV: 30, HEPB: 50, IPV: 50, MEASLES: 30, MENA: 20, MR: 40 },
              },
              {
                id: 'utughugwu-hc',
                name: 'Utughugwu HC',
                vaccines: { BCG: 100, BOPV: 160, HPV: 40, HEPB: 100, IPV: 80, MEASLES: 50, MENA: 20, MR: 40 },
              },
              {
                id: 'aro1-clinic',
                name: 'Aro1 Ward Clinic',
                vaccines: { BCG: 80, BOPV: 120, HPV: 25, HEPB: 75, IPV: 95, MEASLES: 88, MENA: 65, MR: 88 },
              },
              {
                id: 'phc',
                name: 'Primary Health Centre',
                vaccines: { BCG: 55, BOPV: 90, HPV: 18, HEPB: 60, IPV: 72, MEASLES: 65, MENA: 48, MR: 65 },
              },
            ],
          },
          {
            id: 'ward-2',
            name: 'Ward 2',
            vaccines: { BCG: 980, BOPV: 3200, HPV: 380, HEPB: 920, IPV: 1420, MEASLES: 1480, MENA: 1120, MR: 1480 },
          },
          {
            id: 'ward-3',
            name: 'Ward 3',
            vaccines: { BCG: 1450, BOPV: 4200, HPV: 510, HEPB: 1350, IPV: 2040, MEASLES: 2120, MENA: 1610, MR: 2120 },
          },
          {
            id: 'ward-4',
            name: 'Ward 4',
            vaccines: { BCG: 840, BOPV: 2780, HPV: 140, HEPB: 780, IPV: 1190, MEASLES: 1240, MENA: 940, MR: 1240 },
          },
          {
            id: 'ward-5',
            name: 'Ward 5',
            vaccines: { BCG: 1100, BOPV: 3560, HPV: 460, HEPB: 1020, IPV: 1560, MEASLES: 1620, MENA: 1230, MR: 1620 },
          },
          {
            id: 'ward-6',
            name: 'Ward 6',
            vaccines: { BCG: 920, BOPV: 3140, HPV: 390, HEPB: 950, IPV: 1450, MEASLES: 1510, MENA: 1150, MR: 1510 },
          },
        ],
      },
      {
        id: 'aba-south',
        name: 'Aba South',
        vaccines: {
          BCG: 7860,
          BOPV: 22173,
          HPV: 2311,
          HEPB: 7099,
          IPV: 10808,
          MEASLES: 11120,
          MENA: 8748,
          MR: 11120,
        },
      },
      {
        id: 'arochukwu',
        name: 'Arochukwu',
        vaccines: {
          BCG: 4173,
          BOPV: 11773,
          HPV: 1227,
          HEPB: 3769,
          IPV: 5738,
          MEASLES: 5904,
          MENA: 4644,
          MR: 5904,
        },
      },
      {
        id: 'isiala-ngwa-north',
        name: 'Isiala Ngwa North',
        vaccines: {
          BCG: 5286,
          BOPV: 14912,
          HPV: 1554,
          HEPB: 4774,
          IPV: 7269,
          MEASLES: 7479,
          MENA: 5883,
          MR: 7479,
        },
      },
      {
        id: 'umuahia-north',
        name: 'Umuahia North',
        vaccines: {
          BCG: 6040,
          BOPV: 17039,
          HPV: 1777,
          HEPB: 5456,
          IPV: 8305,
          MEASLES: 8545,
          MENA: 6723,
          MR: 8545,
        },
      },
    ],
  },
  {
    id: 'adamawa',
    name: 'Adamawa',
    vaccines: {
      BCG: 158180,
      BOPV: 206190,
      HPV: 40216,
      HEPB: 84520,
      IPV: 98360,
      MEASLES: 122050,
      MENA: 113410,
      MR: 0,
    },
  },
  {
    id: 'akwa-ibom',
    name: 'Akwa Ibom',
    vaccines: {
      BCG: 211011,
      BOPV: 278169,
      HPV: 54623,
      HEPB: 126153,
      IPV: 173065,
      MEASLES: 199723,
      MENA: 156490,
      MR: 185669,
    },
  },
  {
    id: 'anambra',
    name: 'Anambra',
    vaccines: {
      BCG: 298205,
      BOPV: 407508,
      HPV: 84105,
      HEPB: 180013,
      IPV: 255474,
      MEASLES: 282081,
      MENA: 223896,
      MR: 272121,
    },
  },
  {
    id: 'bauchi',
    name: 'Bauchi',
    vaccines: {
      BCG: 402214,
      BOPV: 501002,
      HPV: 90092,
      HEPB: 216456,
      IPV: 295940,
      MEASLES: 341282,
      MENA: 262803,
      MR: 312137,
    },
  },
  {
    id: 'bayelsa',
    name: 'Bayelsa',
    vaccines: {
      BCG: 45390,
      BOPV: 52995,
      HPV: 8382,
      HEPB: 17895,
      IPV: 33538,
      MEASLES: 33820,
      MENA: 30314,
      MR: 36135,
    },
  },
  {
    id: 'benue',
    name: 'Benue',
    vaccines: {
      BCG: 288144,
      BOPV: 341389,
      HPV: 52882,
      HEPB: 136085,
      IPV: 191102,
      MEASLES: 220771,
      MENA: 160609,
      MR: 211710,
    },
  },
  {
    id: 'borno',
    name: 'Borno',
    vaccines: {
      BCG: 265374,
      BOPV: 367574,
      HPV: 0,
      HEPB: 172464,
      IPV: 174269,
      MEASLES: 262235,
      MENA: 206309,
      MR: 0,
    },
  },
  {
    id: 'delta',
    name: 'Delta',
    vaccines: {
      BCG: 329740,
      BOPV: 385431,
      HPV: 62971,
      HEPB: 151064,
      IPV: 219933,
      MEASLES: 326661,
      MENA: 263611,
      MR: 234502,
    },
  },
  {
    id: 'ebonyi',
    name: 'Ebonyi',
    vaccines: {
      BCG: 183233,
      BOPV: 249561,
      HPV: 51975,
      HEPB: 112250,
      IPV: 157596,
      MEASLES: 171094,
      MENA: 136058,
      MR: 165690,
    },
  },
  {
    id: 'enugu',
    name: 'Enugu',
    vaccines: {
      BCG: 205855,
      BOPV: 248886,
      HPV: 46158,
      HEPB: 110865,
      IPV: 151565,
      MEASLES: 173164,
      MENA: 133803,
      MR: 160660,
    },
  },
  {
    id: 'fct-abuja',
    name: 'FCT Abuja',
    vaccines: {
      BCG: 245310,
      BOPV: 343159,
      HPV: 72994,
      HEPB: 113417,
      IPV: 159644,
      MEASLES: 190633,
      MENA: 140374,
      MR: 174295,
    },
  },
  {
    id: 'kaduna',
    name: 'Kaduna',
    vaccines: {
      BCG: 467780,
      BOPV: 592730,
      HPV: 205191,
      HEPB: 113417,
      IPV: 312924,
      MEASLES: 319500,
      MENA: 298860,
      MR: 324120,
    },
  },
  {
    id: 'kano',
    name: 'Kano',
    vaccines: {
      BCG: 794813,
      BOPV: 1016903,
      HPV: 190990,
      HEPB: 430708,
      IPV: 621134,
      MEASLES: 696702,
      MENA: 546278,
      MR: 643766,
    },
  },
  {
    id: 'katsina',
    name: 'Katsina',
    vaccines: {
      BCG: 464142,
      BOPV: 610415,
      HPV: 119455,
      HEPB: 276329,
      IPV: 379228,
      MEASLES: 437862,
      MENA: 342767,
      MR: 406949,
    },
  },
  {
    id: 'lagos',
    name: 'Lagos',
    vaccines: {
      BCG: 885994,
      BOPV: 1065363,
      HPV: 183404,
      HEPB: 424037,
      IPV: 620542,
      MEASLES: 706515,
      MENA: 537103,
      MR: 645776,
    },
  },
  {
    id: 'niger',
    name: 'Niger',
    vaccines: {
      BCG: 405320,
      BOPV: 535866,
      HPV: 105665,
      HEPB: 243557,
      IPV: 333977,
      MEASLES: 385181,
      MENA: 302137,
      MR: 358185,
    },
  },
  {
    id: 'ogun',
    name: 'Ogun',
    vaccines: {
      BCG: 275316,
      BOPV: 348130,
      HPV: 65188,
      HEPB: 145858,
      IPV: 213136,
      MEASLES: 239314,
      MENA: 186133,
      MR: 219902,
    },
  },
  {
    id: 'plateau',
    name: 'Plateau',
    vaccines: {
      BCG: 181180,
      BOPV: 225260,
      HPV: 42772,
      HEPB: 84500,
      IPV: 110908,
      MEASLES: 127340,
      MENA: 110998,
      MR: 127340,
    },
  },
  {
    id: 'rivers',
    name: 'Rivers',
    vaccines: {
      BCG: 424385,
      BOPV: 0,
      HPV: 111955,
      HEPB: 246602,
      IPV: 352435,
      MEASLES: 392787,
      MENA: 312469,
      MR: 364522,
    },
  },
  {
    id: 'sokoto',
    name: 'Sokoto',
    vaccines: {
      BCG: 309014,
      BOPV: 416052,
      HPV: 85340,
      HEPB: 193655,
      IPV: 264583,
      MEASLES: 296403,
      MENA: 236712,
      MR: 277029,
    },
  },
  {
    id: 'yobe',
    name: 'Yobe',
    vaccines: {
      BCG: 0,
      BOPV: 241919,
      HPV: 50530,
      HEPB: 112600,
      IPV: 155048,
      MEASLES: 133130,
      MENA: 140433,
      MR: 0,
    },
  },
  {
    id: 'zamfara',
    name: 'Zamfara',
    vaccines: {
      BCG: 296778,
      BOPV: 343433,
      HPV: 53904,
      HEPB: 138762,
      IPV: 201446,
      MEASLES: 225628,
      MENA: 237278,
      MR: 213397,
    },
  },
];

export function getStockStatus(code: string, doses: number): { status: StockStatus; percentage: number } {
  if (doses === 0) {
    return { status: 'out_of_stock', percentage: 0 };
  }
  
  const vaccineInfo = VACCINE_INFO_MAP[code];
  if (!vaccineInfo) {
    return { status: 'adequate', percentage: 75 };
  }

  // Calculate percentage relative to the min target to give a realistic look
  const percentage = Math.min(Math.round((doses / vaccineInfo.targetMin) * 100), 150);

  if (percentage <= 0) return { status: 'out_of_stock', percentage };
  if (percentage <= 25) return { status: 'below_min', percentage };
  if (percentage <= 49) return { status: 'reorder', percentage };
  if (percentage <= 124) return { status: 'adequate', percentage };
  return { status: 'overstock', percentage };
}

export function getStatusDetails(status: StockStatus): {
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
} {
  switch (status) {
    case 'out_of_stock':
      return {
        label: 'Out of Stock (0%)',
        colorClass: 'text-red-600',
        bgClass: 'bg-red-50 hover:bg-red-100',
        borderClass: 'border-red-200',
      };
    case 'below_min':
      return {
        label: 'Below Minimum Stock (1-25%)',
        colorClass: 'text-amber-600',
        bgClass: 'bg-amber-50 hover:bg-amber-100',
        borderClass: 'border-amber-200',
      };
    case 'reorder':
      return {
        label: 'Re-order Level (26-49%)',
        colorClass: 'text-yellow-600',
        bgClass: 'bg-yellow-50 hover:bg-yellow-100',
        borderClass: 'border-yellow-200',
      };
    case 'adequate':
      return {
        label: 'Stock Adequate (50-124%)',
        colorClass: 'text-emerald-600',
        bgClass: 'bg-emerald-50 hover:bg-emerald-100',
        borderClass: 'border-emerald-200',
      };
    case 'overstock':
      return {
        label: 'Over Stock (≥125%)',
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-50 hover:bg-blue-100',
        borderClass: 'border-blue-200',
      };
  }
}

// Exact values from screenshot overrides
const EXACT_OVERRIDES: Record<string, Record<string, number>> = {
  abia: { PCV: 28400, PENTA: 41200, ROTA: 39800, TD: 18600, YF: 22100 },
  'aba-north': { PCV: 17892, PENTA: 18930, ROTA: 15390, TD: 13420, YF: 10592 },
  'ward-1': { PCV: 2310, PENTA: 2450, ROTA: 1980, TD: 1720, YF: 1350 },
  'gen-hosp': { PCV: 55, PENTA: 60, ROTA: 48, TD: 42, YF: 33 },
  'utughugwu-hc': { PCV: 110, PENTA: 120, ROTA: 95, TD: 85, YF: 68 },
  'aro1-clinic': { PCV: 95, PENTA: 102, ROTA: 82, TD: 71, YF: 56 },
  phc: { PCV: 72, PENTA: 78, ROTA: 62, TD: 54, YF: 43 },
  'ward-2': { PCV: 1960, PENTA: 2080, ROTA: 1690, TD: 1460, YF: 1150 },
  'ward-3': { PCV: 2830, PENTA: 2990, ROTA: 2430, TD: 2100, YF: 1650 },
  'ward-4': { PCV: 1650, PENTA: 1750, ROTA: 1420, TD: 1230, YF: 970 },
  'ward-5': { PCV: 2160, PENTA: 2290, ROTA: 1860, TD: 1600, YF: 1260 },
  'ward-6': { PCV: 2010, PENTA: 2130, ROTA: 1730, TD: 1490, YF: 1180 },
  'aba-south': { PCV: 14830, PENTA: 15640, ROTA: 12740, TD: 11120, YF: 8740 },
  arochukwu: { PCV: 7870, PENTA: 8310, ROTA: 6760, TD: 5910, YF: 4640 },
  'isiala-ngwa-north': { PCV: 9970, PENTA: 10520, ROTA: 8560, TD: 7480, YF: 5880 },
  'umuahia-north': { PCV: 11390, PENTA: 12020, ROTA: 9780, TD: 8545, YF: 6716 },
  adamawa: { PCV: 139000, PENTA: 201500, ROTA: 194000, TD: 91000, YF: 108000 },
  'akwa-ibom': { PCV: 185000, PENTA: 268000, ROTA: 258000, TD: 121000, YF: 144000 },
  anambra: { PCV: 261000, PENTA: 378000, ROTA: 364000, TD: 171000, YF: 203000 },
  bauchi: { PCV: 352000, PENTA: 510000, ROTA: 491000, TD: 230000, YF: 273000 },
  bayelsa: { PCV: 39700, PENTA: 57500, ROTA: 55400, TD: 26000, YF: 30900 },
  benue: { PCV: 252000, PENTA: 365000, ROTA: 352000, TD: 165000, YF: 196000 },
  borno: { PCV: 232000, PENTA: 336000, ROTA: 0, TD: 152000, YF: 181000 },
};

// Auto backfill function for missing vaccines
const enrichVaccineData = (vaccines: Record<string, number>) => {
  const base = vaccines.BCG !== undefined ? vaccines.BCG : 1000;
  
  if (vaccines.PCV === undefined) {
    vaccines.PCV = base > 0 ? Math.round(base * 0.86) : 0;
  }
  if (vaccines.PENTA === undefined) {
    vaccines.PENTA = base > 0 ? Math.round(base * 1.25) : 0;
  }
  if (vaccines.ROTA === undefined) {
    vaccines.ROTA = base > 0 ? Math.round(base * 1.21) : 0;
  }
  if (vaccines.TD === undefined) {
    vaccines.TD = base > 0 ? Math.round(base * 0.56) : 0;
  }
  if (vaccines.YF === undefined) {
    vaccines.YF = base > 0 ? Math.round(base * 0.67) : 0;
  }
};

// Run mutation on module import to expand original data set
INITIAL_STATES_DATA.forEach(state => {
  // 1. State Level
  const stateOverrides = EXACT_OVERRIDES[state.id];
  if (stateOverrides) {
    Object.assign(state.vaccines, stateOverrides);
  } else {
    enrichVaccineData(state.vaccines);
  }

  // 2. LGA Level
  if (state.lgas) {
    state.lgas.forEach(lga => {
      const lgaOverrides = EXACT_OVERRIDES[lga.id];
      if (lgaOverrides) {
        Object.assign(lga.vaccines, lgaOverrides);
      } else {
        enrichVaccineData(lga.vaccines);
      }

      // 3. Ward Level
      if (lga.wards) {
        lga.wards.forEach(ward => {
          const wardOverrides = EXACT_OVERRIDES[ward.id];
          if (wardOverrides) {
            Object.assign(ward.vaccines, wardOverrides);
          } else {
            enrichVaccineData(ward.vaccines);
          }

          // 4. Facility Level
          if (ward.facilities) {
            ward.facilities.forEach(facility => {
              const facOverrides = EXACT_OVERRIDES[facility.id];
              if (facOverrides) {
                Object.assign(facility.vaccines, facOverrides);
              } else {
                enrichVaccineData(facility.vaccines);
              }
            });
          }
        });
      }
    });
  }
});
