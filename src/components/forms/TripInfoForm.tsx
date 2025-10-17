import React, { useState } from "react";
import type { TripInfo, TripInfoType } from "../../services/types";
import ImageUploadWidget from "../common/ImageUploadWidget";

interface Props {
    initialValues?: TripInfo;
    tripId: string;
    onSubmit: (info: TripInfo) => void;
    onCancel: () => void;
    onImageSelect: (file: File) => Promise<string>;
}

const TripInfoForm: React.FC<Props> = ({
    initialValues,
    tripId,
    onSubmit,
    onCancel,
    onImageSelect,
}) => {
    const [title, setTitle] = useState(initialValues?.title || "");
    const [description, setDescription] = useState(initialValues?.description || "");
    const [location, setLocation] = useState(initialValues?.location || "");
    const [type, setType] = useState<TripInfoType>(
        initialValues?.type ?? "General"
    );

    const [startDate, setStartDate] = useState(initialValues?.startDate?.slice(0, 10) || "");
    const [endDate, setEndDate] = useState(initialValues?.endDate?.slice(0, 10) || "");
    const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || "");
    const [linkUrl, setLinkUrl] = useState(initialValues?.linkUrl || "");
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...initialValues,
            tripId,
            title,
            description,
            location,
            type,
            startDate,
            endDate,
            imageUrl,
            linkUrl
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 px-4 sm:px-6 md:px-8">
            {/* Title */}
            <div className="flex flex-col">
                <label className="font-semibold mb-1">Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    required
                    className="border rounded p-2 w-full"
                />
            </div>

            {/* Description */}
            <div className="flex flex-col">
                <label className="font-semibold mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Extra info for the trip"
                    rows={4}
                    className="border rounded p-2 w-full resize-none"
                />
            </div>
            <div>
                <label className="block font-semibold">Link URL</label>
                <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full border rounded p-2"
                    placeholder="https://example.com"
                />
            </div>
            {/* Location + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="font-semibold mb-1">Location</label>
                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. New York"
                        className="border rounded p-2 w-full"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="block font-semibold">Type</label>
                    <select
                        name="type"
                        value={type}
                        onChange={(e) => setType(e.target.value as TripInfoType)}
                        className="mt-1 py-2 border block w-full rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="General">General</option>
                        <option value="Accommodation">Accommodation</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Activity">Activity</option>
                        <option value="Reminder">Reminder</option>
                    </select>


                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="font-semibold mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded p-2 w-full"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="font-semibold mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded p-2 w-full"
                    />
                </div>
            </div>
            <ImageUploadWidget
                initialUrl={imageUrl}
                onSelect={async (file) => {
                    const url = await onImageSelect(file);
                    setImageUrl(url);
                    return url;
                }}
            />
            <div className="flex gap-4">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
                <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
        </form>
    );
};

export default TripInfoForm;
