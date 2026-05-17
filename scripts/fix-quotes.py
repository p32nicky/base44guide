import sys

path = r"C:\base44site\scripts\generate-articles.ts"

with open(path, "rb") as f:
    raw = f.read()

# curly double quotes -> straight double quote (0x22)
fixed = raw.replace(b"\xe2\x80\x9c", b"\x22").replace(b"\xe2\x80\x9d", b"\x22")
# curly single quotes -> straight apostrophe (0x27)
fixed = fixed.replace(b"\xe2\x80\x98", b"\x27").replace(b"\xe2\x80\x99", b"\x27")
# em dash -> --
fixed = fixed.replace(b"\xe2\x80\x94", b"--")

with open(path, "wb") as f:
    f.write(fixed)

print("Fixed smart quotes in", path)
