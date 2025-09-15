import React, { useState, useEffect, useCallback } from "react";

interface Props {
    onSelect: (file: File) => Promise<string>; // returns the uploaded / preview URL
    initialUrl?: string;
}

const ImageUploadWidget: React.FC<Props> = ({ onSelect, initialUrl }) => {
    const [preview, setPreview] = useState(initialUrl || "");
    const [dragging, setDragging] = useState(false);

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

    // Handlers
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

    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const file = e.clipboardData?.files?.[0];
            if (file) await handleFile(file);
        };
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [handleFile]);

    // Cleanup on unmount
    useEffect(() => {
        return () => revokePreview();
    }, [revokePreview]);

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed p-4 rounded transition-colors ${
                dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
        >
            {preview && (
                <img
                    src={preview}
                    alt="Preview"
                    className="h-32 object-cover mb-2 rounded"
                />
            )}
            <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="block"
            />
            <p className="text-sm text-gray-500 mt-2">
                Drag & drop, paste, or tap to upload
            </p>
        </div>
    );
};

export default ImageUploadWidget;
