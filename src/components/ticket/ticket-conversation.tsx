"use client"

import { User, ChevronDown, ChevronUp, Image, ImageOff, Info } from "lucide-react"
import { TicketComment, Ticket, CommentFile } from "@/types/ticket"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { applyEmailStyles, applyEmailStylesWithImages, analyzeEmailImages } from "@/lib/html-utils"
import { AuthenticatedImage } from "./AuthenticatedImage"
import { downloadAuthenticatedFile } from "@/lib/file-utils"

interface TicketConversationProps {
    ticket: Ticket
    comments: TicketComment[]
    loading: boolean
}

interface ImageFile {
    id: number
    filename: string
    file_type?: string
}

/**
 * Renderiza imágenes en un grid 2x2
 */
function renderImageGrid(
    images: ImageFile[],
    showImages: boolean,
    onImageClick: (fileId: number, filename: string) => void
) {
    if (!showImages || images.length === 0) {
        return null
    }

    return (
        <div className="grid grid-cols-2 gap-2">
            {images.map((image) => (
                <div
                    key={image.id}
                    className="relative group border rounded-lg overflow-hidden bg-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    style={{ height: '120px' }}
                    onClick={() => onImageClick(image.id, image.filename)}
                    title={image.filename}
                >
                    <AuthenticatedImage
                        fileId={image.id}
                        filename={image.filename}
                        className="w-full h-full"
                        style={{ 
                            width: '100%', 
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        onClick={() => onImageClick(image.id, image.filename)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {image.filename}
                    </div>
                </div>
            ))}
        </div>
    )
}

export function TicketConversation({ ticket, comments, loading }: TicketConversationProps) {
    const [showHistory, setShowHistory] = useState(true)
    const [showImages, setShowImages] = useState(false)
    
    // Analizar imágenes en el contenido (solo en descripción y comentarios, no en el summary)
    const imageAnalysis = useMemo(() => {
        // Analizar imágenes solo en la descripción del ticket (no en el summary)
        const ticketImages = analyzeEmailImages(ticket.description || '');
        
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
                        {/* Mostrar solo el asunto del ticket */}
                        <div className="text-gray-800 font-medium">
                            {ticket.description || 'Sin asunto'}
                        </div>
                        
                        {/* Mostrar archivos directos del ticket */}
                        {ticket.file && ticket.file.length > 0 && (() => {
                            const imageFiles = ticket.file.filter(file => 
                                file.file_type?.startsWith('image/') && file.id
                            ) as ImageFile[];
                            const nonImageFiles = ticket.file.filter(file => 
                                !file.file_type?.startsWith('image/')
                            );

                            return (
                                <div className="mt-3 space-y-2">
                                    <span className="text-xs text-blue-700 block font-medium">
                                        {ticket.file.length} archivo(s) adjunto(s):
                                    </span>
                                    
                                    {/* Grid de imágenes */}
                                    {imageFiles.length > 0 && (
                                        <div>
                                            {showImages ? (
                                                renderImageGrid(imageFiles, true, (fileId, filename) => {
                                                    downloadAuthenticatedFile(fileId, filename).catch((err) => {
                                                        console.error('Error al descargar imagen:', err);
                                                    });
                                                })
                                            ) : (
                                                <div className="text-xs text-gray-500 italic">
                                                    {imageFiles.length} imagen(es) oculta(s). Activa "Mostrar imágenes" para verlas.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Archivos no imagen */}
                                    {nonImageFiles.length > 0 && (
                                        <div className="space-y-1">
                                            {nonImageFiles.map((file) => (
                                                <div key={file.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                                                    <span className="text-sm">📎</span>
                                                    <span className="text-sm text-gray-700 flex-1">{file.filename || 'Archivo sin nombre'}</span>
                                                    <button
                                                        onClick={() => {
                                                            if (file.id) {
                                                                downloadAuthenticatedFile(file.id, file.filename || 'archivo').catch((err) => {
                                                                    console.error('Error al descargar archivo:', err);
                                                                });
                                                            }
                                                        }}
                                                        className="text-blue-600 hover:underline text-xs cursor-pointer"
                                                    >
                                                        Descargar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
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
                                {comment.comments_files && comment.comments_files.length > 0 && (() => {
                                    const imageFiles = comment.comments_files
                                        .filter((cf: CommentFile) => 
                                            cf.file?.file_type?.startsWith('image/') && cf.file?.id
                                        )
                                        .map((cf: CommentFile) => ({
                                            id: cf.file!.id!,
                                            filename: cf.file!.filename || 'imagen',
                                            file_type: cf.file!.file_type
                                        })) as ImageFile[];
                                    
                                    const nonImageFiles = comment.comments_files.filter((cf: CommentFile) => 
                                        !cf.file?.file_type?.startsWith('image/')
                                    );

                                    return (
                                        <div className="mt-3 space-y-2">
                                            <span className="text-xs text-gray-500 block">
                                                {comment.comments_files.length} archivo(s) adjunto(s):
                                            </span>
                                            
                                            {/* Grid de imágenes */}
                                            {imageFiles.length > 0 && (
                                                <div>
                                                    {showImages ? (
                                                        renderImageGrid(imageFiles, true, (fileId, filename) => {
                                                            downloadAuthenticatedFile(fileId, filename).catch((err) => {
                                                                console.error('Error al descargar imagen:', err);
                                                            });
                                                        })
                                                    ) : (
                                                        <div className="text-xs text-gray-500 italic">
                                                            {imageFiles.length} imagen(es) oculta(s). Activa "Mostrar imágenes" para verlas.
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Archivos no imagen */}
                                            {nonImageFiles.length > 0 && (
                                                <div className="space-y-1">
                                                    {nonImageFiles.map((commentFile: CommentFile, index: number) => {
                                                        const fileId = commentFile.file?.id;
                                                        const filename = commentFile.file?.filename || `archivo-${index + 1}`;
                                                        
                                                        return (
                                                            <div key={commentFile.id || index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                                                <span className="text-sm">📎</span>
                                                                <span className="text-sm text-gray-700 flex-1">{filename}</span>
                                                                {fileId && (
                                                                    <button
                                                                        onClick={() => {
                                                                            downloadAuthenticatedFile(fileId, filename).catch((err) => {
                                                                                console.error('Error al descargar archivo:', err);
                                                                            });
                                                                        }}
                                                                        className="text-blue-600 hover:underline text-xs cursor-pointer"
                                                                    >
                                                                        Descargar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
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