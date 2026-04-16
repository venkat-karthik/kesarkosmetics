import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useWishlist } from "../contexts/WishlistContext";
import { formatPrice } from "../utils/helpers";

const getProductId = (product) => product?.id || product?._id;

const WishlistPage = () => {
	const navigate = useNavigate();
	const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();

	if (wishlistItems.length === 0) {
		return (
			<div className="min-h-screen bg-[#FAF7F2]">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
					<div className="rounded-[2rem] border-2 border-dashed border-[#E0D8C8] bg-white p-8 sm:p-12 text-center shadow-sm">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5EEE6] text-[#D97736]">
							<Heart className="h-10 w-10" />
						</div>
						<h1 className="font-heading text-3xl text-[#3E2723]">Your wishlist is empty</h1>
						<p className="mt-2 text-sm sm:text-base text-[#6B5B52]">Tap the heart on a product to save it here.</p>
						<Button
							onClick={() => navigate("/")}
							className="mt-6 rounded-full bg-[#D97736] px-6 py-3 font-semibold text-white hover:bg-[#C96626]"
						>
							Browse products
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#FAF7F2]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">Saved products</p>
						<h1 className="font-heading text-3xl sm:text-4xl text-[#3E2723]">My Wishlist</h1>
					</div>
					<Button
						onClick={clearWishlist}
						className="rounded-full bg-white border border-[#E0D8C8] text-[#5D4037] hover:bg-[#F5EEE6]"
					>
						Clear all
					</Button>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
					{wishlistItems.map((product) => {
						const productId = getProductId(product);
						return (
							<div key={productId} className="rounded-2xl border-2 border-[#E6DCCB] bg-white p-4 shadow-sm">
								<Link to={`/product/${productId}`}>
									<div className="overflow-hidden rounded-xl">
										<img
											src={product.images?.[0] || product.image || "/logo.png"}
											alt={product.name}
											className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-105"
										/>
									</div>
								</Link>
								<h2 className="mt-3 font-heading text-2xl sm:text-3xl font-bold leading-[1.08] text-[#111111] line-clamp-2">{product.name}</h2>
								<p className="mt-1 text-[#5D4037] font-medium">{formatPrice(product.price || 0)}</p>
								<div className="mt-4 flex gap-2">
									<Button
										onClick={() => navigate(`/product/${productId}`)}
										className="flex-1 rounded-full bg-[#2F6B5A] text-white hover:bg-[#245446]"
									>
										<ShoppingBag className="w-4 h-4 mr-2" />
										View product
									</Button>
									<Button
										onClick={() => removeFromWishlist(productId)}
										className="rounded-full bg-[#8B2C6D] border border-[#8B2C6D] text-white hover:bg-[#742456] hover:border-[#742456]"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default WishlistPage;
