"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { isHtmlEmpty } from "@/hooks/useTiptapHelpers"
import { Send, Paperclip, X, MessageSquare, ChevronUp, ChevronDown } from "lucide-react"
import { useState } from "react"

interface TicketResponseFormProps {
    responseText: string
    setResponseText: (text: string) => void
    selectedFiles: File[]
    setSelectedFiles: (files: File[]) => void
    isPublic: boolean
    setIsPublic: (isPublic: boolean) => void
    onSubmit: (e: React.FormEvent) => void
    onClose: () => void
}

export function TicketResponseForm({
    responseText,
    setResponseText,
    selectedFiles,
    setSelectedFiles,
    isPublic,
    setIsPublic,
    onSubmit,
    onClose
}: TicketResponseFormProps) {
    const [isResponseVisible, setIsResponseVisible] = useState(true)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setSelectedFiles([...selectedFiles, ...newFiles])
        }
    }

    const removeFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
    }

    return (
        <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsResponseVisible(!isResponseVisible)}
                    className="flex items-center gap-2 text-sm font-medium"
                >
                    <MessageSquare className="h-4 w-4" />
                    Escribir respuesta
                    {isResponseVisible ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                {isResponseVisible && (
                    <div>
                        <TiptapEditor
                            content={responseText}
                            onChange={setResponseText}
                            placeholder="Escribe tu respuesta aquí..."
                            className="mt-2"
                        />
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div>
                            <Input
                                id="files"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('files')?.click()}
                            >
                                <Paperclip className="h-4 w-4 mr-2" />
                                Adjuntar
                            </Button>
                            {selectedFiles.length > 0 && (
                                <span className="text-sm text-gray-500 ml-2">
                                    {selectedFiles.length} archivo(s)
                                </span>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="rounded"
                            />
                            <Label htmlFor="isPublic" className="text-sm">
                                Comentario público
                            </Label>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cerrar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isHtmlEmpty(responseText) || !isResponseVisible} 
                            className="flex items-center"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Enviar
                        </Button>
                    </div>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                <span className="truncate">{file.name}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="h-6 w-6 p-0"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </form>
        </div>
    )
}