const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.resolve(__dirname, '../src/components/finance/pdc-management.tsx'),
  path.resolve(__dirname, '../../src/components/finance/pdc-management.tsx'),
];

for (const f of targetFiles) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  
  const searchPattern = /{pdc\.status === "Partial Cash" && \(\s*<Button[\s\S]*?Transfer\s*<\/Button>\s*\)}/;
  const replacement = `{pdc.status === "Partial Cash" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-xs px-2 border-purple-400 bg-purple-50/50 text-purple-700 hover:bg-purple-100"
                                        onClick={() => openCashModal(pdc)}
                                      >
                                        <Banknote className="h-3 w-3 mr-1" /> Pay Cash
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-xs px-2 border-blue-400 bg-blue-50/50 text-blue-700 hover:bg-blue-100"
                                        onClick={() => openBankTransferModal(pdc)}
                                      >
                                        <ArrowRightLeft className="h-3 w-3 mr-1" /> Transfer
                                      </Button>
                                    </>
                                  )}`;

  if (searchPattern.test(c)) {
    c = c.replace(searchPattern, replacement);
    fs.writeFileSync(f, c, 'utf8');
    console.log('Successfully fixed fragment in:', f);
  } else {
    console.log('Pattern not matched in:', f);
  }
}
