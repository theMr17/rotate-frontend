"use client";
import { useState } from "react";
import type { ConditionPhoto, Order } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

type Props = {
  order: Order;
  onUploaded: (updated: Order) => void;
};

function PhotoGrid({ photos }: { photos: ConditionPhoto[] }) {
  if (photos.length === 0) {
    return <p className="mt-2 text-sm text-gray-400">No photos yet.</p>;
  }
  return (
    <div className="mt-2 grid grid-cols-3 gap-2">
      {photos.map((photo) => (
        <a key={photo.id} href={photo.image} target="_blank">
          <img src={photo.image} alt="Item condition" className="h-24 w-full rounded-md object-cover" />
        </a>
      ))}
    </div>
  );
}

function UploadButton({ busy, onPick }: { busy: boolean; onPick: (file: File) => void }) {
  return (
    <label className="mt-2 inline-block cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
      {busy ? "Uploading..." : "+ Add photo"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}

export default function ConditionPhotos({ order, onUploaded }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const prePhotos = order.photos.filter((photo) => photo.stage === "pre");
  const postPhotos = order.photos.filter((photo) => photo.stage === "post");
  const canAddPre = order.status === "accepted";
  const canAddPost = order.status === "active" || order.status === "returned";

  async function upload(stage: string, file: File) {
    setBusy(true);
    setError(null);

    const formData = new FormData();
    formData.append("stage", stage);
    formData.append("image", file);

    const token = window.localStorage.getItem("rotate_access_token");

    try {
      const response = await fetch(`${API_URL}/orders/${order.id}/photos/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail ?? "Upload failed. Please choose an image file.");
      } else {
        onUploaded(data);
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold">Condition photos</h2>

      <h3 className="mt-3 text-sm font-medium text-gray-600">Before rental (handover)</h3>
      <PhotoGrid photos={prePhotos} />
      {canAddPre && <UploadButton busy={busy} onPick={(file) => upload("pre", file)} />}

      <h3 className="mt-5 text-sm font-medium text-gray-600">After return</h3>
      <PhotoGrid photos={postPhotos} />
      {canAddPost && <UploadButton busy={busy} onPick={(file) => upload("post", file)} />}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}