"use client"

import { User, ChevronDown, ChevronUp, Image, ImageOff, Info } from "lucide-react"
import { TicketComment, Ticket, CommentFile } from "@/types/ticket"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { applyEmailStyles, applyEmailStylesWithImages, analyzeEmailImages } from "@/lib/html-utils"

interface TicketConversationProps {
    ticket: Ticket
    comments: TicketComment[]
    loading: boolean
}

export function TicketConversation({ ticket, comments, loading }: TicketConversationProps) {
    const [showHistory, setShowHistory] = useState(true)
    const [showImages, setShowImages] = useState(false)
    
    // Analizar imágenes en el contenido
    const imageAnalysis = useMemo(() => {
        const ticketImages = analyzeEmailImages(ticket.description || ticket.summary || '');
        
        // Contar archivos directos del ticket
        const ticketFiles = ticket.file?.filter(file => file.file_type?.startsWith('image/')) || [];
        
        // Contar archivos adjuntos de comentarios
        const commentFiles = comments.reduce((acc, comment) => {
            const commentFileImages = comment.comments_files?.filter(
                (cf: CommentFile) => cf.file?.file_type?.startsWith('image/')
            ) || [];
            return acc + commentFileImages.length;
        }, 0);
        
        const commentImages = comments.reduce((acc, comment) => {
            const analysis = analyzeEmailImages(comment.body || '');
            return {
                totalImages: acc.totalImages + analysis.totalImages,
                base64Images: acc.base64Images + analysis.base64Images,
                externalImages: acc.externalImages + analysis.externalImages,
                largeImages: acc.largeImages + analysis.largeImages,
                totalSizeKB: acc.totalSizeKB + analysis.totalSizeKB
            };
        }, { totalImages: 0, base64Images: 0, externalImages: 0, largeImages: 0, totalSizeKB: 0 });
        
        return {
            totalImages: ticketImages.totalImages + commentImages.totalImages + ticketFiles.length + commentFiles,
            base64Images: ticketImages.base64Images + commentImages.base64Images,
            externalImages: ticketImages.externalImages + commentImages.externalImages,
            largeImages: ticketImages.largeImages + commentImages.largeImages,
            totalSizeKB: ticketImages.totalSizeKB + commentImages.totalSizeKB
        };
    }, [ticket, comments])

    return (
        <div className="flex-1 flex flex-col border rounded-lg min-w-0">
            <div className="p-3 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-700 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Conversación del Ticket
                    </h3>
                    <div className="flex items-center gap-2">
                        {imageAnalysis.totalImages > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowImages(!showImages)}
                                className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                                title={
                                    showImages 
                                        ? "Ocultar imágenes" 
                                        : `Mostrar ${imageAnalysis.totalImages} imagen(es) - ${imageAnalysis.totalSizeKB > 0 ? `${imageAnalysis.totalSizeKB}KB` : 'Externas'}`
                                }
                            >
                                {showImages ? (
                                    <>
                                        <ImageOff className="h-4 w-4" />
                                        Ocultar ({imageAnalysis.totalImages})
                                    </>
                                ) : (
                                    <>
                                        <Image className="h-4 w-4" />
                                        Mostrar ({imageAnalysis.totalImages})
                                        {imageAnalysis.largeImages > 0 && (
                                            <span className="text-xs bg-amber-100 text-amber-800 px-1 rounded">
                                                {imageAnalysis.largeImages} grandes
                                            </span>
                                        )}
                                    </>
                                )}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                        >
                            {showHistory ? (
                                <>
                                    <ChevronUp className="h-4 w-4" />
                                    Ocultar historial
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                    Mostrar historial
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {showHistory && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="p-3 bg-blue-100 border-l-4 border-blue-400 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-blue-800">
                                ({ticket.end_user ? ticket.end_user : 'Usuario desconocido'})
                            </span>
                            <span className="text-xs text-gray-600">
                                {new Date(ticket.created_at).toLocaleString('es-ES')}
                            </span>
                        </div>
                        <div className="text-gray-800" dangerouslySetInnerHTML={{ 
                            __html: showImages 
                                ? applyEmailStylesWithImages(ticket.description || ticket.summary)
                                : applyEmailStyles(ticket.description || ticket.summary) 
                        }} />
                        
                        {/* Mostrar archivos directos del ticket */}
                        {ticket.file && ticket.file.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <span className="text-xs text-blue-700 block font-medium">
                                    {ticket.file.length} archivo(s) adjunto(s):
                                </span>
                                <div className="space-y-2">
                                    {ticket.file.map((file, index: number) => {
                                        // Verificar si es una imagen
                                        const isImage = file.file_type?.startsWith('image/');
                                        const fileId = file.id;
                                        const filename = file.filename || `archivo-${index + 1}`;
                                        
                                        if (isImage && showImages && fileId) {
                                            // Mostrar imagen desde el endpoint de descarga
                                            return (
                                                <div key={fileId} className="border rounded-lg p-2 bg-white">
                                                    <div className="text-xs text-gray-600 mb-2">{filename}</div>
                                                    <img 
                                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/files/${fileId}/download`}
                                                        alt={filename}
                                                        className="email-image max-w-xs h-auto rounded border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                                        style={{ maxHeight: '200px', maxWidth: '300px' }}
                                                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/files/${fileId}/download`, '_blank')}
                                                        onError={(e) => {
                                                            // Si falla la carga, mostrar placeholder
                                                            const img = e.target as HTMLImageElement;
                                                            img.style.display = 'none';
                                                            const placeholder = img.nextElementSibling as HTMLElement;
                                                            if (placeholder) placeholder.style.display = 'block';
                                                        }}
                                                    />
                                                    <div className="email-image-placeholder" style={{display: 'none'}}>
                                                        <span className="email-image-icon">🖼️</span>
                                                        <span className="email-image-text">Error al cargar: {filename}</span>
                                                        <a 
                                                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/files/${fileId}/download`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline text-xs"
                                                        >
                                                            Descargar archivo
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        } else if (isImage && !showImages) {
                                            // Mostrar placeholder para imagen cuando las imágenes están ocultas
                                            return (
                                                <div key={fileId} className="email-image-placeholder">
                                                    <span className="email-image-icon">🖼️</span>
                                                    <span className="email-image-text">Imagen: {filename}</span>
                                                    <span className="email-image-hint">Activa "Mostrar imágenes" para verla</span>
                                                </div>
                                            );
                                        } else {
                                            // Mostrar enlace para archivos no imagen
                                            return (
                                                <div key={fileId} className="flex items-center gap-2 p-2 bg-white rounded border">
                                                    <span className="text-sm">📎</span>
                                                    <span className="text-sm text-gray-700 flex-1">{filename}</span>
                                                    <a 
                                                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/files/${fileId}/download`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-xs"
                                                    >
                                                        Descargar
                                                    </a>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Conversacion */}
                    {loading ? (
                        <div className="text-center py-4">
                            <p className="text-gray-500">Cargando comentarios...</p>
                        </div>
                    ) : comments && comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="p-3 rounded-lg border-l-4 bg-green-100 border-green-400">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-green-800">
                                        {comment.users?.name && comment.users?.last_name 
                                            ? `${comment.users.name} ${comment.users.last_name}` 
                                            : comment.users?.email || 'Usuario desconocido'}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        {new Date(comment.created_at).toLocaleString('es-ES')}
                                    </span>
                                </div>
                                <div className="text-gray-800" dangerouslySetInnerHTML={{ 
                                    __html: showImages 
                                        ? applyEmailStylesWithImages(comment.body)
                                        : applyEmailStyles(comment.body) 
                                }} />
                                {comment.comments_files && comment.comments_files.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <span className="text-xs text-gray-500 block">
                                            {comment.comments_files.length} archivo(s) adjunto(s):
                                        </span>
                                        <div className="space-y-2">
                                            {comment.comments_files.map((commentFile: CommentFile, index: number) => {
                                                // Verificar si es una imagen
                                                const isImage = commentFile.file?.file_type?.startsWith('image/');
                                                const fileId = commentFile.file?.id;
                                                const filename = commentFile.file?.filename || `archivo-${index + 1}`;
                                                
                                                if (isImage && showImages && fileId) {
                                                    // Mostrar imagen desde el endpoint de descarga
                                                    return (
                                                        <div key={commentFile.id || index} className="border rounded-lg p-2">
                                                            <div className="text-xs text-gray-600 mb-2">{filename}</div>
                                                            <img 
                                                                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/files/${fileId}/download`}
                                                                alt={filename}
                                                                className="email-image max-w-xs h-auto rounded border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                                                style={{ maxHeight: '200px', maxWidth: '300px' }}
                                                                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/files/${fileId}/download`, '_blank')}
                                                                onError={(e) => {
                                                                    // Si falla la carga, mostrar placeholder
                                                                    const img = e.target as HTMLImageElement;
                                                                    img.style.display = 'none';
                                                                    const placeholder = img.nextElementSibling as HTMLElement;
                                                                    if (placeholder) placeholder.style.display = 'block';
                                                                }}
                                                            />
                                                            <div className="email-image-placeholder" style={{display: 'none'}}>
                                                                <span className="email-image-icon">🖼️</span>
                                                                <span className="email-image-text">Error al cargar: {filename}</span>
                                                                <a 
                                                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/files/${fileId}/download`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline text-xs"
                                                                >
                                                                    Descargar archivo
                                                                </a>
                                                            </div>
                                                        </div>
                                                    );
                                                } else if (isImage && !showImages) {
                                                    // Mostrar placeholder para imagen cuando las imágenes están ocultas
                                                    return (
                                                        <div key={commentFile.id || index} className="email-image-placeholder">
                                                            <span className="email-image-icon">🖼️</span>
                                                            <span className="email-image-text">Imagen: {filename}</span>
                                                            <span className="email-image-hint">Activa "Mostrar imágenes" para verla</span>
                                                        </div>
                                                    );
                                                } else {
                                                    // Mostrar enlace para archivos no imagen
                                                    return (
                                                        <div key={commentFile.id || index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                                            <span className="text-sm">📎</span>
                                                            <span className="text-sm text-gray-700 flex-1">{filename}</span>
                                                            {fileId && (
                                                                <a 
                                                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/files/${fileId}/download`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline text-xs"
                                                                >
                                                                    Descargar
                                                                </a>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            <p>No hay comentarios adicionales</p>
                        </div>
                    )}
                </div>
            )}
            
            {!showHistory && (
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Historial de conversación oculto</p>
                        <p className="text-sm">Haz clic en "Mostrar historial" para ver los comentarios</p>
                    </div>
                </div>
            )}
        </div>
    )
}