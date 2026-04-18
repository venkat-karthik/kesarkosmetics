with open('frontend/src/pages/HomePage.js', 'r') as f:
    content = f.read()

OLD = content[content.find('\t\t\t<section ref={reviewSectionRef} id="customer-reviews"'):content.find('\t\t\t</section>\n\n\t\t\t<CartSuccessModal')+len('\t\t\t</section>')]

NEW = """\t\t\t<section ref={reviewSectionRef} id="customer-reviews" className="relative py-20 sm:py-28 overflow-hidden" style={{ background: "linear-gradient(135deg,#1A0800 0%,#2D0F00 45%,#1A0800 100%)" }}>
\t\t\t\t<div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#F5A800]/50 to-transparent" />
\t\t\t\t<div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#F5A800]/50 to-transparent" />
\t\t\t\t<div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
\t\t\t\t\t<div className="text-center mb-14">
\t\t\t\t\t\t<div className="inline-flex items-center gap-3 mb-5">
\t\t\t\t\t\t\t<div className="h-px w-10 bg-gradient-to-r from-transparent to-[#F5A800]/60" />
\t\t\t\t\t\t\t<span className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#F5A800]">Customer Reviews</span>
\t\t\t\t\t\t\t<div className="h-px w-10 bg-gradient-to-l from-transparent to-[#F5A800]/60" />
\t\t\t\t\t\t</div>
\t\t\t\t\t\t<h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white font-light">
\t\t\t\t\t\t\tWhat They&apos;re <em className="text-[#F5A800] not-italic">Saying</em>
\t\t\t\t\t\t</h2>
\t\t\t\t\t</div>
\t\t\t\t\t{featuredReviews.length === 0 ? (
\t\t\t\t\t\t<p className="text-center text-white/30 text-sm">No reviews yet.</p>
\t\t\t\t\t) : (
\t\t\t\t\t\t<div>
\t\t\t\t\t\t\t<div className={`transition-all duration-500 ${reviewFading ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}>
\t\t\t\t\t\t\t\t<div className="relative rounded-2xl overflow-hidden text-center px-8 sm:px-16 py-12 sm:py-16" style={{ background: "rgba(245,168,0,0.06)", border: "1px solid rgba(245,168,0,0.18)" }}>
\t\t\t\t\t\t\t\t\t<div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5A800] to-transparent" />
\t\t\t\t\t\t\t\t\t<div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5A800] to-transparent" />
\t\t\t\t\t\t\t\t\t<div className="absolute top-0 left-4 font-serif leading-none select-none pointer-events-none text-[#F5A800]/8" style={{ fontSize: "150px" }}>&ldquo;</div>
\t\t\t\t\t\t\t\t\t<div className="flex justify-center gap-1.5 mb-8">
\t\t\t\t\t\t\t\t\t\t{Array.from({ length: 5 }).map((_, i) => (
\t\t\t\t\t\t\t\t\t\t\t<svg key={i} viewBox="0 0 20 20" className={`w-5 h-5 ${i < (featuredReviews[reviewStartIndex]?.rating || 5) ? "fill-[#F5A800]" : "fill-white/10"}`}>
\t\t\t\t\t\t\t\t\t\t\t\t<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
\t\t\t\t\t\t\t\t\t\t\t</svg>
\t\t\t\t\t\t\t\t\t\t))}
\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t<p className="relative z-10 text-xl sm:text-2xl lg:text-3xl text-white/90 font-light italic leading-relaxed max-w-2xl mx-auto mb-10">
\t\t\t\t\t\t\t\t\t\t&ldquo;{featuredReviews[reviewStartIndex]?.comment}&rdquo;
\t\t\t\t\t\t\t\t\t</p>
\t\t\t\t\t\t\t\t\t<div className="flex items-center justify-center gap-4 mb-6">
\t\t\t\t\t\t\t\t\t\t<div className="h-px w-16 bg-gradient-to-r from-transparent to-[#F5A800]/50" />
\t\t\t\t\t\t\t\t\t\t<svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#F5A800]"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
\t\t\t\t\t\t\t\t\t\t<div className="h-px w-16 bg-gradient-to-l from-transparent to-[#F5A800]/50" />
\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t<p className="text-white font-semibold text-sm tracking-[0.2em] uppercase mb-1">{featuredReviews[reviewStartIndex]?.userName}</p>
\t\t\t\t\t\t\t\t\t{featuredReviews[reviewStartIndex]?.productId ? (
\t\t\t\t\t\t\t\t\t\t<Link to={`/product/${featuredReviews[reviewStartIndex].productId}`} className="text-[#F5A800]/60 hover:text-[#F5A800] text-xs tracking-[0.18em] uppercase transition-colors">
\t\t\t\t\t\t\t\t\t\t\t{featuredReviews[reviewStartIndex]?.productName}
\t\t\t\t\t\t\t\t\t\t</Link>
\t\t\t\t\t\t\t\t\t) : (
\t\t\t\t\t\t\t\t\t\t<p className="text-[#F5A800]/60 text-xs tracking-[0.18em] uppercase">{featuredReviews[reviewStartIndex]?.productName}</p>
\t\t\t\t\t\t\t\t\t)}
\t\t\t\t\t\t\t\t\t<div className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: "rgba(245,168,0,0.1)", border: "1px solid rgba(245,168,0,0.25)" }}>
\t\t\t\t\t\t\t\t\t\t<svg viewBox="0 0 20 20" className="w-3 h-3 fill-[#F5A800]"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
\t\t\t\t\t\t\t\t\t\t<span className="text-[#F5A800] text-[10px] font-bold tracking-[0.25em] uppercase">Verified Purchase</span>
\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<div className="flex items-center justify-center gap-6 mt-10">
\t\t\t\t\t\t\t\t<button onClick={handleReviewPrev} aria-label="Previous" className="w-11 h-11 rounded-full flex items-center justify-center text-[#F5A800] transition-all hover:scale-110" style={{ border: "1px solid rgba(245,168,0,0.3)" }}>
\t\t\t\t\t\t\t\t\t<ChevronLeft className="w-5 h-5" />
\t\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t\t\t<div className="flex gap-2 items-center">
\t\t\t\t\t\t\t\t\t{featuredReviews.map((_, idx) => (
\t\t\t\t\t\t\t\t\t\t<button key={idx} onClick={() => { setReviewFading(true); setTimeout(() => { setReviewStartIndex(idx); setReviewFading(false); }, 350); }} className={`rounded-full transition-all duration-300 ${idx === reviewStartIndex ? "w-8 h-2 bg-[#F5A800]" : "w-2 h-2 bg-white/20 hover:bg-[#F5A800]/50"}`} aria-label={`Review ${idx + 1}`} />
\t\t\t\t\t\t\t\t\t))}
\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t<button onClick={handleReviewNext} aria-label="Next" className="w-11 h-11 rounded-full flex items-center justify-center text-[#F5A800] transition-all hover:scale-110" style={{ border: "1px solid rgba(245,168,0,0.3)" }}>
\t\t\t\t\t\t\t\t\t<ChevronRight className="w-5 h-5" />
\t\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<p className="text-center text-white/25 text-[10px] tracking-[0.3em] uppercase mt-5">{reviewStartIndex + 1} of {featuredReviews.length}</p>
\t\t\t\t\t\t</div>
\t\t\t\t\t)}
\t\t\t\t</div>
\t\t\t</section>"""

content = content.replace(OLD, NEW)

with open('frontend/src/pages/HomePage.js', 'w') as f:
    f.write(content)

print("Done")
