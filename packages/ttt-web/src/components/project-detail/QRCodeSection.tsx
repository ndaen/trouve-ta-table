import type {Project} from "@/types/project.types.ts";
import Button from "@/components/ui/buttons/Button.tsx";
import {DynamicIcon} from "lucide-react/dynamic";

interface QRCodeSectionProps {
    project: Project;
    qrScans: number;
}

export default function QRCodeSection({project, qrScans}: QRCodeSectionProps) {
    const hasQRCode = Boolean(project.qrCodeUrl);
    const qrCodeUrl = project.qrCodeUrl || generateQRUrl(project.id);

    function generateQRUrl(projectId: string): string {
        return `${window.location.origin}/search?project=${projectId}`;
    }

    const handleGenerateQR = () => {
        // TODO: Implement QR code generation and save to project
    };

    const handleDownloadQR = () => {
        // TODO: Implement QR code download
    };

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(qrCodeUrl);
            // TODO: Show toast notification
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    const handleRegenerateQR = () => {
        // TODO: Implement QR code regeneration
    };

    return (
        <div className="qr-section">
            <div className="qr-container">
                <div className="qr-code-placeholder">
                    <div className="text-center">
                        <DynamicIcon name="qr-code" size={48} className="text-muted mb-2"/>
                        <p className="text-sm">{hasQRCode ? 'QR Code généré' : 'QR Code à générer'}</p>
                    </div>
                </div>

                <div className="qr-content">
                    <h3 className="qr-title">Code QR pour la recherche de table</h3>
                    <p className="qr-description">
                        Partagez ce QR code avec vos invités pour qu'ils puissent facilement
                        trouver leur table assignée. Le QR code les redirigera vers une page
                        de recherche où ils pourront entrer leur nom.
                    </p>

                    {hasQRCode && (
                        <div className="qr-stats">
                            <DynamicIcon name="scan-line" size={16}/>
                            <span>{qrScans} scan(s) effectué(s)</span>
                        </div>
                    )}

                    <div className="qr-actions">
                        {hasQRCode ? (
                            <>
                                <Button
                                    variant="btn-primary"
                                    size="sm"
                                    onClick={handleDownloadQR}
                                    aria-label="Télécharger le QR code"
                                >
                                    <DynamicIcon name="download" size={16}/>
                                    Télécharger
                                </Button>
                                <Button
                                    variant="btn-outline"
                                    size="sm"
                                    onClick={handleCopyUrl}
                                    aria-label="Copier le lien de recherche"
                                >
                                    <DynamicIcon name="copy" size={16}/>
                                    Copier le lien
                                </Button>
                                <Button
                                    variant="btn-outline"
                                    size="sm"
                                    onClick={handleRegenerateQR}
                                    aria-label="Régénérer le QR code"
                                >
                                    <DynamicIcon name="refresh-cw" size={16}/>
                                    Régénérer
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="btn-primary"
                                size="default"
                                onClick={handleGenerateQR}
                                aria-label="Générer le QR code"
                            >
                                <DynamicIcon name="plus" size={16}/>
                                Générer le QR code
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {hasQRCode && (
                <>
                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">Instructions pour vos invités</h4>
                        <div className="instruction-box">
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                                <li>Scannez le QR code avec l'appareil photo de votre téléphone</li>
                                <li>Vous serez redirigé vers la page de recherche</li>
                                <li>Entrez votre nom et prénom</li>
                                <li>Votre numéro de table s'affichera instantanément</li>
                            </ol>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">URL de recherche</h4>
                        <div className="url-display">
                            <code className="url-code">{qrCodeUrl}</code>
                            <Button
                                variant="btn-outline"
                                size="sm"
                                onClick={handleCopyUrl}
                                aria-label="Copier l'URL de recherche"
                            >
                                <DynamicIcon name="copy" size={14}/>
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}