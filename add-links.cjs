const fs = require('fs');

function addLinks(file, linksStr) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/(<LayoutDashboard className="h-4 w-4" \/> Overview\n\s*<\/Link>)/, '\$1\n' + linksStr);
  fs.writeFileSync(file, content);
}

addLinks('src/routes/leasing.tsx', 
  '          <Link to="/leasing/manage" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"><FileSignature className="h-4 w-4" /> Manage Leases</Link>\n' +
  '          <Link to="/leasing/create" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"><PlusCircle className="h-4 w-4" /> Create Lease</Link>'
);

let leasing = fs.readFileSync('src/routes/leasing.tsx', 'utf8');
leasing = leasing.replace(/LayoutDashboard, LogOut, Briefcase/, 'LayoutDashboard, LogOut, Briefcase, FileSignature, PlusCircle');
fs.writeFileSync('src/routes/leasing.tsx', leasing);

addLinks('src/routes/finance.tsx', 
  '          <Link to="/finance/ledger" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"><BookOpen className="h-4 w-4" /> General Ledger</Link>\n' +
  '          <Link to="/finance/journal" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"><FileText className="h-4 w-4" /> Journal Entries</Link>\n' +
  '          <Link to="/finance/receivables" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"><Wallet className="h-4 w-4" /> Receivables</Link>'
);

let finance = fs.readFileSync('src/routes/finance.tsx', 'utf8');
finance = finance.replace(/LayoutDashboard, LogOut, DollarSign/, 'LayoutDashboard, LogOut, DollarSign, BookOpen, FileText, Wallet');
fs.writeFileSync('src/routes/finance.tsx', finance);

addLinks('src/routes/cashier.tsx', 
  '          <Link to="/cashier/receipts" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"><Receipt className="h-4 w-4" /> Receipts & Refunds</Link>\n' +
  '          <Link to="/cashier/pdc" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"><CreditCard className="h-4 w-4" /> PDC Management</Link>'
);

let cashier = fs.readFileSync('src/routes/cashier.tsx', 'utf8');
cashier = cashier.replace(/LayoutDashboard, LogOut, CreditCard/, 'LayoutDashboard, LogOut, CreditCard, Receipt');
fs.writeFileSync('src/routes/cashier.tsx', cashier);

addLinks('src/routes/maintenance.tsx', 
  '          <Link to="/maintenance/tickets" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"><Ticket className="h-4 w-4" /> Tickets</Link>\n' +
  '          <Link to="/maintenance/inventory" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"><Box className="h-4 w-4" /> Inventory</Link>'
);

let maintenance = fs.readFileSync('src/routes/maintenance.tsx', 'utf8');
maintenance = maintenance.replace(/LayoutDashboard, LogOut, Wrench/, 'LayoutDashboard, LogOut, Wrench, Ticket, Box');
fs.writeFileSync('src/routes/maintenance.tsx', maintenance);
