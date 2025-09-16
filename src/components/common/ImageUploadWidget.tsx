import React, { useState, useEffect, useCallback, useRef } from "react";

interface Props {
    onSelect: (file: File) => Promise<string>; // returns the uploaded / preview URL
    initialUrl?: string;
}

const ImageUploadWidget: React.FC<Props> = ({ onSelect, initialUrl }) => {
    const [preview, setPreview] = useState(initialUrl || "");
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Revoke old blob URLs safely
    const revokePreview = useCallback(() => {
        if (preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }
    }, [preview]);

    const handleFile = useCallback(
        async (file: File) => {
            revokePreview(); // revoke previous preview
            const previewUrl = await onSelect(file);
            setPreview(previewUrl);
        },
        [onSelect, revokePreview]
    );

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) await handleFile(file);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await handleFile(file);
    };

    const handleRemove = () => {
        revokePreview();
        setPreview("");
    };

    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const file = e.clipboardData?.files?.[0];
            if (file) await handleFile(file);
        };
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [handleFile]);

    useEffect(() => {
        return () => revokePreview();
    }, [revokePreview]);

    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            {/* Dashed box for drag/drop */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed p-4 rounded transition-colors w-full text-center ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    }`}
            >
                {preview ? (
                    <div className="relative">
                        <img src={preview} alt="Preview" className="h-32 object-cover mb-2 rounded w-full" />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 mt-2">
                        Drag & drop, paste, or tap a button below to select an image
                    </p>
                )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 w-full">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Upload Image
                </button>
                <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded"
                >
                    Take Photo
                </button>
            </div>

            {/* Hidden Inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

export default ImageUploadWidget;
