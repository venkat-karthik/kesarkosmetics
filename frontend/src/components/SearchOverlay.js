import React, { useState } from "react";
import { X, Search as SearchIcon } from "lucide-react";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/helpers";

const SearchOverlay = ({ isOpen, onClose }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState([]);
	const navigate = useNavigate();

	const handleSearch = async (query) => {
		setSearchQuery(query);
		if (query.length > 2) {
			try {
				const { searchProducts } = await import("../utils/productsDb");
				setResults(await searchProducts(query));
			} catch {
				setResults([]);
			}
		} else {
			setResults([]);
		}
	};

	const handleProductClick = (productId) => {
		navigate(`/product/${productId}`);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
			<div className="max-w-2xl mx-auto mt-20 bg-white rounded-3xl shadow-2xl p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="font-heading text-2xl font-semibold text-[#3E2723]">Search Products</h2>
					<button onClick={onClose} className="p-2 hover:bg-[#E0D8C8] rounded-full transition-colors">
						<X className="w-6 h-6 text-[#3E2723]" />
					</button>
				</div>

				<div className="relative mb-6">
					<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D4037]" />
					<Input
						type="text"
						placeholder="Search for serums, creams, cleansers..."
						value={searchQuery}
						onChange={(e) => handleSearch(e.target.value)}
						className="pl-10 rounded-full border-[#E0D8C8] focus:ring-[#D97736]"
					/>
				</div>

				<div className="max-h-96 overflow-y-auto space-y-3">
					{results.length > 0 ? (
						results.map((product) => (
							<div
								key={product.id}
								onClick={() => handleProductClick(product.id)}
								className="flex items-center gap-4 p-3 hover:bg-[#EFE9DF] rounded-2xl cursor-pointer transition-colors"
							>
								<img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-xl" />
								<div className="flex-1">
									<h3 className="font-heading text-lg sm:text-xl font-bold leading-[1.08] text-[#3E2723]">{product.name}</h3>
									<p className="text-sm text-[#5D4037]">{formatPrice(product.price)}</p>
								</div>
							</div>
						))
					) : searchQuery.length > 2 ? (
						<p className="text-center text-[#5D4037] py-8">No products found</p>
					) : (
						<p className="text-center text-[#5D4037] py-8">Start typing to search...</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default SearchOverlay;
