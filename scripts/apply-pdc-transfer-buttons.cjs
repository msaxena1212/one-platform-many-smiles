const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.resolve(__dirname, '../src/components/finance/pdc-management.tsx'),
  path.resolve(__dirname, '../../src/components/finance/pdc-management.tsx'),
];

for (const targetPath of targetFiles) {
  if (!fs.existsSync(targetPath)) continue;

  let content = fs.readFileSync(targetPath, 'utf8');

  // 1. In Hand replacement
  const oldInHand = `<Button size="sm" variant="outline" className="h-6 text-xs px-2 border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => openCashModal(pdc)}>
                                        <Banknote className="h-3 w-3 mr-1" /> Cash
                                      </Button>`;

  const newInHand = `<Button size="sm" variant="outline" className="h-6 text-xs px-2 border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => openCashModal(pdc)}>
                                        <Banknote className="h-3 w-3 mr-1" /> Cash
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-6 text-xs px-2 border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => openBankTransferModal(pdc)}>
                                        <ArrowRightLeft className="h-3 w-3 mr-1" /> Transfer
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-6 text-xs px-2 border-rose-300 text-rose-700 hover:bg-rose-50" onClick={() => openGlConfirm(pdc, "cancel")}>
                                        <XCircle className="h-3 w-3 mr-1" /> Cancel
                                      </Button>`;

  // 2. Partial Cash replacement
  const oldPartial = `<Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs px-2 border-purple-400 bg-purple-50/50 text-purple-700 hover:bg-purple-100"
                                      onClick={() => openCashModal(pdc)}
                                    >
                                      <Banknote className="h-3 w-3 mr-1" /> Pay Cash
                                    </Button>`;

  const newPartial = `<Button
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
                                    </Button>`;

  // 3. Returned replacement
  const oldReturned = `<Button size="sm" variant="outline" className="h-6 text-xs border-purple-300 text-purple-700 hover:bg-purple-50 px-2" disabled={actionLoading} onClick={() => openCashModal(pdc)}>
                                        <Banknote className="h-3 w-3 mr-1" /> Cash
                                      </Button>`;

  const newReturned = `<Button size="sm" variant="outline" className="h-6 text-xs border-purple-300 text-purple-700 hover:bg-purple-50 px-2" disabled={actionLoading} onClick={() => openCashModal(pdc)}>
                                        <Banknote className="h-3 w-3 mr-1" /> Cash
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-6 text-xs border-blue-300 text-blue-700 hover:bg-blue-50 px-2" disabled={actionLoading} onClick={() => openBankTransferModal(pdc)}>
                                        <ArrowRightLeft className="h-3 w-3 mr-1" /> Transfer
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-6 text-xs border-rose-300 text-rose-700 hover:bg-rose-50 px-2" disabled={actionLoading} onClick={() => openGlConfirm(pdc, "cancel")}>
                                        <XCircle className="h-3 w-3 mr-1" /> Cancel
                                      </Button>`;

  // Standardize \r\n to match content
  const normalize = (s) => s.replace(/\r\n/g, '\n');
  const fileIsCRLF = content.includes('\r\n');
  let normContent = normalize(content);

  normContent = normContent.replace(normalize(oldInHand), normalize(newInHand));
  normContent = normContent.replace(normalize(oldPartial), normalize(newPartial));
  normContent = normContent.replace(normalize(oldReturned), normalize(newReturned));

  if (fileIsCRLF) {
    normContent = normContent.replace(/\n/g, '\r\n');
  }

  fs.writeFileSync(targetPath, normContent, 'utf8');
  console.log('Successfully updated:', targetPath);
}
