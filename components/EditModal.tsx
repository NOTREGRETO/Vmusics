'use client';

import { useState, useRef } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';

interface EditModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (text: string, images: { src: string; alt: string }[]) => void;
	currentText: string;
	currentImages: { src: string; alt: string }[];
}

export default function EditModal({
	isOpen,
	onClose,
	onSave,
	currentText,
	currentImages,
}: EditModalProps) {
	const [text, setText] = useState(currentText);
	const [images, setImages] = useState<{ src: string; alt: string }[]>(currentImages);
	const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

	if (!isOpen) return null;

	const handleImageUpload = (index: number, file: File | null) => {
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			alert('Please upload an image file');
			return;
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			alert('Image size must be less than 10MB');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const newImages = [...images];
			if (newImages[index]) {
				// Revoke old object URL if it was a blob
				if (newImages[index].src.startsWith('blob:')) {
					URL.revokeObjectURL(newImages[index].src);
				}
				newImages[index] = {
					src: e.target?.result as string,
					alt: `Image ${index + 1}`,
				};
			} else {
				newImages.push({
					src: e.target?.result as string,
					alt: `Image ${index + 1}`,
				});
			}
			setImages(newImages);
		};
		reader.readAsDataURL(file);
	};

	const removeImage = (index: number) => {
		const newImages = [...images];
		// Revoke object URL if it's a blob
		if (newImages[index].src.startsWith('blob:')) {
			URL.revokeObjectURL(newImages[index].src);
		}
		newImages.splice(index, 1);
		setImages(newImages);
	};

	const handleSave = () => {
		// Filter out empty image slots
		const validImages = images.filter((img) => img.src);
		onSave(text, validImages);
		onClose();
	};

	const handleClose = () => {
		// Clean up any blob URLs that weren't saved
		images.forEach((img) => {
			if (img.src.startsWith('blob:') && !currentImages.includes(img)) {
				URL.revokeObjectURL(img.src);
			}
		});
		setText(currentText);
		setImages(currentImages);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<div className="bg-[var(--background)] text-[var(--foreground)] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--foreground)]/10">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-[var(--foreground)]/10">
					<h2 className="text-2xl font-serif font-normal text-[var(--foreground)]">
						Edit Portfolio
					</h2>
					<button
						onClick={handleClose}
						className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors"
						aria-label="Close"
					>
						<X className="w-5 h-5 text-[var(--foreground)]/70" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Text Input */}
					<div>
						<label
							htmlFor="text-input"
							className="block text-xs font-mono uppercase font-semibold text-[var(--foreground)]/80 mb-2"
						>
							Portfolio Text
						</label>
						<input
							id="text-input"
							type="text"
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="I'm; Batman (use semicolon to make first part italic)"
							className="w-full px-4 py-2 border border-[var(--foreground)]/20 rounded-lg focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-[var(--foreground)]/40 bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground)]/40 font-mono"
						/>
						<p className="mt-1 text-xs font-mono uppercase text-[var(--foreground)]/60">
							This text will be displayed in the center of the gallery. Use a semicolon (;) to make the first part italic.
						</p>
					</div>

					{/* Image Uploads */}
					<div>
						<label className="block text-xs font-mono uppercase font-semibold text-[var(--foreground)]/80 mb-2">
							Images (up to 10)
						</label>
						<div className="grid grid-cols-2 gap-4">
							{Array.from({ length: 10 }).map((_, index) => (
								<div
									key={index}
									className="relative border-2 border-dashed border-[var(--foreground)]/20 rounded-lg p-4 hover:border-[var(--foreground)]/40 transition-colors"
								>
									{images[index]?.src ? (
										<div className="relative group">
											<img
												src={images[index].src}
												alt={images[index].alt}
												className="w-full h-32 object-cover rounded-lg"
											/>
											<button
												onClick={() => removeImage(index)}
												className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
												aria-label="Remove image"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									) : (
										<label className="flex flex-col items-center justify-center h-32 cursor-pointer">
											<Upload className="w-8 h-8 text-[var(--foreground)]/40 mb-2" />
											<span className="text-xs font-mono uppercase text-[var(--foreground)]/60 text-center">
												Click to upload
											</span>
											<input
												ref={(el) => {
													fileInputRefs.current[index] = el;
												}}
												type="file"
												accept="image/*"
												className="hidden"
												onChange={(e) => {
													const file = e.target.files?.[0] || null;
													handleImageUpload(index, file);
												}}
											/>
										</label>
									)}
								</div>
							))}
						</div>
						<p className="mt-2 text-xs font-mono uppercase text-[var(--foreground)]/60">
							Upload up to 10 images. Supported formats: JPG, PNG, WebP, etc.
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--foreground)]/10">
					<button
						onClick={handleClose}
						className="px-4 py-2 text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors font-mono uppercase text-xs font-semibold"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="px-6 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg hover:opacity-90 transition-opacity font-mono uppercase text-xs font-semibold"
					>
						Save Changes
					</button>
				</div>
			</div>
		</div>
	);
}

