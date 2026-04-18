with open('frontend/src/components/Header.js', 'r') as f:
    lines = f.readlines()

# Find the line with "const navigate = useNavigate"
start = next(i for i, l in enumerate(lines) if 'const navigate = useNavigate' in l)
# Find "const count = " line
end = next(i for i, l in enumerate(lines) if 'const count = ' in l) + 1

new_block = [
    "\tconst navigate = useNavigate();\n",
    "\tconst { pathname } = useLocation();\n",
    "\tconst { cartCount } = useCart();\n",
    "\tconst [userMenu, setUserMenu] = React.useState(false);\n",
    "\tconst [shakeWish, setShakeWish] = React.useState(false);\n",
    "\n",
    "\tReact.useEffect(() => {\n",
    "\t\tconst onWish = () => { setShakeWish(true); setTimeout(() => setShakeWish(false), 550); };\n",
    "\t\twindow.addEventListener('wishlist:updated', onWish);\n",
    "\t\treturn () => window.removeEventListener('wishlist:updated', onWish);\n",
    "\t}, []);\n",
    "\n",
    "\tconst count = cartCount;\n",
]

new_lines = lines[:start] + new_block + lines[end:]

with open('frontend/src/components/Header.js', 'w') as f:
    f.writelines(new_lines)

print(f"Replaced lines {start}-{end} with {len(new_block)} lines")
