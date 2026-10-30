const xlsx = require('xlsx');
const wb = xlsx.readFile('Documents/New Documents/All_Leases_2026-10-15.xlsx');
const data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

const userRefs = [
  "L-OS4026", "L-OS4036", "L-OS4044", "L-MN31303", "L-PQ50106", "L-PQ50401", "L-PQ50503", "L-PQ50605",
  "L-OS4053", "L-MN31401", "L-PQ50504", "L-BO6113", "L-OS4106", "L-OS4116", "L-MN31402", "L-PQ50505",
  "L-BO6104", "L-BO6124", "L-BO6131", "L-OS4127", "L-MN31101", "L-MN31102", "L-MN31403", "L-PQ50201",
  "L-OS4074", "L-OS4118", "L-BO6010", "L-MN31501", "L-PQ50303", "L-PQ50405", "L-OS4109", "L-OS4119",
  "L-MN31103", "L-OS4110", "L-OS4120", "L-BO6117", "L-MN3002", "L-MN31201", "L-MN31502", "L-PQ50304",
  "L-PQ50305", "L-BO6003", "L-MN31202", "L-MN31503", "L-MN3014", "L-PQ50306", "L-MN3100", "L-OS4102",
  "L-MN3004", "L-MN31203", "L-PQ50104", "L-PQ50205", "L-OS4113", "L-MN31301", "L-BO6138", "L-PQ50105",
  "L-BO6139", "L-BO6141", "L-BO6142", "L-MS8020", "L-BK9607", "L-BK9608", "L-BK9617", "L-BK9618",
  "L-OA2205", "L-OA2301", "L-OA2103", "L-OA2402", "L-OA2504", "L-OA2512", "L-MS8016", "L-MS8026",
  "L-BK9614", "L-OA2307", "L-OA2408", "L-MS8021", "L-BK9609", "L-BK9620", "L-OA2302", "L-SD7018",
  "L-OA2403", "L-BK9611", "L-BK9622", "L-OA2304", "L-OA2005", "L-BO6147", "L-OA2507", "L-BK9601",
  "L-OA26V23", "L-BK9610", "L-BK9621", "L-OA2411", "L-MS8022", "L-BK9613", "L-OA2407", "L-BK9603",
  "L-BK9602", "L-OA2413", "L-BK9612", "L-BK9623", "L-SD7014", "L-MG9001", "L-MG9011", "L-MS8027",
  "L-BK9604", "L-OA2203", "L-OA2308", "L-OA2101", "L-OA2501", "L-OA2511", "L-MS8007", "L-BK9615",
  "L-MS8008", "L-OA2204", "L-OA2102", "L-WK9508", "L-BK9605", "L-BK9616", "L-SD7016", "L-OS4114",
  "L-OA2513", "L-OS40GF1", "L-OS4035", "L-MN31302", "L-MS8030", "L-OA2104"
];

console.log('User refs count:', userRefs.length);

const refMap = new Map();
data.forEach(r => refMap.set(r.Ref, r));

let found = 0;
let notFound = 0;
const endDates = [];

userRefs.forEach(ref => {
  const r = refMap.get(ref);
  if (r) {
    found++;
    endDates.push({ ref, end: r['End Date'], start: r['Start Date'], tenant: r['Tenant Name'], unit: r['Unit'] });
  } else {
    notFound++;
    console.log('Not found in excel:', ref);
  }
});
console.log('Found:', found, 'NotFound:', notFound);

// Check min and max end dates
const parsedDates = endDates.map(e => {
  const parts = e.end.split('/');
  return { ...e, dateObj: new Date(parts[2], parts[1]-1, parts[0]) };
});
parsedDates.sort((a,b) => a.dateObj - b.dateObj);
console.log('Min end date in list:', parsedDates[0].end, 'for ref:', parsedDates[0].ref);
console.log('Max end date in list:', parsedDates[parsedDates.length-1].end, 'for ref:', parsedDates[parsedDates.length-1].ref);

// Distribution of end dates
const dateFreq = {};
parsedDates.forEach(p => {
  dateFreq[p.end] = (dateFreq[p.end] || 0) + 1;
});
console.log('Date frequencies for the 126 leases:', dateFreq);

// Compare against ALL 377 leases in excel
console.log('\n--- ALL 377 LEASES DATE DISTRIBUTION ---');
const allDates = data.map(r => {
  const parts = (r['End Date'] || '').split('/');
  return { ref: r.Ref, end: r['End Date'], dateObj: new Date(parts[2], parts[1]-1, parts[0]) };
});
allDates.sort((a,b) => a.dateObj - b.dateObj);
console.log('Overall min end date:', allDates[0].end, 'max:', allDates[allDates.length-1].end);

// Group all 377 by month/year or check which ones have end date <= some threshold
const today = new Date(2026, 9, 15); // 2026-10-15
console.log('Today is assumed 2026-10-15');
const expiredCount = allDates.filter(d => d.dateObj < today).length;
console.log('Leases with End Date < 2026-10-15 (expired):', expiredCount);

// Check 60 days from 2026-10-15
const d60 = new Date(2026, 9, 15);
d60.setDate(d60.getDate() + 60);
console.log('60 days from 2026-10-15 is:', d60.toISOString().split('T')[0]);

const expiringIn60 = allDates.filter(d => d.dateObj >= today && d.dateObj <= d60).length;
console.log('Leases expiring between 2026-10-15 and 60 days later:', expiringIn60);

// Expired + expiring in 60 days:
const expiredPlusExpiring60 = allDates.filter(d => d.dateObj <= d60).length;
console.log('Leases with End Date <= 60 days from today (including expired!):', expiredPlusExpiring60);

// Check how many of the 126 are expired vs expiring in 60
const userRefsExpired = parsedDates.filter(d => d.dateObj < today).length;
const userRefsExpiring60 = parsedDates.filter(d => d.dateObj >= today && d.dateObj <= d60).length;
console.log('User 126 refs: Expired (< 2026-10-15):', userRefsExpired);
console.log('User 126 refs: Expiring in 60 days (>= 2026-10-15 and <= 60d):', userRefsExpiring60);
console.log('User 126 refs sum:', userRefsExpired + userRefsExpiring60);
